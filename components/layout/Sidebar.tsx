"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Truck,
  Route,
  Fuel,
  Banknote,
  Receipt,
  Wrench,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuGroups = [
    {
      label: "Overview",
      items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Operations",
      items: [
        { name: "Trips", href: "/trips", icon: Route },
        { name: "Trucks", href: "/trucks", icon: Truck },
        { name: "Fuel Logs", href: "/fuel", icon: Fuel },
        { name: "Maintenance", href: "/maintenance", icon: Wrench },
        { name: "Truck Expenses", href: "/expenses", icon: Receipt },
      ],
    },
    {
      label: "People",
      items: [
        { name: "Employees", href: "/employees", icon: Users },
        { name: "Salaries / Payroll", href: "/payroll", icon: Banknote },
        { name: "Fines (ROP)", href: "/fines", icon: AlertTriangle },
      ],
    },
    {
      label: "Finance",
      items: [
        { name: "Customers", href: "/customers", icon: Building2 },
        { name: "Invoices", href: "/invoices", icon: FileText },
        { name: "Reports Console", href: "/reports", icon: FileSpreadsheet },
      ],
    },
    {
      label: "System",
      items: [{ name: "Settings", href: "/settings", icon: Settings }],
    },
  ];

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      try {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        if (res.ok) {
          router.push("/login");
          router.refresh();
        }
      } catch (err) {
        console.error("Logout failed:", err);
      }
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-300 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-800 bg-zinc-950">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-950/40">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block">Logistics</span>
              <span className="text-zinc-500 text-xs block">Muscat, Oman</span>
            </div>
          </Link>
          <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="lg:hidden text-zinc-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-emerald-400" />
                      )}
                      <Icon
                        className={`h-[18px] w-[18px] transition-colors ${
                          isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer User & Logout */}
        <div className="border-t border-zinc-800 p-4 bg-zinc-950/40">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/20 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
