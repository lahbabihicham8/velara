"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CURRENCY_LIST } from "@/lib/currencies";
import {
  createBeneficiaryAction,
  type BeneficiaryState,
} from "@/server/actions/beneficiary-actions";

const INITIAL: BeneficiaryState = {};

function Field({
  label,
  name,
  errors,
  ...props
}: {
  label: string;
  name: string;
  errors?: string[];
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input id={name} name={name} {...props} />
      {errors?.[0] && <p className="text-xs text-negative">{errors[0]}</p>}
    </div>
  );
}

/**
 * Modal form to add a saved beneficiary, wired to the `createBeneficiaryAction`
 * server action via `useActionState`.
 */
export function AddBeneficiary() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createBeneficiaryAction,
    INITIAL,
  );

  useEffect(() => {
    // Close the modal once the server action reports a successful create.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus /> Add beneficiary
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="text-lg font-bold tracking-tight">New beneficiary</h2>
                <p className="text-xs text-muted-foreground">
                  Bank details of a payee you send funds to.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <form action={formAction} className="max-h-[70vh] overflow-y-auto p-5">
              {state.error && (
                <p className="mb-3 rounded-lg border border-negative/30 bg-negative/10 px-3 py-2 text-sm text-negative">
                  {state.error}
                </p>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Beneficiary name" name="name" required errors={state.fieldErrors?.name} placeholder="Atlas Logistics Ltd" />
                <Field label="Nickname (optional)" name="nickname" errors={state.fieldErrors?.nickname} placeholder="Atlas freight" />
                <Field label="Bank name" name="bankName" required errors={state.fieldErrors?.bankName} placeholder="Barclays" />
                <Field label="Account number" name="accountNumber" required errors={state.fieldErrors?.accountNumber} placeholder="12345678" />
                <Field label="IBAN (optional)" name="iban" errors={state.fieldErrors?.iban} placeholder="GB29 NWBK …" />
                <Field label="SWIFT / BIC" name="swift" required errors={state.fieldErrors?.swift} placeholder="BARCGB22" />
                <div className="space-y-1">
                  <label htmlFor="currency" className="text-xs font-medium text-muted-foreground">
                    Currency
                  </label>
                  <Select id="currency" name="currency" defaultValue="USD">
                    {CURRENCY_LIST.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} — {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <Field label="Country" name="country" required errors={state.fieldErrors?.country} placeholder="United Kingdom" />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    "Save beneficiary"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
