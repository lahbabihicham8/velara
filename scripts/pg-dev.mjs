// Dev-only: boots a local embedded PostgreSQL so the app can be migrated,
// seeded and verified without Docker. Production uses docker-compose / a
// managed Postgres via DATABASE_URL.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const databaseDir = resolve(process.cwd(), ".pgdata");

const pg = new EmbeddedPostgres({
  databaseDir,
  user: "nexapay",
  password: "nexapay",
  port: 5432,
  persistent: true,
});

const alreadyInitialised = existsSync(resolve(databaseDir, "PG_VERSION"));

if (!alreadyInitialised) {
  console.log("[pg-dev] initialising cluster…");
  await pg.initialise();
}

console.log("[pg-dev] starting postgres on :5432…");
await pg.start();

try {
  await pg.createDatabase("nexapay");
  console.log("[pg-dev] created database 'nexapay'");
} catch {
  console.log("[pg-dev] database 'nexapay' already exists");
}

console.log("[pg-dev] READY");

async function shutdown() {
  console.log("\n[pg-dev] stopping…");
  try {
    await pg.stop();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
