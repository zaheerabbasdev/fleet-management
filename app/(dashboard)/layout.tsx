"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content viewport */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header navigation bar */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Dynamic page viewport */}
        <main className="flex-1 overflow-y-auto bg-zinc-900/30 p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
