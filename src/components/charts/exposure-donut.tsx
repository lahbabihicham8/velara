"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { formatCompact, formatPercent } from "@/lib/format";
import { CURRENCIES } from "@/lib/currencies";
import type { CurrencyExposure } from "@/types";

/**
 * Currency-exposure donut with a centred total label.
 */
export function ExposureDonut({
  data,
  total,
}: {
  data: CurrencyExposure[];
  total: number;
}) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Tooltip
            content={<ChartTooltip formatter={(v) => formatCompact(v)} />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="currency"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell key={d.currency} fill={d.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-xl font-bold tnum">{formatCompact(total)}</span>
        <span className="text-[10px] text-muted-foreground">USD base</span>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {data.map((d) => (
          <li
            key={d.currency}
            className="flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ background: d.fill }}
              />
              {CURRENCIES[d.currency].flag} {d.currency}
            </span>
            <span className="font-semibold tnum">{formatPercent(d.pct, false)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
