import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Zod Schema for validation
const employeeCreateSchema = z.object({
  empId: z.string().min(3, "Employee ID must be at least 3 characters"),
  name: z.string().min(2, "Full Name is required"),
  fatherName: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  nationality: z.string().min(2, "Nationality is required"),
  phone: z.string().min(5, "Valid phone number is required"),
  altPhone: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().or(z.literal("")).nullable(),
  currentAddress: z.string().optional().nullable(),
  permanentAddress: z.string().optional().nullable(),
  emergencyName: z.string().optional().nullable(),
  emergencyPhone: z.string().optional().nullable(),
  joiningDate: z.string().min(1, "Joining Date is required"),
  arrivalDate: z.string().optional().nullable(),
  status: z.string().default("Active"),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const nationality = searchParams.get("nationality") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * pageSize;

    // Build query conditions
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (nationality) {
      where.nationality = nationality;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { empId: { contains: search } },
        { phone: { contains: search } },
        { passports: { some: { passportNumber: { contains: search } } } },
        { visas: { some: { visaNumber: { contains: search } } } },
        { licenses: { some: { licenseNumber: { contains: search } } } },
      ];
    }

    // Get employees count and list
    const [totalItems, items] = await prisma.$transaction([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          [sortField]: sortOrder,
        },
        include: {
          passports: true,
          visas: true,
          licenses: true,
          truckAssignments: {
            where: { status: "Active" },
            include: { truck: true },
            take: 1,
          },
        },
      }),
    ]);

    // Format output to include current truck info
    const formattedItems = items.map((emp) => {
      const activeAssignment = emp.truckAssignments[0];
      return {
        ...emp,
        currentTruck: activeAssignment ? activeAssignment.truck.regNumber : "Unassigned",
        passportStatus: emp.passports[0] ? "Provided" : "Missing",
        visaStatus: emp.visas[0] ? "Provided" : "Missing",
        licenseStatus: emp.licenses[0] ? "Provided" : "Missing",
      };
    });

    return NextResponse.json({
      items: formattedItems,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch (error) {
    console.error("GET Employees API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = employeeCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check for duplicate employee ID
    const duplicateId = await prisma.employee.findUnique({
      where: { empId: data.empId },
    });

    if (duplicateId) {
      return NextResponse.json(
        { error: `Employee ID ${data.empId} is already in use` },
        { status: 409 }
      );
    }

    // Parse date fields
    const employee = await prisma.employee.create({
      data: {
        empId: data.empId,
        name: data.name,
        fatherName: data.fatherName,
        dob: data.dob ? new Date(data.dob) : null,
        gender: data.gender,
        nationality: data.nationality,
        phone: data.phone,
        altPhone: data.altPhone,
        email: data.email || null,
        currentAddress: data.currentAddress,
        permanentAddress: data.permanentAddress,
        emergencyName: data.emergencyName,
        emergencyPhone: data.emergencyPhone,
        joiningDate: new Date(data.joiningDate),
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
        status: data.status,
        notes: data.notes,
      },
    });

    // Write audit log
    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Employee Created",
        module: "Employees",
        recordId: employee.empId,
        description: `Created new employee: ${employee.name} (${employee.empId})`,
      },
    }).catch((err) => console.error("Audit log error:", err));

    return NextResponse.json({ success: true, employee }, { status: 201 });
  } catch (error) {
    console.error("POST Employee API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
