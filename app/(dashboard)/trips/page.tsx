"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, MapPin, Truck, User, Building,
  ArrowRight, PackageOpen, TrendingUp, TrendingDown
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "Planned": "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  "In Progress": "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  "Completed": "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  "Cancelled": "bg-red-500/10 text-red-400 ring-red-500/20",
  "Delayed": "bg-purple-500/10 text-purple-400 ring-purple-500/20",
};

export default function TripsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchTrips = async (page = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ search, status, page: page.toString() });
      const res = await fetch(`/api/trips?${q}`);
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
    fetchTrips(1);
  }, [search, status]);

  const formatOMR = (v: number) =>
    new Intl.NumberFormat("en-OM", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(v);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Trips & Loads</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Record and track every truck trip, revenue, and expenses in real time.
          </p>
        </div>
        <Link
          href="/trips/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Record Trip
        </Link>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search trips by ID, origin, destination, driver, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Delayed">Delayed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Trips Table */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-20 text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 font-bold text-sm text-zinc-400">No Trips Found</h3>
          <p className="mt-1 text-xs text-zinc-500">Record your first trip to track routes, revenue, and expenses.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/80">
              <tr className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                <th className="px-5 py-3.5">Trip ID</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Route</th>
                <th className="px-5 py-3.5">Truck / Driver</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Revenue</th>
                <th className="px-5 py-3.5">P&L</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {items.map((trip) => (
                <tr key={trip.id} className="bg-zinc-900/20 hover:bg-zinc-900/50 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <Link href={`/trips/${trip.id}`}>
                      <span className="font-mono font-semibold text-emerald-400 text-xs hover:underline">{trip.tripId}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-zinc-300">{new Date(trip.tripDate).toLocaleDateString("en-OM")}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <span className="text-zinc-400">{trip.origin}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-600" />
                      <span>{trip.destination}</span>
                    </div>
                    {trip.distance > 0 && (
                      <span className="text-xs text-zinc-600">{trip.distance.toLocaleString()} km</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                        <Truck className="h-3.5 w-3.5 text-zinc-600" />
                        {trip.truck?.regNumber}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <User className="h-3.5 w-3.5 text-zinc-700" />
                        {trip.driver?.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                      <Building className="h-3.5 w-3.5 text-zinc-600" />
                      {trip.customer?.companyName}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-sm font-semibold text-white">
                      OMR {formatOMR(Number(trip.revenue))}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {trip.status === "Completed" && (
                      <div className="flex items-center gap-1.5">
                        {trip.estimatedProfit >= 0 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                            <span className="font-mono text-xs text-emerald-400">
                              +{formatOMR(trip.estimatedProfit)}
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 text-red-400" />
                            <span className="font-mono text-xs text-red-400">
                              {formatOMR(trip.estimatedProfit)}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                    {trip.status !== "Completed" && (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_COLORS[trip.status] || "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20"}`}>
                      {trip.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3">
              <span className="text-xs text-zinc-500">
                Showing {items.length} of {pagination.totalItems} trips
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchTrips(pagination.page - 1)}
                  className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchTrips(pagination.page + 1)}
                  className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
