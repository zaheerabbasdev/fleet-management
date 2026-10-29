import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkLinks, getPaging, handleApiError } from "@/lib/api";
import { z } from "zod";

const fineSchema = z.object({
  employeeId: z.number().int().positive().optional().nullable(),
  truckId: z.number().int().positive().optional().nullable(),
  date: z.string().min(1, "Date is required"),
  fineType: z.string().min(1, "Fine type is required"),
  amount: z.number().positive("Fine amount must be positive"),
  authority: z.string().default("ROP"),
  description: z.string().optional().nullable(),
  assignedTo: z.string().default("Driver"),
  paymentStatus: z.string().default("Unpaid"),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const employeeId = searchParams.get("employeeId") || "";
    const truckId = searchParams.get("truckId") || "";
    const { page, pageSize, skip } = getPaging(searchParams, 20);

    const where: any = {};
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (truckId) where.truckId = parseInt(truckId);
    if (search) {
      where.OR = [
        { fineType: { contains: search } },
        { authority: { contains: search } },
        { description: { contains: search } },
        { employee: { name: { contains: search } } },
        { truck: { regNumber: { contains: search } } },
      ];
    }

    const [totalItems, items, totals] = await prisma.$transaction([
      prisma.fine.count({ where }),
      prisma.fine.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: "desc" },
        include: {
          employee: { select: { name: true, empId: true } },
          truck: { select: { regNumber: true, truckId: true } },
        },
      }),
      prisma.fine.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),
    ]);

    return NextResponse.json({
      items,
      totalAmount: Number(totals._sum.amount || 0),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch (error) {
    console.error("GET Fines error:", error);
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = fineSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    const missingLink = await checkLinks({ employeeId: data.employeeId, truckId: data.truckId });
    if (missingLink) return missingLink;

    const fine = await prisma.fine.create({
      data: {
        employeeId: data.employeeId ?? null,
        truckId: data.truckId ?? null,
        date: new Date(data.date),
        fineType: data.fineType,
        amount: data.amount,
        authority: data.authority,
        description: data.description,
        assignedTo: data.assignedTo,
        paymentStatus: data.paymentStatus,
        notes: data.notes,
      },
    });

    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Fine Logged",
        module: "Fines",
        recordId: fine.id.toString(),
        description: `Logged OMR ${data.amount} fine (${data.fineType}) from ${data.authority} assigned to ${data.assignedTo}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, fine }, { status: 201 });
  } catch (error) {
    console.error("POST Fine error:", error);
    return handleApiError(error);
  }
}
