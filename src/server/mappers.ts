import "server-only";
import type {
  Transaction as TxRow,
  User as UserRow,
  Wallet as WalletRow,
} from "@prisma/client";
import { toBase } from "@/lib/fx-engine";
import { round } from "@/lib/utils";
import type { CurrencyCode, TeamMember, Transaction, Wallet } from "@/types";

/** Coerce a Prisma Decimal (or number) to a plain JS number. */
export function toNum(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  return Number((value as { toString(): string }).toString());
}

/** Map a wallet row to the domain Wallet, computing its USD base value. */
export function walletFromRow(row: WalletRow): Wallet {
  const balance = toNum(row.balance);
  return {
    id: row.id,
    currency: row.currency as CurrencyCode,
    balance,
    reserved: toNum(row.reserved),
    baseValue: round(toBase(balance, row.currency as CurrencyCode), 2),
    change24h: row.change24h,
    reference: row.reference,
    isPrimary: row.isPrimary,
  };
}

/** Map a transaction row to the domain Transaction. */
export function transactionFromRow(row: TxRow): Transaction {
  const tx: Transaction = {
    id: row.id,
    reference: row.reference,
    type: row.type,
    status: row.status,
    counterparty: row.counterparty,
    counterpartyInitials: row.counterpartyInitials,
    amount: {
      currency: row.amountCurrency as CurrencyCode,
      amount: toNum(row.amountValue),
    },
    fee: toNum(row.fee),
    category: row.category,
    createdAt: row.createdAt.getTime(),
    countryFlag: row.countryFlag,
  };

  if (row.convertedCurrency && row.convertedValue != null) {
    tx.converted = {
      currency: row.convertedCurrency as CurrencyCode,
      amount: toNum(row.convertedValue),
    };
    tx.rate = row.rate != null ? toNum(row.rate) : undefined;
  }

  return tx;
}

/** Map a user row to a team-member view model. */
export function teamMemberFromRow(row: UserRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    initials: row.initials,
    status: row.status,
    lastActive: row.lastActiveAt.getTime(),
    twoFactor: row.twoFactor,
  };
}
