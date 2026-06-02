"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileUp,
  Download,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CURRENCY_CODES } from "@/types";
import { formatMoney } from "@/lib/format";
import { submitBulkPayment, type BulkResult } from "@/server/actions/payment-actions";
import type { CurrencyCode } from "@/types";

interface ParsedRow {
  beneficiary: string;
  currency: string;
  amount: number;
  reference: string;
  valid: boolean;
  error?: string;
}

const TEMPLATE =
  "beneficiary,currency,amount,reference\n" +
  "Atlas Logistics Ltd,GBP,15000,Invoice 4471\n" +
  "Nordic Steel AB,EUR,8200,PO-2231\n" +
  "Gulf Trading FZE,AED,33000,Settlement\n";

function parseCsv(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  // Drop a header row if present.
  const start = /beneficiary/i.test(lines[0]) ? 1 : 0;
  const codes = new Set<string>(CURRENCY_CODES);

  return lines.slice(start).map((line) => {
    const [beneficiary = "", currency = "", amountRaw = "", reference = ""] =
      line.split(",").map((c) => c.trim());
    const amount = Number.parseFloat(amountRaw);
    const cur = currency.toUpperCase();

    let error: string | undefined;
    if (!beneficiary) error = "Missing beneficiary";
    else if (!codes.has(cur)) error = `Unsupported currency "${currency}"`;
    else if (!Number.isFinite(amount) || amount <= 0) error = "Invalid amount";

    return {
      beneficiary,
      currency: cur,
      amount: Number.isFinite(amount) ? amount : 0,
      reference,
      valid: !error,
      error,
    };
  });
}

function downloadTemplate() {
  const blob = new Blob([TEMPLATE], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "velarapay-bulk-payments-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Bulk payment uploader: parse a CSV client-side, validate rows, preview, then
 * submit the valid rows to the `submitBulkPayment` server action.
 */
export function BulkUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [pending, startTransition] = useTransition();

  const valid = rows.filter((r) => r.valid);
  const invalid = rows.length - valid.length;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setFilename(file.name);
    file.text().then((text) => setRows(parseCsv(text)));
  }

  function reset() {
    setRows([]);
    setFilename("");
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function submit() {
    if (valid.length === 0) return;
    startTransition(async () => {
      const res = await submitBulkPayment({
        filename: filename || "bulk-payments.csv",
        rows: valid.map((r) => ({
          beneficiary: r.beneficiary,
          currency: r.currency as CurrencyCode,
          amount: r.amount,
          reference: r.reference,
        })),
      });
      setResult(res);
      if (res.ok) {
        setRows([]);
        setFilename("");
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileUp className="size-4 text-primary" />
          Upload payment file
        </CardTitle>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download /> CSV template
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:border-ring hover:bg-muted/50">
          <FileUp className="size-6 text-muted-foreground" />
          <span className="text-sm font-medium">
            {filename || "Choose a CSV file"}
          </span>
          <span className="text-xs text-muted-foreground">
            Columns: beneficiary, currency, amount, reference
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            className="hidden"
          />
        </label>

        {result && (
          <div
            className={
              result.ok
                ? "flex items-start gap-2 rounded-lg border border-positive/30 bg-positive/10 px-3 py-2.5 text-sm text-positive"
                : "flex items-start gap-2 rounded-lg border border-negative/30 bg-negative/10 px-3 py-2.5 text-sm text-negative"
            }
          >
            {result.ok ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            )}
            <span>
              {result.ok
                ? `Submitted ${result.count} payments (${formatMoney(result.totalValue ?? 0, "USD", { compact: true })} total).`
                : result.error}
            </span>
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="positive">{valid.length} valid</Badge>
              {invalid > 0 && <Badge variant="negative">{invalid} invalid</Badge>}
              <span className="text-muted-foreground">
                {rows.length} rows parsed from {filename}
              </span>
            </div>

            <div className="max-h-72 overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Beneficiary</th>
                    <th className="px-3 py-2 font-medium">Currency</th>
                    <th className="px-3 py-2 text-right font-medium">Amount</th>
                    <th className="px-3 py-2 font-medium">Reference</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-border/60">
                      <td className="px-3 py-2">{r.beneficiary || "—"}</td>
                      <td className="px-3 py-2">{r.currency || "—"}</td>
                      <td className="px-3 py-2 text-right tnum">
                        {r.valid
                          ? formatMoney(r.amount, r.currency as CurrencyCode)
                          : r.amount}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {r.reference || "—"}
                      </td>
                      <td className="px-3 py-2">
                        {r.valid ? (
                          <Badge variant="positive">OK</Badge>
                        ) : (
                          <Badge variant="negative">{r.error}</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={reset} disabled={pending}>
                Clear
              </Button>
              <Button size="sm" onClick={submit} disabled={pending || valid.length === 0}>
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    <Send /> Submit {valid.length} payments
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
