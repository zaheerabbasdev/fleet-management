import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { z } from "zod";

const truckCreateSchema = z.object({
  truckId: z.string().min(3, "Truck ID must be at least 3 characters"),
  regNumber: z.string().min(3, "Registration number is required"),
  plateNumber: z.string().min(1, "Plate number is required"),
  plateCode: z.string().min(1, "Plate code is required"),
  category: z.string().default("Trucks"),
  truckType: z.string().min(2, "Vehicle type is required"),
  make: z.string().min(2, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  vin: z.string().min(5, "VIN/Chassis Number is required"),
  engineNumber: z.string().optional().nullable(),
  odometer: z.number().int().nonnegative("Odometer reading cannot be negative"),
  purchaseDate: z.string().optional().nullable(),
  status: z.string().default("Available"),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { truckId: { contains: search } },
        { regNumber: { contains: search } },
        { plateNumber: { contains: search } },
        { vin: { contains: search } },
        { make: { contains: search } },
        { model: { contains: search } },
      ];
    }

    const trucks = await prisma.truck.findMany({
      where,
      include: {
        assignments: {
          where: { status: "Active" },
          include: { employee: true },
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Format to include current driver
    const formattedTrucks = trucks.map((t) => {
      const activeAssignment = t.assignments[0];
      return {
        ...t,
        currentDriver: activeAssignment ? activeAssignment.employee.name : "Unassigned",
        currentDriverId: activeAssignment ? activeAssignment.employee.id : null,
      };
    });

    return NextResponse.json(formattedTrucks);
  } catch (error) {
    console.error("GET Trucks API Error:", error);
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = truckCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    // Check duplicates
    const dupReg = await prisma.truck.findUnique({ where: { regNumber: data.regNumber } });
    if (dupReg) {
      return NextResponse.json({ error: `Registration number ${data.regNumber} is already registered` }, { status: 409 });
    }

    const dupVin = await prisma.truck.findUnique({ where: { vin: data.vin } });
    if (dupVin) {
      return NextResponse.json({ error: `VIN/Chassis ${data.vin} is already registered` }, { status: 409 });
    }

    const truck = await prisma.truck.create({
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

    // Audit log
    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Truck Created",
        module: "Trucks",
        recordId: truck.truckId,
        description: `Registered truck ${truck.regNumber} (${truck.make} ${truck.model})`,
      },
    }).catch((e) => console.error(e));

    return NextResponse.json({ success: true, truck }, { status: 201 });
  } catch (error) {
    console.error("POST Truck error:", error);
    return handleApiError(error);
  }
}
