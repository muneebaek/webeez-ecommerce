import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Prisma talks to Neon through node-postgres (driver adapter) instead of its own engine networking:
// Node falls back from IPv6 to IPv4 automatically ("happy eyeballs"), so networks with broken IPv6 still connect.
// sslmode=require is already treated as verify-full by pg; spelling it out keeps full certificate checks
// and silences pg's deprecation warning.
function createClient() {
  const connectionString = process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=verify-full");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// In dev, every hot reload would create a new PrismaClient → connections run out.
// So a single instance is kept on globalThis and reused (singleton).
// The key names the adapter setup: a running dev server that cached the old engine-based client
// under another key picks up this one on the next reload instead of reusing the stale instance.
const globalForPrisma = globalThis as unknown as { prismaPg?: PrismaClient };

export const db = globalForPrisma.prismaPg ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaPg = db;
