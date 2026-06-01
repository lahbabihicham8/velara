import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

/**
 * Prisma 7 client singleton (driver-adapter based).
 *
 * Prisma 7 removed the bundled Rust query engine; connections go through the
 * native `pg` driver via `@prisma/adapter-pg`. We cache the client on
 * `globalThis` so Next.js hot-reload doesn't exhaust the connection pool in
 * development.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: env.IS_PRODUCTION ? ["error"] : ["error", "warn"],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (!env.IS_PRODUCTION) {
  globalForPrisma.prisma = prisma;
}
