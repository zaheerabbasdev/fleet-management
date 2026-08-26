import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const expenseSchema = z.object({
  expenseId: z.string().min(3, "Expense ID is required"),
  date: z.string().min(1, "Date is required"),
  truckId: z.number().int().positive().optional().nullable(),
  tripId: z.number().int().positive().optional().nullable(),
  employeeId: z.number().int().positive().optional().nullable(),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(2, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.string().default("Cash"),
  paidBy: z.string().optional().nullable(),
  approved: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const truckId = searchParams.get("truckId") || "";
    const tripId = searchParams.get("tripId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (category) where.category = category;
    if (truckId) where.truckId = parseInt(truckId);
    if (tripId) where.tripId = parseInt(tripId);

    const [totalItems, items, totalAmount] = await prisma.$transaction([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: "desc" },
        include: {
          truck: { select: { regNumber: true } },
          trip: { select: { tripId: true } },
          employee: { select: { name: true } },
        },
      }),
      prisma.expense.aggregate({ where, _sum: { amount: true } }),
    ]);

    return NextResponse.json({
      items,
      totalAmount: Number(totalAmount._sum.amount || 0),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch (error) {
    console.error("GET Expenses error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = expenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    const expense = await prisma.expense.create({
      data: {
        expenseId: data.expenseId,
        date: new Date(data.date),
        truckId: data.truckId ?? null,
        tripId: data.tripId ?? null,
        employeeId: data.employeeId ?? null,
        category: data.category,
        description: data.description,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paidBy: data.paidBy,
        approved: data.approved,
        notes: data.notes,
      },
    });

    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Expense Added",
        module: "Expenses",
        recordId: expense.expenseId,
        description: `Recorded expense: ${data.category} - OMR ${data.amount}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (error) {
    console.error("POST Expense error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
