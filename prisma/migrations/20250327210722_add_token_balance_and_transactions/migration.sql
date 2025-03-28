/*
  Warnings:

  - Changed the type of `messages` on the `Chat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userId_fkey";

-- DropForeignKey
ALTER TABLE "Usage" DROP CONSTRAINT "Usage_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Usage" DROP CONSTRAINT "Usage_userId_fkey";

-- First, create a temporary column to store the messages
ALTER TABLE "Chat" ADD COLUMN "messages_temp" JSONB;

-- Copy the data from the old column to the new one, converting the array to a single JSONB object
UPDATE "Chat" SET "messages_temp" = jsonb_build_array(messages);

-- Drop the old column
ALTER TABLE "Chat" DROP COLUMN "messages";

-- Rename the temporary column to the original name
ALTER TABLE "Chat" RENAME COLUMN "messages_temp" TO "messages";

-- Add tokenBalance to User table
ALTER TABLE "User" ADD COLUMN "tokenBalance" INTEGER NOT NULL DEFAULT 0;

-- Create Transaction table
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update Usage table
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Usage" ALTER COLUMN "chatId" DROP NOT NULL;
