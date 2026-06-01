"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/transactions/status-badge";
import { TransactionIcon } from "@/components/transactions/transaction-icon";
import { CURRENCY_LIST } from "@/lib/currencies";
import { formatDate, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  CurrencyCode,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/types";

type TypeFilter = TransactionType | "all";
type StatusFilter = TransactionStatus | "all";
type CurrencyFilter = CurrencyCode | "all";

/**
 * Full transactions ledger with instant client-side filtering across
 * search, type, status and currency.
 */
export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [currency, setCurrency] = useState<CurrencyFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (type !== "all" && tx.type !== type) return false;
      if (status !== "all" && tx.status !== status) return false;
      if (currency !== "all" && tx.amount.currency !== currency) return false;
      if (q) {
        const haystack = `${tx.counterparty} ${tx.reference} ${tx.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, query, type, status, currency]);

  return (
    <Card className="overflow-hidden">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, reference or category…"
            className="h-10 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none focus:border-ring focus:bg-card"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 lg:flex lg:w-auto">
          <Select value={type} onChange={(e) => setType(e.target.value as TypeFilter)} className="lg:w-36">
            <option value="all">All types</option>
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
            <option value="conversion">Conversion</option>
            <option value="fee">Fee</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className="lg:w-36">
            <option value="all">All status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Select>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyFilter)} className="lg:w-32">
            <option value="all">All FX</option>
            {CURRENCY_LIST.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Result meta */}
      <div className="flex items-center justify-between px-4 py-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="size-3.5" />
          {filtered.length} of {transactions.length} transactions
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No matching transactions"
          message="Try adjusting your filters or search query."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Counterparty</th>
                <th className="px-4 py-2.5 font-medium">Reference</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const incoming = tx.type === "incoming";
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <TransactionIcon type={tx.type} />
                        <div>
                          <p className="font-medium">
                            {tx.countryFlag} {tx.counterparty}
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {tx.reference}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p
                        className={cn(
                          "font-semibold tnum",
                          incoming ? "text-positive" : "text-foreground",
                        )}
                      >
                        {incoming ? "+" : tx.type === "outgoing" ? "−" : ""}
                        {formatMoney(tx.amount.amount, tx.amount.currency)}
                      </p>
                      {tx.converted && (
                        <p className="text-xs text-muted-foreground tnum">
                          → {formatMoney(tx.converted.amount, tx.converted.currency)}
                        </p>
                      )}
                      {tx.type === "conversion" && (
                        <Badge variant="primary" className="mt-0.5">
                          FX
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
