"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  User,
  ShieldCheck,
  Calendar,
  Truck,
  ArrowUpDown,
  Archive,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [nationality, setNationality] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("empId");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status,
        nationality,
        page: page.toString(),
        sortField,
        sortOrder,
      });
      const res = await fetch(`/api/employees?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.items);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, status, nationality, page, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleArchive = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to archive employee ${name}? This will set their status to Inactive.`)) {
      try {
        const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
        if (res.ok) {
          alert(`Successfully archived ${name}`);
          fetchEmployees();
        } else {
          alert("Failed to archive employee");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Employee Management</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Manage company drivers, HR profiles, licenses, and document expiries.
          </p>
        </div>
        <Link
          href="/employees/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="grid gap-4 md:grid-cols-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by name, ID, phone, passport, license..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
            <option value="Terminated">Terminated</option>
            <option value="Returned Home">Returned Home</option>
          </select>
        </div>

        <div>
          <select
            value={nationality}
            onChange={(e) => {
              setNationality(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Nationalities</option>
            <option value="Oman">Oman</option>
            <option value="Pakistani">Pakistani</option>
            <option value="Indian">Indian</option>
            <option value="Bangladeshi">Bangladeshi</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/20 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950/80 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th
                  onClick={() => handleSort("empId")}
                  className="cursor-pointer px-6 py-4 hover:bg-zinc-900 hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    Employee ID <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="cursor-pointer px-6 py-4 hover:bg-zinc-900 hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    Full Name <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Nationality</th>
                <th
                  onClick={() => handleSort("joiningDate")}
                  className="cursor-pointer px-6 py-4 hover:bg-zinc-900 hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    Joining Date <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-4">Assigned Truck</th>
                <th className="px-6 py-4">Docs Checklist</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-transparent">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    <p className="mt-3 text-xs text-zinc-500">Loading employees list...</p>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-zinc-500">
                    <User className="mx-auto h-12 w-12 text-zinc-700" />
                    <h3 className="mt-4 font-bold text-sm text-zinc-400">No Employees Found</h3>
                    <p className="mt-1 text-xs">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-mono font-bold text-emerald-400">
                      {emp.empId}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                      {emp.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs">
                      {emp.phone}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs">
                      {emp.nationality}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs">
                      {new Date(emp.joiningDate).toLocaleDateString("en-GB")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-mono font-semibold">
                      {emp.currentTruck === "Unassigned" ? (
                        <span className="text-zinc-500">Unassigned</span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5" />
                          {emp.currentTruck}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex gap-2">
                        <span
                          title="Passport"
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            emp.passportStatus === "Provided"
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                              : "bg-red-950/40 text-red-400 border border-red-900/40"
                          }`}
                        >
                          PAS
                        </span>
                        <span
                          title="Visa / Residence"
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            emp.nationality === "Oman"
                              ? "bg-zinc-800 text-zinc-500"
                              : emp.visaStatus === "Provided"
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                              : "bg-red-950/40 text-red-400 border border-red-900/40"
                          }`}
                        >
                          VIS
                        </span>
                        <span
                          title="ROP Driving License"
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            emp.licenseStatus === "Provided"
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                              : "bg-red-950/40 text-red-400 border border-red-900/40"
                          }`}
                        >
                          LIC
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          emp.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                            : emp.status === "On Leave"
                            ? "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20"
                            : "bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-xs font-medium">
                      <div className="flex justify-end gap-3.5">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          View Profile
                        </Link>
                        {emp.status !== "Inactive" && (
                          <button
                            onClick={() => handleArchive(emp.id, emp.name)}
                            className="text-red-400 hover:text-red-300"
                            title="Archive Employee"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950/40 px-6 py-4">
            <span className="text-xs text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
