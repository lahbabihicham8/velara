import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CURRENCIES } from "@/lib/currencies";
import { formatMoney, formatPercent } from "@/lib/format";
import { clamp } from "@/lib/utils";
import type { FxRisk } from "@/types";

const LEVEL_META: Record<
  FxRisk["level"],
  { label: string; variant: "positive" | "info" | "warning" | "negative"; bar: string }
> = {
  low: { label: "Low", variant: "positive", bar: "bg-positive" },
  moderate: { label: "Moderate", variant: "info", bar: "bg-info" },
  elevated: { label: "Elevated", variant: "warning", bar: "bg-warning" },
  high: { label: "High", variant: "negative", bar: "bg-negative" },
};

/**
 * FX Value-at-Risk panel: per-currency 1-day 95% VaR with a volatility bar.
 */
export function FxRiskPanel({ risk }: { risk: FxRisk[] }) {
  const totalVar = risk.reduce((s, r) => s + r.var95, 0);
  const maxVol = Math.max(...risk.map((r) => r.volatility));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-warning-foreground" />
            FX Risk Management
          </CardTitle>
          <CardDescription>1-day 95% Value at Risk · USD base</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total VaR</p>
          <p className="text-lg font-bold tnum text-negative">
            {formatMoney(totalVar, "USD", { compact: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {risk.map((r) => {
          const meta = LEVEL_META[r.level];
          const width = clamp((r.volatility / maxVol) * 100, 8, 100);
          return (
            <div key={r.currency} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  {CURRENCIES[r.currency].flag} {r.currency}
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </span>
                <span className="font-semibold tnum">
                  {formatMoney(r.var95, "USD", { compact: true })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${meta.bar}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs text-muted-foreground tnum">
                  σ {formatPercent(r.volatility, false)}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
