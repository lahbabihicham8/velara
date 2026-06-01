"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatCompact } from "@/lib/format";
import type { VolumePoint } from "@/types";

/**
 * Daily transaction-volume bar chart with hover highlight.
 */
export function VolumeChart({ data }: { data: VolumePoint[] }) {
  const max = Math.max(...data.map((d) => d.volume));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="day"
          stroke="var(--color-muted-foreground)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval={4}
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
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
        />
        <Bar dataKey="volume" radius={[4, 4, 0, 0]} maxBarSize={18}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={
                d.volume === max
                  ? "var(--color-chart-1)"
                  : "color-mix(in oklch, var(--color-chart-1) 55%, transparent)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
