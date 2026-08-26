"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldAlert, Route } from "lucide-react";
import Link from "next/link";

export default function RecordTripPage() {
  const router = useRouter();

  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    tripId: "",
    tripDate: new Date().toISOString().split("T")[0],
    truckId: 0,
    driverId: 0,
    customerId: 0,
    origin: "",
    destination: "",
    startingOdometer: 0,
    cargo: "",
    revenue: 0,
    status: "Planned",
    notes: "",
  });

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [resTrucks, resDrivers, resCustomers] = await Promise.all([
          fetch("/api/trucks"),
          fetch("/api/employees"),
          fetch("/api/customers"),
        ]);

        if (resTrucks.ok && resDrivers.ok && resCustomers.ok) {
          const tData = await resTrucks.json();
          const dData = await resDrivers.json();
          const cData = await resCustomers.json();

          setTrucks(tData.filter((t: any) => t.status === "Available" || t.status === "On Trip"));
          setDrivers(dData.filter((e: any) => e.status === "Active"));
          setCustomers(cData.items || cData);
        }
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "truckId" || name === "driverId" || name === "customerId" || name === "startingOdometer" || name === "revenue"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleTruckChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tId = parseInt(e.target.value);
    const selectedTruck = trucks.find((t) => t.id === tId);
    setFormData((prev) => ({
      ...prev,
      truckId: tId,
      startingOdometer: selectedTruck ? selectedTruck.odometer : 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (formData.truckId === 0 || formData.driverId === 0 || formData.customerId === 0) {
      setError("Please select a valid Truck, Driver, and Customer");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record trip");
      }

      router.push("/trips");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-5">
        <Link href="/trips" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Record Trip Booking</h1>
          <p className="mt-1.5 text-sm text-zinc-400">Plan a route, dispatch a driver, and set billing revenues.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loadingOptions ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Trip Reference ID *</label>
                <input
                  type="text"
                  name="tripId"
                  required
                  placeholder="TRP-0091"
                  value={formData.tripId}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Trip Dispatch Date *</label>
                <input
                  type="date"
                  name="tripDate"
                  required
                  value={formData.tripDate}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                />
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
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.companyName} ({c.custId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Select Truck *</label>
                <select
                  name="truckId"
                  required
                  value={formData.truckId}
                  onChange={handleTruckChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value={0}>Choose Truck</option>
                  {trucks.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.regNumber} - {t.make} ({t.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Select Driver *</label>
                <select
                  name="driverId"
                  required
                  value={formData.driverId}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value={0}>Choose Driver</option>
                  {drivers.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.empId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Starting Odometer (KM) *</label>
                <input
                  type="number"
                  name="startingOdometer"
                  required
                  value={formData.startingOdometer}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Origin *</label>
                <input
                  type="text"
                  name="origin"
                  required
                  placeholder="Muscat / Sohar Port"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Destination *</label>
                <input
                  type="text"
                  name="destination"
                  required
                  placeholder="Salalah / Nizwa"
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Freight Cargo Details</label>
                <input
                  type="text"
                  name="cargo"
                  placeholder="24 Tons Cement / Steel"
                  value={formData.cargo}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Trip Billing Revenue (OMR) *</label>
                <input
                  type="number"
                  name="revenue"
                  step="0.001"
                  required
                  value={formData.revenue}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Trip Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Dispatch / Route Notes</label>
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

          <div className="flex justify-end gap-3">
            <Link
              href="/trips"
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-850"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Recording..." : "Record Trip"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
