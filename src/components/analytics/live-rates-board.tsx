"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFxStream } from "@/hooks/use-fx-stream";
import { formatRate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Real-time FX board. Each cell updates on every stream tick and flashes
 * green/red based on tick direction.
 */
export function LiveRatesBoard() {
  const { ticks, lastUpdated } = useFxStream();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Live FX Rates</CardTitle>
          <CardDescription>Streaming mid-market · updates every 1.5s</CardDescription>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 animate-pulse-ring rounded-full bg-positive" />
          {new Date(lastUpdated).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ticks.map((tick) => {
            const up = tick.changePct >= 0;
            return (
              <div
                key={tick.pair}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{tick.pair}</span>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-[10px] font-medium tnum",
                      up ? "text-positive" : "text-negative",
                    )}
                  >
                    {up ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {(tick.changePct * 100).toFixed(2)}%
                  </span>
                </div>
                <motion.p
                  key={tick.rate}
                  initial={{ color: up ? "var(--color-positive)" : "var(--color-negative)" }}
                  animate={{ color: "var(--color-foreground)" }}
                  transition={{ duration: 0.8 }}
                  className="mt-1 text-lg font-bold tnum"
                >
                  {formatRate(tick.rate)}
                </motion.p>
                <div className="mt-0.5 flex justify-between text-[10px] text-muted-foreground tnum">
                  <span>B {formatRate(tick.bid)}</span>
                  <span>A {formatRate(tick.ask)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
