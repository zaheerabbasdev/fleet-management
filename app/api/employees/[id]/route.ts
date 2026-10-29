import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { z } from "zod";

const employeeUpdateSchema = z.object({
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
  status: z.string(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        passports: true,
        visas: true,
        licenses: true,
        documents: true,
        salaryStructures: {
          orderBy: { effectiveDate: "desc" },
        },
        advances: {
          orderBy: { date: "desc" },
        },
        leaves: {
          orderBy: { startDate: "desc" },
        },
        truckAssignments: {
          include: { truck: true },
          orderBy: { startDate: "desc" },
        },
        trips: {
          include: { truck: true, customer: true },
          orderBy: { tripDate: "desc" },
        },
        fines: {
          include: { truck: true },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("GET Employee details error:", error);
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const body = await request.json();
    const result = employeeUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Update Employee Core Records
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
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
        action: "Employee Updated",
        module: "Employees",
        recordId: updatedEmployee.empId,
        description: `Updated employee fields for ${updatedEmployee.name} (${updatedEmployee.empId})`,
      },
    }).catch((err) => console.error("Audit log error:", err));

    return NextResponse.json({ success: true, employee: updatedEmployee });
  } catch (error) {
    console.error("PUT Employee edit error:", error);
    return handleApiError(error);
  }
}

// Archive/Deactivate Employee instead of Deleting
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employeeId = parseInt(id);

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Update status to archived/inactive
    const archivedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: { status: "Inactive" },
    });

    // Terminate any active truck assignments
    await prisma.truckAssignment.updateMany({
      where: {
        employeeId: employeeId,
        status: "Active",
      },
      data: {
        endDate: new Date(),
        status: "Completed",
      },
    });

    // Write audit log
    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Employee Archived",
        module: "Employees",
        recordId: employee.empId,
        description: `Archived employee: ${employee.name} (${employee.empId}). Set status to Inactive.`,
      },
    }).catch((err) => console.error("Audit log error:", err));

    return NextResponse.json({ success: true, employee: archivedEmployee });
  } catch (error) {
    console.error("DELETE Employee archive error:", error);
    return handleApiError(error);
  }
}
