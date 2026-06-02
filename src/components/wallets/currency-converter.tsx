"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFxStream, useLiveRate } from "@/hooks/use-fx-stream";
import { CURRENCIES, CURRENCY_LIST } from "@/lib/currencies";
import { formatMoney, formatRate } from "@/lib/format";
import { applyMargin, formatMargin, DEFAULT_MARGIN_BPS } from "@/lib/margin";
import { round } from "@/lib/utils";
import type { CurrencyCode } from "@/types";

/**
 * Instant multi-currency converter powered by the live FX stream.
 * The output amount and rate re-compute on every tick, with the client's
 * configured trading margin applied on top of the mid-market rate.
 */
export function CurrencyConverter({
  marginBps = DEFAULT_MARGIN_BPS,
}: {
  marginBps?: number;
}) {
  const [amount, setAmount] = useState("10000");
  const [from, setFrom] = useState<CurrencyCode>("USD");
  const [to, setTo] = useState<CurrencyCode>("EUR");

  const { running } = useFxStream();
  const midRate = useLiveRate(from, to);
  const rate = useMemo(
    () => applyMargin(midRate, marginBps),
    [midRate, marginBps],
  );

  const parsed = Number.parseFloat(amount) || 0;
  const result = useMemo(
    () => round(parsed * rate, CURRENCIES[to].decimals),
    [parsed, rate, to],
  );

  const fee = round(parsed * 0.0009, 2);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          Instant Conversion
        </CardTitle>
        {running && (
          <Badge variant="positive" className="gap-1.5">
            <span className="size-1.5 animate-pulse-ring rounded-full bg-positive" />
            Live rate
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* From */}
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>You send</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <Input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="h-11 border-0 bg-transparent px-0 text-xl font-bold focus-visible:ring-0 tnum"
            />
            <div className="w-32 shrink-0">
              <Select
                value={from}
                onChange={(e) => setFrom(e.target.value as CurrencyCode)}
              >
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Swap */}
        <div className="flex justify-center">
          <button
            onClick={swap}
            aria-label="Swap currencies"
            className="grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:rotate-180 hover:text-primary"
          >
            <ArrowDownUp className="size-4" />
          </button>
        </div>

        {/* To */}
        <div className="rounded-xl border border-primary/30 bg-primary/[0.04] p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Recipient gets</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <motion.span
              key={result}
              initial={{ opacity: 0.5, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 truncate text-xl font-bold tnum"
            >
              {result.toLocaleString("en-US", {
                minimumFractionDigits: CURRENCIES[to].decimals,
                maximumFractionDigits: CURRENCIES[to].decimals,
              })}
            </motion.span>
            <div className="w-32 shrink-0">
              <Select
                value={to}
                onChange={(e) => setTo(e.target.value as CurrencyCode)}
              >
                {CURRENCY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Rate + margin + fee summary */}
        <dl className="space-y-1.5 rounded-lg bg-muted/40 p-3 text-xs">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Mid-market rate</dt>
            <dd className="font-semibold tnum">
              1 {from} = {formatRate(midRate)} {to}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Trading margin</dt>
            <dd className="font-semibold tnum">{formatMargin(marginBps)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5">
            <dt className="text-muted-foreground">Your rate</dt>
            <dd className="font-semibold tnum text-primary">
              1 {from} = {formatRate(rate)} {to}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Transfer fee (0.09%)</dt>
            <dd className="font-semibold tnum">{formatMoney(fee, from)}</dd>
          </div>
        </dl>

        <Button className="w-full" size="lg">
          Convert {formatMoney(parsed, from, { compact: true })}
        </Button>
      </CardContent>
    </Card>
  );
}
