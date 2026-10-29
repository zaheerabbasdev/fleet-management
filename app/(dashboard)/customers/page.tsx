"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import CustomerForm from "@/components/forms/CustomerForm";
import Link from "next/link";
import {
  Plus, Building, Phone, Mail, MapPin, 
  Package, FileText, Users, Search, Globe
} from "lucide-react";

export default function CustomersPage() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("true");

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ search, isActive, page: page.toString() });
      const res = await fetch(`/api/customers?${q}`);
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
    fetchCustomers(1);
  }, [search, isActive]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Customers</h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Manage client companies, contacts, and invoice/trip history.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800">
        <div className="relative sm:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by company name, contact, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 pr-4 pl-10 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <select
          value={isActive}
          onChange={(e) => setIsActive(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950/60 py-2.5 px-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
        >
          <option value="true">Active Customers</option>
          <option value="false">Inactive Customers</option>
          <option value="">All Customers</option>
        </select>
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 p-20 text-center">
          <Building className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-4 font-bold text-sm text-zinc-400">No Customers Found</h3>
          <p className="mt-1 text-xs text-zinc-500">Add your first customer to start managing contracts and invoices.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700 transition-all hover:bg-zinc-900/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-600/20">
                    <Building className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{customer.companyName}</p>
                    <p className="text-xs text-zinc-500 font-mono">{customer.custId}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${customer.status === "Active" ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20"}`}>
                  {customer.status ?? "Active"}
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-400">
                {customer.contactPerson && (
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-zinc-600" />
                    <span>{customer.contactPerson}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-zinc-600" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-zinc-600" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-zinc-600" />
                    <span>{customer.city}, {customer.country}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-4 border-t border-zinc-800 pt-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <Package className="h-3.5 w-3.5 text-zinc-600" />
                  <span className="text-zinc-400">{customer._count?.trips || 0} trips</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5 text-zinc-600" />
                  <span className="text-zinc-400">{customer._count?.invoices || 0} invoices</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Add customer" onClose={() => setShowForm(false)}>
          <CustomerForm
            onClose={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              fetchCustomers();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
