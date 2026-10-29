import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const dbSettings = await prisma.setting.findMany();
    const settingsObject = dbSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsObject);
  } catch (error) {
    console.error("GET settings error:", error);
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userIdHeader = request.headers.get("x-user-id");
    const userId = userIdHeader ? parseInt(userIdHeader) : null;

    // Save each key-value pair in a transaction
    await prisma.$transaction(
      Object.keys(body).map((key) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: String(body[key]) },
          create: { key, value: String(body[key]) },
        })
      )
    );

    await prisma.auditLog.create({
      data: {
        userId,
        action: "Settings Updated",
        module: "Settings",
        recordId: "SYSTEM",
        description: "Updated system settings parameters.",
      },
    }).catch((e) => console.error(e));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST settings error:", error);
    return handleApiError(error);
  }
}
