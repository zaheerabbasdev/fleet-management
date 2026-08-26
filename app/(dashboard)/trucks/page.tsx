"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Truck, AlertTriangle,
} from "lucide-react";
import { VEHICLE_CATEGORIES } from "@/lib/vehicleCategories";

const categoryIcons: Record<string, string> = {
  Trucks: "🚛",
  Trailers: "🚚",
  Cars: "🚗",
  Vans: "🚐",
  "Heavy Equipment": "🏗️",
};

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ search, status, category });
      const res = await fetch(`/api/trucks?${query}`);
      if (res.ok) {
        const data = await res.json();
        setTrucks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, [search, status, category]);

  const statusColors: Record<string, string> = {
    Available: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    "On Trip": "bg-blue-500/10 text-blue-400 ring-blue-500/20",
    "Under Maintenance": "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    Inactive: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
    Sold: "bg-red-500/10 text-red-400 ring-red-500/20",
  };

  const getExpiringDoc = (documents: any[]) => {
    const now = new Date();
    const warn = new Date();
    warn.setDate(warn.getDate() + 30);
    return documents.some(
      (doc) =>
        new Date(doc.expiryDate) <= warn && new Date(doc.expiryDate) >= now
    );
  };

  // Count per category from current loaded data
  const countByCategory = (cat: string) =>
    trucks.filter((t) => t.category === cat).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Fleet Management
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Manage trucks, trailers, cars, vans, and heavy equipment across the entire fleet.
          </p>
        </div>
        <Link
          href="/trucks/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Register Vehicle
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all border ${
            category === ""
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
          }`}
        >
          🚘 All Fleet
          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs">
            {trucks.length}
          </span>
        </button>
        {VEHICLE_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all border ${
              category === cat.value
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, registration, plate, make, VIN..."
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
          <option value="Available">Available</option>
          <option value="On Trip">On Trip</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Inactive">Inactive</option>
          <option value="Sold">Sold</option>
        </select>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : trucks.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-20 text-center">
          <Truck className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 font-bold text-sm text-zinc-400">No Vehicles Found</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Register your first vehicle to begin tracking fleet operations.
          </p>
          <Link
            href="/trucks/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4" />
            Register Vehicle
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trucks.map((truck) => (
            <Link
              key={truck.id}
              href={`/trucks/${truck.id}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700 transition-all hover:bg-zinc-900/50 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/10 border border-emerald-600/20 text-xl">
                    {categoryIcons[truck.category] ?? "🚘"}
                  </div>
                  <div>
                    <p className="font-mono font-bold text-emerald-400 text-sm">
                      {truck.regNumber}
                    </p>
                    <p className="text-xs text-zinc-500 font-medium">{truck.truckId}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                    statusColors[truck.status] ??
                    "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20"
                  }`}
                >
                  {truck.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Category</span>
                  <span className="text-zinc-300 font-semibold">
                    {truck.category} — {truck.truckType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Make / Model</span>
                  <span className="text-zinc-200 font-semibold">
                    {truck.make} {truck.model} ({truck.year})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Plate</span>
                  <span className="font-mono text-zinc-300">
                    {truck.plateCode} {truck.plateNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Odometer</span>
                  <span className="font-mono text-zinc-200">
                    {truck.odometer.toLocaleString()} KM
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-800 pt-2 mt-2">
                  <span className="text-zinc-500">Assigned Driver</span>
                  <span
                    className={`font-semibold ${
                      truck.currentDriver === "Unassigned"
                        ? "text-zinc-600"
                        : "text-emerald-400"
                    }`}
                  >
                    {truck.currentDriver}
                  </span>
                </div>
              </div>

              {getExpiringDoc(truck.documents) && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Document expiring soon
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
