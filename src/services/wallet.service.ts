import "server-only";
import { prisma } from "@/lib/prisma";
import { attempt, type Result } from "@/lib/result";
import { requirePermission } from "@/server/auth";
import { walletFromRow } from "@/server/mappers";
import { round } from "@/lib/utils";
import type { Wallet } from "@/types";

export interface WalletsView {
  wallets: Wallet[];
  totalBaseValue: number;
}

/**
 * List the authenticated org's multi-currency wallets with portfolio total.
 * Requires `wallets.view`.
 */
export async function listWallets(): Promise<Result<WalletsView>> {
  return attempt(async () => {
    const user = await requirePermission("wallets.view");
    const rows = await prisma.wallet.findMany({ where: { orgId: user.orgId } });
    const wallets = rows
      .map(walletFromRow)
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || b.baseValue - a.baseValue);
    const totalBaseValue = round(
      wallets.reduce((s, w) => s + w.baseValue, 0),
      2,
    );
    return { wallets, totalBaseValue };
  }, "WALLETS_LOAD_FAILED");
}
