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
      can: (permission: Permission) => can(user.role, permission),
      canAll: (permissions: Permission[]) => canAll(user.role, permissions),
    }),
    [user.role],
  );
}
