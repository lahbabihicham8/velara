import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getWallets } from "@/data/wallets";
import { getTransactions } from "@/data/transactions";
import { TEAM_MEMBERS } from "@/data/team";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "NexaPay!2026";
const SALT_ROUNDS = Number.parseInt(process.env.PASSWORD_SALT_ROUNDS ?? "12", 10);

async function main() {
  console.log("🌱 Seeding NexaPay database…");

  // Idempotent reset (respects FK order via cascades, but explicit is safer).
  await prisma.session.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: { name: "Meridian Holdings", baseCurrency: "USD" },
  });
  console.log(`  • organization: ${org.name}`);

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

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
  console.log(`  • users: ${TEAM_MEMBERS.length}`);

  const wallets = getWallets();
  await prisma.wallet.createMany({
    data: wallets.map((w) => ({
      orgId: org.id,
      currency: w.currency,
      balance: w.balance,
      reserved: w.reserved,
      change24h: w.change24h,
      reference: w.reference,
      isPrimary: w.isPrimary,
    })),
  });
  console.log(`  • wallets: ${wallets.length}`);

  // Rich 12-month ledger so analytics (cash flow / volume) are populated.
  const transactions = getTransactions(520, 20260601, 365);
  await prisma.transaction.createMany({
    data: transactions.map((t) => ({
      orgId: org.id,
      reference: t.reference,
      type: t.type,
      status: t.status,
      counterparty: t.counterparty,
      counterpartyInitials: t.counterpartyInitials,
      amountCurrency: t.amount.currency,
      amountValue: t.amount.amount,
      convertedCurrency: t.converted?.currency ?? null,
      convertedValue: t.converted?.amount ?? null,
      rate: t.rate ?? null,
      fee: t.fee,
      category: t.category,
      countryFlag: t.countryFlag,
      createdAt: new Date(t.createdAt),
    })),
  });
  console.log(`  • transactions: ${transactions.length}`);

  console.log("\n✅ Seed complete.");
  console.log("──────────────────────────────────────────");
  console.log("  Demo login (all users share this password):");
  console.log(`  Email:    ${TEAM_MEMBERS[0].email}  (Owner)`);
  console.log(`  Password: ${SEED_PASSWORD}`);
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
