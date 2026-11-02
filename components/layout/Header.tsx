"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Menu, ShieldAlert, UserCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Employees",
  trucks: "Trucks",
  trips: "Trips",
  fuel: "Fuel Logs",
  payroll: "Salaries / Payroll",
  expenses: "Truck Expenses",
  maintenance: "Maintenance",
  customers: "Customers",
  invoices: "Invoices",
  fines: "Fines (ROP)",
  reports: "Reports Console",
  settings: "Settings",
};

export default function Header({ setSidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname.split("/")[1]] ?? "Logistics Fleet System";
  const bellRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState("Administrator");
  const [userRole, setUserRole] = useState("ADMIN");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch admin profile and notifications
  useEffect(() => {
    // Show the user who is really logged in
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user) {
          setUserName(user.name);
          setUserRole(user.role);
        }
      })
      .catch(() => {});

    // Generate fresh expiry alerts then fetch unread notifications
    const fetchNotifications = async () => {
      try {
        // Trigger expiry alert generation silently (fire-and-forget style)
        fetch("/api/notifications/generate-expiry-alerts", { method: "POST" }).catch(() => {});

        const res = await fetch("/api/notifications?status=Unread");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications in header:", err);
      }
    };

    fetchNotifications();
    // Refresh every 5 minutes to pick up new expiry alerts
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Close the alerts panel on outside click or Escape
  useEffect(() => {
    if (!showNotifications) return;
    const onClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowNotifications(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showNotifications]);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 text-zinc-300 backdrop-blur-md sm:px-6">
      {/* Sidebar Toggle for Mobile */}
      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
        className="text-zinc-400 hover:text-white lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Header Title / Search bar space */}
      <div className="hidden sm:block">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Logistics Fleet System
        </p>
        <h1 className="text-lg font-semibold leading-tight text-white">{pageTitle}</h1>
      </div>

      {/* Right Side Icons & Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={bellRef}>
          <button
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 animate-fade-up rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/40 z-50">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <span className="font-semibold text-white text-sm">System Alerts</span>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-zinc-500">
                    No active warnings or alerts. All documents are up to date!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-2.5 rounded bg-zinc-950/40 p-2.5 border border-zinc-800/40"
                    >
                      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <div className="text-xs">
                        <p className="font-medium text-zinc-200">{n.title}</p>
                        <p className="mt-1 text-zinc-400 leading-normal">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-zinc-800 px-4 py-2 text-center">
                <Link
                  href="/reports"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                >
                  View Expiry Reports
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User profile capsule */}
        <div className="flex items-center gap-3 border-l border-zinc-800 pl-3 sm:pl-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30 text-zinc-300">
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-white leading-none">{userName}</p>
            <p className="mt-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
              {userRole}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
