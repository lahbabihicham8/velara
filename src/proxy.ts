import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-constants";

/**
 * Edge/proxy route guard (Next.js 16 `proxy` convention, formerly middleware).
 *
 * Fast first line of defence: an optimistic cookie-presence check that blocks
 * unauthenticated access to the dashboard. Authoritative session validation
 * against the database happens in the dashboard layout via `getCurrentUser`,
 * which redirects expired/invalid sessions to /login.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
