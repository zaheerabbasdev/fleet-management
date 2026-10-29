"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import FuelForm from "@/components/forms/FuelForm";
import Link from "next/link";
import {
  Plus, Fuel, Truck, User, Droplets, DollarSign,
  ArrowUpDown, Search, CreditCard
} from "lucide-react";

export default function FuelPage() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);

  const fetchFuel = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fuel?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuel();
  }, []);

  const formatOMR = (v: number) =>
    new Intl.NumberFormat("en-OM", { minimumFractionDigits: 3 }).format(v);

  const totalAmount = items.reduce((sum, f) => sum + Number(f.totalAmount), 0);
  const totalLiters = items.reduce((sum, f) => sum + Number(f.liters), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Fuel Logs</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Record and monitor diesel consumption and fuel costs across all trucks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Fuel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Droplets className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Liters</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalLiters.toLocaleString()} L</p>
          <p className="text-xs text-zinc-500 mt-1">on current page</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Cost</span>
          </div>
          <p className="text-2xl font-bold text-white">OMR {formatOMR(totalAmount)}</p>
          <p className="text-xs text-zinc-500 mt-1">on current page</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Fuel className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Avg Cost/Liter</span>
          </div>
          <p className="text-2xl font-bold text-white">
            OMR {totalLiters > 0 ? formatOMR(totalAmount / totalLiters) : "0.000"}
          </p>
          <p className="text-xs text-zinc-500 mt-1">on current page</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-20 text-center">
          <Fuel className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 font-bold text-sm text-zinc-400">No Fuel Logs</h3>
          <p className="mt-1 text-xs text-zinc-500">Log your first fuel fill-up to begin tracking consumption.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/80">
              <tr className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Fuel ID</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Truck</th>
                <th className="px-5 py-3.5">Driver</th>
                <th className="px-5 py-3.5">Station</th>
                <th className="px-5 py-3.5">Liters</th>
                <th className="px-5 py-3.5">Price/L</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Odometer</th>
                <th className="px-5 py-3.5">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {items.map((fuel) => (
                <tr key={fuel.id} className="bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-emerald-400">{fuel.fuelId}</span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-300">
                    {new Date(fuel.date).toLocaleDateString("en-OM")}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                      <Truck className="h-3.5 w-3.5 text-zinc-600" />
                      {fuel.truck?.regNumber}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                      <User className="h-3.5 w-3.5 text-zinc-600" />
                      {fuel.driver?.name}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-400">{fuel.fuelStation || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-semibold text-blue-400">{Number(fuel.liters).toFixed(1)} L</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-zinc-300">{formatOMR(Number(fuel.pricePerLiter))}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-semibold text-white">OMR {formatOMR(Number(fuel.totalAmount))}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-zinc-400">{fuel.odometer.toLocaleString()} km</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${fuel.paymentMethod === "Fuel Card" ? "bg-purple-500/10 text-purple-400 ring-purple-500/20" : "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20"}`}>
                      <CreditCard className="mr-1 h-3 w-3" />
                      {fuel.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3">
              <span className="text-xs text-zinc-500">{pagination.totalItems} total records</span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchFuel(pagination.page - 1)}
                  className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchFuel(pagination.page + 1)}
                  className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <Modal title="Add fuel" onClose={() => setShowForm(false)}>
          <FuelForm
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              fetchFuel();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
