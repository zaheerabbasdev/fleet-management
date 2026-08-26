"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import Link from "next/link";

const EXPENSE_CATEGORIES = [
  "Office & Administration",
  "Communication & Internet",
  "Toll & Road Fees",
  "Customs & Port Charges",
  "Permits & Licensing",
  "Advertising & Marketing",
  "Utilities",
  "Insurance",
  "Legal & Professional Fees",
  "Stationery & Supplies",
  "Travel & Accommodation",
  "Miscellaneous",
];

export default function AddExpensePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    expenseId: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    amount: 0,
    paymentMethod: "Cash",
    paidBy: "",
    approved: false,
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "amount"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          truckId: null,
          tripId: null,
          employeeId: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save expense");

      router.push("/expenses");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-5">
        <Link href="/expenses" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Log General Expense</h1>
          <p className="mt-1.5 text-sm text-zinc-400">Record office, administrative, and operational expenses.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="grid gap-5 sm:grid-cols-2 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Expense Reference ID *</label>
              <input
                type="text"
                name="expenseId"
                required
                placeholder="EXP-0045"
                value={formData.expenseId}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Expense Date *</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Category *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
              >
                <option value="">Select Category</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Corporate Card">Corporate Card</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Description *</label>
              <input
                type="text"
                name="description"
                required
                placeholder="Short description of what was purchased or paid for"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Amount (OMR) *</label>
              <input
                type="number"
                step="0.001"
                name="amount"
                required
                value={formData.amount}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Paid By</label>
              <input
                type="text"
                name="paidBy"
                placeholder="Office Admin / Employee Name"
                value={formData.paidBy}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Notes</label>
              <textarea
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white resize-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3">
              <input
                type="checkbox"
                id="approved"
                name="approved"
                checked={formData.approved}
                onChange={handleChange}
                className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
              />
              <label htmlFor="approved" className="text-sm text-zinc-300 cursor-pointer">
                Mark as <span className="font-semibold text-emerald-400">Approved</span> — expense has been verified and authorized
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/expenses"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-850"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}
