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

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Employees", href: "/employees", icon: Users },
    { name: "Trucks", href: "/trucks", icon: Truck },
    { name: "Trips", href: "/trips", icon: Route },
    { name: "Fuel Logs", href: "/fuel", icon: Fuel },
    { name: "Salaries / Payroll", href: "/payroll", icon: Banknote },
    { name: "Truck Expenses", href: "/expenses", icon: Receipt },
    { name: "Maintenance", href: "/maintenance", icon: Wrench },
    { name: "Customers", href: "/customers", icon: Building2 },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Fines (ROP)", href: "/fines", icon: AlertTriangle },
    { name: "Reports Console", href: "/reports", icon: FileSpreadsheet },
    { name: "Settings", href: "/settings", icon: Settings },
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
            <div className="flex h-9 w-9 items-center justify-center rounded bg-emerald-600 font-bold text-white">
              HU
            </div>
            <div>
              <span className="font-bold text-white text-sm block">Logistics</span>
              <span className="text-zinc-500 text-xs block">Muscat, Oman</span>
            </div>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                    : "hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-zinc-400"}`} />
                {item.name}
              </Link>
            );
          })}
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
