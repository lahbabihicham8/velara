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

function getClient(): PrismaClient {
  const client = globalForPrisma.prisma ?? createClient();
  if (!env.IS_PRODUCTION) {
    globalForPrisma.prisma = client;
  }
  return client;
}

/**
 * Lazy proxy: the real `PrismaClient` (and therefore the `pg` connection and
 * `DATABASE_URL` read) is only constructed on first property access at
 * runtime. This guarantees `next build` never opens a DB connection or
 * touches `DATABASE_URL`, which would otherwise break the Nixpacks/EasyPanel
 * build phase where the database is unreachable.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;
