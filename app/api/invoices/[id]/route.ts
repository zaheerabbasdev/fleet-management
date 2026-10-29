import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";
import { z } from "zod";

const updateSchema = z.object({
  dueDate: z.string().optional(),
  status: z.enum(["Draft", "Sent", "Partially Paid", "Paid", "Overdue", "Cancelled"]).optional(),
  notes: z.string().optional().nullable(),
  discountAmount: z.number().nonnegative().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: {
          select: {
            id: true,
            custId: true,
            companyName: true,
            contactPerson: true,
            phone: true,
            email: true,
            address: true,
            city: true,
            country: true,
            taxNumber: true,
          },
        },
        trips: {
          include: {
            trip: {
              select: {
                id: true,
                tripId: true,
                tripDate: true,
                origin: true,
                destination: true,
                cargo: true,
                revenue: true,
                status: true,
              },
            },
          },
        },
        payments: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Compute paidAmount from payments
    const paidAmount = invoice.payments.reduce(
      (sum, p) => sum + parseFloat(p.amount.toString()),
      0
    );

    return NextResponse.json({ ...invoice, paidAmount });
  } catch (error) {
    console.error("GET Invoice error:", error);
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { dueDate, ...rest } = result.data;

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        ...rest,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: request.headers.get("x-user-id") ? parseInt(request.headers.get("x-user-id")!) : null,
        action: "Invoice Updated",
        module: "Invoices",
        recordId: invoice.invoiceNumber,
        description: `Updated invoice ${invoice.invoiceNumber} status to ${invoice.status}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("PUT Invoice error:", error);
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { payments: true } } },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "Paid") {
      return NextResponse.json(
        { error: "Cannot delete a fully paid invoice." },
        { status: 400 }
      );
    }

    if ((invoice._count.payments ?? 0) > 0) {
      return NextResponse.json(
        { error: "Cannot delete an invoice with existing payments. Cancel it instead." },
        { status: 400 }
      );
    }

    await prisma.invoice.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Invoice error:", error);
    return handleApiError(error);
  }
}
