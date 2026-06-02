import "server-only";
import { prisma } from "@/lib/prisma";
import { attempt, type Result } from "@/lib/result";
import { requirePermission } from "@/server/auth";
import { activeOrgId } from "@/server/context";
import { cryptoFromRow } from "@/server/mappers";
import { round } from "@/lib/utils";
import type { CryptoHolding } from "@/types";

export interface CryptoView {
  holdings: CryptoHolding[];
  totalBaseValue: number;
}

/**
 * List the active org's crypto holdings, valued in USD at reference prices.
 * Requires `crypto.view`.
 */
export async function listCrypto(): Promise<Result<CryptoView>> {
  return attempt(async () => {
    const user = await requirePermission("crypto.view");
    const orgId = await activeOrgId(user);
    const rows = await prisma.cryptoWallet.findMany({ where: { orgId } });
    const holdings = rows
      .map(cryptoFromRow)
      .sort((a, b) => b.baseValue - a.baseValue);
    const totalBaseValue = round(
      holdings.reduce((s, h) => s + h.baseValue, 0),
      2,
    );
    return { holdings, totalBaseValue };
  }, "CRYPTO_LOAD_FAILED");
}
