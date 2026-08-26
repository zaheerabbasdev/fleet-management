import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const maintenanceSchema = z.object({
  truckId: z.number().int().positive(),
  date: z.string().min(1, "Date is required"),
  maintenanceType: z.string().min(1, "Maintenance type is required"),
  description: z.string().optional().nullable(),
  odometer: z.number().int().nonnegative(),
  workshop: z.string().optional().nullable(),
  cost: z.number().positive("Cost must be positive"),
  nextServiceDate: z.string().optional().nullable(),
  nextServiceOdometer: z.number().int().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const truckId = searchParams.get("truckId") || "";
    const maintenanceType = searchParams.get("maintenanceType") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (truckId) where.truckId = parseInt(truckId);
    if (maintenanceType) where.maintenanceType = maintenanceType;
    if (search) {
      where.OR = [
        { maintenanceType: { contains: search } },
        { description: { contains: search } },
        { workshop: { contains: search } },
        { truck: { regNumber: { contains: search } } },
      ];
    }

    const [totalItems, items, totals] = await prisma.$transaction([
      prisma.truckMaintenance.count({ where }),
      prisma.truckMaintenance.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: "desc" },
        include: {
          truck: { select: { regNumber: true, truckId: true, odometer: true } },
        },
      }),
      prisma.truckMaintenance.aggregate({
        where,
        _sum: {
          cost: true,
        },
      }),
    ]);

    return NextResponse.json({
      items,
      totalCost: Number(totals._sum.cost || 0),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch (error) {
    console.error("GET TruckMaintenances error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = maintenanceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    // Create maintenance record
    const maintenance = await prisma.truckMaintenance.create({
      data: {
        truckId: data.truckId,
        date: new Date(data.date),
        maintenanceType: data.maintenanceType,
        description: data.description,
        odometer: data.odometer,
        workshop: data.workshop,
        cost: data.cost,
        nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : null,
        nextServiceOdometer: data.nextServiceOdometer,
        notes: data.notes,
      },
    });

    // Update truck odometer if this service odometer is higher
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
        action: "Maintenance Added",
        module: "Maintenance",
        recordId: maintenance.id.toString(),
        description: `Logged maintenance (${data.maintenanceType}) for truck ID ${data.truckId} | Cost: OMR ${data.cost}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, maintenance }, { status: 201 });
  } catch (error) {
    console.error("POST TruckMaintenance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
