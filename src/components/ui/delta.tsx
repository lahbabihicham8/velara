import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Coloured percentage-change pill (green up / red down).
 */
export function Delta({
  value,
  className,
  showIcon = true,
}: {
  value: number;
  className?: string;
  showIcon?: boolean;
}) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tnum",
        up ? "bg-positive/12 text-positive" : "bg-negative/12 text-negative",
        className,
      )}
    >
      {showIcon && <Icon className="size-3" />}
      {formatPercent(value)}
    </span>
  );
}
