"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import MaintenanceForm from "@/components/forms/MaintenanceForm";
import Link from "next/link";
import {
  Plus, Search, Wrench, Truck, Calendar,
  Activity, AlertTriangle, PenTool, CheckCircle,
  Clock, ShieldAlert, FileSpreadsheet
} from "lucide-react";

export default function MaintenancePage() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [totalCost, setTotalCost] = useState(0);

  const TYPES = [
    "Oil Change", "General Service", "Tyre Replacement", "Engine Repair",
    "Brake Repair", "Electrical", "Accident Repair", "Other"
  ];

  const fetchMaintenance = async (page = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ search, maintenanceType, page: page.toString() });
      const res = await fetch(`/api/maintenance?${q}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setPagination(data.pagination);
        setTotalCost(data.totalCost);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance(1);
  }, [search, maintenanceType]);

  const formatOMR = (v: number) =>
    new Intl.NumberFormat("en-OM", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Truck Maintenance</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Record maintenance services, track garage visits, repairs, and schedule next service reminders.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Maintenance
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Maintenance Expenditure</span>
          </div>
          <p className="text-2xl font-bold text-white">OMR {formatOMR(totalCost)}</p>
          <p className="text-xs text-zinc-500 mt-1">total service costs in current query</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Wrench className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Services Logged</span>
          </div>
          <p className="text-2xl font-bold text-white">{pagination.totalItems}</p>
          <p className="text-xs text-zinc-500 mt-1">completed workshop events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by description, workshop, truck plate/reg..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <select
          value={maintenanceType}
          onChange={(e) => setMaintenanceType(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All Types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Maintenance Table */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-20 text-center">
          <Wrench className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 font-bold text-sm text-zinc-400">No Maintenance Logs</h3>
          <p className="mt-1 text-xs text-zinc-500">Log your first vehicle repair or oil change to track servicing.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/80">
              <tr className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Service Date</th>
                <th className="px-5 py-3.5">Truck</th>
                <th className="px-5 py-3.5">Service Type</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Workshop</th>
                <th className="px-5 py-3.5">Odometer</th>
                <th className="px-5 py-3.5">Cost</th>
                <th className="px-5 py-3.5">Next Service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {items.map((item) => (
                <tr key={item.id} className="bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-zinc-300 font-medium">
                    {new Date(item.date).toLocaleDateString("en-OM")}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
                      <Truck className="h-3.5 w-3.5 text-zinc-600" />
                      {item.truck?.regNumber}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                      {item.maintenanceType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-400 max-w-[200px] truncate">
                    {item.description || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-300">{item.workshop || "—"}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-zinc-400">
                    {item.odometer.toLocaleString()} km
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-semibold text-white">OMR {formatOMR(Number(item.cost))}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {item.nextServiceDate ? (
                      <div className="text-xs text-zinc-400 font-medium">
                        <p>{new Date(item.nextServiceDate).toLocaleDateString("en-OM")}</p>
                        {item.nextServiceOdometer && (
                          <p className="text-[10px] text-zinc-500 font-mono">@{item.nextServiceOdometer.toLocaleString()} km</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3">
              <span className="text-xs text-zinc-500">{pagination.totalItems} logs total</span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchMaintenance(pagination.page - 1)}
                  className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchMaintenance(pagination.page + 1)}
                  className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal title="Add repair or service" onClose={() => setShowForm(false)}>
          <MaintenanceForm
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              fetchMaintenance();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
