"use client";

import { useEffect, useState } from "react";
import {
  FileText, TrendingUp, TrendingDown, DollarSign,
  Briefcase, Wrench, Fuel, BarChart4, ChevronRight,
  Download, Printer, Landmark
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from "recharts";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<string>("2026");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?year=${year}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [year]);

  const formatOMR = (v: number) =>
    new Intl.NumberFormat("en-OM", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Reports Console</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            View high-level financials, operational expenses, truck profitability rankings, and growth trends.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="2024">Year 2024</option>
            <option value="2025">Year 2025</option>
            <option value="2026">Year 2026</option>
            <option value="2027">Year 2027</option>
          </select>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-850"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : !data ? (
        <div className="text-center py-20 border border-zinc-800 rounded-xl">
          <p className="text-zinc-500">Failed to aggregate report data. Please try again.</p>
        </div>
      ) : (
        <>
          {/* Main Financial Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Gross Revenue</p>
              <p className="text-2xl font-bold text-white">OMR {formatOMR(data.summary.revenue)}</p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Trip invoicing total</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-400">OMR {formatOMR(data.summary.expenses)}</p>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2">
                <span>Fuel, staff, maintenance & bills</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Net Margin</p>
              <p className={`text-2xl font-bold ${data.summary.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                OMR {formatOMR(data.summary.profit)}
              </p>
              <div className="flex items-center gap-1.5 text-xs mt-2 text-zinc-500">
                <span>Net operational profit</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Operating Ratio</p>
              <p className="text-2xl font-bold text-white">
                {data.summary.revenue > 0 ? ((data.summary.expenses / data.summary.revenue) * 100).toFixed(1) : "0.0"}%
              </p>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2">
                <span>Cost-to-income efficiency</span>
              </div>
            </div>
          </div>

          {/* Expense Category Breakdown */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/10 p-5 space-y-4">
              <h3 className="font-bold text-white text-base">Monthly Income vs Expenses</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-5">
              <h3 className="font-bold text-white text-base mb-4">Expense Structure</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-amber-400" />
                    <span className="text-zinc-300">Fuel Costs</span>
                  </div>
                  <span className="font-mono font-semibold text-white">OMR {formatOMR(data.summary.fuel)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-blue-400" />
                    <span className="text-zinc-300">Maintenance</span>
                  </div>
                  <span className="font-mono font-semibold text-white">OMR {formatOMR(data.summary.maintenance)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-emerald-400" />
                    <span className="text-zinc-300">Staff Salaries</span>
                  </div>
                  <span className="font-mono font-semibold text-white">OMR {formatOMR(data.summary.salaries)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-400" />
                    <span className="text-zinc-300">General Overhead</span>
                  </div>
                  <span className="font-mono font-semibold text-white">OMR {formatOMR(data.summary.general)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Truck Profitability Rankings */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-5">
            <h3 className="font-bold text-white text-base mb-4">Top 10 Most Profitable Trucks</h3>
            <div className="overflow-hidden rounded-lg border border-zinc-850">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-900/60">
                  <tr className="text-xs font-semibold text-zinc-400 uppercase tracking-wide border-b border-zinc-850">
                    <th className="px-5 py-3">Rank</th>
                    <th className="px-5 py-3">Plate / Truck ID</th>
                    <th className="px-5 py-3 text-right">Revenue</th>
                    <th className="px-5 py-3 text-right">Fuel & Maintenance</th>
                    <th className="px-5 py-3 text-right">Estimated Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {data.truckBreakdown.map((t: any, index: number) => (
                    <tr key={t.truckId} className="bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
                      <td className="px-5 py-3 font-semibold text-zinc-500">#{index + 1}</td>
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-mono text-emerald-400 font-semibold">{t.regNumber}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{t.truckId}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-zinc-300">
                        OMR {formatOMR(t.revenue)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-red-400">
                        OMR {formatOMR(t.expenses)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-emerald-400">
                        OMR {formatOMR(t.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
