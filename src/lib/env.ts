import "server-only";

/**
 * Centralised, validated access to server environment variables.
 *
 * Values are exposed via getters so validation happens lazily on first access
 * (i.e. at request time) rather than at module-import time. This is critical
 * for build environments such as Nixpacks/EasyPanel where `next build` runs
 * without runtime secrets like `DATABASE_URL` being injected — a top-level
 * `throw` would otherwise fail the production build.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  get DATABASE_URL(): string {
    return required("DATABASE_URL");
  },
  get SESSION_TTL_DAYS(): number {
    return int("SESSION_TTL_DAYS", 7);
  },
  get PASSWORD_SALT_ROUNDS(): number {
    return int("PASSWORD_SALT_ROUNDS", 12);
  },
  get IS_PRODUCTION(): boolean {
    return process.env.NODE_ENV === "production";
  },
} as const;
