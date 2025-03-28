-- AlterTable
ALTER TABLE "Usage" ALTER COLUMN "inputTokens" SET DEFAULT 0,
ALTER COLUMN "outputTokens" SET DEFAULT 0,
ALTER COLUMN "totalTokens" SET DEFAULT 0,
ALTER COLUMN "cost" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Usage_createdAt_idx" ON "Usage"("createdAt");
