import { FileClock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatMoney } from "@/lib/format";
import type { BatchStatus, PaymentBatch } from "@/types";

const STATUS_VARIANT: Record<BatchStatus, "positive" | "info" | "warning" | "negative"> = {
  completed: "positive",
  processing: "info",
  draft: "warning",
  failed: "negative",
};

export function BatchHistory({ batches }: { batches: PaymentBatch[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileClock className="size-4 text-muted-foreground" />
          Recent batches
        </CardTitle>
      </CardHeader>
      {batches.length === 0 ? (
        <EmptyState
          icon={FileClock}
          title="No batches yet"
          message="Uploaded payment runs will appear here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">File</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Payments</th>
                <th className="px-4 py-2.5 text-right font-medium">Total (USD)</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.id} className="border-b border-border/60 hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{b.filename}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[b.status]} className="capitalize">
                      {b.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right tnum">{b.totalCount}</td>
                  <td className="px-4 py-3 text-right tnum">
                    {formatMoney(b.totalValue, "USD", { compact: true })}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(b.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
