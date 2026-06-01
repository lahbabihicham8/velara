"use client";

import type { ReactNode } from "react";

interface TooltipRow {
  name: string;
  value: number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: ReactNode;
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>;
  formatter?: (value: number) => string;
}

/**
 * Themed tooltip shared across Recharts charts.
 */
export function ChartTooltip({
  active,
  label,
  payload,
  formatter = (v) => v.toLocaleString(),
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const rows: TooltipRow[] = payload.map((p) => ({
    name: p.name ?? p.dataKey ?? "",
    value: Number(p.value ?? 0),
    color: p.color ?? "var(--color-chart-1)",
  }));

  return (
    <div className="glass min-w-36 rounded-lg border border-border px-3 py-2 text-xs shadow-lg">
      {label != null && (
        <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      )}
      <div className="flex flex-col gap-1">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground capitalize">
              <span
                className="size-2 rounded-full"
                style={{ background: row.color }}
              />
              {row.name}
            </span>
            <span className="font-semibold text-foreground tnum">
              {formatter(row.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
