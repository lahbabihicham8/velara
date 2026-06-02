"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/auth";
import { activeOrgId } from "@/server/context";
import { bulkPayloadSchema } from "@/lib/validation";
import { CURRENCIES } from "@/lib/currencies";
import { toBase } from "@/lib/fx-engine";
import { round } from "@/lib/utils";

export interface BulkResult {
  ok: boolean;
  error?: string;
  batchId?: string;
  count?: number;
  totalValue?: number;
}

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "—"
  );
}

/**
 * Process a validated bulk-payment payload: create a PaymentBatch and one
 * outgoing transaction per row, linking to existing beneficiaries by name.
 * Requires `payments.bulk`.
 */
export async function submitBulkPayment(payload: unknown): Promise<BulkResult> {
  const user = await requirePermission("payments.bulk");
  const orgId = await activeOrgId(user);

  const parsed = bulkPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Invalid payment data. Check the CSV format." };
  }

  const { filename, rows } = parsed.data;

  // Match rows to saved beneficiaries by (case-insensitive) name.
  const beneficiaries = await prisma.beneficiary.findMany({ where: { orgId } });
  const byName = new Map(
    beneficiaries.map((b) => [b.name.toLowerCase(), b]),
  );

  const totalValue = round(
    rows.reduce((s, r) => s + toBase(r.amount, r.currency), 0),
    2,
  );

  try {
    const batchId = await prisma.$transaction(async (tx) => {
      const batch = await tx.paymentBatch.create({
        data: {
          orgId,
          filename,
          status: "completed",
          totalCount: rows.length,
          totalValue,
          baseCurrency: "USD",
          createdBy: user.name,
        },
      });

      await tx.transaction.createMany({
        data: rows.map((r) => {
          const match = byName.get(r.beneficiary.toLowerCase());
          return {
            orgId,
            reference: `BULK-${batch.id.slice(-6).toUpperCase()}`,
            type: "outgoing" as const,
            status: "processing" as const,
            counterparty: r.beneficiary,
            counterpartyInitials: initialsOf(r.beneficiary),
            amountCurrency: r.currency,
            amountValue: r.amount,
            fee: 0,
            category: "Bulk payment",
            countryFlag: CURRENCIES[r.currency].flag,
            beneficiaryId: match?.id ?? null,
            batchId: batch.id,
          };
        }),
      });

      return batch.id;
    });

    revalidatePath("/dashboard/payments");
    revalidatePath("/dashboard/transactions");
    return { ok: true, batchId, count: rows.length, totalValue };
  } catch {
    return { ok: false, error: "Failed to process the batch. Please retry." };
  }
}
