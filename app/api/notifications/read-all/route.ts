import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    await prisma.notification.updateMany({
      where: { status: "Unread" },
      data: { status: "Read" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Read-all notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
