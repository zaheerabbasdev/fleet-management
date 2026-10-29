import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkLinks, getPaging, handleApiError } from "@/lib/api";
import { z } from "zod";

const tripSchema = z.object({
  tripId: z.string().min(3),
  tripDate: z.string().min(1, "Trip date is required"),
  truckId: z.number().int().positive(),
  driverId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  startingOdometer: z.number().int().nonnegative("Starting odometer must be non-negative"),
  endingOdometer: z.number().int().optional().nullable(),
  cargo: z.string().optional().nullable(),
  revenue: z.number().nonnegative("Revenue cannot be negative"),
  status: z.string().default("Planned"),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const truckId = searchParams.get("truckId") || "";
    const driverId = searchParams.get("driverId") || "";
    const customerId = searchParams.get("customerId") || "";
    const { page, pageSize, skip } = getPaging(searchParams, 15);

    const where: any = {};
    if (status) where.status = status;
    if (truckId) where.truckId = parseInt(truckId);
    if (driverId) where.driverId = parseInt(driverId);
    if (customerId) where.customerId = parseInt(customerId);
    if (search) {
      where.OR = [
        { tripId: { contains: search } },
        { origin: { contains: search } },
        { destination: { contains: search } },
        { truck: { regNumber: { contains: search } } },
        { driver: { name: { contains: search } } },
        { customer: { companyName: { contains: search } } },
      ];
    }

    const [totalItems, items] = await prisma.$transaction([
      prisma.trip.count({ where }),
      prisma.trip.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { tripDate: "desc" },
        include: {
          truck: { select: { regNumber: true, truckId: true } },
          driver: { select: { name: true, empId: true } },
          customer: { select: { companyName: true, custId: true } },
          expenses: { select: { amount: true } },
        },
      }),
    ]);

    // Calculate trip profit for each trip
    const enrichedItems = items.map((trip) => {
      const totalExpenses = trip.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const profit = Number(trip.revenue) - totalExpenses;
      return { ...trip, totalExpenses, estimatedProfit: profit };
    });

    return NextResponse.json({
      items: enrichedItems,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch (error) {
    console.error("GET Trips error:", error);
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = tripSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    const missingLink = await checkLinks({ truckId: data.truckId, driverId: data.driverId, customerId: data.customerId });
    if (missingLink) return missingLink;

    // Validate odometer: ending must be >= starting
    if (data.endingOdometer !== null && data.endingOdometer !== undefined) {
      if (data.endingOdometer < data.startingOdometer) {
        return NextResponse.json(
          { error: "Ending odometer cannot be less than starting odometer" },
          { status: 400 }
        );
      }
    }

    // Calculate distance
    const distance = data.endingOdometer
      ? data.endingOdometer - data.startingOdometer
      : 0;

    const trip = await prisma.trip.create({
      data: {
        tripId: data.tripId,
        tripDate: new Date(data.tripDate),
        truckId: data.truckId,
        driverId: data.driverId,
        customerId: data.customerId,
        origin: data.origin,
        destination: data.destination,
        startingOdometer: data.startingOdometer,
        endingOdometer: data.endingOdometer,
        distance,
        cargo: data.cargo,
        revenue: data.revenue,
        status: data.status,
        notes: data.notes,
      },
    });

    // Update truck status if In Progress
    if (data.status === "In Progress") {
      await prisma.truck.update({
        where: { id: data.truckId },
        data: { status: "On Trip" },
      });
    }

    // Update truck odometer if trip completed
    if (data.endingOdometer && data.status === "Completed") {
      await prisma.truck.update({
        where: { id: data.truckId },
        data: { odometer: data.endingOdometer },
      });
    }

    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Trip Created",
        module: "Trips",
        recordId: trip.tripId,
        description: `Created trip ${trip.tripId}: ${trip.origin} → ${trip.destination}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, trip }, { status: 201 });
  } catch (error) {
    console.error("POST Trip error:", error);
    return handleApiError(error);
  }
}
