import { ArrowDownLeft, ArrowUpRight, Repeat, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types";

const MAP: Record<
  TransactionType,
  { icon: typeof ArrowDownLeft; className: string }
> = {
  incoming: { icon: ArrowDownLeft, className: "bg-positive/12 text-positive" },
  outgoing: { icon: ArrowUpRight, className: "bg-negative/12 text-negative" },
  conversion: { icon: Repeat, className: "bg-primary/12 text-primary" },
  fee: { icon: Receipt, className: "bg-muted text-muted-foreground" },
};

export function TransactionIcon({ type }: { type: TransactionType }) {
  const { icon: Icon, className } = MAP[type];
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-lg",
        className,
      )}
    >
      <Icon className="size-4" />
    </span>
  );
}
