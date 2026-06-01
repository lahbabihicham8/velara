/**
 * NexaPay — Core domain models.
 * Every entity is strictly typed and shared across services, hooks and UI.
 */

/* ------------------------------------------------------------------ */
/* Currencies & FX                                                     */
/* ------------------------------------------------------------------ */

export const CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "SAR",
  "AED",
  "KWD",
  "QAR",
] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  /** Decimal places used when formatting amounts. */
  decimals: number;
  /** Locale used for Intl number formatting. */
  locale: string;
}

/** A single tick in a streaming FX feed. */
export interface FxTick {
  pair: string; // e.g. "EUR/USD"
  base: CurrencyCode;
  quote: CurrencyCode;
  rate: number;
  /** Absolute change vs. previous tick. */
  change: number;
  /** Percentage change vs. session open. */
  changePct: number;
  direction: "up" | "down" | "flat";
  bid: number;
  ask: number;
  timestamp: number;
}

/** One point in an intraday rate sparkline. */
export interface FxPoint {
  t: number;
  rate: number;
}

export interface FxSeries {
  pair: string;
  base: CurrencyCode;
  quote: CurrencyCode;
  points: FxPoint[];
}

/* ------------------------------------------------------------------ */
/* Wallets & Money                                                     */
/* ------------------------------------------------------------------ */

export interface Money {
  currency: CurrencyCode;
  /** Amount in major units (e.g. dollars, not cents). */
  amount: number;
}

export interface Wallet {
  id: string;
  currency: CurrencyCode;
  /** Available balance in the wallet currency. */
  balance: number;
  /** Funds reserved for pending settlements. */
  reserved: number;
  /** Value converted to the company base currency (USD). */
  baseValue: number;
  /** 24h change in base value, as a fraction (0.012 = +1.2%). */
  change24h: number;
  /** IBAN-style masked account reference. */
  reference: string;
  isPrimary: boolean;
}

/* ------------------------------------------------------------------ */
/* Transactions                                                        */
/* ------------------------------------------------------------------ */

export type TransactionType =
  | "incoming"
  | "outgoing"
  | "conversion"
  | "fee";

export type TransactionStatus =
  | "completed"
  | "pending"
  | "processing"
  | "failed";

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  /** Counterparty / merchant / beneficiary name. */
  counterparty: string;
  counterpartyInitials: string;
  amount: Money;
  /** For conversions: the resulting money in the target currency. */
  converted?: Money;
  /** Effective rate used (conversions only). */
  rate?: number;
  fee: number;
  category: string;
  createdAt: number;
  /** ISO country code of the counterparty, for the flag chip. */
  countryFlag: string;
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

export interface KpiMetric {
  id: string;
  label: string;
  /** Pre-formatted display value. */
  value: string;
  /** Raw numeric value for sorting / sparklines. */
  raw: number;
  delta: number; // fractional change, e.g. 0.082 = +8.2%
  trend: "up" | "down";
  spark: number[];
  currency?: CurrencyCode;
}

export interface CashflowPoint {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface CurrencyExposure {
  currency: CurrencyCode;
  value: number;
  pct: number;
  fill: string;
}

/** FX value-at-risk style assessment per currency. */
export interface FxRisk {
  currency: CurrencyCode;
  exposure: number;
  /** Annualised volatility, as a fraction. */
  volatility: number;
  /** 1-day 95% Value at Risk, in base currency. */
  var95: number;
  level: "low" | "moderate" | "elevated" | "high";
}

export interface VolumePoint {
  day: string;
  volume: number;
  count: number;
}

/* ------------------------------------------------------------------ */
/* RBAC — Roles, Permissions, Users                                    */
/* ------------------------------------------------------------------ */

export type Role = "owner" | "admin" | "treasurer" | "analyst" | "viewer";

export type Permission =
  | "dashboard.view"
  | "wallets.view"
  | "wallets.convert"
  | "transactions.view"
  | "transactions.create"
  | "transactions.approve"
  | "analytics.view"
  | "team.view"
  | "team.manage"
  | "settings.manage";

export interface RoleDefinition {
  role: Role;
  label: string;
  description: string;
  permissions: Permission[];
  accent: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  status: "active" | "invited" | "suspended";
  lastActive: number;
  twoFactor: boolean;
}

export interface SessionUser {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  company: string;
  status: "active" | "invited" | "suspended";
}
