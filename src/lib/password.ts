import "server-only";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";

/**
 * Hash a plaintext password using bcrypt with the configured cost factor.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.PASSWORD_SALT_ROUNDS);
}

/**
 * Constant-time comparison of a plaintext password against a stored hash.
 */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
