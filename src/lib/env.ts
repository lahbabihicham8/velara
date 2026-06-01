import "server-only";

/**
 * Centralised, validated access to server environment variables.
 * Throws early (at import time) if a required variable is missing.
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
  DATABASE_URL: required("DATABASE_URL"),
  SESSION_TTL_DAYS: int("SESSION_TTL_DAYS", 7),
  PASSWORD_SALT_ROUNDS: int("PASSWORD_SALT_ROUNDS", 12),
  IS_PRODUCTION: process.env.NODE_ENV === "production",
} as const;
