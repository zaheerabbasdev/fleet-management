import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const paymentSchema = z.object({
  invoiceId: z.number().int().positive(),
  date: z.string().min(1, "Payment date is required"),
  amount: z.number().positive("Payment amount must be positive"),
  paymentMethod: z.string().default("Bank Transfer"),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");

    const where: any = {};
    if (invoiceId) where.invoiceId = parseInt(invoiceId);

    const payments = await prisma.invoicePayment.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            totalAmount: true,
            customer: { select: { companyName: true } },
          },
        },
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET InvoicePayments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    // Fetch invoice to compute status
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Create payment and update invoice status inside a transaction
    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.invoicePayment.create({
        data: {
          invoiceId: data.invoiceId,
          date: new Date(data.date),
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
        },
      });

      // Sum existing + new payment
      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + data.amount;
      const invoiceTotal = Number(invoice.totalAmount);

      let newStatus = invoice.status;
      if (totalPaid >= invoiceTotal) {
        newStatus = "Paid";
      } else if (totalPaid > 0) {
        newStatus = "Partially Paid";
      }

      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: { status: newStatus },
      });

      return createdPayment;
    });

    const userIdHeader = request.headers.get("x-user-id");
    await prisma.auditLog.create({
      data: {
        userId: userIdHeader ? parseInt(userIdHeader) : null,
        action: "Invoice Payment Added",
        module: "Invoices",
        recordId: invoice.invoiceNumber,
        description: `Added payment of OMR ${data.amount} for invoice ${invoice.invoiceNumber}. New Status: ${invoice.status}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error("POST InvoicePayment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
