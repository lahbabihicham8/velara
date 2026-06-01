import "server-only";
import { prisma } from "@/lib/prisma";
import { attempt, type Result } from "@/lib/result";
import { requirePermission } from "@/server/auth";
import { transactionFromRow } from "@/server/mappers";
import type { Transaction } from "@/types";

/**
 * Fetch the authenticated org's transaction ledger (newest first).
 * Requires `transactions.view`.
 */
export async function listTransactions(
  count = 80,
): Promise<Result<Transaction[]>> {
  return attempt(async () => {
    const user = await requirePermission("transactions.view");
    const rows = await prisma.transaction.findMany({
      where: { orgId: user.orgId },
      orderBy: { createdAt: "desc" },
      take: count,
    });
    return rows.map(transactionFromRow);
  }, "TRANSACTIONS_LOAD_FAILED");
}
