import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const truckUpdateSchema = z.object({
  truckId: z.string().min(3),
  regNumber: z.string().min(3),
  plateNumber: z.string().min(1),
  plateCode: z.string().min(1),
  category: z.string().default("Trucks"),
  truckType: z.string().min(2),
  make: z.string().min(2),
  model: z.string().min(1),
  year: z.number().int().min(1980),
  vin: z.string().min(5),
  engineNumber: z.string().optional().nullable(),
  odometer: z.number().int().nonnegative(),
  purchaseDate: z.string().optional().nullable(),
  status: z.string().default("Available"),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const truck = await prisma.truck.findUnique({
      where: { id },
      include: {
        documents: true,
        assignments: {
          include: { employee: true },
          orderBy: { startDate: "desc" },
        },
        trips: {
          take: 10,
          orderBy: { tripDate: "desc" },
          include: { driver: { select: { name: true } } },
        },
        maintenances: {
          take: 10,
          orderBy: { date: "desc" },
        },
        fuelLog: {
          take: 10,
          orderBy: { date: "desc" },
        },
      },
    });

    if (!truck) {
      return NextResponse.json({ error: "Truck not found" }, { status: 404 });
    }

    const activeAssignment = truck.assignments.find((a) => a.status === "Active");
    const formattedTruck = {
      ...truck,
      currentDriver: activeAssignment ? activeAssignment.employee.name : "Unassigned",
      currentDriverId: activeAssignment ? activeAssignment.employee.id : null,
    };

    return NextResponse.json(formattedTruck);
  } catch (error) {
    console.error("GET Single Truck error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const result = truckUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    // Check duplicate regNumber or vin for other trucks
    const dupReg = await prisma.truck.findFirst({
      where: { regNumber: data.regNumber, NOT: { id } },
    });
    if (dupReg) {
      return NextResponse.json({ error: `Registration number ${data.regNumber} is already in use` }, { status: 409 });
    }

    const dupVin = await prisma.truck.findFirst({
      where: { vin: data.vin, NOT: { id } },
    });
    if (dupVin) {
      return NextResponse.json({ error: `VIN/Chassis ${data.vin} is already in use` }, { status: 409 });
    }

    const truck = await prisma.truck.update({
      where: { id },
      data: {
        truckId: data.truckId,
        regNumber: data.regNumber,
        plateNumber: data.plateNumber,
        plateCode: data.plateCode,
        category: data.category,
        truckType: data.truckType,
        make: data.make,
        model: data.model,
        year: data.year,
        vin: data.vin,
        engineNumber: data.engineNumber,
        odometer: data.odometer,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        status: data.status,
        notes: data.notes,
      },
    });

    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Truck Updated",
        module: "Trucks",
        recordId: truck.truckId,
        description: `Updated truck ${truck.regNumber}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, truck });
  } catch (error) {
    console.error("PUT Truck error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const truck = await prisma.truck.findUnique({ where: { id } });

    if (!truck) {
      return NextResponse.json({ error: "Truck not found" }, { status: 404 });
    }

    await prisma.truck.delete({ where: { id } });

    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Truck Deleted",
        module: "Trucks",
        recordId: truck.truckId,
        description: `Deleted truck ${truck.regNumber} (${truck.make} ${truck.model})`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Truck error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
