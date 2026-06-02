import "server-only";
import { prisma } from "@/lib/prisma";
import { attempt, type Result } from "@/lib/result";
import { requirePermission } from "@/server/auth";
import { activeOrgId } from "@/server/context";
import { transactionFromRow, walletFromRow } from "@/server/mappers";
import {
  deriveCashflow,
  deriveExposure,
  deriveFxRisk,
  deriveKpis,
  deriveVolume,
} from "@/server/analytics";
import { round } from "@/lib/utils";
import type {
  CashflowPoint,
  CurrencyExposure,
  FxRisk,
  KpiMetric,
  Transaction,
  VolumePoint,
  Wallet,
} from "@/types";

/**
 * Aggregated payload powering the dashboard & analytics views.
 * One scoped query per entity, then derived analytics computed in-process.
 */
export interface DashboardSnapshot {
  wallets: Wallet[];
  totalBaseValue: number;
  kpis: KpiMetric[];
  cashflow: CashflowPoint[];
  exposure: CurrencyExposure[];
  risk: FxRisk[];
  volume: VolumePoint[];
  recentTransactions: Transaction[];
}

/**
 * Resolve the full dashboard snapshot for the authenticated org.
 * Requires `dashboard.view`.
 */
export async function getDashboardSnapshot(): Promise<Result<DashboardSnapshot>> {
  return attempt(async () => {
    const user = await requirePermission("dashboard.view");
    const orgId = await activeOrgId(user);

    const [walletRows, txRows] = await Promise.all([
      prisma.wallet.findMany({ where: { orgId } }),
      prisma.transaction.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 800,
      }),
    ]);

    const wallets = walletRows
      .map(walletFromRow)
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || b.baseValue - a.baseValue);
    const totalBaseValue = round(
      wallets.reduce((s, w) => s + w.baseValue, 0),
      2,
    );
    const transactions = txRows.map(transactionFromRow);
    const volume = deriveVolume(transactions);

    return {
      wallets,
      totalBaseValue,
      kpis: deriveKpis(wallets, transactions, totalBaseValue, volume),
      cashflow: deriveCashflow(transactions),
      exposure: deriveExposure(wallets),
      risk: deriveFxRisk(wallets),
      volume,
      recentTransactions: transactions.slice(0, 8),
    };
  }, "DASHBOARD_LOAD_FAILED");
}
