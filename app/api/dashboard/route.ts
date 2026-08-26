import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const salaryExpenseAggregation = await prisma.salaryPayment.aggregate({
      _sum: { netSalary: true },
      where: {
        salaryMonth: currentYearMonth,
      },
    });
    const salaryExpenseThisMonth = Number(salaryExpenseAggregation._sum.netSalary || 0);

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

    // General truck expenses
    const generalExpensesAggregation = await prisma.truckExpense.aggregate({
      _sum: { amount: true },
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    const generalExpensesThisMonth = Number(generalExpensesAggregation._sum.amount || 0);

    const totalExpensesThisMonth =
      fuelExpenseThisMonth +
      salaryExpenseThisMonth +
      maintenanceCostThisMonth +
      generalExpensesThisMonth;

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

      const salAggr = await prisma.salaryPayment.aggregate({
        _sum: { netSalary: true },
        where: { salaryMonth: yearMonth },
      });
      const salaries = Number(salAggr._sum.netSalary || 0);

      const maintAggr = await prisma.truckMaintenance.aggregate({
        _sum: { cost: true },
        where: { date: { gte: monthStart, lte: monthEnd } },
      });
      const maint = Number(maintAggr._sum.cost || 0);

      const expAggr = await prisma.truckExpense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: monthStart, lte: monthEnd } },
      });
      const otherExp = Number(expAggr._sum.amount || 0);

      const totalExp = fuel + salaries + maint + otherExp;

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
        const rev = t.trips.reduce((sum, trip) => sum + Number(trip.revenue), 0);
        const fuelCost = t.fuelLog.reduce((sum, f) => sum + Number(f.totalAmount), 0);
        const maintCost = t.maintenances.reduce((sum, m) => sum + Number(m.cost), 0);
        const otherCost = t.expenses.reduce((sum, e) => sum + Number(e.amount), 0);

        const profit = rev - (fuelCost + maintCost + otherCost);

        return {
          truck: t.regNumber,
          revenue: rev,
          expenses: fuelCost + maintCost + otherCost,
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
    return NextResponse.json(
      { error: "Internal Server Error fetching dashboard statistics" },
      { status: 500 }
    );
  }
}
