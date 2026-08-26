"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldAlert, Droplet } from "lucide-react";
import Link from "next/link";

export default function LogFuelPage() {
  const router = useRouter();

  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    fuelId: "",
    date: new Date().toISOString().split("T")[0],
    truckId: 0,
    driverId: 0,
    tripId: 0,
    odometer: 0,
    fuelStation: "",
    fuelType: "Diesel",
    liters: 0,
    pricePerLiter: 0.258, // average Oman diesel price per liter
    paymentMethod: "Fuel Card",
    notes: "",
  });

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [resTrucks, resDrivers, resTrips] = await Promise.all([
          fetch("/api/trucks"),
          fetch("/api/employees?pageSize=200"),
          fetch("/api/trips?pageSize=200"),
        ]);

        if (resTrucks.ok && resDrivers.ok) {
          const tData = await resTrucks.json();
          const dData = await resDrivers.json();
          setTrucks(tData);
          // employees API returns paginated {items, pagination}
          const empList = dData.items || dData;
          setDrivers(empList.filter((e: any) => e.status === "Active"));
        }
        if (resTrips.ok) {
          const trData = await resTrips.json();
          setTrips(trData.items || trData);
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
        name === "truckId" || name === "driverId" || name === "tripId" || name === "odometer" || name === "liters" || name === "pricePerLiter"
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
      odometer: selectedTruck ? selectedTruck.odometer : 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (formData.truckId === 0 || formData.driverId === 0) {
      setError("Please select a valid Truck and Driver");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        tripId: formData.tripId === 0 ? null : formData.tripId,
      };

      const res = await fetch("/api/fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log fuel refill");
      }

      router.push("/fuel");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const totalCost = Number((formData.liters * formData.pricePerLiter).toFixed(3));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 border-b border-zinc-800 pb-5">
        <Link href="/fuel" className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Log Fuel Purchase</h1>
          <p className="mt-1.5 text-sm text-zinc-400">Record diesel refills, station, odometer, and billing transaction details.</p>
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
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Fuel Transaction Reference *</label>
                <input
                  type="text"
                  name="fuelId"
                  required
                  placeholder="FUL-901"
                  value={formData.fuelId}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Purchase Date *</label>
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
                    <option key={t.id} value={t.id}>{t.regNumber} - {t.make}</option>
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
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Select Associated Trip (Optional)</label>
                <select
                  name="tripId"
                  value={formData.tripId}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value={0}>Unassociated / Internal Move</option>
                  {trips.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.tripId}: {t.origin} → {t.destination}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Current Odometer Reading (KM) *</label>
                <input
                  type="number"
                  name="odometer"
                  required
                  value={formData.odometer}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Fuel Station Name</label>
                <input
                  type="text"
                  name="fuelStation"
                  placeholder="Shell Al-Khuwair / Oman Oil"
                  value={formData.fuelStation}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value="Fuel Card">Maha / Shell Fuel Card</option>
                  <option value="Cash">Cash Payment</option>
                  <option value="Corporate Account">Corporate Account Invoice</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Liters Filled *</label>
                <input
                  type="number"
                  step="0.01"
                  name="liters"
                  required
                  value={formData.liters}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Oman Diesel Price per Liter (OMR) *</label>
                <input
                  type="number"
                  step="0.001"
                  name="pricePerLiter"
                  required
                  value={formData.pricePerLiter}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4 flex justify-between items-center">
                <span className="text-zinc-400 font-medium">Auto-Calculated Total Transaction Cost</span>
                <span className="text-xl font-mono font-bold text-emerald-400">OMR {totalCost.toFixed(3)}</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Fuel Log Notes</label>
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
              href="/fuel"
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
              {saving ? "Logging..." : "Log Fuel Fill"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
