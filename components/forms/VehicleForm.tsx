"use client";

import { useState, useEffect } from "react";
import { Save, ShieldAlert } from "lucide-react";
import { VEHICLE_CATEGORIES, getTypesForCategory } from "@/lib/vehicleCategories";

interface FormProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function VehicleForm({ onClose, onSaved }: FormProps) {
  const [formData, setFormData] = useState({
    truckId: "",
    regNumber: "",
    plateNumber: "",
    plateCode: "",
    category: "Trucks",
    truckType: "Heavy Truck",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    engineNumber: "",
    odometer: 0,
    purchaseDate: "",
    status: "Available",
    notes: "",
  });

  const [availableTypes, setAvailableTypes] = useState<string[]>(
    getTypesForCategory("Trucks")
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // When category changes, reset truckType to the first type in the new list
  useEffect(() => {
    const types = getTypesForCategory(formData.category);
    setAvailableTypes(types);
    setFormData((prev) => ({ ...prev, truckType: types[0] ?? "" }));
  }, [formData.category]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" || name === "odometer" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/trucks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register vehicle");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const selectedCategory = VEHICLE_CATEGORIES.find(
    (c) => c.value === formData.category
  );

  return (
    <div className="space-y-6">

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Category Selection ── */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
            Vehicle Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {VEHICLE_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-semibold transition-all ${
                  formData.category === cat.value
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-800 bg-zinc-950/40 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Vehicle Details ── */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
            {selectedCategory?.icon} {selectedCategory?.label} Details
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 text-xs">

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Vehicle number *
              </label>
              <input
                type="text"
                name="truckId"
                required
                placeholder="TRK-001 / TRL-001 / CAR-001"
                value={formData.truckId}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Registration (Mulkiya) number *
              </label>
              <input
                type="text"
                name="regNumber"
                required
                placeholder="1092-A"
                value={formData.regNumber}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Plate Number *
              </label>
              <input
                type="text"
                name="plateNumber"
                required
                placeholder="98234"
                value={formData.plateNumber}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Plate Code *
              </label>
              <input
                type="text"
                name="plateCode"
                required
                placeholder="AD / A / YA"
                value={formData.plateCode}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Cascading type dropdown */}
            <div className="sm:col-span-2">
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Type *
              </label>
              <select
                name="truckType"
                value={formData.truckType}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300 focus:border-emerald-500 focus:outline-none"
              >
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Make (brand) *
              </label>
              <input
                type="text"
                name="make"
                required
                placeholder="Volvo / Toyota / CAT"
                value={formData.make}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Model *
              </label>
              <input
                type="text"
                name="model"
                required
                placeholder="FH16 / Land Cruiser / 320D"
                value={formData.model}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Year *
              </label>
              <input
                type="number"
                name="year"
                required
                min={1980}
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Meter reading (KM) *
              </label>
              <input
                type="number"
                name="odometer"
                required
                min={0}
                value={formData.odometer}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Chassis number *
              </label>
              <input
                type="text"
                name="vin"
                required
                placeholder="YV3A4X0A..."
                value={formData.vin}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Engine Number
              </label>
              <input
                type="text"
                name="engineNumber"
                placeholder="D16G-750"
                value={formData.engineNumber}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Date bought
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="Anything else about this vehicle"
                value={formData.notes}
                onChange={handleChange}
                className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white resize-none focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800">
              Cancel
            </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
