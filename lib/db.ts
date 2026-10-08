import { PrismaClient } from "@prisma/client";

// In dev, every hot reload would create a new PrismaClient → connections run out.
// So a single instance is kept on globalThis and reused (singleton).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
