"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Truck, ArrowLeft, Save, ShieldAlert, Calendar,
  User, Wrench, Fuel, FileText, CheckCircle2,
  AlertTriangle, Trash2
} from "lucide-react";
import Link from "next/link";
import { VEHICLE_CATEGORIES, getTypesForCategory } from "@/lib/vehicleCategories";

export default function TruckDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [truck, setTruck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const [formData, setFormData] = useState({
    truckId: "",
    regNumber: "",
    plateNumber: "",
    plateCode: "",
    category: "Trucks",
    truckType: "",
    make: "",
    model: "",
    year: 0,
    vin: "",
    engineNumber: "",
    odometer: 0,
    purchaseDate: "",
    status: "",
    notes: "",
  });

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  const fetchTruck = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trucks/${id}`);
      if (!res.ok) {
        throw new Error("Failed to load truck details");
      }
      const data = await res.json();
      setTruck(data);
      const types = getTypesForCategory(data.category || "Trucks");
      setAvailableTypes(types);
      setFormData({
        truckId: data.truckId || "",
        regNumber: data.regNumber || "",
        plateNumber: data.plateNumber || "",
        plateCode: data.plateCode || "",
        category: data.category || "Trucks",
        truckType: data.truckType || "",
        make: data.make || "",
        model: data.model || "",
        year: data.year || 0,
        vin: data.vin || "",
        engineNumber: data.engineNumber || "",
        odometer: data.odometer || 0,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split("T")[0] : "",
        status: data.status || "Available",
        notes: data.notes || "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTruck();
  }, [id]);

  // When category changes update available types
  useEffect(() => {
    if (!formData.category) return;
    const types = getTypesForCategory(formData.category);
    setAvailableTypes(types);
    // Only reset truckType if the current one isn't valid for the new category
    if (!types.includes(formData.truckType)) {
      setFormData((prev) => ({ ...prev, truckType: types[0] ?? "" }));
    }
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/trucks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update truck");
      }

      setMessage("Truck details updated successfully.");
      fetchTruck();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this truck? All associated records will be updated/deleted.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/trucks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete truck");
      router.push("/trucks");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const formatOMR = (v: number) =>
    new Intl.NumberFormat("en-OM", { minimumFractionDigits: 3 }).format(v);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-zinc-400">Loading truck specifications...</p>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="text-center py-20 border border-zinc-805 rounded-xl max-w-lg mx-auto">
        <p className="text-zinc-500">Truck not found or deleted.</p>
        <Link href="/trucks" className="mt-4 inline-flex items-center gap-2 text-emerald-400 text-sm hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Fleet List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/trucks" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Truck {truck.regNumber}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-normal">
                {truck.truckId}
              </span>
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {truck.make} {truck.model} ({truck.year}) • Assigned Driver: <span className="text-emerald-400 font-semibold">{truck.currentDriver}</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? "Deleting..." : "Delete Truck"}
        </button>
      </div>

      {message && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 overflow-x-auto text-sm">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-3 border-b-2 font-medium transition-colors shrink-0 ${activeTab === "overview" ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
        >
          Overview & Edit
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-5 py-3 border-b-2 font-medium transition-colors shrink-0 ${activeTab === "documents" ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
        >
          Mulkiya & Documents ({truck.documents?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`px-5 py-3 border-b-2 font-medium transition-colors shrink-0 ${activeTab === "maintenance" ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
        >
          Maintenance History ({truck.maintenances?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("fuel")}
          className={`px-5 py-3 border-b-2 font-medium transition-colors shrink-0 ${activeTab === "fuel" ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
        >
          Fuel Fill Logs ({truck.fuelLog?.length || 0})
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW / EDIT */}
      {activeTab === "overview" && (
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Truck Internal ID *</label>
                <input
                  type="text"
                  name="truckId"
                  required
                  value={formData.truckId}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Mulkiya Reg Number *</label>
                <input
                  type="text"
                  name="regNumber"
                  required
                  value={formData.regNumber}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Oman Plate Number *</label>
                <input
                  type="text"
                  name="plateNumber"
                  required
                  value={formData.plateNumber}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Plate Code *</label>
                <input
                  type="text"
                  name="plateCode"
                  required
                  value={formData.plateCode}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  {VEHICLE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Vehicle Type</label>
                <select
                  name="truckType"
                  value={formData.truckType}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  {availableTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Manufacturer Make *</label>
                <input
                  type="text"
                  name="make"
                  required
                  value={formData.make}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Model Name *</label>
                <input
                  type="text"
                  name="model"
                  required
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Manufacturing Year *</label>
                <input
                  type="number"
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">VIN / Chassis Number *</label>
                <input
                  type="text"
                  name="vin"
                  required
                  value={formData.vin}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Engine Number</label>
                <input
                  type="text"
                  name="engineNumber"
                  value={formData.engineNumber}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                />
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
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Additional Fleet Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving Changes..." : "Save Truck Profile"}
            </button>
          </div>
        </form>
      )}

      {/* TAB CONTENT: DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Vehicle Documents (Mulkiya, Insurance, Inspections)</h3>
          </div>

          {truck.documents?.length === 0 ? (
            <div className="text-center py-10 border border-zinc-800 rounded-xl">
              <FileText className="mx-auto h-10 w-10 text-zinc-700 mb-2" />
              <p className="text-sm text-zinc-500">No documents registered for this truck.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {truck.documents.map((doc: any) => {
                const now = new Date();
                const exp = new Date(doc.expiryDate);
                const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isExp = days <= 0;
                return (
                  <div key={doc.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">{doc.docType}</span>
                      {isExp ? (
                        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 ring-1 ring-inset ring-red-500/20">
                          Expired
                        </span>
                      ) : days <= 30 ? (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 ring-1 ring-inset ring-amber-500/20">
                          Expires in {days} days
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                          Valid
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 text-xs text-zinc-400">
                      <div className="flex justify-between">
                        <span>Document Number</span>
                        <span className="text-white font-mono">{doc.docNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Issue Date</span>
                        <span>{new Date(doc.issueDate).toLocaleDateString("en-OM")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expiry Date</span>
                        <span>{new Date(doc.expiryDate).toLocaleDateString("en-OM")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MAINTENANCE */}
      {activeTab === "maintenance" && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base">Workshop Servicing History</h3>
          {truck.maintenances?.length === 0 ? (
            <div className="text-center py-10 border border-zinc-800 rounded-xl">
              <Wrench className="mx-auto h-10 w-10 text-zinc-700 mb-2" />
              <p className="text-sm text-zinc-500">No workshop repair logs found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900/60">
                  <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Workshop</th>
                    <th className="px-5 py-3 font-mono">Odometer</th>
                    <th className="px-5 py-3 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
                  {truck.maintenances.map((m: any) => (
                    <tr key={m.id}>
                      <td className="px-5 py-3 text-xs text-zinc-300">
                        {new Date(m.date).toLocaleDateString("en-OM")}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium text-zinc-200">{m.maintenanceType}</span>
                        {m.description && <p className="text-[10px] text-zinc-500 mt-0.5">{m.description}</p>}
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-400">{m.workshop || "—"}</td>
                      <td className="px-5 py-3 text-xs text-zinc-400 font-mono">
                        {m.odometer.toLocaleString()} km
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-white">
                        OMR {formatOMR(Number(m.cost))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FUEL LOGS */}
      {activeTab === "fuel" && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base">Diesel Refills History</h3>
          {truck.fuelLog?.length === 0 ? (
            <div className="text-center py-10 border border-zinc-800 rounded-xl">
              <Fuel className="mx-auto h-10 w-10 text-zinc-700 mb-2" />
              <p className="text-sm text-zinc-500">No fuel transaction history found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900/60">
                  <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Liters</th>
                    <th className="px-5 py-3 font-mono">Odometer</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3 text-right">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
                  {truck.fuelLog.map((f: any) => (
                    <tr key={f.id}>
                      <td className="px-5 py-3 text-xs text-zinc-300">
                        {new Date(f.date).toLocaleDateString("en-OM")}
                      </td>
                      <td className="px-5 py-3 text-xs text-blue-400 font-semibold font-mono">
                        {Number(f.liters).toFixed(1)} L
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-400 font-mono">
                        {f.odometer.toLocaleString()} km
                      </td>
                      <td className="px-5 py-3 text-xs text-zinc-500">{f.paymentMethod}</td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-white">
                        OMR {formatOMR(Number(f.totalAmount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
