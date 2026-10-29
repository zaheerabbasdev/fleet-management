"use client";

import { useEffect, useState } from "react";
import { Save, ShieldAlert, Wallet } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface FormProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function PayrollForm({ onClose, onSaved }: FormProps) {

  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();
  const [formData, setFormData] = useState({
    employeeId: 0,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    baseSalary: 0,
    allowances: 0,
    overtime: 0,
    bonus: 0,
    deductions: 0,
    notes: "",
    status: "Pending",
    paymentDate: "",
    paymentMethod: "Bank Transfer",
    paymentReference: "",
  });

  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await fetch("/api/employees?pageSize=200");
        if (res.ok) {
          const data = await res.json();
          // employees API returns paginated {items, pagination}
          const empList = data.items || data;
          setEmployees(empList.filter((e: any) => e.status === "Active"));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingEmployees(false);
      }
    }
    loadEmployees();
  }, []);

  const handleEmployeeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const empId = parseInt(e.target.value);
    setFormData((prev) => ({ ...prev, employeeId: empId }));

    if (empId > 0) {
      try {
        // Fetch detailed profile to get current active salary structure
        const res = await fetch(`/api/employees/${empId}`);
        if (res.ok) {
          const profile = await res.json();
          const activeStructure = profile.salaryStructures?.find((s: any) => s.isActive);
          if (activeStructure) {
            const basic = Number(activeStructure.basicSalary);
            const allow =
              Number(activeStructure.accommodationAllowance) +
              Number(activeStructure.foodAllowance) +
              Number(activeStructure.transportAllowance) +
              Number(activeStructure.otherAllowance);

            setFormData((prev) => ({
              ...prev,
              baseSalary: basic,
              allowances: allow,
            }));
          } else {
            // Reset if no active salary structure found
            setFormData((prev) => ({
              ...prev,
              baseSalary: 0,
              allowances: 0,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load employee salary details:", err);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "employeeId" || name === "month" || name === "year" || name === "baseSalary" || name === "allowances" || name === "overtime" || name === "bonus" || name === "deductions"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (formData.employeeId === 0) {
      setError("Please select a valid Employee");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add payroll record");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const grossSalary = formData.baseSalary + formData.allowances + formData.overtime + formData.bonus;
  const netSalary = Math.max(0, grossSalary - formData.deductions);

  return (
    <div className="space-y-6">

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loadingEmployees ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Employee *</label>
                <select
                  name="employeeId"
                  required
                  value={formData.employeeId}
                  onChange={handleEmployeeChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value={0}>Choose employee</option>
                  {employees.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.empId})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Month *</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-300"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Year *</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-300"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Basic salary (OMR) *</label>
                <input
                  type="number"
                  step="0.001"
                  name="baseSalary"
                  required
                  value={formData.baseSalary}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Allowances (OMR)</label>
                <input
                  type="number"
                  step="0.001"
                  name="allowances"
                  value={formData.allowances}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Overtime pay (OMR)</label>
                <input
                  type="number"
                  step="0.001"
                  name="overtime"
                  value={formData.overtime}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Bonus (OMR)</label>
                <input
                  type="number"
                  step="0.001"
                  name="bonus"
                  value={formData.bonus}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Money taken off (fines, advances)</label>
                <input
                  type="number"
                  step="0.001"
                  name="deductions"
                  value={formData.deductions}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white font-mono border-red-500/20 text-red-400"
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Is it paid?</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                >
                  <option value="Pending">Not paid yet</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {formData.status === "Paid" && (
                <>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Date paid *</label>
                    <input
                      type="date"
                      name="paymentDate"
                      required
                      value={formData.paymentDate}
                      onChange={handleChange}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">How was it paid?</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-zinc-300"
                    >
                      <option value="Bank Transfer">Bank transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Payment reference</label>
                    <input
                      type="text"
                      name="paymentReference"
                      placeholder="Bank reference number"
                      value={formData.paymentReference}
                      onChange={handleChange}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                    />
                  </div>
                </>
              )}

              {/* Aggregation Summary banner */}
              <div className="sm:col-span-2 rounded-xl bg-zinc-950 p-5 border border-zinc-800 flex flex-col sm:flex-row justify-between gap-4 text-sm font-semibold">
                <div>
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Calculated Gross Salary</span>
                  <span className="text-lg text-white font-mono">OMR {grossSalary.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Total Deductions</span>
                  <span className="text-lg text-red-400 font-mono">OMR {formData.deductions.toFixed(3)}</span>
                </div>
                <div className="sm:border-l sm:border-zinc-800 sm:pl-6">
                  <span className="text-emerald-400 block uppercase tracking-wider text-[10px]">Net Payout Amount</span>
                  <span className="text-xl text-emerald-400 font-mono">OMR {netSalary.toFixed(3)}</span>
                </div>
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
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-850">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save salary"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
