import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  companyName: z.string().min(2).optional(),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional(),
  taxNumber: z.string().optional().nullable(),
  creditLimit: z.number().nonnegative().optional(),
  paymentTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["Active", "Inactive"]).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        trips: {
          orderBy: { tripDate: "desc" },
          take: 10,
          select: {
            id: true,
            tripId: true,
            tripDate: true,
            origin: true,
            destination: true,
            revenue: true,
            status: true,
          },
        },
        invoices: {
          orderBy: { date: "desc" },
          take: 10,
          select: {
            id: true,
            invoiceNumber: true,
            date: true,
            dueDate: true,
            totalAmount: true,
            status: true,
            payments: {
              select: {
                amount: true,
              },
            },
          },
        },
        _count: { select: { trips: true, invoices: true } },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const formattedInvoices = customer.invoices.map((inv: any) => {
      const paidAmount = inv.payments.reduce(
        (sum: number, p: any) => sum + parseFloat(p.amount.toString()),
        0
      );
      const { payments, ...rest } = inv;
      return { ...rest, paidAmount };
    });

    return NextResponse.json({ ...customer, invoices: formattedInvoices });
  } catch (error) {
    console.error("GET Customer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: result.data as any,
    });

    await prisma.auditLog.create({
      data: {
        userId: request.headers.get("x-user-id") ? parseInt(request.headers.get("x-user-id")!) : null,
        action: "Customer Updated",
        module: "Customers",
        recordId: customer.custId,
        description: `Updated customer ${customer.companyName}`,
      },
    }).catch(console.error);

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error("PUT Customer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { trips: true, invoices: true } } },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if ((customer._count.trips ?? 0) > 0 || (customer._count.invoices ?? 0) > 0) {
      return NextResponse.json(
        { error: "Cannot delete customer with existing trips or invoices. Deactivate instead." },
        { status: 400 }
      );
    }

    await prisma.customer.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Customer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
