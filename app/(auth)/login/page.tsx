"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldAlert, Truck } from "lucide-react";

// Inner component that uses useSearchParams — must be inside <Suspense>
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
            Email Address
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-3 pr-4 pl-10 text-white placeholder-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
              placeholder="admin@omantrucking.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
            Password
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-3 pr-12 pl-10 text-white placeholder-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Sign in"
          )}
        </button>
      </div>
    </form>
  );
}

// Page component wraps LoginForm in Suspense (required for useSearchParams in Next.js 16)
export default function LoginPage() {
  return (
    <div className="grid min-h-screen bg-zinc-950 font-sans text-zinc-100 lg:grid-cols-2">
      {/* Brand panel (desktop only) */}
      <div className="bg-grid relative hidden flex-col justify-between overflow-hidden border-r border-zinc-800 p-12 lg:flex">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-amber-600/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-950/40">
            <Truck className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-white">Logistics</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Run your fleet with <span className="text-emerald-400">clarity</span>.
          </h1>
          <p className="mt-4 text-zinc-400">
            Trips, trucks, drivers, fuel, payroll and invoicing in one place, with expiry alerts
            so no document lapses unnoticed.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-zinc-300">
            {[
              "Live trip and truck status",
              "Automatic passport, visa and Mulkiya expiry alerts",
              "Invoices and payments in OMR",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-zinc-600">Fleet &amp; Employee Management System • Oman</p>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="absolute inset-0 overflow-hidden lg:hidden">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-950/30 blur-3xl" />
        </div>

        <div className="animate-fade-up relative w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-950/40">
              <Truck className="h-6 w-6" />
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-zinc-400">Sign in to manage your fleet operations.</p>

          {/* Suspense boundary required for useSearchParams */}
          <Suspense fallback={<div className="mt-8 h-48 animate-pulse rounded-lg bg-zinc-800/40" />}>
            <LoginForm />
          </Suspense>

          <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-500">
            <p className="font-medium text-zinc-400">Demo account</p>
            <p className="mt-1">admin@omantrucking.com</p>
            <p>Admin@Oman2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
