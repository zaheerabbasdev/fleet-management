"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Truck,
  TrendingUp,
  Fuel,
  CreditCard,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Banknote,
  Route,
  UserPlus,
  FileCheck2,
  type LucideIcon,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "0 10px 30px rgb(0 0 0 / 0.4)",
};

const formatOMR = (val: number) =>
  new Intl.NumberFormat("en-OM", {
    style: "currency",
    currency: "OMR",
    minimumFractionDigits: 3,
  }).format(val || 0);

const percent = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

// Static class maps so Tailwind can see every class name.
const TONES = {
  emerald: {
    chip: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    glow: "from-emerald-500/15",
    text: "text-emerald-400",
    bar: "bg-emerald-500",
  },
  amber: {
    chip: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
    glow: "from-amber-500/15",
    text: "text-amber-400",
    bar: "bg-amber-500",
  },
  sky: {
    chip: "bg-sky-500/10 text-sky-400 ring-sky-500/20",
    glow: "from-sky-500/15",
    text: "text-sky-400",
    bar: "bg-sky-500",
  },
  red: {
    chip: "bg-red-500/10 text-red-400 ring-red-500/20",
    glow: "from-red-500/15",
    text: "text-red-400",
    bar: "bg-red-500",
  },
} as const;

type Tone = keyof typeof TONES;

function StatCard({
  label,
  icon: Icon,
  tone,
  value,
  hint,
  badge,
  progress,
}: {
  label: string;
  icon: LucideIcon;
  tone: Tone;
  value: React.ReactNode;
  hint: React.ReactNode;
  badge?: string;
  progress?: number;
}) {
  const t = TONES[tone];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/30">
      <div
        className={`pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${t.glow} to-transparent blur-2xl transition-opacity group-hover:opacity-100`}
      />
      <div className="relative flex items-start justify-between">
        <span className="text-sm font-medium text-zinc-400">{label}</span>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${t.chip}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="relative mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${t.chip}`}>{badge}</span>
        )}
      </div>
      <p className="relative mt-1.5 text-xs text-zinc-500">{hint}</p>
      {progress !== undefined && (
        <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full ${t.bar} transition-all duration-700`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm ${className}`}>
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [userName, setUserName] = useState("");
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

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => user?.name && setUserName(user.name))
      .catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8" aria-busy="true" aria-label="Loading fleet operations data">
        <div className="h-40 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40 lg:col-span-2" />
          <div className="h-96 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40" />
        </div>
      </div>
    );
  }

  if (error || !data) {
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Muscat",
  }).format(new Date());

  const fleetStatus = [
    { name: "Available", value: summary.availableTrucks, color: "#10b981" },
    { name: "On Trip", value: summary.trucksOnTrip, color: "#38bdf8" },
    { name: "In Service", value: summary.trucksMaintenance, color: "#f59e0b" },
  ];
  const fleetTotal = fleetStatus.reduce((sum, s) => sum + (s.value || 0), 0);

  const totalExpenses = summary.totalExpensesThisMonth;
  const expenseRows = [
    { label: "Fuel", amount: summary.fuelExpenseThisMonth, icon: Fuel, tone: "amber" as Tone },
    { label: "Salaries", amount: summary.salaryExpenseThisMonth, icon: Banknote, tone: "sky" as Tone },
    {
      label: "Other operating costs",
      amount: Math.max(0, totalExpenses - summary.fuelExpenseThisMonth - summary.salaryExpenseThisMonth),
      icon: TrendingDown,
      tone: "red" as Tone,
    },
  ];

  const shortcuts = [
    { href: "/employees?add=1", label: "Add New Employee", desc: "Register a driver or staff member", icon: UserPlus },
    { href: "/fuel", label: "Record Fuel Fill", desc: "Log a fuel transaction", icon: Fuel },
    { href: "/trips", label: "Create New Trip", desc: "Dispatch a truck and driver", icon: Route },
    { href: "/payroll", label: "Finalize Payroll Run", desc: "Process this month's salaries", icon: FileCheck2 },
  ];

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="bg-grid relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-emerald-950/40 p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">{today}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {greeting}
              {userName ? `, ${userName.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              {summary.trucksOnTrip} of {summary.totalTrucks} trucks are on the road and{" "}
              {alerts?.length ?? 0} document {alerts?.length === 1 ? "alert needs" : "alerts need"} attention
              this month.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 transition-colors hover:bg-emerald-500"
            >
              <Route className="h-4 w-4" />
              New trip
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              View reports
            </Link>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Employees"
          icon={Users}
          tone="emerald"
          value={summary.totalEmployees}
          badge={`${summary.activeEmployees} active`}
          hint="Omani and expatriate staff"
          progress={percent(summary.activeEmployees, summary.totalEmployees)}
        />
        <StatCard
          label="Trucks"
          icon={Truck}
          tone="sky"
          value={summary.totalTrucks}
          badge={`${summary.availableTrucks} available`}
          hint={`${summary.trucksOnTrip} on trip • ${summary.trucksMaintenance} in service`}
          progress={percent(summary.availableTrucks + summary.trucksOnTrip, summary.totalTrucks)}
        />
        <StatCard
          label="Revenue (MTD)"
          icon={TrendingUp}
          tone="emerald"
          value={<span className="text-2xl text-emerald-400">{formatOMR(summary.tripRevenueThisMonth)}</span>}
          hint={`From ${summary.tripsThisMonthCount} completed/planned trips`}
        />
        <StatCard
          label="Outstanding invoices"
          icon={CreditCard}
          tone="amber"
          value={<span className="text-2xl text-amber-400">{formatOMR(summary.outstandingCustomerPayments)}</span>}
          hint="Uncollected client balances"
        />
      </div>

      {/* Expiry alerts */}
      {alerts && alerts.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-5">
          <div className="flex items-center gap-3 border-b border-amber-500/10 pb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/30">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </span>
            <div className="flex-1">
              <h2 className="text-base font-bold text-amber-400">Important expiry alerts</h2>
              <p className="text-xs text-zinc-400">Documents requiring office action this month</p>
            </div>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
              {alerts.length}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-lg border border-amber-500/10 bg-zinc-900/60 p-3.5 text-xs text-zinc-300 transition-colors hover:border-amber-500/30"
              >
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue chart + fleet status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Monthly revenue vs operating expenses"
          subtitle="Comparison of trip billings and total operating costs"
          className="lg:col-span-2"
        >
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyOverview} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#3f3f46" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area name="Revenue" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area name="Expenses" type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Fleet status" subtitle="Where every truck is right now">
          {fleetTotal === 0 ? (
            <div className="flex h-72 items-center justify-center text-xs text-zinc-500">No trucks registered yet.</div>
          ) : (
            <>
              <div className="relative h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fleetStatus}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={80}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {fleetStatus.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{fleetTotal}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">trucks</span>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5">
                {fleetStatus.map((s) => (
                  <li key={s.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-zinc-300">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </span>
                    <span className="font-medium text-white">
                      {s.value}
                      <span className="ml-1.5 text-xs font-normal text-zinc-500">{percent(s.value, fleetTotal)}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      {/* Expense breakdown */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-zinc-900/40 p-5">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-zinc-400">
            <span>Total operating expenses (MTD)</span>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-red-400">{formatOMR(totalExpenses)}</p>
          <p className="mt-1 text-xs text-zinc-500">Fuel, salaries and other costs combined</p>
        </div>
        {expenseRows.map((row) => {
          const t = TONES[row.tone];
          const share = percent(row.amount, totalExpenses);
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-zinc-400">
                <span>{row.label}</span>
                <Icon className={`h-4 w-4 ${t.text}`} />
              </div>
              <p className="mt-3 text-xl font-bold text-zinc-100">{formatOMR(row.amount)}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div className={`h-full rounded-full ${t.bar} transition-all duration-700`} style={{ width: `${share}%` }} />
                </div>
                <span className="text-xs text-zinc-500">{share}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fuel + profitability charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Fuel consumption efficiency (L / 100 KM)" subtitle="Lower is better. Highlights trucks needing a mechanical check">
          {charts.fuelConsumption.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-xs text-zinc-500">
              No fuel or mileage logs found yet for active trucks.
            </div>
          ) : (
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.fuelConsumption}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="truck" stroke="#71717a" tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgb(255 255 255 / 0.04)" }} />
                  <Bar name="Liters per 100 KM" dataKey="consumption" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Truck profitability (estimated)" subtitle="Trip revenue minus fuel, maintenance and other expenses">
          {charts.truckProfitability.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-xs text-zinc-500">
              No trip/cost records available for active trucks.
            </div>
          ) : (
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.truckProfitability} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" stroke="#71717a" tickLine={false} axisLine={false} />
                  <YAxis dataKey="truck" type="category" stroke="#71717a" width={60} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgb(255 255 255 / 0.04)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar name="Revenue" dataKey="revenue" fill="#10b981" stackId="a" />
                  <Bar name="Expenses" dataKey="expenses" fill="#f59e0b" stackId="a" />
                  <Bar name="Net profit (OMR)" dataKey="profit" fill="#38bdf8" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-white">Quick management shortcuts</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-600/60 hover:bg-zinc-900"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 transition-colors group-hover:bg-emerald-500/20">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{label}</span>
                <span className="block truncate text-xs text-zinc-500">{desc}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
