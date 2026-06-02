import type { CryptoAssetMeta, CryptoCode } from "@/types";

/**
 * Crypto asset registry. Prices are reference USD spot prices; the live feed
 * (`useCryptoPrices`) oscillates around them. No on-chain custody — balances
 * are tracked consistently with the platform's seeded data architecture.
 */
export const CRYPTO_ASSETS: Record<CryptoCode, CryptoAssetMeta> = {
  BTC: {
    code: "BTC",
    name: "Bitcoin",
    decimals: 6,
    color: "#f7931a",
    referencePriceUsd: 68_420,
    volatility: 0.62,
    stable: false,
  },
  ETH: {
    code: "ETH",
    name: "Ethereum",
    decimals: 5,
    color: "#627eea",
    referencePriceUsd: 3_540,
    volatility: 0.74,
    stable: false,
  },
  USDT: {
    code: "USDT",
    name: "Tether",
    decimals: 2,
    color: "#26a17b",
    referencePriceUsd: 1,
    volatility: 0.01,
    stable: true,
  },
  USDC: {
    code: "USDC",
    name: "USD Coin",
    decimals: 2,
    color: "#2775ca",
    referencePriceUsd: 1,
    volatility: 0.01,
    stable: true,
  },
};

export const CRYPTO_LIST: CryptoAssetMeta[] = Object.values(CRYPTO_ASSETS);

/** USD value of a crypto holding at the reference price. */
export function cryptoToUsd(amount: number, asset: CryptoCode): number {
  return amount * CRYPTO_ASSETS[asset].referencePriceUsd;
}
