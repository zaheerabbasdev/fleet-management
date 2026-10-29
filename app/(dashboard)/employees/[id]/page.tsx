"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  Calendar,
  Truck,
  CreditCard,
  AlertTriangle,
  FolderOpen,
  Plus,
  FileText,
  FileSpreadsheet,
  Clock,
  Coins,
  History,
  FileCheck
} from "lucide-react";

export default function EmployeeProfilePage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const employeeId = params.id;

  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Sub-document form states
  const [passportForm, setPassportForm] = useState({
    passportNumber: "",
    issueDate: "",
    expiryDate: "",
    issuingCountry: "",
    fileUrl: "",
  });

  const [visaForm, setVisaForm] = useState({
    visaNumber: "",
    visaType: "Work Visa",
    sponsor: "Logistics LLC",
    issueDate: "",
    expiryDate: "",
    status: "Valid",
    notes: "",
    fileUrl: "",
  });

  const [licenseForm, setLicenseForm] = useState({
    licenseNumber: "",
    licenseType: "Heavy Vehicle (Truck)",
    obtainedDate: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "ROP",
    notes: "",
    fileUrl: "",
  });

  const [documentForm, setDocumentForm] = useState({
    docType: "Resident Card",
    docNumber: "",
    issueDate: "",
    expiryDate: "",
    notes: "",
    fileUrl: "",
  });

  const [salaryForm, setSalaryForm] = useState({
    basicSalary: "",
    accommodationAllowance: "0",
    foodAllowance: "0",
    transportAllowance: "0",
    otherAllowance: "0",
    overtimeRate: "0",
    effectiveDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [advanceForm, setAdvanceForm] = useState({
    amount: "",
    deductionMonthly: "",
    date: new Date().toISOString().split("T")[0],
    reason: "",
    notes: "",
  });

  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Annual",
    startDate: "",
    endDate: "",
    days: "30",
    reason: "",
    status: "Pending",
    notes: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}`);
      if (!res.ok) {
        throw new Error("Failed to load employee details");
      }
      const data = await res.json();
      setEmployee(data);

      // Pre-fill form state arrays if documents exist
      if (data.passports && data.passports[0]) {
        const p = data.passports[0];
        setPassportForm({
          passportNumber: p.passportNumber,
          issueDate: p.issueDate.split("T")[0],
          expiryDate: p.expiryDate.split("T")[0],
          issuingCountry: p.issuingCountry,
          fileUrl: p.fileUrl || "",
        });
      }
      if (data.visas && data.visas[0]) {
        const v = data.visas[0];
        setVisaForm({
          visaNumber: v.visaNumber,
          visaType: v.visaType,
          sponsor: v.sponsor || "",
          issueDate: v.issueDate.split("T")[0],
          expiryDate: v.expiryDate.split("T")[0],
          status: v.status,
          notes: v.notes || "",
          fileUrl: v.fileUrl || "",
        });
      }
      if (data.licenses && data.licenses[0]) {
        const l = data.licenses[0];
        setLicenseForm({
          licenseNumber: l.licenseNumber,
          licenseType: l.licenseType,
          obtainedDate: l.obtainedDate.split("T")[0],
          issueDate: l.issueDate.split("T")[0],
          expiryDate: l.expiryDate.split("T")[0],
          issuingAuthority: l.issuingAuthority,
          notes: l.notes || "",
          fileUrl: l.fileUrl || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, [employeeId]);

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(category);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      // Update the correct form state based on category
      if (category === "passport") {
        setPassportForm(prev => ({ ...prev, fileUrl: data.url }));
      } else if (category === "visa") {
        setVisaForm(prev => ({ ...prev, fileUrl: data.url }));
      } else if (category === "license") {
        setLicenseForm(prev => ({ ...prev, fileUrl: data.url }));
      } else if (category === "general") {
        setDocumentForm(prev => ({ ...prev, fileUrl: data.url }));
      }
      alert("Document file uploaded successfully.");
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDocumentSubmit = async (category: string, formData: any) => {
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, ...formData }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update document");
      }
      alert("Document details saved successfully");
      fetchEmployeeDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleHRSubmit = async (type: string, formData: any) => {
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/hr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...formData }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit HR entry");
      }
      alert("HR details saved successfully");
      fetchEmployeeDetails();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteGeneralDocument = async (docId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        const res = await fetch(`/api/employees/${employeeId}/documents?docId=${docId}&category=general`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("Document deleted");
          fetchEmployeeDetails();
        } else {
          alert("Failed to delete document");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-zinc-400">Loading profile details...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-bold">Profile Load Failed</h3>
        <p className="mt-2 text-sm">{error || "Employee not found."}</p>
        <Link href="/employees" className="mt-4 inline-block rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500">
          Back to Directory
        </Link>
      </div>
    );
  }

  // Active document expiries check (calculating remaining days helper)
  const getRemainingDays = (dateStr: string) => {
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryBadge = (dateStr: string) => {
    const days = getRemainingDays(dateStr);
    if (days <= 0) return <span className="rounded bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-xs text-red-400 font-semibold">Expired</span>;
    if (days <= 30) return <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs text-amber-400 font-semibold">Expiring in {days}d</span>;
    return <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-400 font-semibold">{days} days left</span>;
  };

  // Allowances calculation helper
  const getActiveSalary = () => {
    const active = employee.salaryStructures.find((s: any) => s.isActive);
    if (!active) return null;
    const gross =
      Number(active.basicSalary) +
      Number(active.accommodationAllowance) +
      Number(active.foodAllowance) +
      Number(active.transportAllowance) +
      Number(active.otherAllowance);
    return { ...active, gross };
  };

  const activeSalary = getActiveSalary();

  return (
    <div className="space-y-6">
      {/* Top breadcrumb and actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/employees"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{employee.name}</h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Oman ID: <span className="font-mono text-emerald-400 font-bold">{employee.empId}</span> • {employee.nationality} Driver
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <span
            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
              employee.status === "Active"
                ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                : employee.status === "On Leave"
                ? "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20"
                : "bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20"
            }`}
          >
            {employee.status}
          </span>
        </div>
      </div>

      {/* Tabs list navigation */}
      <div className="flex gap-2 overflow-x-auto border-b border-zinc-800 pb-px text-sm">
        {[
          { id: "overview", name: "Overview" },
          { id: "personal", name: "Personal Profile" },
          { id: "passport", name: "Passport" },
          { id: "visa", name: "Visa / Residence" },
          { id: "license", name: "Driving License" },
          { id: "documents", name: "Documents" },
          { id: "salary", name: "Salary Structure" },
          { id: "advances", name: "Salary Advances" },
          { id: "leaves", name: "Leaves History" },
          { id: "trips", name: "Trip History" },
          { id: "fines", name: "Fines Ledger" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-emerald-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Dynamic Tab Body */}
      <div className="min-h-[40vh]">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* KPI Overview */}
            <div className="md:col-span-2 space-y-6">
              {/* Quick Info Grid */}
              <div className="grid gap-5 sm:grid-cols-2 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block font-semibold">Current Assigned Truck</span>
                  <span className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-emerald-400" />
                    {employee.truckAssignments.find((a: any) => a.status === "Active")?.truck.regNumber || "Unassigned"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block font-semibold">Active Base Salary</span>
                  <span className="text-base font-bold text-emerald-400 mt-1.5">
                    {activeSalary ? `${new Intl.NumberFormat("en-OM", { style: "currency", currency: "OMR", minimumFractionDigits: 3 }).format(activeSalary.basicSalary)} / month` : "Not Configured"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block font-semibold">Oman Arrival Date</span>
                  <span className="text-sm font-medium text-zinc-300 mt-1.5 block">
                    {employee.arrivalDate ? new Date(employee.arrivalDate).toLocaleDateString("en-GB") : "Omani National"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block font-semibold">Joining Date</span>
                  <span className="text-sm font-medium text-zinc-300 mt-1.5 block">
                    {new Date(employee.joiningDate).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>

              {/* Expiring Docs Warnings in Overview */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white">Document Status Summary</h3>
                <div className="divide-y divide-zinc-800">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-semibold text-zinc-400">Passport</span>
                    {employee.passports[0] ? getExpiryBadge(employee.passports[0].expiryDate) : <span className="text-red-400 text-xs">Missing</span>}
                  </div>
                  {employee.nationality !== "Oman" && (
                    <div className="flex items-center justify-between py-3">
                      <span className="text-xs font-semibold text-zinc-400">Oman Residence Visa</span>
                      {employee.visas[0] ? getExpiryBadge(employee.visas[0].expiryDate) : <span className="text-red-400 text-xs">Missing</span>}
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-xs font-semibold text-zinc-400">ROP Driving License</span>
                    {employee.licenses[0] ? getExpiryBadge(employee.licenses[0].expiryDate) : <span className="text-red-400 text-xs">Missing</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Column */}
            <div className="space-y-6">
              {/* Emergency Contact */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Emergency Contact</h3>
                <div className="text-xs space-y-2">
                  <p><span className="text-zinc-500 font-medium block">Contact Name:</span> <span className="font-semibold text-zinc-200 block mt-0.5">{employee.emergencyName || "N/A"}</span></p>
                  <p><span className="text-zinc-500 font-medium block">Phone Number:</span> <span className="font-semibold text-emerald-400 block mt-0.5">{employee.emergencyPhone || "N/A"}</span></p>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
                <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-2">Remarks / Notes</h3>
                <p className="text-xs text-zinc-400 leading-relaxed italic">{employee.notes || "No special notes recorded."}</p>
              </div>
            </div>
          </div>
        )}

        {/* PERSONAL INFO TAB */}
        {activeTab === "personal" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 max-w-2xl">
            <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3 mb-5">Personal Registration details</h3>
            <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2 text-xs">
              <p><span className="text-zinc-500 font-medium block">Full Name:</span> <span className="text-zinc-200 text-sm font-semibold block mt-0.5">{employee.name}</span></p>
              <p><span className="text-zinc-500 font-medium block">Father's Name:</span> <span className="text-zinc-200 text-sm font-semibold block mt-0.5">{employee.fatherName || "N/A"}</span></p>
              <p><span className="text-zinc-500 font-medium block">Date of Birth:</span> <span className="text-zinc-200 block mt-0.5">{employee.dob ? new Date(employee.dob).toLocaleDateString("en-GB") : "N/A"}</span></p>
              <p><span className="text-zinc-500 font-medium block">Gender:</span> <span className="text-zinc-200 block mt-0.5">{employee.gender || "N/A"}</span></p>
              <p><span className="text-zinc-500 font-medium block">Nationality:</span> <span className="text-zinc-200 block mt-0.5 font-semibold">{employee.nationality}</span></p>
              <p><span className="text-zinc-500 font-medium block">Primary Phone:</span> <span className="text-emerald-400 font-bold block mt-0.5">{employee.phone}</span></p>
              <p><span className="text-zinc-500 font-medium block">Secondary Phone:</span> <span className="text-zinc-300 block mt-0.5">{employee.altPhone || "N/A"}</span></p>
              <p><span className="text-zinc-500 font-medium block">Email Address:</span> <span className="text-zinc-300 block mt-0.5">{employee.email || "N/A"}</span></p>
              <div className="sm:col-span-2 border-t border-zinc-800/60 pt-3"><span className="text-zinc-500 font-medium block">Current Address (Oman):</span> <span className="text-zinc-300 block mt-0.5 whitespace-pre-wrap">{employee.currentAddress || "N/A"}</span></div>
              <div className="sm:col-span-2 border-t border-zinc-800/60 pt-3"><span className="text-zinc-500 font-medium block">Permanent Address (Home Country):</span> <span className="text-zinc-300 block mt-0.5 whitespace-pre-wrap">{employee.permanentAddress || "N/A"}</span></div>
            </div>
          </div>
        )}

        {/* PASSPORT TAB */}
        {activeTab === "passport" && (
          <div className="grid gap-6 md:grid-cols-2">
            {employee.passports[0] ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Registered Passport</h3>
                <div className="text-xs space-y-3">
                  <p><span className="text-zinc-500 block font-medium">Passport Number:</span> <span className="font-mono text-sm font-bold text-white block mt-0.5">{employee.passports[0].passportNumber}</span></p>
                  <p><span className="text-zinc-500 block font-medium">Issuing Country:</span> <span className="font-semibold text-zinc-300 block mt-0.5">{employee.passports[0].issuingCountry}</span></p>
                  <p><span className="text-zinc-500 block font-medium">Issue Date:</span> <span className="text-zinc-300 block mt-0.5">{new Date(employee.passports[0].issueDate).toLocaleDateString("en-GB")}</span></p>
                  <p><span className="text-zinc-500 block font-medium">Expiry Date:</span> <span className="text-zinc-300 block mt-0.5">{new Date(employee.passports[0].expiryDate).toLocaleDateString("en-GB")}</span></p>
                  {employee.passports[0].fileUrl && (
                    <p>
                      <span className="text-zinc-500 block font-medium">Attachment:</span>
                      <a
                        href={employee.passports[0].fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-1 rounded bg-zinc-800 px-2.5 py-1.5 text-zinc-200 hover:bg-zinc-700 transition-colors font-semibold"
                      >
                        <FileText className="h-3.5 w-3.5" /> View Passport Document
                      </a>
                    </p>
                  )}
                  <div className="pt-2">{getExpiryBadge(employee.passports[0].expiryDate)}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-red-950/20 bg-red-950/5 p-6 text-center text-red-400">
                <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
                <h4 className="mt-3 font-bold text-sm text-white">No Passport Linked</h4>
                <p className="mt-1 text-xs">Please submit the employee passport details using the editor form.</p>
              </div>
            )}

            {/* Passport Edit Form */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">
                {employee.passports[0] ? "Update Passport Details" : "Record Passport"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDocumentSubmit("passport", passportForm);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Passport Number *</label>
                  <input
                    type="text"
                    required
                    value={passportForm.passportNumber}
                    onChange={(e) => setPassportForm({ ...passportForm, passportNumber: e.target.value })}
                    placeholder="P102938"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Issuing Country *</label>
                  <input
                    type="text"
                    required
                    value={passportForm.issuingCountry}
                    onChange={(e) => setPassportForm({ ...passportForm, issuingCountry: e.target.value })}
                    placeholder="Pakistan"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Issue Date *</label>
                    <input
                      type="date"
                      required
                      value={passportForm.issueDate}
                      onChange={(e) => setPassportForm({ ...passportForm, issueDate: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={passportForm.expiryDate}
                      onChange={(e) => setPassportForm({ ...passportForm, expiryDate: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Upload Passport Image/PDF</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "passport")}
                    className="w-full text-zinc-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                  />
                  {uploadingDoc === "passport" && <span className="text-amber-400 text-[10px] animate-pulse">Uploading file to storage...</span>}
                  {passportForm.fileUrl && (
                    <p className="mt-1.5 text-[10px] text-emerald-400">
                      ✓ File loaded: <a href={passportForm.fileUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-300">View Attachment</a>
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitLoading ? "Saving..." : "Save Passport"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VISA TAB */}
        {activeTab === "visa" && (
          <div className="grid gap-6 md:grid-cols-2">
            {employee.visas[0] ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Registered Visa / Resident Permit</h3>
                <div className="text-xs space-y-3">
                  <p><span className="text-zinc-500 block font-medium">Visa Number:</span> <span className="font-mono text-sm font-bold text-white block mt-0.5">{employee.visas[0].visaNumber}</span></p>
                  <p><span className="text-zinc-500 block font-medium">Visa Type:</span> <span className="font-semibold text-zinc-300 block mt-0.5">{employee.visas[0].visaType}</span></p>
                  <p><span className="text-zinc-500 block font-medium">Sponsor:</span> <span className="text-zinc-300 block mt-0.5">{employee.visas[0].sponsor || "N/A"}</span></p>
                  <p><span className="text-zinc-500 block font-medium">Issue Date:</span> <span className="text-zinc-300 block mt-0.5">{new Date(employee.visas[0].issueDate).toLocaleDateString("en-GB")}</span></p>
                  <p><span className="text-zinc-500 block font-medium">Expiry Date:</span> <span className="text-zinc-300 block mt-0.5">{new Date(employee.visas[0].expiryDate).toLocaleDateString("en-GB")}</span></p>
                  <p><span className="text-zinc-500 block font-medium">Status:</span> <span className="text-zinc-300 block mt-0.5">{employee.visas[0].status}</span></p>
                  {employee.visas[0].notes && <p><span className="text-zinc-500 block font-medium">Notes:</span> <span className="text-zinc-400 block mt-0.5 leading-relaxed italic">{employee.visas[0].notes}</span></p>}
                  {employee.visas[0].fileUrl && (
                    <p>
                      <span className="text-zinc-500 block font-medium">Attachment:</span>
                      <a
                        href={employee.visas[0].fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-1 rounded bg-zinc-800 px-2.5 py-1.5 text-zinc-200 hover:bg-zinc-700 transition-colors font-semibold"
                      >
                        <FileText className="h-3.5 w-3.5" /> View Visa Document
                      </a>
                    </p>
                  )}
                  <div className="pt-2">{getExpiryBadge(employee.visas[0].expiryDate)}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-center text-zinc-400">
                <AlertTriangle className="mx-auto h-8 w-8 text-zinc-600" />
                <h4 className="mt-3 font-bold text-sm text-white">No Visa Document Record</h4>
                <p className="mt-1 text-xs">Expatriates require an active residence permit. Record it using the form.</p>
              </div>
            )}

            {/* Visa Edit Form */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">
                {employee.visas[0] ? "Update Visa details" : "Record Visa / Residence"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDocumentSubmit("visa", visaForm);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Visa/Residence Number *</label>
                  <input
                    type="text"
                    required
                    value={visaForm.visaNumber}
                    onChange={(e) => setVisaForm({ ...visaForm, visaNumber: e.target.value })}
                    placeholder="V876543"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Sponsor Company</label>
                  <input
                    type="text"
                    value={visaForm.sponsor}
                    onChange={(e) => setVisaForm({ ...visaForm, sponsor: e.target.value })}
                    placeholder="Logistics LLC"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Visa Type *</label>
                    <input
                      type="text"
                      required
                      value={visaForm.visaType}
                      onChange={(e) => setVisaForm({ ...visaForm, visaType: e.target.value })}
                      placeholder="Work Visa"
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Status</label>
                    <select
                      value={visaForm.status}
                      onChange={(e) => setVisaForm({ ...visaForm, status: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-300 focus:outline-none"
                    >
                      <option value="Valid">Valid</option>
                      <option value="Expiring Soon">Expiring Soon</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Issue Date *</label>
                    <input
                      type="date"
                      required
                      value={visaForm.issueDate}
                      onChange={(e) => setVisaForm({ ...visaForm, issueDate: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={visaForm.expiryDate}
                      onChange={(e) => setVisaForm({ ...visaForm, expiryDate: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={visaForm.notes}
                    onChange={(e) => setVisaForm({ ...visaForm, notes: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Upload Visa Image/PDF</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "visa")}
                    className="w-full text-zinc-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                  />
                  {uploadingDoc === "visa" && <span className="text-amber-400 text-[10px] animate-pulse">Uploading file to storage...</span>}
                  {visaForm.fileUrl && (
                    <p className="mt-1.5 text-[10px] text-emerald-400">
                      ✓ File loaded: <a href={visaForm.fileUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-300">View Attachment</a>
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitLoading ? "Saving..." : "Save Visa Details"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* LICENSE TAB */}
        {activeTab === "license" && (
          <div className="grid gap-6 md:grid-cols-2">
            {employee.licenses[0] ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Registered Heavy Driving License</h3>
                <div className="text-xs space-y-3">
                  <p><span className="text-zinc-500 block font-medium">License Number:</span> <span className="font-mono text-sm font-bold text-white block mt-0.5">{employee.licenses[0].licenseNumber}</span></p>
                  <p><span className="text-zinc-500 block font-medium">License Category:</span> <span className="font-semibold text-zinc-300 block mt-0.5">{employee.licenses[0].licenseType}</span></p>
                  <p><span className="text-zinc-500 block font-medium">Obtained Date:</span> <span className="text-zinc-300 block mt-0.5">{new Date(employee.licenses[0].obtainedDate).toLocaleDateString("en-GB")}</span></p>
                  <p><span className="text-zinc-500 block font-medium">ROP Issue Date:</span> <span className="text-zinc-300 block mt-0.5">{new Date(employee.licenses[0].issueDate).toLocaleDateString("en-GB")}</span></p>
                  <p><span className="text-zinc-500 block font-medium">ROP Expiry Date:</span> <span className="text-zinc-300 block mt-0.5">{new Date(employee.licenses[0].expiryDate).toLocaleDateString("en-GB")}</span></p>
                  <p><span className="text-zinc-500 block font-medium">Authority:</span> <span className="text-zinc-300 block mt-0.5">{employee.licenses[0].issuingAuthority}</span></p>
                  {employee.licenses[0].notes && <p><span className="text-zinc-500 block font-medium">Notes:</span> <span className="text-zinc-400 block mt-0.5 leading-relaxed italic">{employee.licenses[0].notes}</span></p>}
                  {employee.licenses[0].fileUrl && (
                    <p>
                      <span className="text-zinc-500 block font-medium">Attachment:</span>
                      <a
                        href={employee.licenses[0].fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-1 rounded bg-zinc-800 px-2.5 py-1.5 text-zinc-200 hover:bg-zinc-700 transition-colors font-semibold"
                      >
                        <FileText className="h-3.5 w-3.5" /> View License Document
                      </a>
                    </p>
                  )}
                  <div className="pt-2">{getExpiryBadge(employee.licenses[0].expiryDate)}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-red-950/20 bg-red-950/5 p-6 text-center text-red-400">
                <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
                <h4 className="mt-3 font-bold text-sm text-white">No Driving License Linked</h4>
                <p className="mt-1 text-xs">Since drivers require active ROP licenses, this must be registered.</p>
              </div>
            )}

            {/* License Edit Form */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">
                {employee.licenses[0] ? "Update License Details" : "Record Driving License"}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDocumentSubmit("license", licenseForm);
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">License Number *</label>
                    <input
                      type="text"
                      required
                      value={licenseForm.licenseNumber}
                      onChange={(e) => setLicenseForm({ ...licenseForm, licenseNumber: e.target.value })}
                      placeholder="L304958"
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">License Category *</label>
                    <input
                      type="text"
                      required
                      value={licenseForm.licenseType}
                      onChange={(e) => setLicenseForm({ ...licenseForm, licenseType: e.target.value })}
                      placeholder="Heavy Truck"
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">License Obtained Date *</label>
                  <input
                    type="date"
                    required
                    value={licenseForm.obtainedDate}
                    onChange={(e) => setLicenseForm({ ...licenseForm, obtainedDate: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">ROP Issue Date *</label>
                    <input
                      type="date"
                      required
                      value={licenseForm.issueDate}
                      onChange={(e) => setLicenseForm({ ...licenseForm, issueDate: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">ROP Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={licenseForm.expiryDate}
                      onChange={(e) => setLicenseForm({ ...licenseForm, expiryDate: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    value={licenseForm.issuingAuthority}
                    onChange={(e) => setLicenseForm({ ...licenseForm, issuingAuthority: e.target.value })}
                    placeholder="ROP"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={licenseForm.notes}
                    onChange={(e) => setLicenseForm({ ...licenseForm, notes: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Upload License Image/PDF</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "license")}
                    className="w-full text-zinc-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                  />
                  {uploadingDoc === "license" && <span className="text-amber-400 text-[10px] animate-pulse">Uploading file to storage...</span>}
                  {licenseForm.fileUrl && (
                    <p className="mt-1.5 text-[10px] text-emerald-400">
                      ✓ File loaded: <a href={licenseForm.fileUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-300">View Attachment</a>
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {submitLoading ? "Saving..." : "Save License"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Documents List */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Civil Cards / General Documents</h3>
              {employee.documents.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 p-12 text-center text-zinc-500 text-xs">
                  <FolderOpen className="mx-auto h-8 w-8 text-zinc-700 mb-2" />
                  No miscellaneous cards or medical certificates logged.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {employee.documents.map((doc: any) => (
                    <div key={doc.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-2 relative text-xs">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white">{doc.docType}</span>
                        <button
                          onClick={() => deleteGeneralDocument(doc.id)}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-zinc-400">Card No: <span className="font-mono text-zinc-200">{doc.docNumber}</span></p>
                      <p className="text-zinc-500">Exp: {new Date(doc.expiryDate).toLocaleDateString("en-GB")}</p>
                      {doc.fileUrl && (
                        <p className="mt-1">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
                          >
                            <FileText className="h-3 w-3" /> View Attachment
                          </a>
                        </p>
                      )}
                      <div className="mt-2">{getExpiryBadge(doc.expiryDate)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Form */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Add New Document</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDocumentSubmit("general", documentForm);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Document Type *</label>
                  <select
                    value={documentForm.docType}
                    onChange={(e) => setDocumentForm({ ...documentForm, docType: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-300 focus:outline-none"
                  >
                    <option value="Resident Card">Resident Card</option>
                    <option value="Civil ID">Civil ID</option>
                    <option value="Work Permit">Work Permit</option>
                    <option value="Medical Certificate">Medical Certificate</option>
                    <option value="Employment Contract">Employment Contract</option>
                    <option value="Other">Other Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Document/Card Number *</label>
                  <input
                    type="text"
                    required
                    value={documentForm.docNumber}
                    onChange={(e) => setDocumentForm({ ...documentForm, docNumber: e.target.value })}
                    placeholder="ID506070"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Issue Date *</label>
                    <input
                      type="date"
                      required
                      value={documentForm.issueDate}
                      onChange={(e) => setDocumentForm({ ...documentForm, issueDate: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={documentForm.expiryDate}
                      onChange={(e) => setDocumentForm({ ...documentForm, expiryDate: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={documentForm.notes}
                    onChange={(e) => setDocumentForm({ ...documentForm, notes: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Upload Document Image/PDF</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, "general")}
                    className="w-full text-zinc-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                  />
                  {uploadingDoc === "general" && <span className="text-amber-400 text-[10px] animate-pulse">Uploading file to storage...</span>}
                  {documentForm.fileUrl && (
                    <p className="mt-1.5 text-[10px] text-emerald-400">
                      ✓ File loaded: <a href={documentForm.fileUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-300">View Attachment</a>
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full rounded bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-50 disabled:opacity-50"
                >
                  {submitLoading ? "Saving..." : "Save Document"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SALARY TAB */}
        {activeTab === "salary" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Active Salary Structure Card */}
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Active Salary Structure</h3>
                {activeSalary ? (
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div><span className="text-zinc-500 font-medium block">Basic Salary:</span> <span className="font-bold text-white block mt-0.5">{new Intl.NumberFormat("en-OM", { style: "currency", currency: "OMR", minimumFractionDigits: 3 }).format(activeSalary.basicSalary)}</span></div>
                    <div><span className="text-zinc-500 font-medium block">Accommodation Allowance:</span> <span className="text-zinc-300 block mt-0.5">{new Intl.NumberFormat("en-OM", { style: "currency", currency: "OMR", minimumFractionDigits: 3 }).format(activeSalary.accommodationAllowance)}</span></div>
                    <div><span className="text-zinc-500 font-medium block">Food Allowance:</span> <span className="text-zinc-300 block mt-0.5">{new Intl.NumberFormat("en-OM", { style: "currency", currency: "OMR", minimumFractionDigits: 3 }).format(activeSalary.foodAllowance)}</span></div>
                    <div><span className="text-zinc-500 font-medium block">Transport Allowance:</span> <span className="text-zinc-300 block mt-0.5">{new Intl.NumberFormat("en-OM", { style: "currency", currency: "OMR", minimumFractionDigits: 3 }).format(activeSalary.transportAllowance)}</span></div>
                    <div><span className="text-zinc-500 font-medium block">Other Allowance:</span> <span className="text-zinc-300 block mt-0.5">{new Intl.NumberFormat("en-OM", { style: "currency", currency: "OMR", minimumFractionDigits: 3 }).format(activeSalary.otherAllowance)}</span></div>
                    <div><span className="text-zinc-500 font-medium block">Overtime Hourly Rate:</span> <span className="text-zinc-300 block mt-0.5">{new Intl.NumberFormat("en-OM", { style: "currency", currency: "OMR", minimumFractionDigits: 3 }).format(activeSalary.overtimeRate)} OMR / hr</span></div>
                    <div className="border-t border-zinc-800/80 pt-3 sm:col-span-2 flex justify-between items-center">
                      <span className="text-sm font-bold text-zinc-400">Total Monthly Gross Salary:</span>
                      <span className="text-base font-bold text-emerald-400">{new Intl.NumberFormat("en-OM", { style: "currency", currency: "OMR", minimumFractionDigits: 3 }).format(activeSalary.gross)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-zinc-500 text-xs">No salary structure defined yet.</div>
                )}
              </div>

              {/* Salary History */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Salary Changes History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-400">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500">
                        <th className="py-2">Effective Date</th>
                        <th className="py-2">Basic</th>
                        <th className="py-2">Allowances</th>
                        <th className="py-2">Overtime Rate</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {employee.salaryStructures.map((sal: any) => (
                        <tr key={sal.id} className="hover:bg-zinc-900/20">
                          <td className="py-2.5">{new Date(sal.effectiveDate).toLocaleDateString("en-GB")}</td>
                          <td className="py-2.5 text-zinc-200">{Number(sal.basicSalary).toFixed(3)}</td>
                          <td className="py-2.5">{(Number(sal.accommodationAllowance) + Number(sal.foodAllowance) + Number(sal.transportAllowance) + Number(sal.otherAllowance)).toFixed(3)}</td>
                          <td className="py-2.5">{Number(sal.overtimeRate).toFixed(3)}</td>
                          <td className="py-2.5">
                            {sal.isActive ? (
                              <span className="text-emerald-400 font-semibold">Active</span>
                            ) : (
                              <span className="text-zinc-600">Replaced</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Change structure form */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Set Salary Structure</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleHRSubmit("salary", salaryForm);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Basic Salary (OMR) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={salaryForm.basicSalary}
                    onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: e.target.value })}
                    placeholder="250.000"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Accommodation (OMR)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={salaryForm.accommodationAllowance}
                      onChange={(e) => setSalaryForm({ ...salaryForm, accommodationAllowance: e.target.value })}
                      placeholder="50.000"
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Food (OMR)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={salaryForm.foodAllowance}
                      onChange={(e) => setSalaryForm({ ...salaryForm, foodAllowance: e.target.value })}
                      placeholder="30.000"
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Transport (OMR)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={salaryForm.transportAllowance}
                      onChange={(e) => setSalaryForm({ ...salaryForm, transportAllowance: e.target.value })}
                      placeholder="20.000"
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Other Allowance (OMR)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={salaryForm.otherAllowance}
                      onChange={(e) => setSalaryForm({ ...salaryForm, otherAllowance: e.target.value })}
                      placeholder="10.000"
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Overtime rate (OMR per hr)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={salaryForm.overtimeRate}
                    onChange={(e) => setSalaryForm({ ...salaryForm, overtimeRate: e.target.value })}
                    placeholder="1.500"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Effective Date *</label>
                  <input
                    type="date"
                    required
                    value={salaryForm.effectiveDate}
                    onChange={(e) => setSalaryForm({ ...salaryForm, effectiveDate: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full rounded bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  Save Salary Structure
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ADVANCES TAB */}
        {activeTab === "advances" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Advances History list */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Active & Paid Advances</h3>
              {employee.advances.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 p-12 text-center text-zinc-500 text-xs">
                  No advances granted to this employee.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-400">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500">
                        <th className="py-2">Date</th>
                        <th className="py-2">Advance Amount</th>
                        <th className="py-2">Monthly Deduction</th>
                        <th className="py-2">Paid Back</th>
                        <th className="py-2">Balance</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {employee.advances.map((adv: any) => (
                        <tr key={adv.id}>
                          <td className="py-3">{new Date(adv.date).toLocaleDateString("en-GB")}</td>
                          <td className="py-3 text-zinc-200 font-semibold">{Number(adv.amount).toFixed(3)}</td>
                          <td className="py-3">{Number(adv.deductionMonthly).toFixed(3)}</td>
                          <td className="py-3 text-emerald-400">{Number(adv.paidAmount).toFixed(3)}</td>
                          <td className="py-3 text-amber-400 font-bold">{Number(adv.remainingBalance).toFixed(3)}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              adv.status === "Active" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {adv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Grant Advance Form */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Record Salary Advance</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleHRSubmit("advance", advanceForm);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Advance Amount (OMR) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={advanceForm.amount}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                    placeholder="150.000"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Monthly Deduction (OMR) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={advanceForm.deductionMonthly}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, deductionMonthly: e.target.value })}
                    placeholder="30.000"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Grant Date *</label>
                  <input
                    type="date"
                    required
                    value={advanceForm.date}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, date: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Reason for Advance</label>
                  <input
                    type="text"
                    value={advanceForm.reason}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                    placeholder="Medical, Family trip, school fees"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full rounded bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  Grant Advance
                </button>
              </form>
            </div>
          </div>
        )}

        {/* LEAVES TAB */}
        {activeTab === "leaves" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Leaves List */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Logged Leave Records</h3>
              {employee.leaves.length === 0 ? (
                <div className="rounded-xl border border-zinc-800 p-12 text-center text-zinc-500 text-xs">
                  No leave periods logged for this employee.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-400">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500">
                        <th className="py-2">Type</th>
                        <th className="py-2">Start Date</th>
                        <th className="py-2">End Date</th>
                        <th className="py-2">Total Days</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {employee.leaves.map((leave: any) => (
                        <tr key={leave.id}>
                          <td className="py-3 font-semibold text-zinc-200">{leave.leaveType}</td>
                          <td className="py-3">{new Date(leave.startDate).toLocaleDateString("en-GB")}</td>
                          <td className="py-3">{new Date(leave.endDate).toLocaleDateString("en-GB")}</td>
                          <td className="py-3 font-bold text-white">{leave.days}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              leave.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" :
                              leave.status === "Pending" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
                            }`}>
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Log Leave Form */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Log Leave Request</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleHRSubmit("leave", leaveForm);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Leave Type *</label>
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-300 focus:outline-none"
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.startDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Number of Days *</label>
                    <input
                      type="number"
                      required
                      value={leaveForm.days}
                      onChange={(e) => setLeaveForm({ ...leaveForm, days: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Approval Status</label>
                    <select
                      value={leaveForm.status}
                      onChange={(e) => setLeaveForm({ ...leaveForm, status: e.target.value })}
                      className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2 text-zinc-300 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold uppercase tracking-wider mb-1">Reason</label>
                  <input
                    type="text"
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Annual vacation back home"
                    className="w-full rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full rounded bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  Log Leave Run
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TRIPS TAB */}
        {activeTab === "trips" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Driver Trip log History</h3>
            {employee.trips.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 p-12 text-center text-zinc-500 text-xs">
                No trips recorded for this driver.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/20">
                <table className="w-full text-left text-xs text-zinc-400 border-collapse">
                  <thead className="bg-zinc-950">
                    <tr className="text-zinc-500 border-b border-zinc-800">
                      <th className="px-4 py-3">Trip ID</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Truck</th>
                      <th className="px-4 py-3">Route</th>
                      <th className="px-4 py-3">Distance (KM)</th>
                      <th className="px-4 py-3">Revenue (OMR)</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {employee.trips.map((trip: any) => (
                      <tr key={trip.id} className="hover:bg-zinc-900/10">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">{trip.tripId}</td>
                        <td className="px-4 py-3">{new Date(trip.tripDate).toLocaleDateString("en-GB")}</td>
                        <td className="px-4 py-3 font-mono">{trip.truck.regNumber}</td>
                        <td className="px-4 py-3 font-semibold text-zinc-200">{trip.origin} → {trip.destination}</td>
                        <td className="px-4 py-3 font-mono">{trip.distance} KM</td>
                        <td className="px-4 py-3 text-emerald-400 font-semibold">{Number(trip.revenue).toFixed(3)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            trip.status === "Completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                          }`}>
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* FINES TAB */}
        {activeTab === "fines" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2">Assigned Fines (Royal Oman Police)</h3>
            {employee.fines.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 p-12 text-center text-zinc-500 text-xs">
                No active traffic violations or fines on record.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/20">
                <table className="w-full text-left text-xs text-zinc-400">
                  <thead className="bg-zinc-950">
                    <tr className="text-zinc-500 border-b border-zinc-800">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Fine Type</th>
                      <th className="px-4 py-3">Truck Plate</th>
                      <th className="px-4 py-3">Authority</th>
                      <th className="px-4 py-3">Amount (OMR)</th>
                      <th className="px-4 py-3">Deduction Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {employee.fines.map((fine: any) => (
                      <tr key={fine.id} className="hover:bg-zinc-900/10">
                        <td className="px-4 py-3">{new Date(fine.date).toLocaleDateString("en-GB")}</td>
                        <td className="px-4 py-3 font-semibold text-zinc-200">{fine.fineType}</td>
                        <td className="px-4 py-3 font-mono">{fine.truck ? fine.truck.regNumber : "N/A"}</td>
                        <td className="px-4 py-3">{fine.authority}</td>
                        <td className="px-4 py-3 text-red-400 font-bold">{Number(fine.amount).toFixed(3)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            fine.paymentStatus === "Paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {fine.paymentStatus}
                          </span>
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
    </div>
  );
}
