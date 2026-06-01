import { toBase } from "@/lib/fx-engine";
import { round } from "@/lib/utils";
import type { CurrencyCode, Wallet } from "@/types";

interface WalletSeed {
  currency: CurrencyCode;
  balance: number;
  reserved: number;
  change24h: number;
  reference: string;
  isPrimary?: boolean;
}

const SEEDS: WalletSeed[] = [
  { currency: "USD", balance: 4_812_540.22, reserved: 320_000, change24h: 0.0042, reference: "US** **** 4821", isPrimary: true },
  { currency: "EUR", balance: 2_640_180.5, reserved: 145_500, change24h: -0.0089, reference: "DE** **** 9134" },
  { currency: "GBP", balance: 1_185_300.0, reserved: 62_000, change24h: 0.0123, reference: "GB** **** 7740" },
  { currency: "SAR", balance: 9_420_000.0, reserved: 410_000, change24h: 0.0008, reference: "SA** **** 3052" },
  { currency: "AED", balance: 6_730_500.75, reserved: 280_000, change24h: 0.0011, reference: "AE** **** 6618" },
  { currency: "KWD", balance: 845_220.125, reserved: 35_000, change24h: -0.0035, reference: "KW** **** 2290" },
  { currency: "QAR", balance: 3_110_400.0, reserved: 120_000, change24h: 0.0019, reference: "QA** **** 8807" },
];

/**
 * Build the company's multi-currency wallets with USD base valuations.
 */
export function getWallets(): Wallet[] {
  return SEEDS.map((seed, i) => ({
    id: `wlt_${seed.currency.toLowerCase()}_${i + 1}`,
    currency: seed.currency,
    balance: seed.balance,
    reserved: seed.reserved,
    baseValue: round(toBase(seed.balance, seed.currency), 2),
    change24h: seed.change24h,
    reference: seed.reference,
    isPrimary: seed.isPrimary ?? false,
  }));
}

/** Total portfolio value in the base currency (USD). */
export function getTotalBaseValue(wallets: Wallet[]): number {
  return round(
    wallets.reduce((sum, w) => sum + w.baseValue, 0),
    2,
  );
}
