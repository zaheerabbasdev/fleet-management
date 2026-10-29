"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/Modal";
import {
  ArrowLeft, Building, Phone, Mail, MapPin, FileText,
  CreditCard, Package, CheckCircle2, Clock, AlertTriangle,
  XCircle, Send, Printer, Plus, Trash2, ShieldAlert,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; icon: any }> = {
  Draft:           { color: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",    icon: FileText },
  Sent:            { color: "bg-blue-500/10 text-blue-400 ring-blue-500/20",      icon: Send },
  "Partially Paid":{ color: "bg-amber-500/10 text-amber-400 ring-amber-500/20",  icon: Clock },
  Paid:            { color: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20", icon: CheckCircle2 },
  Overdue:         { color: "bg-red-500/10 text-red-400 ring-red-500/20",         icon: AlertTriangle },
  Cancelled:       { color: "bg-zinc-700/30 text-zinc-500 ring-zinc-700/30",      icon: XCircle },
};

const PAYMENT_METHODS = ["Bank Transfer", "Cash", "Cheque", "Online"];

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [invoice, setInvoice]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Record payment form
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm]  = useState({
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    paymentMethod: "Bank Transfer",
    referenceNumber: "",
    notes: "",
  });
  const [paying, setPaying]    = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (res.ok) setInvoice(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoice(); }, [id]);

  const handleStatusChange = async (status: string) => {
    setError("");
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setInvoice((prev: any) => ({ ...prev, ...data.invoice }));
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setError("");
    try {
      const res = await fetch(`/api/invoices/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: parseInt(id as string),
          date: payForm.date,
          amount: parseFloat(payForm.amount),
          paymentMethod: payForm.paymentMethod,
          referenceNumber: payForm.referenceNumber || null,
          notes: payForm.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment");
      setShowPayForm(false);
      setPayForm({ date: new Date().toISOString().slice(0,10), amount: "", paymentMethod: "Bank Transfer", referenceNumber: "", notes: "" });
      await fetchInvoice();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete invoice ${invoice.invoiceNumber}? This cannot be undone.`)) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      router.push("/invoices");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
    </div>
  );

  if (!invoice) return (
    <div className="rounded-xl border border-red-800/50 bg-red-950/20 p-12 text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
      <h3 className="mt-4 font-bold text-white">Invoice Not Found</h3>
      <Link href="/invoices" className="mt-4 inline-flex text-sm text-emerald-400 hover:underline">← Back to Invoices</Link>
    </div>
  );

  const paidAmount   = invoice.paidAmount ?? 0;
  const totalAmount  = parseFloat(invoice.totalAmount ?? 0);
  const balance      = totalAmount - paidAmount;
  const paidPct      = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
  const statusCfg    = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG["Draft"];
  const StatusIcon   = statusCfg.icon;

  const isOverdue = invoice.status !== "Paid" && invoice.status !== "Cancelled" &&
    new Date(invoice.dueDate) < new Date();

  return (
    <div className="space-y-6 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/invoices" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-mono">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-sm text-zinc-500">{invoice.customer?.companyName}</p>
          </div>
          <span className={`ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusCfg.color}`}>
            <StatusIcon className="h-3 w-3" />
            {invoice.status}
          </span>
          {isOverdue && invoice.status !== "Overdue" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 ring-1 ring-inset ring-red-500/20">
              <AlertTriangle className="h-3 w-3" /> Overdue
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {invoice.status === "Draft" && (
            <button
              onClick={() => handleStatusChange("Sent")}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              <Send className="h-4 w-4" /> Mark as Sent
            </button>
          )}
          {(invoice.status === "Sent" || invoice.status === "Partially Paid" || invoice.status === "Overdue") && (
            <button
              onClick={() => setShowPayForm(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              <Plus className="h-4 w-4" /> Record Payment
            </button>
          )}
          {invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
            <button
              onClick={() => handleStatusChange("Cancelled")}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <XCircle className="h-4 w-4" /> Cancel
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
          {invoice.status !== "Paid" && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-lg border border-red-800/60 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40 disabled:opacity-60 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400 print:hidden">
          <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Record Payment Form */}
      {showPayForm && (
        <Modal title="Add payment" onClose={() => setShowPayForm(false)}>
          {error && (
            <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
          )}
          <form onSubmit={handleRecordPayment} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Date paid *</label>
              <input type="date" required value={payForm.date}
                onChange={e => setPayForm({...payForm, date: e.target.value})}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Amount (OMR) * <span className="text-zinc-500">(Left to pay: {balance.toFixed(3)})</span>
              </label>
              <input type="number" required min="0.001" step="0.001" max={balance}
                placeholder={balance.toFixed(3)} value={payForm.amount}
                onChange={e => setPayForm({...payForm, amount: e.target.value})}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">How was it paid? *</label>
              <select value={payForm.paymentMethod}
                onChange={e => setPayForm({...payForm, paymentMethod: e.target.value})}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Reference or cheque number</label>
              <input value={payForm.referenceNumber}
                onChange={e => setPayForm({...payForm, referenceNumber: e.target.value})}
                placeholder="Optional"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">Notes</label>
              <input value={payForm.notes}
                onChange={e => setPayForm({...payForm, notes: e.target.value})}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={paying}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                {paying ? "Saving…" : "Save payment"}
              </button>
              <button type="button" onClick={() => setShowPayForm(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Invoice */}
        <div className="lg:col-span-2 space-y-5">

          {/* Invoice Meta */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Invoice Number</p>
                <p className="font-mono font-bold text-white">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Issue Date</p>
                <p className="text-zinc-300">{new Date(invoice.date).toLocaleDateString("en-OM", { day:"2-digit", month:"short", year:"numeric" })}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Due Date</p>
                <p className={`font-semibold ${isOverdue ? "text-red-400" : "text-zinc-300"}`}>
                  {new Date(invoice.dueDate).toLocaleDateString("en-OM", { day:"2-digit", month:"short", year:"numeric" })}
                  {isOverdue && " ⚠"}
                </p>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Bill To</h2>
            <Link href={`/customers/${invoice.customer?.id}`} className="group">
              <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                {invoice.customer?.companyName}
              </p>
            </Link>
            <div className="mt-2 space-y-1 text-xs text-zinc-400">
              {invoice.customer?.contactPerson && (
                <div className="flex items-center gap-2"><Building className="h-3.5 w-3.5 text-zinc-600" />{invoice.customer.contactPerson}</div>
              )}
              {invoice.customer?.phone && (
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-zinc-600" />{invoice.customer.phone}</div>
              )}
              {invoice.customer?.email && (
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-zinc-600" />{invoice.customer.email}</div>
              )}
              {(invoice.customer?.city || invoice.customer?.country) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-600" />
                  {[invoice.customer.city, invoice.customer.country].filter(Boolean).join(", ")}
                </div>
              )}
              {invoice.customer?.taxNumber && (
                <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-zinc-600" />VAT: {invoice.customer.taxNumber}</div>
              )}
            </div>
          </div>

          {/* Linked Trips */}
          {invoice.trips?.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                <Package className="h-3.5 w-3.5" /> Linked Trips ({invoice.trips.length})
              </h2>
              <div className="space-y-2">
                {invoice.trips.map(({ trip }: any) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 hover:border-zinc-700 transition-all"
                  >
                    <div>
                      <p className="text-xs font-mono text-zinc-500">{trip.tripId}</p>
                      <p className="text-sm text-white">{trip.origin} → {trip.destination}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(trip.tripDate).toLocaleDateString("en-OM")}
                        {trip.cargo && ` · ${trip.cargo}`}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-400">
                      OMR {parseFloat(trip.revenue).toFixed(3)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Amounts */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Invoice Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>OMR {parseFloat(invoice.subtotal ?? 0).toFixed(3)}</span>
              </div>
              {parseFloat(invoice.taxAmount ?? 0) > 0 && (
                <div className="flex justify-between text-zinc-400">
                  <span>VAT (5%)</span>
                  <span>OMR {parseFloat(invoice.taxAmount).toFixed(3)}</span>
                </div>
              )}
              {parseFloat(invoice.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>− OMR {parseFloat(invoice.discountAmount).toFixed(3)}</span>
                </div>
              )}
              <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-white text-base">
                <span>Total</span>
                <span>OMR {totalAmount.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Paid</span>
                <span>OMR {paidAmount.toFixed(3)}</span>
              </div>
              <div className={`flex justify-between font-semibold ${balance > 0 ? "text-red-400" : "text-zinc-400"}`}>
                <span>Balance Due</span>
                <span>OMR {balance.toFixed(3)}</span>
              </div>
            </div>
            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Payment Progress</span>
                <span>{paidPct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Notes</h2>
              <p className="text-sm text-zinc-400 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Right: Payments */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
              Payment History ({invoice.payments?.length ?? 0})
            </h2>
            {invoice.payments?.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No payments recorded</p>
            ) : (
              <div className="space-y-3">
                {invoice.payments?.map((pay: any) => (
                  <div key={pay.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-emerald-400">
                          OMR {parseFloat(pay.amount).toFixed(3)}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {new Date(pay.date).toLocaleDateString("en-OM")}
                        </p>
                      </div>
                      <span className="text-xs rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-400">
                        {pay.paymentMethod}
                      </span>
                    </div>
                    {pay.referenceNumber && (
                      <p className="text-xs text-zinc-500 mt-1 font-mono">Ref: {pay.referenceNumber}</p>
                    )}
                    {pay.notes && (
                      <p className="text-xs text-zinc-600 mt-1">{pay.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {(invoice.status === "Sent" || invoice.status === "Partially Paid" || invoice.status === "Overdue") && (
              <button
                onClick={() => setShowPayForm(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-800/50 py-2.5 text-sm text-emerald-500 hover:bg-emerald-950/20 transition-colors"
              >
                <Plus className="h-4 w-4" /> Record Payment
              </button>
            )}
          </div>

          {/* Quick status actions */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Change Status</h2>
            <div className="space-y-2">
              {Object.keys(STATUS_CONFIG).map((status) => {
                const cfg = STATUS_CONFIG[status];
                return (
                  <button
                    key={status}
                    disabled={invoice.status === status}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors ${
                      invoice.status === status
                        ? "opacity-100 cursor-default " + cfg.color + " ring-1 ring-inset"
                        : "text-zinc-400 hover:bg-zinc-800 border border-zinc-800"
                    }`}
                  >
                    {invoice.status === status ? "✓ " : ""}{status}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-xs text-zinc-500 space-y-1">
            <p>Created: {new Date(invoice.createdAt).toLocaleDateString("en-OM")}</p>
            <p>Updated: {new Date(invoice.updatedAt).toLocaleDateString("en-OM")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
