import "server-only";
import { prisma } from "@/lib/prisma";
import { attempt, type Result } from "@/lib/result";
import { requirePermission } from "@/server/auth";
import { activeOrgId } from "@/server/context";
import { batchFromRow } from "@/server/mappers";
import type { PaymentBatch } from "@/types";

/**
 * List the active org's bulk payment runs, newest first.
 * Requires `payments.bulk`.
 */
export async function listBatches(): Promise<Result<PaymentBatch[]>> {
  return attempt(async () => {
    const user = await requirePermission("payments.bulk");
    const orgId = await activeOrgId(user);
    const rows = await prisma.paymentBatch.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map(batchFromRow);
  }, "BATCHES_LOAD_FAILED");
}
