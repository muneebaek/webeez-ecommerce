import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./session";

/** For admin pages / actions — redirects to /admin/login when not signed in. Second layer of checks after proxy.ts. */
export async function requireAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const email = await verifySessionToken(token);
  if (!email) redirect("/admin/login");
  return email;
}
