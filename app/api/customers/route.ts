import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const customerSchema = z.object({
  custId: z.string().min(3, "Customer ID required"),
  companyName: z.string().min(2, "Company name required"),
  contactName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().default("Oman"),
  vatNumber: z.string().optional().nullable(),
  creditLimit: z.number().nonnegative().optional().default(0),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (isActive !== null && isActive !== "") {
      where.status = isActive === "true" ? "Active" : "Inactive";
    }
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { custId: { contains: search } },
        { contactPerson: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const [totalItems, items] = await prisma.$transaction([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { companyName: "asc" },
        include: {
          _count: {
            select: { trips: true, invoices: true },
          },
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
    console.error("GET Customers error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = customerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    // Check uniqueness of custId
    const existing = await prisma.customer.findUnique({ where: { custId: data.custId } });
    if (existing) {
      return NextResponse.json({ error: "Customer ID already exists" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        custId: data.custId,
        companyName: data.companyName,
        contactPerson: data.contactName || null,
        phone: data.phone || "",
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country,
        taxNumber: data.vatNumber || null,
        creditLimit: data.creditLimit ?? 0,
        paymentTerms: data.paymentTerms || null,
        notes: data.notes || null,
        status: data.isActive ? "Active" : "Inactive",
      },
    });

    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Customer Created",
        module: "Customers",
        recordId: customer.custId,
        description: `Created customer ${customer.companyName}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error) {
    console.error("POST Customer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
