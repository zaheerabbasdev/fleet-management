import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkLinks, getPaging, handleApiError } from "@/lib/api";
import { z } from "zod";

const payrollSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  employeeId: z.number().int().positive(),
  baseSalary: z.number().nonnegative(),
  allowances: z.number().nonnegative().default(0),
  overtime: z.number().nonnegative().default(0),
  bonus: z.number().nonnegative().default(0),
  deductions: z.number().nonnegative().default(0),
  notes: z.string().optional().nullable(),
  status: z.string().default("Pending"),
  paymentDate: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  paymentReference: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || "";
    const year = searchParams.get("year") || "";
    const employeeId = searchParams.get("employeeId") || "";
    const status = searchParams.get("status") || "";
    const { page, pageSize, skip } = getPaging(searchParams, 20);

    const where: any = {};
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (status) where.status = status;
    if (month && year) {
      where.salaryMonth = `${year}-${month.padStart(2, "0")}`;
    } else if (year) {
      where.salaryMonth = { startsWith: `${year}-` };
    }

    const [totalItems, items, summary] = await prisma.$transaction([
      prisma.salaryPayment.count({ where }),
      prisma.salaryPayment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { salaryMonth: "desc" },
        include: {
          employee: {
            select: {
              empId: true,
              name: true,
              nationality: true,
            },
          },
        },
      }),
      prisma.salaryPayment.aggregate({ where, _sum: { netSalary: true, basicSalary: true } }),
    ]);

    // Format items to match frontend expectation of month/year/baseSalary/deductions/grossSalary
    const formattedItems = items.map(item => {
      const parts = item.salaryMonth.split("-");
      const m = parseInt(parts[1]);
      const y = parseInt(parts[0]);
      const grossSalary = Number(item.basicSalary) + Number(item.allowances) + Number(item.overtime) + Number(item.bonus);
      return {
        id: item.id,
        employeeId: item.employeeId,
        employee: item.employee,
        month: m,
        year: y,
        baseSalary: Number(item.basicSalary),
        allowances: Number(item.allowances),
        overtime: Number(item.overtime),
        bonus: Number(item.bonus),
        deductions: Number(item.deductions),
        grossSalary,
        netSalary: Number(item.netSalary),
        status: item.status,
        notes: item.notes,
        paymentDate: item.paymentDate,
        paymentMethod: item.paymentMethod,
        paymentReference: item.paymentReference,
      };
    });

    const totalNet = Number(summary._sum.netSalary || 0);
    const totalGross = formattedItems.reduce((sum, item) => sum + item.grossSalary, 0);

    return NextResponse.json({
      items: formattedItems,
      summary: {
        totalGross,
        totalNet,
      },
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch (error) {
    console.error("GET SalaryPayments error:", error);
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = payrollSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    const missingLink = await checkLinks({ employeeId: data.employeeId });
    if (missingLink) return missingLink;
    const salaryMonth = `${data.year}-${String(data.month).padStart(2, "0")}`;

    // Prevent duplicate payroll for same employee+month+year
    const existing = await prisma.salaryPayment.findFirst({
      where: { employeeId: data.employeeId, salaryMonth },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Salary record for this employee and month already exists." },
        { status: 400 }
      );
    }

    const grossSalary = data.baseSalary + data.allowances + data.overtime + data.bonus;
    const netSalary = Math.max(0, grossSalary - data.deductions);

    const salaryPayment = await prisma.salaryPayment.create({
      data: {
        employeeId: data.employeeId,
        salaryMonth,
        basicSalary: data.baseSalary,
        allowances: data.allowances,
        overtime: data.overtime,
        bonus: data.bonus,
        deductions: data.deductions,
        netSalary,
        status: data.status,
        notes: data.notes,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
      },
    });

    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Payroll Created",
        module: "Salaries",
        recordId: salaryPayment.id.toString(),
        description: `Created salary payment for employee ID ${data.employeeId} - ${salaryMonth} | Net: OMR ${netSalary}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, payroll: salaryPayment }, { status: 201 });
  } catch (error) {
    console.error("POST SalaryPayment error:", error);
    return handleApiError(error);
  }
}
