import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearStr = searchParams.get("year") || new Date().getFullYear().toString();
    const year = parseInt(yearStr);

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    // 1. Fetch all financial components in parallel
    const [trips, fuel, maintenance, generalExpenses, salaries] = await prisma.$transaction([
      prisma.trip.findMany({
        where: { tripDate: { gte: startDate, lt: endDate } },
        select: { revenue: true, tripDate: true },
      }),
      prisma.fuelTransaction.findMany({
        where: { date: { gte: startDate, lt: endDate } },
        select: { totalAmount: true, date: true },
      }),
      prisma.truckMaintenance.findMany({
        where: { date: { gte: startDate, lt: endDate } },
        select: { cost: true, date: true },
      }),
      prisma.expense.findMany({
        where: { date: { gte: startDate, lt: endDate } },
        select: { amount: true, date: true },
      }),
      prisma.salaryPayment.findMany({
        where: { salaryMonth: { startsWith: `${year}-` } },
        select: { netSalary: true, allowances: true, overtime: true, bonus: true, basicSalary: true, salaryMonth: true },
      }),
    ]);

    // 2. Aggregate financial totals
    const totalRevenue = trips.reduce((sum: number, t: any) => sum + Number(t.revenue), 0);
    const totalFuel = fuel.reduce((sum: number, f: any) => sum + Number(f.totalAmount), 0);
    const totalMaintenance = maintenance.reduce((sum: number, m: any) => sum + Number(m.cost), 0);
    const totalGeneral = generalExpenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const totalSalaries = salaries.reduce((sum: number, s: any) =>
      sum + Number(s.basicSalary) + Number(s.allowances) + Number(s.overtime) + Number(s.bonus), 0);

    const totalExpenses = totalFuel + totalMaintenance + totalGeneral + totalSalaries;
    const netProfit = totalRevenue - totalExpenses;

    // 3. Monthly breakdowns
    const monthlyReport: Record<number, { revenue: number; fuel: number; maintenance: number; general: number; salaries: number }> = {};
    for (let m = 0; m < 12; m++) {
      monthlyReport[m] = { revenue: 0, fuel: 0, maintenance: 0, general: 0, salaries: 0 };
    }

    trips.forEach((t: any) => {
      const month = new Date(t.tripDate).getMonth();
      monthlyReport[month].revenue += Number(t.revenue);
    });
    fuel.forEach((f: any) => {
      const month = new Date(f.date).getMonth();
      monthlyReport[month].fuel += Number(f.totalAmount);
    });
    maintenance.forEach((m: any) => {
      const month = new Date(m.date).getMonth();
      monthlyReport[month].maintenance += Number(m.cost);
    });
    generalExpenses.forEach((e: any) => {
      const month = new Date(e.date).getMonth();
      monthlyReport[month].general += Number(e.amount);
    });
    // Salaries are saved as YYYY-MM
    salaries.forEach((s: any) => {
      // Find month from YYYY-MM
      const parts = s.salaryMonth.split("-");
      const monthStr = parts.length > 1 ? parts[1] : "";
      const monthIndex = parseInt(monthStr) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyReport[monthIndex].salaries +=
          Number(s.basicSalary) + Number(s.allowances) + Number(s.overtime) + Number(s.bonus);
      }
    });

    const monthlyArray = Object.keys(monthlyReport).map((key) => {
      const mIdx = parseInt(key);
      const data = monthlyReport[mIdx];
      const monthExpenses = data.fuel + data.maintenance + data.general + data.salaries;
      return {
        month: new Date(year, mIdx, 1).toLocaleString("en-US", { month: "short" }),
        revenue: data.revenue,
        expenses: monthExpenses,
        profit: data.revenue - monthExpenses,
      };
    });

    // 4. Truck Profitability breakdown
    const trucks = await prisma.truck.findMany({
      select: {
        id: true,
        truckId: true,
        regNumber: true,
        trips: {
          where: { tripDate: { gte: startDate, lt: endDate } },
          select: { revenue: true },
        },
        fuelLog: {
          where: { date: { gte: startDate, lt: endDate } },
          select: { totalAmount: true },
        },
        maintenances: {
          where: { date: { gte: startDate, lt: endDate } },
          select: { cost: true },
        },
      },
    });

    const truckProfitability = trucks.map((t) => {
      const rev = t.trips.reduce((sum, tr) => sum + Number(tr.revenue), 0);
      const fCost = t.fuelLog.reduce((sum, fl) => sum + Number(fl.totalAmount), 0);
      const mCost = t.maintenances.reduce((sum, mc) => sum + Number(mc.cost), 0);
      const profit = rev - (fCost + mCost);
      return {
        regNumber: t.regNumber,
        truckId: t.truckId,
        revenue: rev,
        expenses: fCost + mCost,
        profit,
      };
    }).sort((a, b) => b.profit - a.profit).slice(0, 10);

    return NextResponse.json({
      summary: {
        revenue: totalRevenue,
        fuel: totalFuel,
        maintenance: totalMaintenance,
        salaries: totalSalaries,
        general: totalGeneral,
        expenses: totalExpenses,
        profit: netProfit,
      },
      monthlyBreakdown: monthlyArray,
      truckBreakdown: truckProfitability,
    });
  } catch (error) {
    console.error("GET Reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
