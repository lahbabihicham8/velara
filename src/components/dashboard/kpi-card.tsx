"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Delta } from "@/components/ui/delta";
import { Sparkline } from "@/components/charts/sparkline";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { formatCompact } from "@/lib/format";
import type { KpiMetric } from "@/types";

const SPARK_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

/**
 * Headline KPI tile with animated value, delta pill and sparkline.
 */
export function KpiCard({ metric, index }: { metric: KpiMetric; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="group relative overflow-hidden p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight tnum">
              {metric.currency === "USD" ? (
                <AnimatedNumber
                  value={metric.raw}
                  format={(n) => `$${formatCompact(n)}`}
                />
              ) : (
                metric.value
              )}
            </p>
          </div>
          <Delta value={metric.delta} />
        </div>
        <div className="mt-3 -mx-1">
          <Sparkline
            data={metric.spark}
            color={SPARK_COLORS[index % SPARK_COLORS.length]}
          />
        </div>
        <div
          className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: SPARK_COLORS[index % SPARK_COLORS.length] }}
        />
      </Card>
    </motion.div>
  );
}
