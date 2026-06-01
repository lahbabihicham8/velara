"use client";

import { useEffect } from "react";
import { useFxStore } from "@/store/fx-store";
import { crossRate } from "@/lib/fx-engine";
import { REFERENCE_RATES } from "@/lib/currencies";
import type { CurrencyCode, FxTick } from "@/types";

/**
 * Subscribe to the live FX feed. Starts the stream on first mount and
 * keeps it running for the session.
 *
 * @param cadenceMs tick interval in milliseconds
 */
export function useFxStream(cadenceMs = 1500): {
  ticks: FxTick[];
  lastUpdated: number;
  running: boolean;
} {
  const ticks = useFxStore((s) => s.ticks);
  const lastUpdated = useFxStore((s) => s.lastUpdated);
  const running = useFxStore((s) => s.running);
  const start = useFxStore((s) => s.start);

  useEffect(() => {
    start(cadenceMs);
    // We intentionally keep the stream alive across route changes.
  }, [start, cadenceMs]);

  return { ticks, lastUpdated, running };
}

/**
 * Select a single pair from the live feed.
 */
export function useFxPair(pair: string): FxTick | undefined {
  return useFxStore((s) => s.ticks.find((t) => t.pair === pair));
}

/** Build a live "1 USD = X currency" map from the streaming ticks. */
function liveUsdRates(ticks: FxTick[]): Record<string, number> {
  const rates: Record<string, number> = { ...REFERENCE_RATES };
  for (const t of ticks) {
    if (t.quote === "USD") rates[t.base] = 1 / t.rate; // e.g. EUR/USD
    else if (t.base === "USD") rates[t.quote] = t.rate; // e.g. USD/SAR
  }
  return rates;
}

/**
 * Live cross rate between two currencies, derived from the streaming feed.
 * Falls back to static reference rates when a pair isn't tracked.
 */
export function useLiveRate(from: CurrencyCode, to: CurrencyCode): number {
  return useFxStore((s) => {
    if (from === to) return 1;
    const rates = liveUsdRates(s.ticks);
    const usdToFrom = rates[from];
    const usdToTo = rates[to];
    if (usdToFrom && usdToTo) return usdToTo / usdToFrom;
    return crossRate(from, to);
  });
}
