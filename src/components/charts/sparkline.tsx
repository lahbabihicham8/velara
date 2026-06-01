"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

/**
 * Minimal area sparkline for KPI tiles. No axes, no tooltip.
 */
export function Sparkline({
  data,
  color = "var(--color-chart-1)",
  height = 40,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const points = data.map((v, i) => ({ i, v }));
  const gradientId = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={["dataMin", "dataMax"]} />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
