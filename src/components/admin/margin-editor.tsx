"use client";

import { useActionState } from "react";
import { Loader2, Check, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMargin, MAX_MARGIN_BPS, MIN_MARGIN_BPS } from "@/lib/margin";
import { setMarginAction, type MarginState } from "@/server/actions/admin-actions";

const INITIAL: MarginState = {};

/**
 * Back-office control to adjust a client account's FX trading margin (bps).
 */
export function MarginEditor({
  orgId,
  current,
}: {
  orgId: string;
  current: number;
}) {
  const [state, formAction, pending] = useActionState(setMarginAction, INITIAL);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="size-4 text-primary" />
          Trading margin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="orgId" value={orgId} />
          <p className="text-xs text-muted-foreground">
            Spread applied on top of the mid-market rate at conversion. Current:{" "}
            <span className="font-semibold text-foreground">
              {formatMargin(current)}
            </span>
          </p>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="marginBps" className="text-xs font-medium text-muted-foreground">
                Margin (basis points)
              </label>
              <Input
                id="marginBps"
                name="marginBps"
                type="number"
                inputMode="numeric"
                defaultValue={current}
                min={MIN_MARGIN_BPS}
                max={MAX_MARGIN_BPS}
                step={1}
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </div>
          {state.fieldErrors?.marginBps?.[0] && (
            <p className="text-xs text-negative">{state.fieldErrors.marginBps[0]}</p>
          )}
          {state.success && (
            <p className="flex items-center gap-1 text-xs text-positive">
              <Check className="size-3.5" /> Margin updated.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
