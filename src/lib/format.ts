import { CURRENCIES } from "@/lib/currencies";
import type { CurrencyCode } from "@/types";

/**
 * Format a monetary amount using the currency's locale and decimals.
 */
export function formatMoney(
  amount: number,
  currency: CurrencyCode,
  options: { compact?: boolean; sign?: boolean } = {},
): string {
  const meta = CURRENCIES[currency];
  // Use a single locale for consistent Western numerals across the
  // dashboard (Bloomberg-style), while honouring per-currency decimals.
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: options.compact ? "compact" : "standard",
    minimumFractionDigits: options.compact ? 0 : meta.decimals,
    maximumFractionDigits: meta.decimals,
    signDisplay: options.sign ? "exceptZero" : "auto",
  });
  return formatter.format(amount);
}

/**
 * Format a number compactly (1.2K, 3.4M) without a currency symbol.
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a fraction (0.082) as a percentage string (+8.2%).
 */
export function formatPercent(fraction: number, sign = true): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
    signDisplay: sign ? "exceptZero" : "auto",
  }).format(fraction);
}

/**
 * Format an FX rate with adaptive precision.
 */
export function formatRate(rate: number): string {
  const decimals = rate >= 100 ? 2 : rate >= 1 ? 4 : 5;
  return rate.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/**
 * Human-friendly relative time ("3m ago", "2h ago").
 */
export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const diff = timestamp - now;
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 60) return RELATIVE.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return RELATIVE.format(hours, "hour");
  const days = Math.round(hours / 24);
  return RELATIVE.format(days, "day");
}

/**
 * Format a timestamp as a short date.
 */
export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}
