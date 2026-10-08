import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

// /admin/* — session check before the page renders (fast redirect).
// Not full security (docs: "optimistic check") — pages and actions also call requireAdmin().
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const loggedIn = !!(await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value));

  if (!isLogin && !loggedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  // already signed in → skip the login page, go to the dashboard
  if (isLogin && loggedIn) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
