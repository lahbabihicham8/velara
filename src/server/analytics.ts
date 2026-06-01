import "server-only";
import { VOLATILITY, toBase } from "@/lib/fx-engine";
import { formatMoney } from "@/lib/format";
import { round } from "@/lib/utils";
import type {
  CashflowPoint,
  CurrencyExposure,
  FxRisk,
  KpiMetric,
  Transaction,
  VolumePoint,
  Wallet,
} from "@/types";

const CHART_FILLS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-info)",
  "var(--color-warning)",
];

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** USD-base value of a transaction's primary amount. */
function baseAmount(tx: Transaction): number {
  return toBase(tx.amount.amount, tx.amount.currency);
}

/** Currency exposure breakdown for the donut chart. */
export function deriveExposure(wallets: Wallet[]): CurrencyExposure[] {
  const total = wallets.reduce((s, w) => s + w.baseValue, 0) || 1;
  return wallets
    .map((w, i) => ({
      currency: w.currency,
      value: w.baseValue,
      pct: round(w.baseValue / total, 4),
      fill: CHART_FILLS[i % CHART_FILLS.length],
    }))
    .sort((a, b) => b.value - a.value);
}

/** Per-currency 1-day 95% parametric Value at Risk. */
export function deriveFxRisk(wallets: Wallet[]): FxRisk[] {
  const Z = 1.645;
  return wallets
    .filter((w) => w.currency !== "USD")
    .map((w) => {
      const annualVol = VOLATILITY[w.currency] ?? 0.05;
      const dailyVol = annualVol / Math.sqrt(252);
      const var95 = round(w.baseValue * dailyVol * Z, 0);
      const ratio = w.baseValue > 0 ? var95 / w.baseValue : 0;
      const level: FxRisk["level"] =
        ratio < 0.001 ? "low" : ratio < 0.004 ? "moderate" : ratio < 0.008 ? "elevated" : "high";
      return { currency: w.currency, exposure: w.baseValue, volatility: annualVol, var95, level };
    })
    .sort((a, b) => b.var95 - a.var95);
}

/** Monthly inflow / outflow / net over the trailing 12 months. */
export function deriveCashflow(transactions: Transaction[]): CashflowPoint[] {
  const now = new Date();
  const buckets: CashflowPoint[] = [];
  const index = new Map<string, CashflowPoint>();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const point: CashflowPoint = { month: MONTH_LABELS[d.getMonth()], inflow: 0, outflow: 0, net: 0 };
    index.set(key, point);
    buckets.push(point);
  }

  for (const tx of transactions) {
    const d = new Date(tx.createdAt);
    const point = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (!point) continue;
    const base = baseAmount(tx);
    if (tx.type === "incoming") point.inflow += base;
    else if (tx.type === "outgoing" || tx.type === "fee") point.outflow += base;
  }

  for (const p of buckets) {
    p.inflow = round(p.inflow, 0);
    p.outflow = round(p.outflow, 0);
    p.net = round(p.inflow - p.outflow, 0);
  }
  return buckets;
}

/** Daily processed volume over the trailing 30 days. */
export function deriveVolume(transactions: Transaction[]): VolumePoint[] {
  const DAY = 86_400_000;
  const now = Date.now();
  const points: VolumePoint[] = Array.from({ length: 30 }, (_, i) => ({
    day: `D${i + 1}`,
    volume: 0,
    count: 0,
  }));

  for (const tx of transactions) {
    const ageDays = Math.floor((now - tx.createdAt) / DAY);
    if (ageDays < 0 || ageDays >= 30) continue;
    const slot = 29 - ageDays;
    points[slot].volume += baseAmount(tx);
    points[slot].count += 1;
  }

  for (const p of points) p.volume = round(p.volume, 0);
  return points;
}

/** Sum of base volume within a rolling window [from, to) days ago. */
function windowSum(
  transactions: Transaction[],
  fromDaysAgo: number,
  toDaysAgo: number,
  predicate: (tx: Transaction) => boolean = () => true,
): number {
  const DAY = 86_400_000;
  const now = Date.now();
  let sum = 0;
  for (const tx of transactions) {
    const ageDays = (now - tx.createdAt) / DAY;
    if (ageDays >= fromDaysAgo && ageDays < toDaysAgo && predicate(tx)) {
      sum += baseAmount(tx);
    }
  }
  return sum;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 1 : 0;
  return round((current - previous) / previous, 4);
}

/** Build a 14-point sparkline from the trailing daily volume. */
function sparkFromVolume(volume: VolumePoint[]): number[] {
  return volume.slice(-14).map((p) => p.volume);
}

/**
 * Headline KPIs, fully derived from live wallet balances and the
 * transaction ledger (30-day vs. prior-30-day windows).
 */
export function deriveKpis(
  wallets: Wallet[],
  transactions: Transaction[],
  totalBaseValue: number,
  volume: VolumePoint[],
): KpiMetric[] {
  const balanceDelta = wallets.length
    ? round(
        wallets.reduce((s, w) => s + w.change24h * w.baseValue, 0) /
          (totalBaseValue || 1),
        4,
      )
    : 0;

  const vol30 = windowSum(transactions, 0, 30);
  const volPrev30 = windowSum(transactions, 30, 60);

  const fees30 = windowSum(transactions, 0, 30, (t) => t.type === "conversion" || t.type === "fee");
  const feesPrev30 = windowSum(transactions, 30, 60, (t) => t.type === "conversion" || t.type === "fee");

  const pending = transactions
    .filter((t) => t.status === "pending" || t.status === "processing")
    .reduce((s, t) => s + baseAmount(t), 0);
  const pendingPrev = windowSum(
    transactions,
    30,
    60,
    (t) => t.status === "pending" || t.status === "processing",
  );

  const spark = sparkFromVolume(volume);

  return [
    {
      id: "total-balance",
      label: "Total Balance",
      value: formatMoney(totalBaseValue, "USD", { compact: true }),
      raw: round(totalBaseValue, 2),
      delta: balanceDelta,
      trend: balanceDelta >= 0 ? "up" : "down",
      spark,
      currency: "USD",
    },
    {
      id: "monthly-volume",
      label: "Monthly Volume",
      value: formatMoney(vol30, "USD", { compact: true }),
      raw: round(vol30, 2),
      delta: pctChange(vol30, volPrev30),
      trend: vol30 >= volPrev30 ? "up" : "down",
      spark,
      currency: "USD",
    },
    {
      id: "fx-savings",
      label: "FX Fees (30d)",
      value: formatMoney(fees30, "USD", { compact: true }),
      raw: round(fees30, 2),
      delta: pctChange(fees30, feesPrev30),
      trend: fees30 <= feesPrev30 ? "up" : "down",
      spark,
      currency: "USD",
    },
    {
      id: "pending-settlement",
      label: "Pending Settlement",
      value: formatMoney(pending, "USD", { compact: true }),
      raw: round(pending, 2),
      delta: pctChange(pending, pendingPrev),
      trend: pending <= pendingPrev ? "up" : "down",
      spark,
      currency: "USD",
    },
  ];
}
