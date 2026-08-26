"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldAlert, Plus, X } from "lucide-react";
import Link from "next/link";

const VAT_RATE = 0.05; // Oman 5% VAT

export default function CreateInvoicePage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<any[]>([]);
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [selectedTrips, setSelectedTrips] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const today = new Date();
  const due30 = new Date(today);
  due30.setDate(due30.getDate() + 30);

  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    customerId: 0,
    date: today.toISOString().split("T")[0],
    dueDate: due30.toISOString().split("T")[0],
    discountAmount: 0,
    notes: "",
    status: "Draft",
    applyVat: true,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [resCustomers, resTrips] = await Promise.all([
          fetch("/api/customers?isActive=true&pageSize=200"),
          fetch("/api/trips?pageSize=200"),
        ]);

        if (resCustomers.ok) {
          const cData = await resCustomers.json();
          setCustomers(cData.items || []);
        }

        if (resTrips.ok) {
          const tData = await resTrips.json();
          setAvailableTrips(tData.items || tData);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "customerId" || name === "discountAmount"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const toggleTripSelection = (trip: any) => {
    if (selectedTrips.find((t) => t.id === trip.id)) {
      setSelectedTrips((prev) => prev.filter((t) => t.id !== trip.id));
    } else {
      setSelectedTrips((prev) => [...prev, trip]);
    }
  };

  // Filtered trips based on selected customer
  const filteredTrips = useMemo(() => {
    if (formData.customerId === 0) return availableTrips;
    return availableTrips.filter(
      (t) => t.customerId === formData.customerId || t.customer?.id === formData.customerId
    );
  }, [formData.customerId, availableTrips]);

  const subtotal = selectedTrips.reduce((sum, t) => sum + Number(t.revenue || 0), 0);
  const taxAmount = formData.applyVat ? subtotal * VAT_RATE : 0;
  const totalAmount = subtotal + taxAmount - formData.discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (formData.customerId === 0) {
      setError("Please select a customer");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: formData.invoiceNumber,
          customerId: formData.customerId,
          date: formData.date,
          dueDate: formData.dueDate,
          subtotal,
          taxAmount,
          discountAmount: formData.discountAmount,
          notes: formData.notes,
          status: formData.status,
          tripIds: selectedTrips.map((t) => t.id),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");

      router.push("/invoices");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-5">
        <Link href="/invoices" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Invoice</h1>
          <p className="mt-1.5 text-sm text-zinc-400">Generate a tax invoice for completed trips with Oman 5% VAT applied.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loadingData ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Meta */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">Invoice Details</p>
            <div className="grid gap-5 sm:grid-cols-2 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Invoice Number *</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  required
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Billing Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent to Customer</option>
                  <option value="Paid">Paid / Settled</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Select Customer *</label>
                <select
                  name="customerId"
                  required
                  value={formData.customerId}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value={0}>Choose Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName} ({c.custId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Invoice Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Discount (OMR)</label>
                <input
                  type="number"
                  step="0.001"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-blue-500/10 bg-blue-500/5 p-3 self-end">
                <input
                  type="checkbox"
                  id="applyVat"
                  name="applyVat"
                  checked={formData.applyVat}
                  onChange={handleChange}
                  className="h-4 w-4 accent-blue-500"
                />
                <label htmlFor="applyVat" className="text-xs text-zinc-300 cursor-pointer">
                  Apply <span className="font-semibold text-blue-400">Oman VAT (5%)</span> to subtotal
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Invoice Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Payment instructions, bank account details, thank you message..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Trip Selector */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Trips to Invoice {selectedTrips.length > 0 && <span className="text-emerald-400">({selectedTrips.length} selected)</span>}
              </p>
              {formData.customerId === 0 && (
                <span className="text-xs text-zinc-600">Select a customer to filter relevant trips</span>
              )}
            </div>

            {/* Selected Trips Summary */}
            {selectedTrips.length > 0 && (
              <div className="mb-4 space-y-2">
                {selectedTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs">
                    <div>
                      <span className="font-medium text-emerald-400">{trip.tripId}</span>
                      <span className="text-zinc-400 ml-2">{trip.origin} → {trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-mono">OMR {Number(trip.revenue || 0).toFixed(3)}</span>
                      <button type="button" onClick={() => toggleTripSelection(trip)} className="text-zinc-500 hover:text-red-400">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Available Trips Table */}
            <div className="max-h-52 overflow-y-auto rounded-lg border border-zinc-800 divide-y divide-zinc-800/60">
              {filteredTrips.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
                  {formData.customerId === 0 ? "Select a customer to see their trips" : "No trips found for this customer"}
                </div>
              ) : (
                filteredTrips
                  .filter((t) => !selectedTrips.find((s) => s.id === t.id))
                  .map((trip) => (
                    <button
                      key={trip.id}
                      type="button"
                      onClick={() => toggleTripSelection(trip)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-left hover:bg-zinc-800/40 transition-colors"
                    >
                      <div>
                        <span className="font-medium text-zinc-300">{trip.tripId}</span>
                        <span className="text-zinc-500 ml-2">{trip.origin} → {trip.destination}</span>
                        <span className="text-zinc-600 ml-2">{trip.status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <span className="font-mono">OMR {Number(trip.revenue || 0).toFixed(3)}</span>
                        <Plus className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="block text-zinc-500 uppercase tracking-wider mb-1">Subtotal</span>
              <span className="text-base font-mono text-white">OMR {subtotal.toFixed(3)}</span>
            </div>
            <div>
              <span className="block text-zinc-500 uppercase tracking-wider mb-1">VAT (5%)</span>
              <span className="text-base font-mono text-blue-400">OMR {taxAmount.toFixed(3)}</span>
            </div>
            <div>
              <span className="block text-zinc-500 uppercase tracking-wider mb-1">Discount</span>
              <span className="text-base font-mono text-red-400">- OMR {formData.discountAmount.toFixed(3)}</span>
            </div>
            <div className="sm:border-l sm:border-zinc-800 sm:pl-4">
              <span className="block text-emerald-400 uppercase tracking-wider mb-1">Total Amount</span>
              <span className="text-xl font-mono font-bold text-emerald-400">OMR {totalAmount.toFixed(3)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/invoices" className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
