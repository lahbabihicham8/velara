import "server-only";
import { prisma } from "@/lib/prisma";
import { attempt, type Result } from "@/lib/result";
import { requirePermission } from "@/server/auth";
import { activeOrgId } from "@/server/context";
import { teamMemberFromRow } from "@/server/mappers";
import type { TeamMember } from "@/types";

/**
 * List the active org's members for the RBAC management view.
 * Requires `team.view`.
 */
export async function listTeamMembers(): Promise<Result<TeamMember[]>> {
  return attempt(async () => {
    const user = await requirePermission("team.view");
    const orgId = await activeOrgId(user);
    const rows = await prisma.user.findMany({
      where: { orgId },
      orderBy: { lastActiveAt: "desc" },
    });
    return rows.map(teamMemberFromRow);
  }, "TEAM_LOAD_FAILED");
}
