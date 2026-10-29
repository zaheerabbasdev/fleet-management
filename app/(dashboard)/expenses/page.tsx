"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import ExpenseForm from "@/components/forms/ExpenseForm";
import Link from "next/link";
import {
  Plus, Search, ReceiptText, Building, Calendar,
  FileText, Check, Clock, AlertCircle, TrendingUp
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "Draft": "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
  "Sent": "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  "Partial": "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  "Paid": "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  "Overdue": "bg-red-500/10 text-red-400 ring-red-500/20",
  "Cancelled": "bg-zinc-600/10 text-zinc-500 ring-zinc-600/20",
};

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  const CATEGORIES = [
    "Fuel", "Maintenance", "Tires", "Toll", "Port / Customs",
    "Driver Allowance", "Food", "Accommodation", "Insurance",
    "Registration", "Office", "Miscellaneous",
  ];

  const fetchExpenses = async (page = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ category, page: page.toString() });
      const res = await fetch(`/api/expenses?${q}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotalAmount(data.totalAmount);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(1);
  }, [category]);

  const formatOMR = (v: number) =>
    new Intl.NumberFormat("en-OM", { minimumFractionDigits: 3 }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Expenses</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Track all company expenses by category — maintenance, fuel, office, port fees, and more.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
      </div>

      {/* Filters + Total */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="ml-auto rounded-lg bg-red-500/5 border border-red-500/20 px-4 py-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Total Expenses</p>
          <p className="font-mono font-bold text-red-400 text-sm">OMR {formatOMR(totalAmount)}</p>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-20 text-center">
          <ReceiptText className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 font-bold text-sm text-zinc-400">No Expenses Found</h3>
          <p className="mt-1 text-xs text-zinc-500">Log your first expense to begin tracking operational costs.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/80">
              <tr className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Expense ID</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Truck</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Approved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {items.map((expense) => (
                <tr key={expense.id} className="bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors">
                  <td className="px-5 py-3.5 text-zinc-300 text-xs">
                    {new Date(expense.date).toLocaleDateString("en-OM")}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-zinc-500">{expense.expenseId}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-300 text-xs max-w-[200px] truncate">{expense.description}</td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500">{expense.truck?.regNumber || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-semibold text-white">OMR {formatOMR(Number(expense.amount))}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-400">{expense.paymentMethod}</td>
                  <td className="px-5 py-3.5">
                    {expense.approved ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                        <Check className="h-4 w-4" /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="h-4 w-4" /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3">
              <span className="text-xs text-zinc-500">{pagination.totalItems} total expenses</span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchExpenses(pagination.page - 1)}
                  className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchExpenses(pagination.page + 1)}
                  className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal title="Add expense" onClose={() => setShowForm(false)}>
          <ExpenseForm
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              fetchExpenses();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
