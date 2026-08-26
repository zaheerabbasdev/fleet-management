"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import Link from "next/link";

const OMAN_CITIES = [
  "Muscat", "Salalah", "Sohar", "Nizwa", "Sur", "Ibra", "Rustaq", "Barka",
  "Saham", "Khasab", "Adam", "Ibri", "Bahla", "Sinaw", "Haima",
  "Al-Buraimi", "Mudhaibi", "Duqm", "Shinas", "Liwa",
];

export default function AddCustomerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    custId: "",
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "Oman",
    vatNumber: "",
    creditLimit: 0,
    paymentTerms: "Net 30",
    notes: "",
    isActive: true,
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
          : name === "creditLimit"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register customer");

      router.push("/customers");
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
        <Link href="/customers" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Register New Customer</h1>
          <p className="mt-1.5 text-sm text-zinc-400">Add a new client company with contact details, credit limit, and billing preferences.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Company Information</p>
          <div className="grid gap-5 sm:grid-cols-2 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Customer ID *</label>
              <input
                type="text"
                name="custId"
                required
                placeholder="CUST-001"
                value={formData.custId}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Company Name *</label>
              <input
                type="text"
                name="companyName"
                required
                placeholder="Al-Fardan Trading LLC"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Primary Contact Name</label>
              <input
                type="text"
                name="contactName"
                placeholder="Ahmed Al-Balushi"
                value={formData.contactName}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="+968 9XXX XXXX"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="accounts@company.om"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Oman VAT Number (TRN)</label>
              <input
                type="text"
                name="vatNumber"
                placeholder="OM1234567890"
                value={formData.vatNumber}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
              >
                <option value="">Select City</option>
                {OMAN_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                readOnly
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Business Address</label>
              <textarea
                name="address"
                rows={2}
                placeholder="P.O. Box, Street, Wilayat..."
                value={formData.address}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white resize-none"
              />
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 pt-2">Billing & Credit Settings</p>
          <div className="grid gap-5 sm:grid-cols-2 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Credit Limit (OMR)</label>
              <input
                type="number"
                step="0.001"
                name="creditLimit"
                value={formData.creditLimit}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Payment Terms</label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
              >
                <option value="Immediate">Immediate / Cash on Delivery</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 45">Net 45 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Net 90">Net 90 Days</option>
              </select>
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
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 accent-emerald-500"
              />
              <label htmlFor="isActive" className="text-sm text-zinc-300 cursor-pointer">
                <span className="font-semibold text-emerald-400">Active Customer</span> — eligible for new trips and invoice generation
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/customers"
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Registering..." : "Register Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}
