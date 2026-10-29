"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import InvoiceForm from "@/components/forms/InvoiceForm";
import Link from "next/link";
import {
  Plus, Search, FileText, Building, Calendar,
  CheckCircle2, AlertCircle, Clock, Ban, DollarSign,
  Receipt, ArrowRight, ArrowUpRight
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "Draft": "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
  "Sent": "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  "Partial": "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  "Paid": "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  "Overdue": "bg-red-500/10 text-red-400 ring-red-500/20",
  "Cancelled": "bg-zinc-700/10 text-zinc-500 ring-zinc-700/20",
};

export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [totalInvoiced, setTotalInvoiced] = useState(0);

  const fetchInvoices = async (page = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ search, status, page: page.toString() });
      const res = await fetch(`/api/invoices?${q}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setPagination(data.pagination);
        setTotalInvoiced(data.totalAmount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
  }, [search, status]);

  const formatOMR = (v: number) =>
    new Intl.NumberFormat("en-OM", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(v);

  const unpaidInvoices = items.filter(inv => inv.status !== "Paid" && inv.status !== "Cancelled");
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.balanceAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Invoicing & Billing</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Generate invoices for trips, manage customer billing, and track payments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      {/* Summary Widgets */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Invoiced</span>
          </div>
          <p className="text-2xl font-bold text-white">OMR {formatOMR(totalInvoiced)}</p>
          <p className="text-xs text-zinc-500 mt-1">all time gross billing</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Outstanding Balance</span>
          </div>
          <p className="text-2xl font-bold text-red-400">OMR {formatOMR(totalUnpaid)}</p>
          <p className="text-xs text-zinc-500 mt-1">unpaid bills from current search results</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by invoice number, customer company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Partial">Partial</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-20 text-center">
          <FileText className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 font-bold text-sm text-zinc-400">No Invoices</h3>
          <p className="mt-1 text-xs text-zinc-500">Create your first invoice to bill customer freight trips.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/80">
              <tr className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Linked Trips</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Paid</th>
                <th className="px-5 py-3.5">Balance</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {items.map((invoice) => (
                <tr key={invoice.id} className="bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/invoices/${invoice.id}`} className="flex items-center gap-1 hover:underline">
                      <span className="font-mono font-semibold text-emerald-400 text-xs">{invoice.invoiceNumber}</span>
                      <ArrowUpRight className="h-3 w-3 text-zinc-500" />
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-300">
                    <div>
                      <p>Date: {new Date(invoice.date).toLocaleDateString("en-OM")}</p>
                      <p className="text-[10px] text-zinc-500">Due: {new Date(invoice.dueDate).toLocaleDateString("en-OM")}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                      <Building className="h-3.5 w-3.5 text-zinc-600" />
                      {invoice.customer?.companyName}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                      {invoice.trips?.length || 0} trips
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-sm font-semibold text-white">OMR {formatOMR(Number(invoice.totalAmount))}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono text-emerald-400">
                    OMR {formatOMR(Number(invoice.paidAmount))}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono text-zinc-300">
                    OMR {formatOMR(Number(invoice.balanceAmount))}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_COLORS[invoice.status] || "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20"}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3">
              <span className="text-xs text-zinc-500">{pagination.totalItems} invoices total</span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchInvoices(pagination.page - 1)}
                  className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchInvoices(pagination.page + 1)}
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
        <Modal title="Create invoice" onClose={() => setShowForm(false)}>
          <InvoiceForm
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              fetchInvoices();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
