import "server-only";
import { prisma } from "@/lib/prisma";
import { attempt, type Result } from "@/lib/result";
import { requirePermission } from "@/server/auth";
import { teamMemberFromRow } from "@/server/mappers";
import type { TeamMember } from "@/types";

/**
 * List the authenticated org's members for the RBAC management view.
 * Requires `team.view`.
 */
export async function listTeamMembers(): Promise<Result<TeamMember[]>> {
  return attempt(async () => {
    const user = await requirePermission("team.view");
    const rows = await prisma.user.findMany({
      where: { orgId: user.orgId },
      orderBy: { lastActiveAt: "desc" },
    });
    return rows.map(teamMemberFromRow);
  }, "TEAM_LOAD_FAILED");
}
