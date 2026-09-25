import { PrismaClient } from "@prisma/client";

// ── Environment variable checks ──────────────────────────────────────────────
// These run at module load time so any missing variable surfaces immediately
// with an actionable message instead of a cryptic Prisma or network error.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "\n\n❌  DATABASE_URL is not set.\n" +
      "    Copy .env.example to .env and fill in your database connection string.\n" +
      "    See the README for full setup instructions.\n"
  );
}

if (!process.env.JWT_SECRET) {
  throw new Error(
    "\n\n❌  JWT_SECRET is not set.\n" +
      "    Copy .env.example to .env and set a long random secret value.\n" +
      "    See the README for full setup instructions.\n"
  );
}

// ── Prisma singleton (prevents multiple connections in Next.js dev HMR) ───────
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
