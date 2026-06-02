import "server-only";
import { prisma } from "@/lib/prisma";
import { attempt, type Result } from "@/lib/result";
import { requireSuperadmin } from "@/server/auth";
import {
  beneficiaryFromRow,
  cryptoFromRow,
  teamMemberFromRow,
  transactionFromRow,
  walletFromRow,
} from "@/server/mappers";
import {
  deriveCashflow,
  deriveExposure,
  deriveFxRisk,
  deriveKpis,
  deriveVolume,
} from "@/server/analytics";
import { round } from "@/lib/utils";
import type {
  AccountSummary,
  Beneficiary,
  CashflowPoint,
  CryptoHolding,
  CurrencyCode,
  CurrencyExposure,
  FxRisk,
  KpiMetric,
  TeamMember,
  Transaction,
  VolumePoint,
  Wallet,
} from "@/types";

/**
 * Back-office account roster across every organisation on the platform.
 * Requires a platform superadmin.
 */
export async function listAccounts(): Promise<Result<AccountSummary[]>> {
  return attempt(async () => {
    await requireSuperadmin();
    const orgs = await prisma.organization.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        wallets: true,
        _count: { select: { users: true, wallets: true, transactions: true } },
      },
    });

    return orgs.map((o) => {
      const wallets = o.wallets.map(walletFromRow);
      const totalBaseValue = round(
        wallets.reduce((s, w) => s + w.baseValue, 0),
        2,
      );
      return {
        id: o.id,
        name: o.name,
        baseCurrency: o.baseCurrency as CurrencyCode,
        marginBps: o.marginBps,
        userCount: o._count.users,
        walletCount: o._count.wallets,
        transactionCount: o._count.transactions,
        totalBaseValue,
        createdAt: o.createdAt.getTime(),
      };
    });
  }, "ACCOUNTS_LOAD_FAILED");
}

export interface AccountDetail {
  id: string;
  name: string;
  baseCurrency: CurrencyCode;
  marginBps: number;
  createdAt: number;
  wallets: Wallet[];
  totalBaseValue: number;
  crypto: CryptoHolding[];
  cryptoBaseValue: number;
  members: TeamMember[];
  beneficiaries: Beneficiary[];
  recentTransactions: Transaction[];
  kpis: KpiMetric[];
  cashflow: CashflowPoint[];
  volume: VolumePoint[];
  exposure: CurrencyExposure[];
  risk: FxRisk[];
}

/**
 * Full read-only detail for a single client account (back office).
 * Requires a platform superadmin.
 */
export async function getAccountDetail(
  orgId: string,
): Promise<Result<AccountDetail>> {
  return attempt(async () => {
    await requireSuperadmin();

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error("Account not found");

    const [walletRows, cryptoRows, txRows, userRows, benRows] =
      await Promise.all([
        prisma.wallet.findMany({ where: { orgId } }),
        prisma.cryptoWallet.findMany({ where: { orgId } }),
        prisma.transaction.findMany({
          where: { orgId },
          orderBy: { createdAt: "desc" },
          take: 800,
        }),
        prisma.user.findMany({
          where: { orgId },
          orderBy: { lastActiveAt: "desc" },
        }),
        prisma.beneficiary.findMany({
          where: { orgId },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    const wallets = walletRows
      .map(walletFromRow)
      .sort(
        (a, b) =>
          Number(b.isPrimary) - Number(a.isPrimary) || b.baseValue - a.baseValue,
      );
    const totalBaseValue = round(
      wallets.reduce((s, w) => s + w.baseValue, 0),
      2,
    );
    const crypto = cryptoRows
      .map(cryptoFromRow)
      .sort((a, b) => b.baseValue - a.baseValue);
    const cryptoBaseValue = round(
      crypto.reduce((s, h) => s + h.baseValue, 0),
      2,
    );
    const transactions = txRows.map(transactionFromRow);
    const volume = deriveVolume(transactions);

    return {
      id: org.id,
      name: org.name,
      baseCurrency: org.baseCurrency as CurrencyCode,
      marginBps: org.marginBps,
      createdAt: org.createdAt.getTime(),
      wallets,
      totalBaseValue,
      crypto,
      cryptoBaseValue,
      members: userRows.map(teamMemberFromRow),
      beneficiaries: benRows.map(beneficiaryFromRow),
      recentTransactions: transactions.slice(0, 10),
      kpis: deriveKpis(wallets, transactions, totalBaseValue, volume),
      cashflow: deriveCashflow(transactions),
      volume,
      exposure: deriveExposure(wallets),
      risk: deriveFxRisk(wallets),
    };
  }, "ACCOUNT_DETAIL_FAILED");
}
