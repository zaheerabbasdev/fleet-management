import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";

/**
 * POST /api/notifications/generate-expiry-alerts
 * Scans all expiring employee documents (passports, visas, licenses, documents)
 * and truck documents within the warning window and creates Unread notifications.
 * Call this endpoint on a daily cron or from the dashboard on load.
 */
export async function POST(request: Request) {
  try {
    // Fetch the warning_days_expiry setting (default to 30 days)
    const warningSetting = await prisma.setting.findUnique({
      where: { key: "warning_days_expiry" },
    });
    const warningDays = warningSetting ? parseInt(warningSetting.value) : 30;

    const today = new Date();
    const warningThreshold = new Date(today);
    warningThreshold.setDate(warningThreshold.getDate() + warningDays);

    const newNotifications: {
      type: string;
      title: string;
      message: string;
      expiresAt: Date;
    }[] = [];

    // --- Employee Passports ---
    const expiringPassports = await prisma.employeePassport.findMany({
      where: {
        expiryDate: { lte: warningThreshold },
      },
      include: {
        employee: { select: { name: true, empId: true } },
      },
    });
    for (const p of expiringPassports) {
      const daysLeft = Math.ceil(
        (p.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isExpired = daysLeft < 0;
      newNotifications.push({
        type: "Expiry",
        title: `Passport ${isExpired ? "Expired" : "Expiring"} — ${p.employee.name}`,
        message: `${p.employee.name} (${p.employee.empId}) passport #${p.passportNumber} ${
          isExpired
            ? `expired ${Math.abs(daysLeft)} day(s) ago`
            : `expires in ${daysLeft} day(s)`
        }. Immediate renewal required.`,
        expiresAt: p.expiryDate,
      });
    }

    // --- Employee Visas ---
    const expiringVisas = await prisma.employeeVisa.findMany({
      where: {
        expiryDate: { lte: warningThreshold },
      },
      include: {
        employee: { select: { name: true, empId: true } },
      },
    });
    for (const v of expiringVisas) {
      const daysLeft = Math.ceil(
        (v.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isExpired = daysLeft < 0;
      newNotifications.push({
        type: "Expiry",
        title: `Visa ${isExpired ? "Expired" : "Expiring"} — ${v.employee.name}`,
        message: `${v.employee.name} (${v.employee.empId}) ${v.visaType} visa #${v.visaNumber} ${
          isExpired
            ? `expired ${Math.abs(daysLeft)} day(s) ago`
            : `expires in ${daysLeft} day(s)`
        }. Contact MOMP to renew.`,
        expiresAt: v.expiryDate,
      });
    }

    // --- Employee Driving Licenses ---
    const expiringLicenses = await prisma.employeeLicense.findMany({
      where: {
        expiryDate: { lte: warningThreshold },
      },
      include: {
        employee: { select: { name: true, empId: true } },
      },
    });
    for (const l of expiringLicenses) {
      const daysLeft = Math.ceil(
        (l.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isExpired = daysLeft < 0;
      newNotifications.push({
        type: "Expiry",
        title: `Driving License ${isExpired ? "Expired" : "Expiring"} — ${l.employee.name}`,
        message: `${l.employee.name} (${l.employee.empId}) ${l.licenseType} license #${l.licenseNumber} issued by ${l.issuingAuthority} ${
          isExpired
            ? `expired ${Math.abs(daysLeft)} day(s) ago`
            : `expires in ${daysLeft} day(s)`
        }. Renew via ROP before driving.`,
        expiresAt: l.expiryDate,
      });
    }

    // --- Employee Other Documents ---
    const expiringDocs = await prisma.employeeDocument.findMany({
      where: {
        expiryDate: { lte: warningThreshold },
      },
      include: {
        employee: { select: { name: true, empId: true } },
      },
    });
    for (const d of expiringDocs) {
      const daysLeft = Math.ceil(
        (d.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isExpired = daysLeft < 0;
      newNotifications.push({
        type: "Expiry",
        title: `${d.docType} ${isExpired ? "Expired" : "Expiring"} — ${d.employee.name}`,
        message: `${d.employee.name} (${d.employee.empId}) ${d.docType} #${d.docNumber} ${
          isExpired
            ? `expired ${Math.abs(daysLeft)} day(s) ago`
            : `expires in ${daysLeft} day(s)`
        }.`,
        expiresAt: d.expiryDate,
      });
    }

    // --- Truck Documents ---
    const expiringTruckDocs = await prisma.truckDocument.findMany({
      where: {
        expiryDate: { lte: warningThreshold },
      },
      include: {
        truck: { select: { regNumber: true, truckId: true } },
      },
    });
    for (const td of expiringTruckDocs) {
      const daysLeft = Math.ceil(
        (td.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isExpired = daysLeft < 0;
      newNotifications.push({
        type: "Expiry",
        title: `Truck ${td.docType} ${isExpired ? "Expired" : "Expiring"} — ${td.truck.regNumber}`,
        message: `${td.truck.regNumber} (${td.truck.truckId}) ${td.docType} ${
          isExpired
            ? `expired ${Math.abs(daysLeft)} day(s) ago`
            : `expires in ${daysLeft} day(s)`
        }. Renew to maintain compliance.`,
        expiresAt: td.expiryDate,
      });
    }

    // Clear previously generated expiry notifications (avoid duplicates)
    await prisma.notification.deleteMany({
      where: { type: "Expiry", status: "Unread" },
    });

    // Insert fresh batch
    let created = 0;
    if (newNotifications.length > 0) {
      const result = await prisma.notification.createMany({
        data: newNotifications,
      });
      created = result.count;
    }

    return NextResponse.json({
      success: true,
      generated: created,
      warningDays,
    });
  } catch (error) {
    console.error("Generate expiry alerts error:", error);
    return handleApiError(error);
  }
}
