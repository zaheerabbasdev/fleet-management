"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building, Phone, Mail, MapPin, Globe,
  CreditCard, FileText, Package, Edit2, Save, X,
  Trash2, AlertTriangle, ShieldAlert, TrendingUp,
} from "lucide-react";

const OMAN_CITIES = [
  "Muscat", "Salalah", "Sohar", "Nizwa", "Sur", "Ibra", "Rustaq", "Barka",
  "Saham", "Khasab", "Adam", "Ibri", "Bahla", "Sinaw", "Haima",
  "Al-Buraimi", "Mudhaibi", "Duqm", "Shinas", "Liwa",
];

const PAYMENT_TERMS = ["Net 15", "Net 30", "Net 45", "Net 60", "Due on Receipt", "Prepaid"];

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCustomer(data);
        setForm({
          companyName: data.companyName,
          contactPerson: data.contactPerson || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "Oman",
          taxNumber: data.taxNumber || "",
          creditLimit: data.creditLimit ?? 0,
          paymentTerms: data.paymentTerms || "",
          notes: data.notes || "",
          status: data.status || "Active",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          creditLimit: parseFloat(form.creditLimit) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setCustomer(data.customer);
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${customer.companyName}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      router.push("/customers");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="rounded-xl border border-red-800/50 bg-red-950/20 p-12 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 font-bold text-white">Customer Not Found</h3>
        <Link href="/customers" className="mt-4 inline-flex text-sm text-emerald-400 hover:underline">
          ← Back to Customers
        </Link>
      </div>
    );
  }

  const totalRevenue = customer.invoices?.reduce(
    (s: number, inv: any) => s + parseFloat(inv.totalAmount || 0),
    0
  );
  const totalPaid = customer.invoices?.reduce(
    (s: number, inv: any) => s + parseFloat(inv.paidAmount || 0),
    0
  );
  const outstanding = totalRevenue - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/customers" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {customer.companyName}
            </h1>
            <p className="text-sm text-zinc-500 font-mono">{customer.custId}</p>
          </div>
          <span
            className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
              customer.status === "Active"
                ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
                : "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20"
            }`}
          >
            {customer.status}
          </span>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={() => { setEditing(false); setError(""); }}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition-colors"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <Edit2 className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg border border-red-800/60 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40 disabled:opacity-60 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-800/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="mb-4 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Company Information
            </h2>
            {editing ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Company Name *</label>
                  <input
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Contact Person</label>
                  <input
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">City</label>
                  <select
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select City</option>
                    {OMAN_CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Country</label>
                  <input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Address</label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">VAT / Tax Number</label>
                  <input
                    value={form.taxNumber}
                    onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Credit Limit (OMR)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.creditLimit}
                    onChange={(e) => setForm({ ...form, creditLimit: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Payment Terms</label>
                  <select
                    value={form.paymentTerms}
                    onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Select Terms</option>
                    {PAYMENT_TERMS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                {customer.contactPerson && (
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <Building className="h-4 w-4 text-zinc-500 shrink-0" />
                    {customer.contactPerson}
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <Phone className="h-4 w-4 text-zinc-500 shrink-0" />
                    {customer.phone}
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <Mail className="h-4 w-4 text-zinc-500 shrink-0" />
                    {customer.email}
                  </div>
                )}
                {(customer.city || customer.country) && (
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <MapPin className="h-4 w-4 text-zinc-500 shrink-0" />
                    {[customer.city, customer.country].filter(Boolean).join(", ")}
                  </div>
                )}
                {customer.address && (
                  <div className="sm:col-span-2 flex items-start gap-2.5 text-zinc-300">
                    <Globe className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                    <span className="whitespace-pre-line">{customer.address}</span>
                  </div>
                )}
                {customer.taxNumber && (
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <FileText className="h-4 w-4 text-zinc-500 shrink-0" />
                    <span className="font-mono text-xs">{customer.taxNumber}</span>
                  </div>
                )}
                {customer.paymentTerms && (
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CreditCard className="h-4 w-4 text-zinc-500 shrink-0" />
                    {customer.paymentTerms}
                  </div>
                )}
                {customer.notes && (
                  <div className="sm:col-span-2 rounded-lg bg-zinc-800/50 px-3 py-2 text-xs text-zinc-400 italic">
                    {customer.notes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Trips */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                Recent Trips ({customer._count?.trips ?? 0})
              </h2>
              <Link href={`/trips?customerId=${customer.id}`} className="text-xs text-emerald-400 hover:underline">
                View All
              </Link>
            </div>
            {customer.trips?.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No trips yet</p>
            ) : (
              <div className="space-y-2">
                {customer.trips?.map((trip: any) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 hover:border-zinc-700 transition-all"
                  >
                    <div>
                      <p className="text-xs font-mono text-zinc-400">{trip.tripId}</p>
                      <p className="text-sm text-white">
                        {trip.origin} → {trip.destination}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(trip.tripDate).toLocaleDateString("en-OM")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-400">
                        OMR {parseFloat(trip.revenue).toFixed(3)}
                      </p>
                      <span className={`text-xs rounded-full px-2 py-0.5 ${
                        trip.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : trip.status === "In Progress"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-zinc-500/10 text-zinc-400"
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Invoices */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
                Recent Invoices ({customer._count?.invoices ?? 0})
              </h2>
              <Link href={`/invoices?customerId=${customer.id}`} className="text-xs text-emerald-400 hover:underline">
                View All
              </Link>
            </div>
            {customer.invoices?.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No invoices yet</p>
            ) : (
              <div className="space-y-2">
                {customer.invoices?.map((inv: any) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 hover:border-zinc-700 transition-all"
                  >
                    <div>
                      <p className="text-xs font-mono text-zinc-400">{inv.invoiceNumber}</p>
                      <p className="text-xs text-zinc-500">
                        Issued: {new Date(inv.invoiceDate).toLocaleDateString("en-OM")} &nbsp;·&nbsp;
                        Due: {new Date(inv.dueDate).toLocaleDateString("en-OM")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        OMR {parseFloat(inv.totalAmount).toFixed(3)}
                      </p>
                      <span className={`text-xs rounded-full px-2 py-0.5 ${
                        inv.status === "Paid"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : inv.status === "Overdue"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Stats */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="mb-4 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Financial Summary
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-white">
                  OMR {totalRevenue?.toFixed(3) ?? "0.000"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Amount Paid</p>
                <p className="text-xl font-bold text-emerald-400">
                  OMR {totalPaid?.toFixed(3) ?? "0.000"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Outstanding Balance</p>
                <p className={`text-xl font-bold ${outstanding > 0 ? "text-red-400" : "text-zinc-400"}`}>
                  OMR {outstanding?.toFixed(3) ?? "0.000"}
                </p>
              </div>
              <div className="border-t border-zinc-800 pt-3">
                <p className="text-xs text-zinc-500 mb-1">Credit Limit</p>
                <p className="text-lg font-semibold text-zinc-300">
                  OMR {parseFloat(customer.creditLimit ?? 0).toFixed(3)}
                </p>
                {parseFloat(customer.creditLimit ?? 0) > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>Used</span>
                      <span>
                        {Math.min(100, Math.round((outstanding / parseFloat(customer.creditLimit)) * 100))}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-800">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500 transition-all"
                        style={{
                          width: `${Math.min(100, Math.round((outstanding / parseFloat(customer.creditLimit)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h2 className="mb-3 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
              Activity
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Package className="h-4 w-4 text-zinc-600" />
                  Total Trips
                </div>
                <span className="font-semibold text-white">{customer._count?.trips ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                  <FileText className="h-4 w-4 text-zinc-600" />
                  Total Invoices
                </div>
                <span className="font-semibold text-white">{customer._count?.invoices ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2 text-zinc-400">
                  <TrendingUp className="h-4 w-4 text-zinc-600" />
                  Payment Terms
                </div>
                <span className="font-semibold text-white text-right text-xs">
                  {customer.paymentTerms || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-xs text-zinc-500 space-y-1">
            <p>Created: {new Date(customer.createdAt).toLocaleDateString("en-OM")}</p>
            <p>Updated: {new Date(customer.updatedAt).toLocaleDateString("en-OM")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
