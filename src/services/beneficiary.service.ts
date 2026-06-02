import "server-only";
import { prisma } from "@/lib/prisma";
import { attempt, type Result } from "@/lib/result";
import { requirePermission } from "@/server/auth";
import { activeOrgId } from "@/server/context";
import { beneficiaryFromRow } from "@/server/mappers";
import type { Beneficiary } from "@/types";

/**
 * List the active org's saved beneficiaries (payees), newest first.
 * Requires `beneficiaries.view`.
 */
export async function listBeneficiaries(): Promise<Result<Beneficiary[]>> {
  return attempt(async () => {
    const user = await requirePermission("beneficiaries.view");
    const orgId = await activeOrgId(user);
    const rows = await prisma.beneficiary.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(beneficiaryFromRow);
  }, "BENEFICIARIES_LOAD_FAILED");
}
