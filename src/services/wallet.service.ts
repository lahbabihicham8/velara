import "server-only";
import { prisma } from "@/lib/prisma";
import { attempt, type Result } from "@/lib/result";
import { requirePermission } from "@/server/auth";
import { activeOrgId } from "@/server/context";
import { walletFromRow } from "@/server/mappers";
import { DEFAULT_MARGIN_BPS } from "@/lib/margin";
import { round } from "@/lib/utils";
import type { Wallet } from "@/types";

export interface WalletsView {
  wallets: Wallet[];
  totalBaseValue: number;
  /** Active org's FX trading margin, applied in the converter. */
  marginBps: number;
}

/**
 * List the active org's multi-currency wallets with portfolio total and the
 * configured trading margin. Requires `wallets.view`.
 */
export async function listWallets(): Promise<Result<WalletsView>> {
  return attempt(async () => {
    const user = await requirePermission("wallets.view");
    const orgId = await activeOrgId(user);
    const [rows, org] = await Promise.all([
      prisma.wallet.findMany({ where: { orgId } }),
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { marginBps: true },
      }),
    ]);
    const wallets = rows
      .map(walletFromRow)
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || b.baseValue - a.baseValue);
    const totalBaseValue = round(
      wallets.reduce((s, w) => s + w.baseValue, 0),
      2,
    );
    return {
      wallets,
      totalBaseValue,
      marginBps: org?.marginBps ?? DEFAULT_MARGIN_BPS,
    };
  }, "WALLETS_LOAD_FAILED");
}
