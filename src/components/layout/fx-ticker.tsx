"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useFxStream } from "@/hooks/use-fx-stream";
import { formatRate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FxTick } from "@/types";

function TickerItem({ tick }: { tick: FxTick }) {
  const up = tick.direction === "up";
  const down = tick.direction === "down";
  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <span className="text-xs font-semibold text-foreground">{tick.pair}</span>
      <span
        className={cn(
          "text-xs font-medium tnum transition-colors duration-300",
          up && "text-positive",
          down && "text-negative",
          !up && !down && "text-muted-foreground",
        )}
      >
        {formatRate(tick.rate)}
      </span>
      <span
        className={cn(
          "flex items-center gap-0.5 text-[10px] font-medium tnum",
          tick.changePct >= 0 ? "text-positive" : "text-negative",
        )}
      >
        {tick.changePct >= 0 ? (
          <TrendingUp className="size-3" />
        ) : (
          <TrendingDown className="size-3" />
        )}
        {(tick.changePct * 100).toFixed(2)}%
      </span>
    </div>
  );
}

/**
 * Infinite live-rate marquee. Rates update via the FX stream every tick;
 * the row is duplicated to create a seamless scroll.
 */
export function FxTicker() {
  const { ticks } = useFxStream();

  return (
    <div className="relative overflow-hidden border-b border-border bg-card/60">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[...ticks, ...ticks].map((tick, i) => (
          <div key={`${tick.pair}-${i}`} className="flex items-center">
            <TickerItem tick={tick} />
            <span className="h-3 w-px bg-border" />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-card to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card to-transparent" />
    </div>
  );
}
