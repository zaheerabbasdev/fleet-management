"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Gauge,
  Briefcase,
  Wrench,
  Fuel,
  Download,
  Printer,
  Landmark,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 10px 30px rgb(0 0 0 / 0.4)",
};

const formatOMR = (v: number) =>
  new Intl.NumberFormat("en-OM", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(v || 0);

const percent = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

function Metric({
  label,
  value,
  hint,
  icon: Icon,
  chip,
  glow,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  chip: string;
  glow: string;
  valueClass?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/30">
      <div className={`pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${chip}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className={`relative mt-4 text-2xl font-bold tracking-tight ${valueClass}`}>{value}</p>
      <p className="relative mt-1.5 text-xs text-zinc-500">{hint}</p>
    </div>
  );
}

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - 3 + i));

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<string>(String(currentYear));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?year=${year}`);
        const d = res.ok ? await res.json() : null;
        if (!cancelled) setData(d);
      } catch (err) {
        console.error(err);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year]);

  const exportCsv = () => {
    if (!data) return;
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [
      `Report year,${year}`,
      "",
      "Monthly breakdown",
      "Month,Revenue,Expenses",
      ...data.monthlyBreakdown.map((m: any) => [q(m.month), m.revenue, m.expenses].join(",")),
      "",
      "Truck profitability",
      "Rank,Truck,Reg number,Revenue,Expenses,Profit",
      ...data.truckBreakdown.map((t: any, i: number) =>
        [i + 1, q(t.truckId), q(t.regNumber), t.revenue, t.expenses, t.profit].join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleet-report-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const s = data?.summary;
  const operatingRatio = s && s.revenue > 0 ? (s.expenses / s.revenue) * 100 : 0;
  const margin = s && s.revenue > 0 ? (s.profit / s.revenue) * 100 : 0;

  const structure = s
    ? [
        { label: "Fuel costs", value: s.fuel, icon: Fuel, color: "#f59e0b" },
        { label: "Maintenance", value: s.maintenance, icon: Wrench, color: "#38bdf8" },
        { label: "Staff salaries", value: s.salaries, icon: Landmark, color: "#10b981" },
        { label: "General overhead", value: s.general, icon: Briefcase, color: "#a78bfa" },
      ]
    : [];
  const structureTotal = structure.reduce((sum, r) => sum + (r.value || 0), 0);
  const bestProfit = data ? Math.max(0, ...data.truckBreakdown.map((t: any) => t.profit)) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-grid relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-emerald-950/40 p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">Financial year {year}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Reports Console</h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              High-level financials, operating costs, truck profitability rankings and growth trends.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <div className="flex rounded-lg border border-zinc-700 bg-zinc-900/60 p-1" role="group" aria-label="Select year">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  aria-pressed={y === year}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    y === year ? "bg-emerald-600 text-white shadow" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
            <button
              onClick={exportCsv}
              disabled={!data}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/60 px-3.5 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition-colors hover:bg-emerald-500"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8" aria-busy="true" aria-label="Loading report">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40 lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40" />
          </div>
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-zinc-800 py-20 text-center">
          <p className="text-zinc-500">Failed to aggregate report data. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* Key metrics */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Gross revenue"
              value={`OMR ${formatOMR(s.revenue)}`}
              hint="Trip invoicing total"
              icon={TrendingUp}
              chip="bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
              glow="from-emerald-500/15"
            />
            <Metric
              label="Total expenses"
              value={`OMR ${formatOMR(s.expenses)}`}
              hint="Fuel, staff, maintenance and bills"
              icon={TrendingDown}
              chip="bg-red-500/10 text-red-400 ring-red-500/20"
              glow="from-red-500/15"
              valueClass="text-red-400"
            />
            <Metric
              label="Net margin"
              value={`OMR ${formatOMR(s.profit)}`}
              hint={`${margin.toFixed(1)}% of revenue kept as profit`}
              icon={Wallet}
              chip={
                s.profit >= 0
                  ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                  : "bg-red-500/10 text-red-400 ring-red-500/20"
              }
              glow={s.profit >= 0 ? "from-emerald-500/15" : "from-red-500/15"}
              valueClass={s.profit >= 0 ? "text-emerald-400" : "text-red-400"}
            />
            <Metric
              label="Operating ratio"
              value={`${operatingRatio.toFixed(1)}%`}
              hint="Cost-to-income efficiency (lower is better)"
              icon={Gauge}
              chip="bg-sky-500/10 text-sky-400 ring-sky-500/20"
              glow="from-sky-500/15"
            />
          </div>

          {/* Monthly chart + expense structure */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 lg:col-span-2">
              <h3 className="text-base font-semibold text-white">Monthly income vs expenses</h3>
              <p className="mb-5 mt-1 text-xs text-zinc-500">Revenue and total costs for each month of {year}</p>
              <div className="h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyBreakdown} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgb(255 255 255 / 0.04)" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h3 className="text-base font-semibold text-white">Expense structure</h3>
              <p className="mb-4 mt-1 text-xs text-zinc-500">Where the money goes</p>
              {structureTotal === 0 ? (
                <div className="flex h-60 items-center justify-center text-xs text-zinc-500">
                  No expenses recorded for {year}.
                </div>
              ) : (
                <>
                  <div className="relative h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={structure}
                          dataKey="value"
                          nameKey="label"
                          innerRadius={52}
                          outerRadius={74}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {structure.map((r) => (
                            <Cell key={r.label} fill={r.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(v) => `OMR ${formatOMR(Number(v))}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-4 space-y-3.5">
                    {structure.map((r) => {
                      const Icon = r.icon;
                      const share = percent(r.value, structureTotal);
                      return (
                        <li key={r.label}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-zinc-300">
                              <Icon className="h-4 w-4" style={{ color: r.color }} />
                              {r.label}
                            </span>
                            <span className="font-mono text-xs font-semibold text-white">
                              OMR {formatOMR(r.value)}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${share}%`, backgroundColor: r.color }}
                              />
                            </div>
                            <span className="w-8 text-right text-[11px] text-zinc-500">{share}%</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Truck rankings */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                <Trophy className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-white">Top 10 most profitable trucks</h3>
                <p className="text-xs text-zinc-500">Ranked by estimated margin for {year}</p>
              </div>
            </div>

            {data.truckBreakdown.length === 0 ? (
              <p className="py-10 text-center text-sm text-zinc-500">No truck activity recorded for {year}.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/80">
                    <tr className="border-b border-zinc-800 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      <th className="px-5 py-3">Rank</th>
                      <th className="px-5 py-3">Plate / Truck ID</th>
                      <th className="px-5 py-3 text-right">Revenue</th>
                      <th className="px-5 py-3 text-right">Fuel &amp; maintenance</th>
                      <th className="px-5 py-3 text-right">Estimated margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70">
                    {data.truckBreakdown.map((t: any, index: number) => (
                      <tr key={t.truckId} className="transition-colors hover:bg-zinc-800/30">
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              index === 0
                                ? "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                                : index === 1
                                  ? "bg-zinc-400/10 text-zinc-300 ring-1 ring-zinc-400/20"
                                  : index === 2
                                    ? "bg-orange-700/20 text-orange-400 ring-1 ring-orange-600/30"
                                    : "text-zinc-500"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-mono font-semibold text-emerald-400">{t.regNumber}</p>
                          <p className="font-mono text-[10px] text-zinc-500">{t.truckId}</p>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-zinc-300">OMR {formatOMR(t.revenue)}</td>
                        <td className="px-5 py-3 text-right font-mono text-red-400">OMR {formatOMR(t.expenses)}</td>
                        <td className="px-5 py-3 text-right">
                          <p
                            className={`font-mono font-bold ${t.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            OMR {formatOMR(t.profit)}
                          </p>
                          <div className="ml-auto mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${bestProfit > 0 ? Math.max(0, (t.profit / bestProfit) * 100) : 0}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
