import type { CryptoCode } from "@/types";

export interface CryptoSeed {
  asset: CryptoCode;
  balance: number;
  change24h: number;
  address: string;
}

/**
 * Reference crypto holdings for the primary client. Other accounts scale these
 * by a factor in the seed script.
 */
export const CRYPTO_SEEDS: CryptoSeed[] = [
  { asset: "BTC", balance: 12.48, change24h: 0.0241, address: "bc1q••••7f3a" },
  { asset: "ETH", balance: 184.21, change24h: -0.0132, address: "0x9C••••e21b" },
  { asset: "USDT", balance: 1_250_000, change24h: 0.0001, address: "0x4A••••8d70" },
  { asset: "USDC", balance: 890_000, change24h: -0.0002, address: "0x71••••c0a9" },
];
