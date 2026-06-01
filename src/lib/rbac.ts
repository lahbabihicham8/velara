import type { Permission, Role, RoleDefinition } from "@/types";

/**
 * Role-Based Access Control matrix.
 * Permissions are additive per role; higher roles are supersets.
 */
export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  owner: {
    role: "owner",
    label: "Owner",
    description: "Full control over the organisation, billing and members.",
    accent: "var(--color-chart-1)",
    permissions: [
      "dashboard.view",
      "wallets.view",
      "wallets.convert",
      "transactions.view",
      "transactions.create",
      "transactions.approve",
      "analytics.view",
      "team.view",
      "team.manage",
      "settings.manage",
    ],
  },
  admin: {
    role: "admin",
    label: "Admin",
    description: "Manage members and operations, excluding billing ownership.",
    accent: "var(--color-chart-5)",
    permissions: [
      "dashboard.view",
      "wallets.view",
      "wallets.convert",
      "transactions.view",
      "transactions.create",
      "transactions.approve",
      "analytics.view",
      "team.view",
      "team.manage",
      "settings.manage",
    ],
  },
  treasurer: {
    role: "treasurer",
    label: "Treasurer",
    description: "Move funds, convert currencies and approve payments.",
    accent: "var(--color-chart-2)",
    permissions: [
      "dashboard.view",
      "wallets.view",
      "wallets.convert",
      "transactions.view",
      "transactions.create",
      "transactions.approve",
      "analytics.view",
      "team.view",
    ],
  },
  analyst: {
    role: "analyst",
    label: "Analyst",
    description: "Read-only access to analytics, balances and reports.",
    accent: "var(--color-chart-3)",
    permissions: [
      "dashboard.view",
      "wallets.view",
      "transactions.view",
      "analytics.view",
    ],
  },
  viewer: {
    role: "viewer",
    label: "Viewer",
    description: "Limited dashboard visibility for external stakeholders.",
    accent: "var(--color-muted-foreground)",
    permissions: ["dashboard.view", "transactions.view"],
  },
};

export const ALL_ROLES: Role[] = Object.keys(ROLE_DEFINITIONS) as Role[];

/**
 * Check whether a role is granted a permission.
 */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_DEFINITIONS[role].permissions.includes(permission);
}

/**
 * Check whether a role satisfies every permission in a set.
 */
export function canAll(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => can(role, p));
}
