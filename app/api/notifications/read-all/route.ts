import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";

export async function POST() {
  try {
    await prisma.notification.updateMany({
      where: { status: "Unread" },
      data: { status: "Read" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Read-all notifications error:", error);
    return handleApiError(error);
  }
}
