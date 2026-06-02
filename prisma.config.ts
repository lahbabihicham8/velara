import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration (CLI: migrate, generate, db seed).
 * The runtime connection is created via the `pg` driver adapter in
 * `src/lib/prisma.ts`; this file only powers the CLI tooling.
 */

/**
 * Build-time commands (`prisma generate` during `postinstall` / `next build`
 * on Nixpacks/EasyPanel) load this config but never open a connection, so a
 * missing `DATABASE_URL` must not be fatal. We fall back to a harmless
 * placeholder when the variable is absent; runtime commands such as
 * `prisma migrate deploy` always receive the real URL from the environment.
 */
const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://user:password@localhost:5432/placeholder?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
