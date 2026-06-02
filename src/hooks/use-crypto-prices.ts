"use client";

import { useEffect, useState } from "react";
import { CRYPTO_ASSETS, CRYPTO_LIST } from "@/lib/crypto";
import type { CryptoCode } from "@/types";

export interface LivePrice {
  price: number;
  /** Change vs. the reference (session open) as a fraction. */
  change: number;
}

export type CryptoPriceMap = Record<CryptoCode, LivePrice>;

function seedPrices(): CryptoPriceMap {
  const map = {} as CryptoPriceMap;
  for (const a of CRYPTO_LIST) {
    map[a.code] = { price: a.referencePriceUsd, change: 0 };
  }
  return map;
}

/**
 * Simulated live crypto price feed. Starts from deterministic reference prices
 * (no hydration mismatch) and walks each price with mean reversion on an
 * interval. Stablecoins barely move; BTC/ETH wobble realistically.
 */
export function useCryptoPrices(intervalMs = 2500): {
  prices: CryptoPriceMap;
  running: boolean;
} {
  const [prices, setPrices] = useState<CryptoPriceMap>(seedPrices);

  useEffect(() => {
    const id = setInterval(() => {
      setPrices((prev) => {
        const next = {} as CryptoPriceMap;
        for (const a of CRYPTO_LIST) {
          const ref = a.referencePriceUsd;
          const cur = prev[a.code].price;
          // Per-tick step scaled by the asset's volatility.
          const step = (Math.random() - 0.5) * a.volatility * 0.01 * ref;
          const reversion = (ref - cur) * 0.05;
          const price = Math.max(ref * 0.5, cur + step + reversion);
          next[a.code] = { price, change: (price - ref) / ref };
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return { prices, running: true };
}

export { CRYPTO_ASSETS };
