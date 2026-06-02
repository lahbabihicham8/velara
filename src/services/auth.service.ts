import "server-only";
import { getCurrentUser } from "@/server/auth";
import { ROLE_DEFINITIONS, can } from "@/lib/rbac";
import { attempt, type Result } from "@/lib/result";
import type { Permission, RoleDefinition, SessionUser } from "@/types";

/**
 * Resolve the current authenticated principal (or fail).
 */
export async function getSessionUser(): Promise<Result<SessionUser>> {
  return attempt(async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    return user;
  }, "SESSION_RESOLVE_FAILED");
}

/**
 * Page-level authorization check for the current session against a
 * permission. Returns whether it's allowed plus the resolved role
 * definition (for messaging / UI).
 */
export async function authorize(
  permission: Permission,
): Promise<Result<{ allowed: boolean; role: RoleDefinition | null }>> {
  return attempt(async () => {
    const user = await getCurrentUser();
    if (!user) return { allowed: false, role: null };
    return {
      allowed: user.isSuperadmin || can(user.role, permission),
      role: ROLE_DEFINITIONS[user.role],
    };
  }, "AUTHORIZE_FAILED");
}
