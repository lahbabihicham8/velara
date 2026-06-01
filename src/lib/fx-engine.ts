import { BASE_CURRENCY, REFERENCE_RATES } from "@/lib/currencies";
import { gaussian, round, seededRandom } from "@/lib/utils";
import type { CurrencyCode, FxPoint, FxSeries, FxTick } from "@/types";

/**
 * Compute the cross rate between two currencies via USD.
 * Returns: 1 `base` = X `quote`.
 */
export function crossRate(base: CurrencyCode, quote: CurrencyCode): number {
  const usdToBase = REFERENCE_RATES[base];
  const usdToQuote = REFERENCE_RATES[quote];
  return usdToQuote / usdToBase;
}

/** The currency pairs surfaced in the live ticker. */
export const TRACKED_PAIRS: Array<[CurrencyCode, CurrencyCode]> = [
  ["EUR", "USD"],
  ["GBP", "USD"],
  ["USD", "SAR"],
  ["USD", "AED"],
  ["USD", "KWD"],
  ["USD", "QAR"],
  ["EUR", "GBP"],
];

/** Per-currency annualised volatility (used for VaR + tick noise). */
export const VOLATILITY: Record<CurrencyCode, number> = {
  USD: 0,
  EUR: 0.072,
  GBP: 0.089,
  SAR: 0.004,
  AED: 0.003,
  KWD: 0.015,
  QAR: 0.005,
};

/**
 * Build a deterministic intraday series for a pair (random walk).
 * Stable across renders thanks to the seeded RNG.
 */
export function buildSeries(
  base: CurrencyCode,
  quote: CurrencyCode,
  points = 48,
  seed = 1,
): FxSeries {
  const rng = seededRandom(seed + base.charCodeAt(0) * 31 + quote.charCodeAt(1));
  const start = crossRate(base, quote);
  const vol = Math.max(VOLATILITY[base], VOLATILITY[quote], 0.02) / 16;
  const now = Date.now();
  const stepMs = (8 * 60 * 60 * 1000) / points;

  let rate = start;
  const series: FxPoint[] = [];
  for (let i = 0; i < points; i++) {
    rate = rate * (1 + gaussian(rng, 0, vol));
    series.push({
      t: now - (points - i) * stepMs,
      rate: round(rate, 5),
    });
  }
  return { pair: `${base}/${quote}`, base, quote, points: series };
}

/**
 * Produce the next FX tick given the previous one.
 * Mean-reverting random walk so rates stay realistic.
 */
export function nextTick(prev: FxTick, sessionOpen: number): FxTick {
  const vol = Math.max(VOLATILITY[prev.base], VOLATILITY[prev.quote], 0.015) / 220;
  const mid = crossRate(prev.base, prev.quote);
  const reversion = (mid - prev.rate) * 0.04;
  const shock = gaussian(Math.random, 0, vol) * prev.rate;
  const rate = round(prev.rate + reversion + shock, 5);
  const change = round(rate - prev.rate, 5);
  const spread = round(rate * 0.0002, 5);

  return {
    ...prev,
    rate,
    change,
    changePct: round((rate - sessionOpen) / sessionOpen, 5),
    direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
    bid: round(rate - spread, 5),
    ask: round(rate + spread, 5),
    timestamp: Date.now(),
  };
}

/**
 * Seed the initial set of live ticks for all tracked pairs.
 */
export function seedTicks(): FxTick[] {
  const now = Date.now();
  return TRACKED_PAIRS.map(([base, quote]) => {
    const rate = round(crossRate(base, quote), 5);
    const spread = round(rate * 0.0002, 5);
    return {
      pair: `${base}/${quote}`,
      base,
      quote,
      rate,
      change: 0,
      changePct: 0,
      direction: "flat" as const,
      bid: round(rate - spread, 5),
      ask: round(rate + spread, 5),
      timestamp: now,
    };
  });
}

/**
 * Convert an amount between currencies using current reference rates.
 */
export function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): { result: number; rate: number } {
  const rate = crossRate(from, to);
  return { result: round(amount * rate, to === "KWD" ? 3 : 2), rate: round(rate, 5) };
}

/** Convert any amount to the company base currency (USD). */
export function toBase(amount: number, from: CurrencyCode): number {
  return convert(amount, from, BASE_CURRENCY).result;
}
