import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const sessionToken = request.headers.get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith("session_token="))
      ?.split("=")[1];

    if (sessionToken) {
      const payload = await verifySessionToken(sessionToken);
      if (payload) {
        // Write audit log
        await prisma.auditLog.create({
          data: {
            userId: payload.userId,
            action: "User Logout",
            module: "Authentication",
            recordId: payload.email,
            description: `User ${payload.name} logged out`,
          },
        }).catch((err) => console.error("Failed to write audit log:", err));
      }
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.delete("session_token");

    return response;
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}
