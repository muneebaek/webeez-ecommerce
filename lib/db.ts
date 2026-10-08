import { PrismaClient } from "@prisma/client";

// Dev mode-il hot reload oro thavanayum puthiya PrismaClient undakkum → connections theerum.
// Athukondu globalThis-il oru instance mathram vechu reuse cheyyunnu (singleton).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
