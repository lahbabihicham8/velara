import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getWallets } from "@/data/wallets";
import { getTransactions } from "@/data/transactions";
import { TEAM_MEMBERS } from "@/data/team";
import { CRYPTO_SEEDS } from "@/data/crypto";
import { BENEFICIARY_SEEDS } from "@/data/beneficiaries";
import type { Role } from "@/types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "VelaraPay!2026";
const SALT_ROUNDS = Number.parseInt(process.env.PASSWORD_SALT_ROUNDS ?? "12", 10);

interface SecondaryUser {
  name: string;
  email: string;
  initials: string;
  role: Role;
}

interface OrgSeed {
  name: string;
  marginBps: number;
  /** Scales wallet & crypto balances relative to the primary account. */
  factor: number;
  txCount: number;
  txSeed: number;
  /** When set, use the full TEAM_MEMBERS roster (primary account). */
  primary?: boolean;
  users?: SecondaryUser[];
}

const ORG_SEEDS: OrgSeed[] = [
  {
    name: "Meridian Holdings",
    marginBps: 50,
    factor: 1,
    txCount: 520,
    txSeed: 20260601,
    primary: true,
  },
  {
    name: "Cedar & Co Trading",
    marginBps: 75,
    factor: 0.42,
    txCount: 260,
    txSeed: 7714002,
    users: [
      { name: "James Whitfield", email: "james@cedarco.example", initials: "JW", role: "owner" },
      { name: "Elena Popova", email: "elena@cedarco.example", initials: "EP", role: "treasurer" },
      { name: "Hassan Ali", email: "hassan@cedarco.example", initials: "HA", role: "analyst" },
    ],
  },
  {
    name: "Halcyon Capital",
    marginBps: 30,
    factor: 1.65,
    txCount: 340,
    txSeed: 5521098,
    users: [
      { name: "Sophie Laurent", email: "sophie@halcyon.example", initials: "SL", role: "owner" },
      { name: "Diego Fernández", email: "diego@halcyon.example", initials: "DF", role: "admin" },
      { name: "Mei Chen", email: "mei@halcyon.example", initials: "MC", role: "treasurer" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding VelaraPay database…");

  // Idempotent reset (children first to respect FKs).
  await prisma.session.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.paymentBatch.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.cryptoWallet.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);
  const baseWallets = getWallets();
  let primaryOrgId = "";

  for (const seed of ORG_SEEDS) {
    const org = await prisma.organization.create({
      data: { name: seed.name, baseCurrency: "USD", marginBps: seed.marginBps },
    });
    if (seed.primary) primaryOrgId = org.id;
    console.log(`  • organization: ${org.name} (${seed.marginBps} bps)`);

    // Users
    if (seed.primary) {
      await prisma.user.createMany({
        data: TEAM_MEMBERS.map((m) => ({
          orgId: org.id,
          email: m.email,
          name: m.name,
          initials: m.initials,
          passwordHash,
          role: m.role,
          status: m.status,
          twoFactor: m.twoFactor,
          lastActiveAt: new Date(m.lastActive),
        })),
      });
    } else if (seed.users) {
      await prisma.user.createMany({
        data: seed.users.map((u) => ({
          orgId: org.id,
          email: u.email,
          name: u.name,
          initials: u.initials,
          passwordHash,
          role: u.role,
          status: "active" as const,
          twoFactor: true,
        })),
      });
    }

    // Fiat wallets (scaled)
    await prisma.wallet.createMany({
      data: baseWallets.map((w) => ({
        orgId: org.id,
        currency: w.currency,
        balance: w.balance * seed.factor,
        reserved: w.reserved * seed.factor,
        change24h: w.change24h,
        reference: w.reference,
        isPrimary: w.isPrimary,
      })),
    });

    // Crypto wallets (scaled)
    await prisma.cryptoWallet.createMany({
      data: CRYPTO_SEEDS.map((c) => ({
        orgId: org.id,
        asset: c.asset,
        balance: c.balance * seed.factor,
        change24h: c.change24h,
        address: c.address,
      })),
    });

    // Beneficiaries
    await prisma.beneficiary.createMany({
      data: BENEFICIARY_SEEDS.map((b) => ({
        orgId: org.id,
        name: b.name,
        nickname: b.nickname ?? null,
        bankName: b.bankName,
        accountNumber: b.accountNumber,
        iban: b.iban ?? null,
        swift: b.swift,
        currency: b.currency,
        country: b.country,
        countryFlag: b.countryFlag,
      })),
    });

    // Transaction ledger (12 months, for analytics)
    const transactions = getTransactions(seed.txCount, seed.txSeed, 365);
    await prisma.transaction.createMany({
      data: transactions.map((t) => ({
        orgId: org.id,
        reference: t.reference,
        type: t.type,
        status: t.status,
        counterparty: t.counterparty,
        counterpartyInitials: t.counterpartyInitials,
        amountCurrency: t.amount.currency,
        amountValue: t.amount.amount * seed.factor,
        convertedCurrency: t.converted?.currency ?? null,
        convertedValue: t.converted ? t.converted.amount * seed.factor : null,
        rate: t.rate ?? null,
        fee: t.fee * seed.factor,
        category: t.category,
        countryFlag: t.countryFlag,
        createdAt: new Date(t.createdAt),
      })),
    });
    console.log(
      `    wallets: ${baseWallets.length}  crypto: ${CRYPTO_SEEDS.length}  beneficiaries: ${BENEFICIARY_SEEDS.length}  txns: ${transactions.length}`,
    );
  }

  // Platform back-office operator (sees every account, adjusts margins).
  await prisma.user.create({
    data: {
      orgId: primaryOrgId,
      email: "ops@velarapay.io",
      name: "VelaraPay Ops",
      initials: "VO",
      passwordHash,
      role: "owner",
      isSuperadmin: true,
      status: "active",
      twoFactor: true,
    },
  });

  console.log("\n✅ Seed complete.");
  console.log("──────────────────────────────────────────");
  console.log("  Demo logins (all share this password):");
  console.log(`  Password:   ${SEED_PASSWORD}`);
  console.log(`  Client:     ${TEAM_MEMBERS[0].email}  (Owner · Meridian)`);
  console.log("  Back office: ops@velarapay.io  (Superadmin)");
  console.log("──────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
