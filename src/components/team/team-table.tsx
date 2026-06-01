import { ShieldCheck, ShieldOff } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ROLE_DEFINITIONS } from "@/lib/rbac";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types";

const STATUS_VARIANT = {
  active: "positive",
  invited: "info",
  suspended: "negative",
} as const;

/**
 * Team roster with role, MFA status and last activity.
 */
export function TeamTable({ members }: { members: TeamMember[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Members · {members.length}</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Member</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">2FA</th>
              <th className="px-4 py-2.5 font-medium">Last active</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const def = ROLE_DEFINITIONS[m.role];
              return (
                <tr
                  key={m.id}
                  className="border-b border-border/60 transition-colors hover:bg-muted/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={m.initials} seed={m.id} />
                      <div>
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        background: `color-mix(in oklch, ${def.accent} 14%, transparent)`,
                        color: def.accent,
                      }}
                    >
                      <span
                        className="size-1.5 rounded-full"
                        style={{ background: def.accent }}
                      />
                      {def.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[m.status]} className="capitalize">
                      {m.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        m.twoFactor ? "text-positive" : "text-muted-foreground",
                      )}
                    >
                      {m.twoFactor ? (
                        <ShieldCheck className="size-3.5" />
                      ) : (
                        <ShieldOff className="size-3.5" />
                      )}
                      {m.twoFactor ? "Enabled" : "Off"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatRelativeTime(m.lastActive)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
