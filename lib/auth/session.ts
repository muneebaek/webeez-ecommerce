import { jwtVerify, SignJWT } from "jose";

// Admin session = signed JWT in an httpOnly cookie.
// Signed with AUTH_SECRET — nobody can forge the cookie (the signature wouldn't match).
// Used by both proxy.ts (edge) and the server → no node-only imports.

export const SESSION_COOKIE = "neythra_admin";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET missing or shorter than 32 characters");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(email: string) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

/** Admin email if valid, otherwise null (expired / tampered / missing) */
export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return payload.role === "admin" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
