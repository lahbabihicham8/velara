import { CURRENCY_CODES } from "@/types";
import { convert } from "@/lib/fx-engine";
import { round, seededRandom } from "@/lib/utils";
import type {
  CurrencyCode,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/types";

const COUNTERPARTIES: Array<{ name: string; flag: string; category: string }> = [
  { name: "Stripe Technology", flag: "🇺🇸", category: "Card settlement" },
  { name: "Aramco Trading", flag: "🇸🇦", category: "Supplier payout" },
  { name: "Emirates NBD", flag: "🇦🇪", category: "Bank transfer" },
  { name: "Shopify Inc.", flag: "🇨🇦", category: "Platform revenue" },
  { name: "Deutsche Bank", flag: "🇩🇪", category: "Treasury" },
  { name: "Qatar National Bank", flag: "🇶🇦", category: "Settlement" },
  { name: "Wise Payments", flag: "🇬🇧", category: "FX transfer" },
  { name: "Amazon Web Services", flag: "🇺🇸", category: "Infrastructure" },
  { name: "Gulf Logistics Co.", flag: "🇰🇼", category: "Operations" },
  { name: "Mada Network", flag: "🇸🇦", category: "Card settlement" },
  { name: "Revolut Business", flag: "🇬🇧", category: "FX transfer" },
  { name: "Adyen N.V.", flag: "🇳🇱", category: "Card settlement" },
  { name: "Salesforce", flag: "🇺🇸", category: "Software" },
  { name: "Etihad Cargo", flag: "🇦🇪", category: "Logistics" },
  { name: "BNP Paribas", flag: "🇫🇷", category: "Treasury" },
];

const TYPE_WEIGHTS: Array<{ type: TransactionType; weight: number }> = [
  { type: "incoming", weight: 0.42 },
  { type: "outgoing", weight: 0.34 },
  { type: "conversion", weight: 0.18 },
  { type: "fee", weight: 0.06 },
];

const STATUS_WEIGHTS: Array<{ status: TransactionStatus; weight: number }> = [
  { status: "completed", weight: 0.78 },
  { status: "processing", weight: 0.1 },
  { status: "pending", weight: 0.08 },
  { status: "failed", weight: 0.04 },
];

function weightedPick<T extends { weight: number }>(
  items: T[],
  rng: () => number,
): T {
  const total = items.reduce((s, it) => s + it.weight, 0);
  let r = rng() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Generate a deterministic ledger of transactions.
 * @param count number of transactions
 * @param seed RNG seed for reproducibility
 * @param spanDays how far back transactions are spread (default 21 days)
 */
export function getTransactions(
  count = 64,
  seed = 20260601,
  spanDays = 21,
): Transaction[] {
  const rng = seededRandom(seed);
  const now = Date.now();
  const list: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const cp = COUNTERPARTIES[Math.floor(rng() * COUNTERPARTIES.length)];
    const { type } = weightedPick(TYPE_WEIGHTS, rng);
    const { status } = weightedPick(STATUS_WEIGHTS, rng);
    const currency = CURRENCY_CODES[
      Math.floor(rng() * CURRENCY_CODES.length)
    ] as CurrencyCode;

    const magnitude = type === "fee" ? rng() * 900 + 40 : rng() * 240_000 + 1_200;
    const amount = round(magnitude, 2);
    const minutesAgo = Math.floor(rng() * 60 * 24 * spanDays);

    const tx: Transaction = {
      id: `txn_${(seed + i).toString(36)}`,
      reference: `NX-${(100000 + Math.floor(rng() * 899999)).toString()}`,
      type,
      status,
      counterparty: cp.name,
      counterpartyInitials: initials(cp.name),
      amount: { currency, amount },
      fee: round(type === "fee" ? amount : amount * 0.0009, 2),
      category: type === "fee" ? "Network fee" : cp.category,
      createdAt: now - minutesAgo * 60_000,
      countryFlag: cp.flag,
    };

    if (type === "conversion") {
      const targets = CURRENCY_CODES.filter((c) => c !== currency);
      const target = targets[Math.floor(rng() * targets.length)] as CurrencyCode;
      const { result, rate } = convert(amount, currency, target);
      tx.converted = { currency: target, amount: result };
      tx.rate = rate;
      tx.category = "FX conversion";
    }

    list.push(tx);
  }

  return list.sort((a, b) => b.createdAt - a.createdAt);
}
