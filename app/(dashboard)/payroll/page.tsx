"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Wallet, Users, ChevronDown, Check,
  TrendingUp, TrendingDown, DollarSign, Calendar
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const STATUS_COLORS: Record<string, string> = {
  "Draft": "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
  "Approved": "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  "Paid": "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
};

export default function PayrollPage() {
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalGross: 0, totalNet: 0 });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState<string>((now.getMonth() + 1).toString());
  const [year, setYear] = useState<string>(now.getFullYear().toString());

  const fetchPayroll = async (page = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ month, year, page: page.toString() });
      const res = await fetch(`/api/payroll?${q}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setSummary(data.summary);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll(1);
  }, [month, year]);

  const formatOMR = (v: number) =>
    new Intl.NumberFormat("en-OM", { minimumFractionDigits: 3 }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Salaries & Payroll</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Process monthly salaries, bonuses, deductions, and advances for all employees.
          </p>
        </div>
        <Link
          href="/payroll/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Payroll
        </Link>
      </div>

      {/* Month/Year filter */}
      <div className="grid gap-4 sm:grid-cols-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
        >
          {[2023, 2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Summary quick view */}
        <div className="sm:col-span-2 flex gap-4">
          <div className="flex-1 rounded-lg bg-emerald-500/5 border border-emerald-500/20 px-4 py-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Gross Payroll</p>
            <p className="font-mono font-bold text-white text-sm">OMR {formatOMR(summary.totalGross)}</p>
          </div>
          <div className="flex-1 rounded-lg bg-blue-500/5 border border-blue-500/20 px-4 py-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Net Payroll</p>
            <p className="font-mono font-bold text-blue-300 text-sm">OMR {formatOMR(summary.totalNet)}</p>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-20 text-center">
          <Wallet className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 font-bold text-sm text-zinc-400">No Payroll Records</h3>
          <p className="mt-1 text-xs text-zinc-500">
            No payroll found for {MONTHS[parseInt(month) - 1]} {year}. Add payroll records for employees.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/80">
              <tr className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Base Salary</th>
                <th className="px-5 py-3.5">Bonuses</th>
                <th className="px-5 py-3.5">Gross</th>
                <th className="px-5 py-3.5">Deductions</th>
                <th className="px-5 py-3.5">Net Salary</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {items.map((payroll) => (
                <tr key={payroll.id} className="bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-semibold text-zinc-200">{payroll.employee?.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">{payroll.employee?.empId}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-400">{payroll.employee?.nationality || "Oman"}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-zinc-300">{formatOMR(Number(payroll.baseSalary))}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-emerald-400">
                      +{formatOMR(Number(payroll.allowances) + Number(payroll.overtime) + Number(payroll.bonus))}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-semibold text-white">{formatOMR(Number(payroll.grossSalary))}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-red-400">
                      -{formatOMR(Number(payroll.deductions))}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-emerald-400">{formatOMR(Number(payroll.netSalary))}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_COLORS[payroll.status] || "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20"}`}>
                      {payroll.status === "Paid" && <Check className="h-3 w-3" />}
                      {payroll.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
