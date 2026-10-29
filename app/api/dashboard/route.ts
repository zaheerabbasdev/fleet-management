import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";

const round3 = (n: number) => Number(n.toFixed(3));

// Salary cost = basic + allowances + overtime + bonus (same rule as the Reports page)
async function salaryCost(salaryMonth: string) {
  const a = await prisma.salaryPayment.aggregate({
    _sum: { basicSalary: true, allowances: true, overtime: true, bonus: true },
    where: { salaryMonth },
  });
  return (
    Number(a._sum.basicSalary || 0) +
    Number(a._sum.allowances || 0) +
    Number(a._sum.overtime || 0) +
    Number(a._sum.bonus || 0)
  );
}

// Other costs = general expenses (Expenses page) + old per-truck expenses
async function otherCost(gte: Date, lte: Date) {
  const [general, truck] = await Promise.all([
    prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte, lte } } }),
    prisma.truckExpense.aggregate({ _sum: { amount: true }, where: { date: { gte, lte } } }),
  ]);
  return Number(general._sum.amount || 0) + Number(truck._sum.amount || 0);
}

export async function GET(request: Request) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // 1. Load Warning Offset from settings
    const warningSetting = await prisma.setting.findUnique({
      where: { key: "warning_days_expiry" },
    });
    const warningDays = warningSetting ? parseInt(warningSetting.value) : 30;
    const warningLimitDate = new Date();
    warningLimitDate.setDate(warningLimitDate.getDate() + warningDays);

    // 2. Summary Counts
    const totalEmployees = await prisma.employee.count();
    const activeEmployees = await prisma.employee.count({
      where: { status: "Active" },
    });

    const totalTrucks = await prisma.truck.count();
    const availableTrucks = await prisma.truck.count({
      where: { status: "Available" },
    });
    const trucksOnTrip = await prisma.truck.count({
      where: { status: "On Trip" },
    });
    const trucksMaintenance = await prisma.truck.count({
      where: { status: "Under Maintenance" },
    });

    // 3. Trips stats this month
    const tripsThisMonthCount = await prisma.trip.count({
      where: {
        tripDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // 4. Financial Calculations for Current Month
    // Revenue from trips
    const tripRevenueAggregation = await prisma.trip.aggregate({
      _sum: { revenue: true },
      where: {
        tripDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: { not: "Cancelled" },
      },
    });
    const tripRevenueThisMonth = Number(tripRevenueAggregation._sum.revenue || 0);

    // Fuel expense
    const fuelExpenseAggregation = await prisma.fuelTransaction.aggregate({
      _sum: { totalAmount: true },
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    const fuelExpenseThisMonth = Number(fuelExpenseAggregation._sum.totalAmount || 0);

    // Salary expense
    const salaryExpenseThisMonth = round3(await salaryCost(currentYearMonth));

    // Maintenance cost
    const maintenanceAggregation = await prisma.truckMaintenance.aggregate({
      _sum: { cost: true },
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    const maintenanceCostThisMonth = Number(maintenanceAggregation._sum.cost || 0);

    // General expenses
    const generalExpensesThisMonth = round3(await otherCost(startOfMonth, endOfMonth));

    const totalExpensesThisMonth = round3(
      fuelExpenseThisMonth +
        salaryExpenseThisMonth +
        maintenanceCostThisMonth +
        generalExpensesThisMonth
    );

    // 5. Customer Outstanding Payments
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["Sent", "Partially Paid", "Overdue"] },
      },
      include: {
        payments: true,
      },
    });

    let outstandingCustomerPayments = 0;
    for (const inv of invoices) {
      const paymentsSum = inv.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      outstandingCustomerPayments += Number(inv.totalAmount) - paymentsSum;
    }

    // 6. Expiring Documents Alerts (Passports, Visas, Licenses, Truck Mulkiyas, etc.)
    const alerts: string[] = [];

    // Passport expiries
    const passportsExpiring = await prisma.employeePassport.findMany({
      where: { expiryDate: { lte: warningLimitDate } },
      include: { employee: true },
    });
    passportsExpiring.forEach((p) => {
      const days = Math.ceil((p.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      alerts.push(
        days <= 0
          ? `Passport for ${p.employee.name} has EXPIRED.`
          : `Passport for ${p.employee.name} expires in ${days} days.`
      );
    });

    // Visa expiries
    const visasExpiring = await prisma.employeeVisa.findMany({
      where: { expiryDate: { lte: warningLimitDate } },
      include: { employee: true },
    });
    visasExpiring.forEach((v) => {
      const days = Math.ceil((v.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      alerts.push(
        days <= 0
          ? `Visa for ${v.employee.name} has EXPIRED.`
          : `Visa for ${v.employee.name} expires in ${days} days.`
      );
    });

    // Driving license expiries
    const licensesExpiring = await prisma.employeeLicense.findMany({
      where: { expiryDate: { lte: warningLimitDate } },
      include: { employee: true },
    });
    licensesExpiring.forEach((l) => {
      const days = Math.ceil((l.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      alerts.push(
        days <= 0
          ? `Driving license for ${l.employee.name} has EXPIRED.`
          : `Driving license for ${l.employee.name} expires in ${days} days.`
      );
    });

    // Truck registration expiries (Mulkiya)
    const truckDocsExpiring = await prisma.truckDocument.findMany({
      where: { expiryDate: { lte: warningLimitDate } },
      include: { truck: true },
    });
    truckDocsExpiring.forEach((td) => {
      const days = Math.ceil((td.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      alerts.push(
        days <= 0
          ? `Truck ${td.truck.regNumber} document [${td.docType}] has EXPIRED.`
          : `Truck ${td.truck.regNumber} document [${td.docType}] expires in ${days} days.`
      );
    });

    // Maintenance Reminders
    const maintenanceDue = await prisma.truckMaintenance.findMany({
      where: {
        OR: [
          { nextServiceDate: { lte: warningLimitDate } },
          // Filter by odometer if next service is near
        ],
      },
      include: { truck: true },
    });
    maintenanceDue.forEach((m) => {
      if (m.nextServiceDate) {
        const days = Math.ceil((m.nextServiceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push(
          days <= 0
            ? `Maintenance for Truck ${m.truck.regNumber} was due on ${m.nextServiceDate.toLocaleDateString()}.`
            : `Maintenance for Truck ${m.truck.regNumber} is due in ${days} days.`
        );
      }
    });

    // 7. Charts Data - Monthly Revenue & Expenses (Last 6 Months)
    const monthsData: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

      // Revenue
      const revAggr = await prisma.trip.aggregate({
        _sum: { revenue: true },
        where: {
          tripDate: { gte: monthStart, lte: monthEnd },
          status: { not: "Cancelled" },
        },
      });
      const rev = Number(revAggr._sum.revenue || 0);

      // Expenses breakdown
      const fuelAggr = await prisma.fuelTransaction.aggregate({
        _sum: { totalAmount: true },
        where: { date: { gte: monthStart, lte: monthEnd } },
      });
      const fuel = Number(fuelAggr._sum.totalAmount || 0);

      const salaries = round3(await salaryCost(yearMonth));

      const maintAggr = await prisma.truckMaintenance.aggregate({
        _sum: { cost: true },
        where: { date: { gte: monthStart, lte: monthEnd } },
      });
      const maint = Number(maintAggr._sum.cost || 0);

      const otherExp = round3(await otherCost(monthStart, monthEnd));

      const totalExp = round3(fuel + salaries + maint + otherExp);

      monthsData.push({
        name: label,
        revenue: rev,
        expenses: totalExp,
        fuel,
        salaries,
        maintenance: maint,
        other: otherExp,
      });
    }

    // 8. Fuel consumption by truck (for efficiency chart)
    const truckList = await prisma.truck.findMany({
      include: {
        fuelLog: true,
        trips: true,
        maintenances: true,
        expenses: true,
        generalExpenses: true,
      },
    });

    const fuelConsumptionData = truckList
      .map((t) => {
        const totalLiters = t.fuelLog.reduce((sum, f) => sum + Number(f.liters), 0);
        const completedTrips = t.trips.filter((trip) => trip.status === "Completed");
        const totalDistance = completedTrips.reduce((sum, trip) => sum + trip.distance, 0);

        // Liters per 100 KM
        const l100 = totalDistance > 0 ? (totalLiters / totalDistance) * 100 : 0;
        return {
          truck: t.regNumber,
          liters: totalLiters,
          distance: totalDistance,
          consumption: Number(l100.toFixed(2)),
        };
      })
      .filter((d) => d.distance > 0) // only include trucks with trip history
      .slice(0, 10); // top 10

    // 9. Truck Profitability
    const truckProfitData = truckList
      .map((t) => {
        const rev = t.trips
          .filter((trip) => trip.status !== "Cancelled")
          .reduce((sum, trip) => sum + Number(trip.revenue), 0);
        const fuelCost = t.fuelLog.reduce((sum, f) => sum + Number(f.totalAmount), 0);
        const maintCost = t.maintenances.reduce((sum, m) => sum + Number(m.cost), 0);
        const otherCosts =
          t.expenses.reduce((sum, e) => sum + Number(e.amount), 0) +
          t.generalExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

        const profit = rev - (fuelCost + maintCost + otherCosts);

        return {
          truck: t.regNumber,
          revenue: round3(rev),
          expenses: round3(fuelCost + maintCost + otherCosts),
          profit: Number(profit.toFixed(3)),
        };
      })
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5); // top 5

    return NextResponse.json({
      summary: {
        totalEmployees,
        activeEmployees,
        totalTrucks,
        availableTrucks,
        trucksOnTrip,
        trucksMaintenance,
        tripsThisMonthCount,
        fuelExpenseThisMonth,
        salaryExpenseThisMonth,
        totalExpensesThisMonth,
        tripRevenueThisMonth,
        outstandingCustomerPayments,
      },
      alerts,
      charts: {
        monthlyOverview: monthsData,
        fuelConsumption: fuelConsumptionData,
        truckProfitability: truckProfitData,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return handleApiError(error);
  }
}
