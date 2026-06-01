import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/transactions/status-badge";
import { TransactionIcon } from "@/components/transactions/transaction-icon";
import { formatMoney, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";

/**
 * Compact recent-activity feed shown on the dashboard overview.
 */
export function RecentTransactions({ items }: { items: Transaction[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y divide-border">
          {items.map((tx) => {
            const incoming = tx.type === "incoming";
            return (
              <li key={tx.id} className="flex items-center gap-3 py-3">
                <TransactionIcon type={tx.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {tx.countryFlag} {tx.counterparty}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.category} · {formatRelativeTime(tx.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold tnum",
                      incoming ? "text-positive" : "text-foreground",
                    )}
                  >
                    {incoming ? "+" : tx.type === "outgoing" ? "−" : ""}
                    {formatMoney(tx.amount.amount, tx.amount.currency)}
                  </p>
                  <div className="mt-0.5 flex justify-end">
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
