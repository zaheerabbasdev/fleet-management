import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "Unread";

    const notifications = await prisma.notification.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
