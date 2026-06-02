import type { CurrencyCode } from "@/types";

export interface BeneficiarySeed {
  name: string;
  nickname?: string;
  bankName: string;
  accountNumber: string;
  iban?: string;
  swift: string;
  currency: CurrencyCode;
  country: string;
  countryFlag: string;
}

/** Saved payees used to populate each seeded account's beneficiary book. */
export const BENEFICIARY_SEEDS: BeneficiarySeed[] = [
  {
    name: "Atlas Logistics Ltd",
    nickname: "Atlas freight",
    bankName: "Barclays",
    accountNumber: "•••• 7740",
    iban: "GB29 NWBK 6016 1331 9268 19",
    swift: "BARCGB22",
    currency: "GBP",
    country: "United Kingdom",
    countryFlag: "🇬🇧",
  },
  {
    name: "Nordic Steel AB",
    bankName: "SEB",
    accountNumber: "•••• 1182",
    iban: "SE35 5000 0000 0549 1000 0003",
    swift: "ESSESESS",
    currency: "EUR",
    country: "Sweden",
    countryFlag: "🇪🇺",
  },
  {
    name: "Gulf Trading FZE",
    bankName: "Emirates NBD",
    accountNumber: "•••• 6618",
    swift: "EBILAEAD",
    currency: "AED",
    country: "United Arab Emirates",
    countryFlag: "🇦🇪",
  },
  {
    name: "Riyadh Imports Co",
    bankName: "Al Rajhi Bank",
    accountNumber: "•••• 3052",
    swift: "RJHISARI",
    currency: "SAR",
    country: "Saudi Arabia",
    countryFlag: "🇸🇦",
  },
  {
    name: "Pacific Components Inc",
    nickname: "Pacific parts",
    bankName: "JPMorgan Chase",
    accountNumber: "•••• 4821",
    swift: "CHASUS33",
    currency: "USD",
    country: "United States",
    countryFlag: "🇺🇸",
  },
];
