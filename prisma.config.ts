import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 configuration (CLI: migrate, generate, db seed).
 * The runtime connection is created via the `pg` driver adapter in
 * `src/lib/prisma.ts`; this file only powers the CLI tooling.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
