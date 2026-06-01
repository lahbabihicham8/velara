import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { can } from "@/lib/rbac";
import { SESSION_COOKIE } from "@/lib/auth-constants";
import type { Permission, SessionUser } from "@/types";

export { SESSION_COOKIE };

/** Typed authentication/authorization error surfaced to callers. */
export class AuthError extends Error {
  constructor(
    public code: "UNAUTHENTICATED" | "FORBIDDEN" | "ACCOUNT_DISABLED",
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/** SHA-256 of the raw token; only the hash is persisted. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Create a new server-side session for a user and set the session cookie.
 * Returns the raw (un-hashed) token, which lives only in the cookie.
 */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 86_400_000);

  const hdrs = await headers();
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      ipAddress: hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: hdrs.get("user-agent") ?? null,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Destroy the current session (DB row + cookie). Safe to call when absent.
 */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => undefined);
  }
  store.delete(SESSION_COOKIE);
}

/**
 * Resolve the authenticated user for the current request, or null.
 * Memoised per-request via React `cache` to avoid duplicate DB hits.
 * Expired sessions are treated as unauthenticated.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { org: true } } },
  });

  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  if (session.user.status === "suspended") return null;

  const { user } = session;
  return {
    id: user.id,
    orgId: user.orgId,
    name: user.name,
    email: user.email,
    role: user.role,
    initials: user.initials,
    company: user.org.name,
    status: user.status,
  };
});

/**
 * Require an authenticated user; throws `AuthError` when absent.
 * Use inside services so failures become typed `Result` errors.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("UNAUTHENTICATED", "Authentication required");
  return user;
}

/**
 * Require an authenticated user that holds a specific permission.
 * Enforces RBAC at the data-access boundary (defence in depth).
 */
export async function requirePermission(
  permission: Permission,
): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) {
    throw new AuthError(
      "FORBIDDEN",
      `Your role (${user.role}) lacks permission: ${permission}`,
    );
  }
  return user;
}
