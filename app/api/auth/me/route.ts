import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

// Returns the user who is logged in right now (used by the page header)
export async function GET() {
  const token = (await cookies()).get("session_token")?.value;
  const payload = token ? await verifySessionToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  return NextResponse.json({
    id: payload.userId,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  });
}
