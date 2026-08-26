import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths that do not require authentication
  const isPublicPath = pathname === "/login" || pathname.startsWith("/api/auth");
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  if (isStaticAsset) {
    return NextResponse.next();
  }

  // Get token from cookies
  const sessionToken = request.cookies.get("session_token")?.value;

  // Verify the session token
  const payload = sessionToken ? await verifySessionToken(sessionToken) : null;

  // Redirect Logic
  if (isPublicPath) {
    // If logged in, redirect away from login page to dashboard
    if (payload && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // If path is protected and not logged in, redirect to login
  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    // Keep track of the original page they were trying to visit
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear cookie if token was invalid
    if (sessionToken) {
      response.cookies.delete("session_token");
    }
    return response;
  }

  // Inject user info in request headers for downstream Route Handlers/Server Components if needed
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId.toString());
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-name", payload.name);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Apply proxy to all routes except public API endpoints and assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (if any public APIs are created later)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/public|_next/static|_next/image|favicon.ico).*)",
  ],
};
