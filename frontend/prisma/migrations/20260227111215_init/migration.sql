/*
  Warnings:

  - The primary key for the `Cards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Decks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Friends` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Inbox` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Inbox_users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id` to the `Messages` table without a default value. This is not possible if the table is not empty.
  - Made the column `user_id` on table `Messages` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Cards" DROP CONSTRAINT "Cards_deckId_fkey";

-- DropForeignKey
ALTER TABLE "Decks" DROP CONSTRAINT "Decks_userId_fkey";

-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_userId_fkey";

-- DropForeignKey
ALTER TABLE "Inbox" DROP CONSTRAINT "Inbox_last_sent_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Inbox_users" DROP CONSTRAINT "Inbox_users_inbox_id_fkey";

-- DropForeignKey
ALTER TABLE "Inbox_users" DROP CONSTRAINT "Inbox_users_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_inbox_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_user_id_fkey";

-- AlterTable
ALTER TABLE "Cards" DROP CONSTRAINT "Cards_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "deckId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Cards_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Cards_id_seq";

-- AlterTable
ALTER TABLE "Decks" DROP CONSTRAINT "Decks_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Decks_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Decks_id_seq";

-- AlterTable
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Friends_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "Inbox" DROP CONSTRAINT "Inbox_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "last_sent_user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Inbox_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Inbox_id_seq";

-- AlterTable
ALTER TABLE "Inbox_users" DROP CONSTRAINT "Inbox_users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "inbox_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Inbox_users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Inbox_users_id_seq";

-- AlterTable
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "inbox_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Messages_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decks" ADD CONSTRAINT "Decks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cards" ADD CONSTRAINT "Cards_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Decks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_inbox_id_fkey" FOREIGN KEY ("inbox_id") REFERENCES "Inbox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox" ADD CONSTRAINT "Inbox_last_sent_user_id_fkey" FOREIGN KEY ("last_sent_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox_users" ADD CONSTRAINT "Inbox_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox_users" ADD CONSTRAINT "Inbox_users_inbox_id_fkey" FOREIGN KEY ("inbox_id") REFERENCES "Inbox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
