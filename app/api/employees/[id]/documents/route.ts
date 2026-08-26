import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function POST(
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
    const { category, ...data } = body;

    const userIdHeader = request.headers.get("x-user-id");
    const userId = userIdHeader ? parseInt(userIdHeader) : null;

    if (category === "passport") {
      const { passportNumber, issueDate, expiryDate, issuingCountry, fileUrl } = data;
      if (!passportNumber || !issueDate || !expiryDate || !issuingCountry) {
        return NextResponse.json({ error: "Missing required passport fields" }, { status: 400 });
      }

      const passport = await prisma.employeePassport.upsert({
        where: { employeeId },
        update: {
          passportNumber,
          issueDate: new Date(issueDate),
          expiryDate: new Date(expiryDate),
          issuingCountry,
          fileUrl: fileUrl || null,
        },
        create: {
          employeeId,
          passportNumber,
          issueDate: new Date(issueDate),
          expiryDate: new Date(expiryDate),
          issuingCountry,
          fileUrl: fileUrl || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: "Passport Updated",
          module: "Employees",
          recordId: passportNumber,
          description: `Updated passport for employee ID: ${employeeId}`,
        },
      }).catch((e) => console.error(e));

      return NextResponse.json({ success: true, document: passport });
    }

    if (category === "visa") {
      const { visaNumber, visaType, sponsor, issueDate, expiryDate, status, fileUrl, notes } = data;
      if (!visaNumber || !visaType || !issueDate || !expiryDate) {
        return NextResponse.json({ error: "Missing required visa fields" }, { status: 400 });
      }

      const visa = await prisma.employeeVisa.upsert({
        where: { employeeId },
        update: {
          visaNumber,
          visaType,
          sponsor: sponsor || null,
          issueDate: new Date(issueDate),
          expiryDate: new Date(expiryDate),
          status: status || "Valid",
          fileUrl: fileUrl || null,
          notes: notes || null,
        },
        create: {
          employeeId,
          visaNumber,
          visaType,
          sponsor: sponsor || null,
          issueDate: new Date(issueDate),
          expiryDate: new Date(expiryDate),
          status: status || "Valid",
          fileUrl: fileUrl || null,
          notes: notes || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: "Visa Updated",
          module: "Employees",
          recordId: visaNumber,
          description: `Updated residence visa for employee ID: ${employeeId}`,
        },
      }).catch((e) => console.error(e));

      return NextResponse.json({ success: true, document: visa });
    }

    if (category === "license") {
      const { licenseNumber, licenseType, obtainedDate, issueDate, expiryDate, issuingAuthority, fileUrl, notes } = data;
      if (!licenseNumber || !licenseType || !obtainedDate || !issueDate || !expiryDate) {
        return NextResponse.json({ error: "Missing required driving license fields" }, { status: 400 });
      }

      const license = await prisma.employeeLicense.upsert({
        where: { employeeId },
        update: {
          licenseNumber,
          licenseType,
          obtainedDate: new Date(obtainedDate),
          issueDate: new Date(issueDate),
          expiryDate: new Date(expiryDate),
          issuingAuthority: issuingAuthority || "ROP",
          fileUrl: fileUrl || null,
          notes: notes || null,
        },
        create: {
          employeeId,
          licenseNumber,
          licenseType,
          obtainedDate: new Date(obtainedDate),
          issueDate: new Date(issueDate),
          expiryDate: new Date(expiryDate),
          issuingAuthority: issuingAuthority || "ROP",
          fileUrl: fileUrl || null,
          notes: notes || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: "License Updated",
          module: "Employees",
          recordId: licenseNumber,
          description: `Updated ROP driving license for employee ID: ${employeeId}`,
        },
      }).catch((e) => console.error(e));

      return NextResponse.json({ success: true, document: license });
    }

    if (category === "general") {
      const { docType, docNumber, issueDate, expiryDate, fileUrl, notes } = data;
      if (!docType || !docNumber || !issueDate || !expiryDate) {
        return NextResponse.json({ error: "Missing required document fields" }, { status: 400 });
      }

      const doc = await prisma.employeeDocument.create({
        data: {
          employeeId,
          docType,
          docNumber,
          issueDate: new Date(issueDate),
          expiryDate: new Date(expiryDate),
          fileUrl: fileUrl || null,
          notes: notes || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId,
          action: "Document Uploaded",
          module: "Employees",
          recordId: docNumber,
          description: `Uploaded document type: ${docType} for employee ID: ${employeeId}`,
        },
      }).catch((e) => console.error(e));

      return NextResponse.json({ success: true, document: doc });
    }

    return NextResponse.json({ error: "Invalid document category specified" }, { status: 400 });
  } catch (error) {
    console.error("POST Employee documents error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

    const { searchParams } = new URL(request.url);
    const docId = parseInt(searchParams.get("docId") || "");
    const category = searchParams.get("category");

    if (!docId || isNaN(docId)) {
      return NextResponse.json({ error: "Invalid document ID" }, { status: 400 });
    }

    const userIdHeader = request.headers.get("x-user-id");
    const userId = userIdHeader ? parseInt(userIdHeader) : null;

    if (category === "general") {
      const doc = await prisma.employeeDocument.findUnique({ where: { id: docId } });
      if (!doc || doc.employeeId !== employeeId) {
        return NextResponse.json({ error: "Document not found or unauthorized" }, { status: 404 });
      }

      await prisma.employeeDocument.delete({ where: { id: docId } });

      await prisma.auditLog.create({
        data: {
          userId,
          action: "Document Deleted",
          module: "Employees",
          recordId: doc.docNumber,
          description: `Deleted document type: ${doc.docType} for employee ID: ${employeeId}`,
        },
      }).catch((e) => console.error(e));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unsupported deletion category" }, { status: 400 });
  } catch (error) {
    console.error("DELETE Employee document error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
