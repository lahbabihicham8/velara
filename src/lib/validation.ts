import { z } from "zod";
import { CURRENCY_CODES } from "@/types";
import { MAX_MARGIN_BPS, MIN_MARGIN_BPS } from "@/lib/margin";

/**
 * Login form validation schema (shared by the server action).
 */
export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").max(254),
  password: z.string().min(1, "Password is required.").max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

const currencyEnum = z.enum(CURRENCY_CODES);

/** New beneficiary (payee) validation. */
export const beneficiarySchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(120),
  nickname: z.string().trim().max(60).optional().or(z.literal("")),
  bankName: z.string().trim().min(2, "Bank name is required.").max(120),
  accountNumber: z.string().trim().min(4, "Account number is required.").max(40),
  iban: z.string().trim().max(40).optional().or(z.literal("")),
  swift: z.string().trim().min(6, "SWIFT/BIC is required.").max(11),
  currency: currencyEnum,
  country: z.string().trim().min(2, "Country is required.").max(60),
});

export type BeneficiaryInput = z.infer<typeof beneficiarySchema>;

/** A single bulk-payment CSV row. */
export const bulkRowSchema = z.object({
  beneficiary: z.string().trim().min(1, "Beneficiary is required.").max(120),
  currency: currencyEnum,
  amount: z.number().positive("Amount must be positive.").max(1_000_000_000),
  reference: z.string().trim().max(140).default(""),
});

/** The full bulk-payment submission payload. */
export const bulkPayloadSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  rows: z.array(bulkRowSchema).min(1, "At least one row is required.").max(5000),
});

export type BulkPayload = z.infer<typeof bulkPayloadSchema>;

/** Back-office margin adjustment. */
export const marginSchema = z.object({
  orgId: z.string().min(1),
  marginBps: z.coerce
    .number()
    .int()
    .min(MIN_MARGIN_BPS, `Minimum is ${MIN_MARGIN_BPS} bps.`)
    .max(MAX_MARGIN_BPS, `Maximum is ${MAX_MARGIN_BPS} bps.`),
});
