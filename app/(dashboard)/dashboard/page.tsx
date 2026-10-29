"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Truck,
  TrendingUp,
  Fuel,
  CreditCard,
  Layers,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Activity,
  Milestone
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard data");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-zinc-400">Loading fleet operations data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-bold">Error Loading Dashboard</h3>
        <p className="mt-2 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, alerts, charts } = data;

  // Format currency helpers
  const formatOMR = (val: number) => {
    return new Intl.NumberFormat("en-OM", {
      style: "currency",
      currency: "OMR",
      minimumFractionDigits: 3,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Fleet Operations Overview
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Real-time status of employees, trucks, fuel efficiency, and revenue across Oman.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
            Live Database Connected
          </span>
          <span className="text-xs text-zinc-500">Asia/Muscat Timezone</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* EMPLOYEES */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Employees</span>
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{summary.totalEmployees}</span>
            <span className="text-xs text-emerald-400 font-medium">
              {summary.activeEmployees} Active
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-500">Omani and Expatriate Staff</p>
        </div>

        {/* TRUCKS */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Active Trucks</span>
            <Truck className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{summary.totalTrucks}</span>
            <span className="text-xs text-zinc-400 font-medium">
              {summary.availableTrucks} Avail.
            </span>
          </div>
          <div className="mt-2 flex gap-3 text-xs text-zinc-500">
            <span>{summary.trucksOnTrip} on Trip</span>
            <span>•</span>
            <span>{summary.trucksMaintenance} in Service</span>
          </div>
        </div>

        {/* REVENUE THIS MONTH */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Revenue (MTD)</span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-emerald-400 block tracking-tight">
              {formatOMR(summary.tripRevenueThisMonth)}
            </span>
            <span className="mt-1 block text-xs text-zinc-500">
              From {summary.tripsThisMonthCount} completed/planned trips
            </span>
          </div>
        </div>

        {/* OUTSTANDING PAYMENTS */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm hover:border-zinc-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Outstanding Invoices</span>
            <CreditCard className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-amber-400 block tracking-tight">
              {formatOMR(summary.outstandingCustomerPayments)}
            </span>
            <span className="mt-1 block text-xs text-zinc-500">Uncollected client balances</span>
          </div>
        </div>
      </div>

      {/* Financial Expenses Breakdown KPI */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>FUEL EXPENSE (MTD)</span>
            <Fuel className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-lg font-bold text-zinc-200">{formatOMR(summary.fuelExpenseThisMonth)}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>SALARY PAYMENTS (MTD)</span>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-lg font-bold text-zinc-200">{formatOMR(summary.salaryExpenseThisMonth)}</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>TOTAL OPERATION EXPENSES</span>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </div>
          <p className="mt-2 text-lg font-bold text-red-400">{formatOMR(summary.totalExpensesThisMonth)}</p>
        </div>
      </div>

      {/* Expiry Alerts section */}
      {alerts && alerts.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-3 border-b border-amber-500/10 pb-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-amber-500">Important Expiry Alerts</h2>
              <p className="text-xs text-zinc-400">Documents requiring office action this month</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-lg border border-amber-500/10 bg-zinc-900/60 p-3.5 text-xs text-zinc-300 hover:border-amber-500/20 transition-all"
              >
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 mt-1.5" />
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CHART 1: Revenue vs Expenses */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <div className="border-b border-zinc-800 pb-4 mb-6">
            <h3 className="text-base font-semibold text-white">Monthly Revenue vs Operating Expenses</h3>
            <p className="text-xs text-zinc-500 mt-1">Comparison of trip billings and total oper. costs</p>
          </div>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyOverview} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} />
                <Legend />
                <Area name="Revenue" type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                <Area name="Expenses" type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Fuel Consumption (Liters/100KM) by Truck */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm">
          <div className="border-b border-zinc-800 pb-4 mb-6">
            <h3 className="text-base font-semibold text-white">Fuel Consumption Efficiency (Liters / 100 KM)</h3>
            <p className="text-xs text-zinc-500 mt-1">Lower is better. Shows trucks requiring mechanical check</p>
          </div>
          {charts.fuelConsumption.length === 0 ? (
            <div className="flex h-80 items-center justify-center text-xs text-zinc-500">
              No fuel or mileage logs found yet for active trucks.
            </div>
          ) : (
            <div className="h-80 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.fuelConsumption}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="truck" stroke="#71717a" />
                  <YAxis stroke="#71717a" label={{ value: "L / 100 KM", angle: -90, position: "insideLeft", fill: "#71717a" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} />
                  <Bar name="Liters per 100 KM" dataKey="consumption" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* CHART 3: Truck Profitability */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm lg:col-span-2">
          <div className="border-b border-zinc-800 pb-4 mb-6">
            <h3 className="text-base font-semibold text-white">Truck Profitability (Estimated)</h3>
            <p className="text-xs text-zinc-500 mt-1">Calculated as: Trip Revenue - (Fuel + Maintenance + Other expenses)</p>
          </div>
          {charts.truckProfitability.length === 0 ? (
            <div className="flex h-60 items-center justify-center text-xs text-zinc-500">
              No trip/cost records available for active trucks.
            </div>
          ) : (
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.truckProfitability} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" stroke="#71717a" />
                  <YAxis dataKey="truck" type="category" stroke="#71717a" width={60} />
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a" }} />
                  <Legend />
                  <Bar name="Revenue" dataKey="revenue" fill="#10b981" stackId="a" />
                  <Bar name="Expenses" dataKey="expenses" fill="#f59e0b" stackId="a" />
                  <Bar name="Net Profit (OMR)" dataKey="profit" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6">
        <h3 className="text-sm font-semibold text-white">Quick Management Shortcuts</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/employees?add=1"
            className="flex items-center justify-between rounded-lg bg-zinc-950 p-4 border border-zinc-800/80 text-sm hover:border-emerald-600 transition-colors"
          >
            <span>Add New Employee</span>
            <ChevronRight className="h-4 w-4 text-emerald-400" />
          </Link>
          <Link
            href="/fuel"
            className="flex items-center justify-between rounded-lg bg-zinc-950 p-4 border border-zinc-800/80 text-sm hover:border-emerald-600 transition-colors"
          >
            <span>Record Fuel Fill</span>
            <ChevronRight className="h-4 w-4 text-emerald-400" />
          </Link>
          <Link
            href="/trips"
            className="flex items-center justify-between rounded-lg bg-zinc-950 p-4 border border-zinc-800/80 text-sm hover:border-emerald-600 transition-colors"
          >
            <span>Create New Trip</span>
            <ChevronRight className="h-4 w-4 text-emerald-400" />
          </Link>
          <Link
            href="/payroll"
            className="flex items-center justify-between rounded-lg bg-zinc-950 p-4 border border-zinc-800/80 text-sm hover:border-emerald-600 transition-colors"
          >
            <span>Finalize Payroll Run</span>
            <ChevronRight className="h-4 w-4 text-emerald-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
