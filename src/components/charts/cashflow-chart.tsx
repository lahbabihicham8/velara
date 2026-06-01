"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatCompact } from "@/lib/format";
import type { CashflowPoint } from "@/types";

/**
 * Stacked inflow vs. outflow area chart for cash-flow analysis.
 */
export function CashflowChart({ data }: { data: CashflowPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="cf-in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cf-out" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          stroke="var(--color-muted-foreground)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--color-muted-foreground)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatCompact(Number(v))}
        />
        <Tooltip
          content={<ChartTooltip formatter={(v) => formatCompact(v)} />}
          cursor={{ stroke: "var(--color-border)" }}
        />
        <Area
          type="monotone"
          name="inflow"
          dataKey="inflow"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          fill="url(#cf-in)"
        />
        <Area
          type="monotone"
          name="outflow"
          dataKey="outflow"
          stroke="var(--color-chart-4)"
          strokeWidth={2}
          fill="url(#cf-out)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
