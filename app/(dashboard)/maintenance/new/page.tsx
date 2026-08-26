"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldAlert, Wrench } from "lucide-react";
import Link from "next/link";

const MAINTENANCE_TYPES = [
  "Engine Oil & Filter Change",
  "Tyre Replacement",
  "Tyre Rotation",
  "Brake Pads Replacement",
  "Brake Fluid Service",
  "Air Filter Replacement",
  "Fuel Filter Change",
  "Transmission Service",
  "Cooling System Flush",
  "Battery Replacement",
  "Alternator / Electrical Repair",
  "Suspension / Steering Repair",
  "Exhaust System Repair",
  "AC Servicing",
  "Windshield / Glass Repair",
  "Body / Paint Work",
  "Annual Inspection / Mulkiya",
  "Accident Repair",
  "General Service",
];

const OMAN_WORKSHOPS = [
  "Habib Ullah Workshop, Muscat",
  "Abdul Salam Transport Services, Sohar",
  "Hamed Al-Harthi Auto Repair",
  "Majan Truck Services",
  "Gulf Technical Services",
  "Shell Lubricants Service Centre",
  "Al-Wafi Automotive",
  "Other Workshop",
];

export default function LogMaintenancePage() {
  const router = useRouter();

  const [trucks, setTrucks] = useState<any[]>([]);
  const [loadingTrucks, setLoadingTrucks] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    truckId: 0,
    date: new Date().toISOString().split("T")[0],
    maintenanceType: "",
    description: "",
    odometer: 0,
    workshop: "",
    cost: 0,
    nextServiceDate: "",
    nextServiceOdometer: 0,
    notes: "",
  });

  useEffect(() => {
    async function loadTrucks() {
      try {
        const res = await fetch("/api/trucks");
        if (res.ok) {
          const data = await res.json();
          setTrucks(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTrucks(false);
      }
    }
    loadTrucks();
  }, []);

  const handleTruckChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tId = parseInt(e.target.value);
    const selectedTruck = trucks.find((t) => t.id === tId);
    setFormData((prev) => ({
      ...prev,
      truckId: tId,
      odometer: selectedTruck ? selectedTruck.odometer : 0,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "truckId" || name === "odometer" || name === "cost" || name === "nextServiceOdometer"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (formData.truckId === 0) {
      setError("Please select a truck");
      setSaving(false);
      return;
    }

    if (!formData.maintenanceType) {
      setError("Please select a maintenance type");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          nextServiceDate: formData.nextServiceDate || null,
          nextServiceOdometer: formData.nextServiceOdometer || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log maintenance");

      router.push("/maintenance");
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
        <Link href="/maintenance" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Log Maintenance Event</h1>
          <p className="mt-1.5 text-sm text-zinc-400">Record vehicle servicing, repairs, tyre changes, and next service schedule.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loadingTrucks ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="grid gap-5 sm:grid-cols-2 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Select Truck *</label>
                <select
                  required
                  value={formData.truckId}
                  onChange={handleTruckChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value={0}>Choose Truck</option>
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>{t.regNumber} — {t.make} {t.model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Service Date *</label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Maintenance Type *</label>
                <select
                  name="maintenanceType"
                  required
                  value={formData.maintenanceType}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value="">Select Type of Work Done</option>
                  {MAINTENANCE_TYPES.map((mt) => (
                    <option key={mt} value={mt}>{mt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Current Odometer (KM) *</label>
                <input
                  type="number"
                  name="odometer"
                  required
                  value={formData.odometer}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Workshop / Service Centre</label>
                <select
                  name="workshop"
                  value={formData.workshop}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value="">Select Workshop</option>
                  {OMAN_WORKSHOPS.map((ws) => (
                    <option key={ws} value={ws}>{ws}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Total Cost (OMR) *</label>
                <input
                  type="number"
                  step="0.001"
                  name="cost"
                  required
                  value={formData.cost}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Next Service Date</label>
                <input
                  type="date"
                  name="nextServiceDate"
                  value={formData.nextServiceDate}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Next Service Odometer (KM)</label>
                <input
                  type="number"
                  name="nextServiceOdometer"
                  placeholder="e.g. 125000 km"
                  value={formData.nextServiceOdometer || ""}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Description / Work Details</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Parts replaced, work done, invoices received..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white resize-none"
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
            </div>
          </div>

          {/* Next service reminder */}
          {formData.nextServiceDate && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-center gap-3 text-xs">
              <Wrench className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-amber-300">
                Next service reminder will be set for <strong>{formData.nextServiceDate}</strong>
                {formData.nextServiceOdometer > 0 && ` or at ${formData.nextServiceOdometer.toLocaleString()} km`}.
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link href="/maintenance" className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Logging..." : "Log Maintenance"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
