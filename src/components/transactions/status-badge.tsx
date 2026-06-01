import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TransactionStatus } from "@/types";

const MAP: Record<
  TransactionStatus,
  { label: string; variant: "positive" | "warning" | "info" | "negative"; dot: string }
> = {
  completed: { label: "Completed", variant: "positive", dot: "bg-positive" },
  processing: { label: "Processing", variant: "info", dot: "bg-info" },
  pending: { label: "Pending", variant: "warning", dot: "bg-warning" },
  failed: { label: "Failed", variant: "negative", dot: "bg-negative" },
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const cfg = MAP[status];
  return (
    <Badge variant={cfg.variant} className="gap-1.5">
      <span
        className={cn(
          "size-1.5 rounded-full",
          cfg.dot,
          status === "processing" && "animate-pulse-ring",
        )}
      />
      {cfg.label}
    </Badge>
  );
}
