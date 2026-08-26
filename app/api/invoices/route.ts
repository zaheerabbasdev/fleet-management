import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(3),
  customerId: z.number().int().positive(),
  date: z.string().min(1),
  dueDate: z.string().min(1),
  subtotal: z.number().nonnegative(),
  taxAmount: z.number().nonnegative().default(0),
  discountAmount: z.number().nonnegative().default(0),
  notes: z.string().optional().nullable(),
  status: z.string().default("Draft"),
  tripIds: z.array(z.number().int().positive()).default([]),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const customerId = searchParams.get("customerId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = parseInt(customerId);
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { companyName: { contains: search } } },
      ];
    }

    const [totalItems, items, totals] = await prisma.$transaction([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: "desc" },
        include: {
          customer: { select: { companyName: true, custId: true } },
          trips: {
            include: {
              trip: {
                select: {
                  tripId: true,
                  origin: true,
                  destination: true,
                  revenue: true,
                },
              },
            },
          },
          payments: {
            select: {
              amount: true,
            },
          },
        },
      }),
      prisma.invoice.aggregate({
        where,
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    // Calculate remaining balance for each invoice
    const enrichedItems = items.map((invoice) => {
      const paid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const balance = Number(invoice.totalAmount) - paid;
      return {
        ...invoice,
        paidAmount: paid,
        balanceAmount: balance,
      };
    });

    return NextResponse.json({
      items: enrichedItems,
      totalAmount: Number(totals._sum.totalAmount || 0),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch (error) {
    console.error("GET Invoices error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = invoiceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    // Check duplicate invoiceNumber
    const existing = await prisma.invoice.findUnique({
      where: { invoiceNumber: data.invoiceNumber },
    });
    if (existing) {
      return NextResponse.json({ error: "Invoice number already exists" }, { status: 400 });
    }

    const totalAmount = data.subtotal + data.taxAmount - data.discountAmount;

    // Create Invoice inside a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const createdInvoice = await tx.invoice.create({
        data: {
          invoiceNumber: data.invoiceNumber,
          customerId: data.customerId,
          date: new Date(data.date),
          dueDate: new Date(data.dueDate),
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          discountAmount: data.discountAmount,
          totalAmount,
          status: data.status,
          notes: data.notes,
        },
      });

      // Create InvoiceTrip junction table entries
      if (data.tripIds.length > 0) {
        await tx.invoiceTrip.createMany({
          data: data.tripIds.map((tripId) => ({
            invoiceId: createdInvoice.id,
            tripId,
          })),
        });
      }

      return createdInvoice;
    });

    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Invoice Created",
        module: "Invoices",
        recordId: invoice.invoiceNumber,
        description: `Created invoice ${invoice.invoiceNumber} for customer ID ${invoice.customerId} | Total: OMR ${totalAmount}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error) {
    console.error("POST Invoice error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
