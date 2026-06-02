"use client";

import { useMemo } from "react";
import { useSession } from "@/components/providers/session-provider";
import { ROLE_DEFINITIONS, can, canAll } from "@/lib/rbac";
import type { Permission } from "@/types";

/**
 * Client-side RBAC helpers bound to the current session user.
 */
export function useRbac() {
  const user = useSession();

  return useMemo(
    () => ({
      role: user.role,
      definition: ROLE_DEFINITIONS[user.role],
      isSuperadmin: user.isSuperadmin,
      can: (permission: Permission) =>
        user.isSuperadmin || can(user.role, permission),
      canAll: (permissions: Permission[]) =>
        user.isSuperadmin || canAll(user.role, permissions),
    }),
    [user.role, user.isSuperadmin],
  );
}
