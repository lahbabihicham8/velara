import type { Currency, CurrencyCode } from "@/types";

/** The company's reporting / base currency. */
export const BASE_CURRENCY: CurrencyCode = "USD";

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", decimals: 2, locale: "en-US" },
  EUR: { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", decimals: 2, locale: "de-DE" },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", decimals: 2, locale: "en-GB" },
  SAR: { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦", decimals: 2, locale: "ar-SA" },
  AED: { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", decimals: 2, locale: "ar-AE" },
  KWD: { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", flag: "🇰🇼", decimals: 3, locale: "ar-KW" },
  QAR: { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق", flag: "🇶🇦", decimals: 2, locale: "ar-QA" },
};

/**
 * Mid-market reference rates expressed as: 1 USD = X currency.
 * These seed the live FX engine; live ticks oscillate around them.
 */
export const REFERENCE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.924,
  GBP: 0.788,
  SAR: 3.751,
  AED: 3.6725,
  KWD: 0.3072,
  QAR: 3.64,
};

export const CURRENCY_LIST: Currency[] = Object.values(CURRENCIES);
