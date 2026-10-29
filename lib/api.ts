import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Reads `page` and `pageSize` from the URL and keeps them in a safe range. */
export function getPaging(searchParams: URLSearchParams, defaultPageSize = 20) {
  const rawPage = parseInt(searchParams.get("page") || "");
  const rawSize = parseInt(searchParams.get("pageSize") || "");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize =
    Number.isFinite(rawSize) && rawSize > 0 ? Math.min(rawSize, 500) : defaultPageSize;
  return { page, pageSize, skip: (page - 1) * pageSize };
}

/** Turns an unexpected error into a clear JSON response instead of a plain 500. */
export function handleApiError(error: unknown) {
  if (error instanceof SyntaxError) {
    return NextResponse.json({ error: "The request data is not valid JSON" }, { status: 400 });
  }
  const code = (error as { code?: string } | null)?.code;
  if (code === "P2002") {
    return NextResponse.json(
      { error: "This ID or number is already in use. Please use a different one." },
      { status: 409 }
    );
  }
  if (code === "P2003") {
    return NextResponse.json(
      { error: "A linked record (truck, driver, customer...) was not found" },
      { status: 400 }
    );
  }
  if (code === "P2025") {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

type Links = {
  truckId?: number | null;
  driverId?: number | null;
  employeeId?: number | null;
  customerId?: number | null;
  tripId?: number | null;
};

/**
 * The database does not enforce foreign keys, so check that linked records exist.
 * Returns an error response when one is missing, otherwise null.
 */
export async function checkLinks(links: Links) {
  const checks: [string, number | null | undefined, (id: number) => Promise<number>][] = [
    ["Truck", links.truckId, (id) => prisma.truck.count({ where: { id } })],
    ["Driver", links.driverId, (id) => prisma.employee.count({ where: { id } })],
    ["Employee", links.employeeId, (id) => prisma.employee.count({ where: { id } })],
    ["Customer", links.customerId, (id) => prisma.customer.count({ where: { id } })],
    ["Trip", links.tripId, (id) => prisma.trip.count({ where: { id } })],
  ];
  for (const [label, id, count] of checks) {
    if (id && (await count(id)) === 0) {
      return NextResponse.json({ error: `${label} not found` }, { status: 400 });
    }
  }
  return null;
}
