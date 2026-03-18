/*
  Warnings:

  - You are about to drop the column `inboxuid` on the `Inbox` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Inbox" DROP CONSTRAINT "Inbox_last_sent_user_id_fkey";

-- AlterTable
ALTER TABLE "Avatar" ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "accent" DROP DEFAULT,
ALTER COLUMN "accentHover" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Inbox" DROP COLUMN "inboxuid",
ALTER COLUMN "last_sent_user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Inbox_users" ADD COLUMN     "unread_messages" INTEGER;

-- AddForeignKey
ALTER TABLE "Inbox" ADD CONSTRAINT "Inbox_last_sent_user_id_fkey" FOREIGN KEY ("last_sent_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
