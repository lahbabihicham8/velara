"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/auth";
import { activeOrgId } from "@/server/context";
import { beneficiarySchema } from "@/lib/validation";
import { CURRENCIES } from "@/lib/currencies";

export interface BeneficiaryState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

/**
 * Create a saved beneficiary for the active organisation.
 * Requires `beneficiaries.manage`.
 */
export async function createBeneficiaryAction(
  _prev: BeneficiaryState,
  formData: FormData,
): Promise<BeneficiaryState> {
  const user = await requirePermission("beneficiaries.manage");
  const orgId = await activeOrgId(user);

  const parsed = beneficiarySchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname"),
    bankName: formData.get("bankName"),
    accountNumber: formData.get("accountNumber"),
    iban: formData.get("iban"),
    swift: formData.get("swift"),
    currency: formData.get("currency"),
    country: formData.get("country"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const d = parsed.data;
  await prisma.beneficiary.create({
    data: {
      orgId,
      name: d.name,
      nickname: d.nickname ? d.nickname : null,
      bankName: d.bankName,
      accountNumber: d.accountNumber,
      iban: d.iban ? d.iban : null,
      swift: d.swift.toUpperCase(),
      currency: d.currency,
      country: d.country,
      countryFlag: CURRENCIES[d.currency].flag,
    },
  });

  revalidatePath("/dashboard/beneficiaries");
  return { success: true };
}

/**
 * Delete a beneficiary (scoped to the active org so a forged id can't reach
 * another tenant's data). Requires `beneficiaries.manage`.
 */
export async function deleteBeneficiaryAction(formData: FormData): Promise<void> {
  const user = await requirePermission("beneficiaries.manage");
  const orgId = await activeOrgId(user);
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.beneficiary.deleteMany({ where: { id, orgId } });
  revalidatePath("/dashboard/beneficiaries");
}
