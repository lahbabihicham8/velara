"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/server/auth";
import { marginSchema } from "@/lib/validation";
import { IMPERSONATE_COOKIE } from "@/lib/auth-constants";
import { env } from "@/lib/env";

export interface MarginState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

/**
 * Adjust a client account's trading margin (basis points).
 * Requires a platform superadmin.
 */
export async function setMarginAction(
  _prev: MarginState,
  formData: FormData,
): Promise<MarginState> {
  await requireSuperadmin();

  const parsed = marginSchema.safeParse({
    orgId: formData.get("orgId"),
    marginBps: formData.get("marginBps"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { orgId, marginBps } = parsed.data;
  await prisma.organization.update({
    where: { id: orgId },
    data: { marginBps },
  });

  revalidatePath(`/admin/accounts/${orgId}`);
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Begin "viewing as" a client account: sets the impersonation cookie and
 * sends the superadmin into the client dashboard scoped to that org.
 */
export async function viewAsAction(formData: FormData): Promise<void> {
  await requireSuperadmin();
  const orgId = String(formData.get("orgId") ?? "");
  if (!orgId) return;

  const store = await cookies();
  store.set(IMPERSONATE_COOKIE, orgId, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
  });
  redirect("/dashboard");
}

/**
 * Stop impersonating and return to the back office.
 */
export async function stopViewAsAction(): Promise<void> {
  const store = await cookies();
  store.delete(IMPERSONATE_COOKIE);
  redirect("/admin");
}
