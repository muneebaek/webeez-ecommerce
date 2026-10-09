import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";
import { globalSearch } from "@/lib/data/admin";

// GET /admin/search?q=… — JSON results for the admin global search (search-as-you-type).
// proxy.ts already guards /admin/*; this check is the second layer, answering 401 instead of a redirect.
export async function GET(request: NextRequest) {
  const admin = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (!q) return Response.json({ orders: [], orderTotal: 0, products: [], productTotal: 0 });

  return Response.json(await globalSearch(q), { headers: { "Cache-Control": "no-store" } });
}
