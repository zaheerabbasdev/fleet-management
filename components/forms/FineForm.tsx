"use client";

import { useEffect, useState } from "react";
import { Save, ShieldAlert } from "lucide-react";

const FINE_TYPES = [
  "Speeding",
  "Running Red Light",
  "Wrong Parking",
  "Mobile Phone Use",
  "No Seatbelt",
  "Reckless Driving",
  "Overloading",
  "No Valid Permit",
  "Lane Violation",
  "Tailgating",
  "Other Traffic Violation",
];

const OMAN_AUTHORITIES = [
  "ROP (Royal Oman Police)",
  "Muscat Municipality",
  "Salalah Municipality",
  "DGT (Directorate General of Transport)",
  "MoT (Ministry of Transport)",
  "Other Authority",
];

interface FormProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function FineForm({ onClose, onSaved }: FormProps) {

  const [employees, setEmployees] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    employeeId: 0,
    truckId: 0,
    date: new Date().toISOString().split("T")[0],
    fineType: "",
    amount: 0,
    authority: "ROP (Royal Oman Police)",
    description: "",
    assignedTo: "Driver",
    paymentStatus: "Unpaid",
    notes: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [resEmployees, resTrucks] = await Promise.all([
          fetch("/api/employees?pageSize=200"),
          fetch("/api/trucks"),
        ]);

        if (resEmployees.ok) {
          const data = await resEmployees.json();
          // employees API returns paginated {items, pagination}
          const empList = data.items || data;
          setEmployees(empList.filter((e: any) => e.status === "Active"));
        }
        if (resTrucks.ok) {
          const data = await resTrucks.json();
          setTrucks(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "employeeId" || name === "truckId" || name === "amount"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!formData.fineType) {
      setError("Please select a fine type");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/fines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          employeeId: formData.employeeId === 0 ? null : formData.employeeId,
          truckId: formData.truckId === 0 ? null : formData.truckId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log fine");

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

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
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <div className="grid gap-5 sm:grid-cols-2 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Driver</label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value={0}>No driver</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.empId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Vehicle</label>
                <select
                  name="truckId"
                  value={formData.truckId}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value={0}>No vehicle</option>
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>{t.regNumber} - {t.make}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Date of fine *</label>
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
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Amount (OMR) *</label>
                <input
                  type="number"
                  step="0.001"
                  name="amount"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Reason for fine *</label>
                <select
                  name="fineType"
                  required
                  value={formData.fineType}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value="">Choose reason</option>
                  {FINE_TYPES.map((ft) => (
                    <option key={ft} value={ft}>{ft}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Who gave the fine?</label>
                <select
                  name="authority"
                  value={formData.authority}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  {OMAN_AUTHORITIES.map((auth) => (
                    <option key={auth} value={auth}>{auth}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Who pays?</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value="Driver">Driver (taken from salary)</option>
                  <option value="Company">Company</option>
                  <option value="Shared">Driver and company share it</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Is it paid?</label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Deducted">Taken from driver salary</option>
                  <option value="Disputed">Being checked</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Details or fine number</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Fine number or what happened"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
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

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save fine"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
