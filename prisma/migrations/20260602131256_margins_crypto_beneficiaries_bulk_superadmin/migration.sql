-- CreateEnum
CREATE TYPE "CryptoAsset" AS ENUM ('BTC', 'ETH', 'USDT', 'USDC');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('draft', 'processing', 'completed', 'failed');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "marginBps" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "beneficiaryId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSuperadmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CryptoWallet" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "asset" "CryptoAsset" NOT NULL,
    "balance" DECIMAL(36,8) NOT NULL,
    "change24h" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CryptoWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "iban" TEXT,
    "swift" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "country" TEXT NOT NULL,
    "countryFlag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentBatch" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'processing',
    "totalCount" INTEGER NOT NULL,
    "totalValue" DECIMAL(24,4) NOT NULL,
    "baseCurrency" "Currency" NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "PaymentBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CryptoWallet_orgId_idx" ON "CryptoWallet"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "CryptoWallet_orgId_asset_key" ON "CryptoWallet"("orgId", "asset");

-- CreateIndex
CREATE INDEX "Beneficiary_orgId_idx" ON "Beneficiary"("orgId");

-- CreateIndex
CREATE INDEX "PaymentBatch_orgId_createdAt_idx" ON "PaymentBatch"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_batchId_idx" ON "Transaction"("batchId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "PaymentBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CryptoWallet" ADD CONSTRAINT "CryptoWallet_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentBatch" ADD CONSTRAINT "PaymentBatch_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
