"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Delta } from "@/components/ui/delta";
import { EmptyState } from "@/components/ui/empty-state";
import { Bitcoin } from "lucide-react";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";
import { CRYPTO_ASSETS } from "@/lib/crypto";
import { formatMoney } from "@/lib/format";
import type { CryptoHolding } from "@/types";

/**
 * Live crypto holdings grid. Server provides balances; the live price feed
 * re-values them in USD on every tick.
 */
export function CryptoHoldings({ holdings }: { holdings: CryptoHolding[] }) {
  const { prices, running } = useCryptoPrices();

  const valued = useMemo(
    () =>
      holdings
        .map((h) => {
          const live = prices[h.asset];
          return {
            ...h,
            price: live.price,
            liveValue: h.balance * live.price,
            priceChange: live.change,
          };
        })
        .sort((a, b) => b.liveValue - a.liveValue),
    [holdings, prices],
  );

  const total = valued.reduce((s, h) => s + h.liveValue, 0);

  if (holdings.length === 0) {
    return (
      <EmptyState
        icon={Bitcoin}
        title="No crypto holdings"
        message="This account has no crypto wallets yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-br from-warning/10 via-card to-card">
        <CardContent className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-warning/15 text-warning-foreground">
              <Bitcoin className="size-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Total crypto value</p>
              <p className="text-3xl font-bold tracking-tight tnum">
                {formatMoney(total, "USD")}
              </p>
            </div>
          </div>
          {running && (
            <Badge variant="positive" className="gap-1.5">
              <span className="size-1.5 animate-pulse-ring rounded-full bg-positive" />
              Live prices
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {valued.map((h, i) => {
          const meta = CRYPTO_ASSETS[h.asset];
          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-11 place-items-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      {h.asset}
                    </span>
                    <div>
                      <p className="font-semibold">{meta.name}</p>
                      <p className="text-xs text-muted-foreground tnum">
                        @ {formatMoney(h.price, "USD")}
                      </p>
                    </div>
                  </div>
                  {meta.stable && <Badge variant="info">Stable</Badge>}
                </div>

                <div className="mt-5">
                  <p className="text-xs text-muted-foreground">Holding</p>
                  <p className="mt-0.5 text-2xl font-bold tracking-tight tnum">
                    {h.balance.toLocaleString("en-US", {
                      maximumFractionDigits: meta.decimals,
                    })}{" "}
                    <span className="text-base text-muted-foreground">{h.asset}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <motion.span
                      key={Math.round(h.liveValue)}
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted-foreground tnum"
                    >
                      ≈ {formatMoney(h.liveValue, "USD", { compact: true })}
                    </motion.span>
                    <Delta value={h.change24h} />
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="font-mono">{h.address}</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
