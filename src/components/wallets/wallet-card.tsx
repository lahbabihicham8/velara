"use client";

import { motion } from "motion/react";
import { MoreHorizontal, Snowflake } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Delta } from "@/components/ui/delta";
import { CURRENCIES } from "@/lib/currencies";
import { formatMoney } from "@/lib/format";
import type { Wallet } from "@/types";

/**
 * A single multi-currency wallet card with balance, base value and 24h delta.
 */
export function WalletCard({ wallet, index }: { wallet: Wallet; index: number }) {
  const meta = CURRENCIES[wallet.currency];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="group relative overflow-hidden p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-muted text-2xl">
              {meta.flag}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{wallet.currency}</p>
                {wallet.isPrimary && <Badge variant="primary">Primary</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{meta.name}</p>
            </div>
          </div>
          <button
            aria-label="Wallet actions"
            className="grid size-8 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>

        <div className="mt-5">
          <p className="text-xs text-muted-foreground">Available balance</p>
          <p className="mt-0.5 text-2xl font-bold tracking-tight tnum">
            {formatMoney(wallet.balance, wallet.currency)}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground tnum">
              ≈ {formatMoney(wallet.baseValue, "USD", { compact: true })}
            </span>
            <Delta value={wallet.change24h} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="font-mono">{wallet.reference}</span>
          {wallet.reserved > 0 && (
            <span className="flex items-center gap-1">
              <Snowflake className="size-3" />
              {formatMoney(wallet.reserved, wallet.currency, { compact: true })} reserved
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
