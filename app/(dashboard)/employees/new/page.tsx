"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

export default function NewEmployeePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    empId: "",
    name: "",
    fatherName: "",
    dob: "",
    gender: "Male",
    nationality: "Oman",
    phone: "",
    altPhone: "",
    email: "",
    currentAddress: "",
    permanentAddress: "",
    emergencyName: "",
    emergencyPhone: "",
    joiningDate: new Date().toISOString().split("T")[0],
    arrivalDate: "",
    status: "Active",
    notes: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create employee");
      }

      router.push("/employees");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-5">
        <Link
          href="/employees"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Add New Employee</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Register a new employee driver and establish their HR records.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Employment Information */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
            1. Employment Information
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="empId" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Employee ID *
              </label>
              <input
                type="text"
                id="empId"
                name="empId"
                required
                value={formData.empId}
                onChange={handleChange}
                placeholder="EMP-0041"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="joiningDate" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Joining Date *
              </label>
              <input
                type="date"
                id="joiningDate"
                name="joiningDate"
                required
                value={formData.joiningDate}
                onChange={handleChange}
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="arrivalDate" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Oman Arrival Date (Expats)
              </label>
              <input
                type="date"
                id="arrivalDate"
                name="arrivalDate"
                value={formData.arrivalDate}
                onChange={handleChange}
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Initial Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Information */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
            2. Personal Details
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ahmed Khan"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="fatherName" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Father Name
              </label>
              <input
                type="text"
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="Ibrahim Khan"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="nationality" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Nationality *
              </label>
              <select
                id="nationality"
                name="nationality"
                required
                value={formData.nationality}
                onChange={handleChange}
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Oman">Oman</option>
                <option value="Pakistani">Pakistani</option>
                <option value="Indian">Indian</option>
                <option value="Bangladeshi">Bangladeshi</option>
                <option value="Egyptian">Egyptian</option>
                <option value="Sudanese">Sudanese</option>
              </select>
            </div>

            <div>
              <label htmlFor="dob" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Address */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
            3. Contact & Address Info
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Phone Number (Oman) *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+968 9123 4567"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="altPhone" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Alternate Phone / Home Country Phone
              </label>
              <input
                type="tel"
                id="altPhone"
                name="altPhone"
                value={formData.altPhone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ahmed.khan@gmail.com"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="currentAddress" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Current Address (Oman)
              </label>
              <textarea
                id="currentAddress"
                name="currentAddress"
                rows={2}
                value={formData.currentAddress}
                onChange={handleChange}
                placeholder="Ghala Industrial Area, Muscat, Oman"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label htmlFor="permanentAddress" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Permanent Address (Home Country)
              </label>
              <textarea
                id="permanentAddress"
                name="permanentAddress"
                rows={2}
                value={formData.permanentAddress}
                onChange={handleChange}
                placeholder="Gulberg III, Lahore, Pakistan"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Emergency Contacts */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
            4. Emergency Contact
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="emergencyName" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Contact Name
              </label>
              <input
                type="text"
                id="emergencyName"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
                placeholder="Mohammed Khan (Brother)"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="emergencyPhone" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Contact Phone
              </label>
              <input
                type="tel"
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                placeholder="+92 301 7654321"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Operational Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any specific details here (e.g. driving experience, past route familiarity, visa details)"
                className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 border-t border-zinc-800 pt-5">
          <Link
            href="/employees"
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}
