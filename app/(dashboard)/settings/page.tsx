"use client";

import { useEffect, useState } from "react";
import { Save, Settings, ShieldCheck, Building, Percent, BellRing, Clock } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    company_name: "",
    company_address: "",
    company_cr: "",
    company_vat: "",
    currency: "OMR",
    timezone: "Asia/Muscat",
    warning_days_expiry: "30",
    invoice_prefix: "INV-",
    employee_prefix: "EMP-",
    truck_prefix: "TRK-",
    trip_prefix: "TRP-",
    tax_enabled: "true",
    tax_name: "VAT",
    tax_rate: "5.000",
    maintenance_km_interval: "10000",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage("Settings updated successfully.");
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-zinc-400">Loading system configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10 border border-emerald-600/30 text-emerald-400">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Configure default warnings, VAT tax rates, prefixes, and company CR records.
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Settings */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <div className="flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
            <Building className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold">1. Company Profile & Oman CR</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Company Registered Name</label>
              <input
                type="text"
                name="company_name"
                value={settings.company_name}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Commercial Registration (CR) Number</label>
              <input
                type="text"
                name="company_cr"
                value={settings.company_cr}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Company Head Office Address</label>
              <textarea
                name="company_address"
                rows={2}
                value={settings.company_address}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Currency and Expiry Thresholds */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <div className="flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
            <BellRing className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold">2. Warning Thresholds & Regional Defaults</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Document Expiry Alerts Offset (Days) *</label>
              <input
                type="number"
                name="warning_days_expiry"
                value={settings.warning_days_expiry}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Currency Code</label>
              <input
                type="text"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Timezone</label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-300"
              >
                <option value="Asia/Muscat">Asia/Muscat (GMT+4)</option>
                <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoicing and Taxes */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <div className="flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
            <Percent className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold">3. Billing, VAT Taxes & OMR Precision</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Enable Tax/VAT</label>
              <select
                name="tax_enabled"
                value={settings.tax_enabled}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-300"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Tax Code Name</label>
              <input
                type="text"
                name="tax_name"
                value={settings.tax_name}
                onChange={handleChange}
                placeholder="VAT"
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.001"
                name="tax_rate"
                value={settings.tax_rate}
                onChange={handleChange}
                placeholder="5.000"
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Oman VAT TRN Number</label>
              <input
                type="text"
                name="company_vat"
                value={settings.company_vat}
                onChange={handleChange}
                placeholder="OM110000..."
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Custom Prefixes */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <div className="flex items-center gap-2 text-white border-b border-zinc-800 pb-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold">4. Custom Human-Readable ID Prefixes</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Employee Prefix</label>
              <input
                type="text"
                name="employee_prefix"
                value={settings.employee_prefix}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Truck ID Prefix</label>
              <input
                type="text"
                name="truck_prefix"
                value={settings.truck_prefix}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Trip ID Prefix</label>
              <input
                type="text"
                name="trip_prefix"
                value={settings.trip_prefix}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Invoice Prefix</label>
              <input
                type="text"
                name="invoice_prefix"
                value={settings.invoice_prefix}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Configurations..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
