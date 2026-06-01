import { Check, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ALL_ROLES, ROLE_DEFINITIONS, can } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types";

const PERMISSION_LABELS: Array<{ permission: Permission; label: string }> = [
  { permission: "dashboard.view", label: "View dashboard" },
  { permission: "wallets.view", label: "View wallets" },
  { permission: "wallets.convert", label: "Convert currency" },
  { permission: "transactions.view", label: "View transactions" },
  { permission: "transactions.create", label: "Create payments" },
  { permission: "transactions.approve", label: "Approve payments" },
  { permission: "analytics.view", label: "View analytics" },
  { permission: "team.manage", label: "Manage team" },
  { permission: "settings.manage", label: "Manage settings" },
];

/**
 * Permission-by-role grid visualising the RBAC policy.
 */
export function RoleMatrix() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Access Control Matrix</CardTitle>
        <CardDescription>
          Permissions granted to each role. Higher roles inherit broader access.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-xs text-muted-foreground">
                <th className="px-5 py-2.5 text-left font-medium">Permission</th>
                {ALL_ROLES.map((role) => (
                  <th key={role} className="px-3 py-2.5 text-center font-medium">
                    {ROLE_DEFINITIONS[role].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_LABELS.map(({ permission, label }) => (
                <tr key={permission} className="border-b border-border/60">
                  <td className="px-5 py-2.5 font-medium">{label}</td>
                  {ALL_ROLES.map((role) => {
                    const allowed = can(role, permission);
                    return (
                      <td key={role} className="px-3 py-2.5 text-center">
                        <span
                          className={cn(
                            "inline-grid size-6 place-items-center rounded-md",
                            allowed
                              ? "bg-positive/12 text-positive"
                              : "bg-muted text-muted-foreground/50",
                          )}
                        >
                          {allowed ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Minus className="size-3.5" />
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
