import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkLinks, getPaging, handleApiError } from "@/lib/api";
import { z } from "zod";

const fuelSchema = z.object({
  fuelId: z.string().min(3),
  date: z.string().min(1),
  truckId: z.number().int().positive(),
  driverId: z.number().int().positive(),
  tripId: z.number().int().positive().optional().nullable(),
  odometer: z.number().int().nonnegative(),
  fuelStation: z.string().optional().nullable(),
  fuelType: z.string().default("Diesel"),
  liters: z.number().positive("Liters must be a positive value"),
  pricePerLiter: z.number().positive("Price per liter must be positive"),
  paymentMethod: z.string().default("Cash"),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const truckId = searchParams.get("truckId") || "";
    const driverId = searchParams.get("driverId") || "";
    const { page, pageSize, skip } = getPaging(searchParams, 20);

    const where: any = {};
    if (truckId) where.truckId = parseInt(truckId);
    if (driverId) where.driverId = parseInt(driverId);

    const [totalItems, items] = await prisma.$transaction([
      prisma.fuelTransaction.count({ where }),
      prisma.fuelTransaction.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: "desc" },
        include: {
          truck: { select: { regNumber: true } },
          driver: { select: { name: true } },
          trip: { select: { tripId: true, origin: true, destination: true } },
        },
      }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch (error) {
    console.error("GET Fuel error:", error);
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = fuelSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    const missingLink = await checkLinks({ truckId: data.truckId, driverId: data.driverId, tripId: data.tripId });
    if (missingLink) return missingLink;

    // Auto-calculate total amount (Liters * PricePerLiter)
    const totalAmount = Number((data.liters * data.pricePerLiter).toFixed(3));

    const fuel = await prisma.fuelTransaction.create({
      data: {
        fuelId: data.fuelId,
        date: new Date(data.date),
        truckId: data.truckId,
        driverId: data.driverId,
        tripId: data.tripId ?? null,
        odometer: data.odometer,
        fuelStation: data.fuelStation,
        fuelType: data.fuelType,
        liters: data.liters,
        pricePerLiter: data.pricePerLiter,
        totalAmount,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
    });

    // Update truck's latest odometer if higher
    const truck = await prisma.truck.findUnique({ where: { id: data.truckId } });
    if (truck && data.odometer > truck.odometer) {
      await prisma.truck.update({
        where: { id: data.truckId },
        data: { odometer: data.odometer },
      });
    }

    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Fuel Added",
        module: "Fuel",
        recordId: fuel.fuelId,
        description: `Recorded ${data.liters}L fuel for truck ID ${data.truckId}. Total: OMR ${totalAmount}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, fuel, totalAmount }, { status: 201 });
  } catch (error) {
    console.error("POST Fuel error:", error);
    return handleApiError(error);
  }
}
