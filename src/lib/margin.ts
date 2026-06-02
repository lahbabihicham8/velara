/**
 * Client trading margins (FX spread).
 *
 * Each organisation has a `marginBps` (basis points) configured by the back
 * office. It is applied on top of the mid-market rate at conversion time, so
 * the client receives a slightly less favourable rate — this spread is the
 * platform's revenue. 1 bp = 0.01%; 50 bps = 0.50%.
 */
export const DEFAULT_MARGIN_BPS = 50;

export const MIN_MARGIN_BPS = 0;
export const MAX_MARGIN_BPS = 1000; // 10% hard cap

/** Convert basis points to a fraction (50 -> 0.005). */
export function bpsToFraction(bps: number): number {
  return bps / 10_000;
}

/**
 * Apply a sell-side margin to a mid-market rate. The client converting `from`
 * into `to` receives `to` at a rate reduced by the margin, i.e. they get less.
 */
export function applyMargin(midRate: number, marginBps: number): number {
  return midRate * (1 - bpsToFraction(marginBps));
}

/** Clamp an arbitrary input to the allowed margin range. */
export function clampMargin(bps: number): number {
  if (!Number.isFinite(bps)) return DEFAULT_MARGIN_BPS;
  return Math.min(MAX_MARGIN_BPS, Math.max(MIN_MARGIN_BPS, Math.round(bps)));
}

/** Format basis points for display ("50 bps · 0.50%"). */
export function formatMargin(bps: number): string {
  return `${bps} bps · ${(bps / 100).toFixed(2)}%`;
}
