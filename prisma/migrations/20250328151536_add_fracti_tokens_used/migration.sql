/*
  Warnings:

  - You are about to drop the column `timestamp` on the `Usage` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Usage` table without a default value. This is not possible if the table is not empty.
  - Made the column `chatId` on table `Usage` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Usage" DROP CONSTRAINT "Usage_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Usage" DROP CONSTRAINT "Usage_userId_fkey";

-- AlterTable
ALTER TABLE "Usage" DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "chatId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Usage_userId_idx" ON "Usage"("userId");

-- CreateIndex
CREATE INDEX "Usage_chatId_idx" ON "Usage"("chatId");

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
