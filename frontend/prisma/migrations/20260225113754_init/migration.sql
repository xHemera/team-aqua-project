/*
  Warnings:

  - The primary key for the `Friends` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `first_friend_id` on the `Friends` table. All the data in the column will be lost.
  - You are about to drop the column `second_friend_id` on the `Friends` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Friends` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_sent_user_id` to the `Inbox` table without a default value. This is not possible if the table is not empty.
  - Made the column `inbox_id` on table `Inbox_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `Inbox_users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_pkey",
DROP COLUMN "first_friend_id",
DROP COLUMN "second_friend_id",
ADD COLUMN     "friendIds" INTEGER[],
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Friends_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "Inbox" ADD COLUMN     "last_message" TEXT,
DROP COLUMN "last_sent_user_id",
ADD COLUMN     "last_sent_user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Inbox_users" ALTER COLUMN "inbox_id" SET NOT NULL,
ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_inbox_id_fkey" FOREIGN KEY ("inbox_id") REFERENCES "Inbox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox" ADD CONSTRAINT "Inbox_last_sent_user_id_fkey" FOREIGN KEY ("last_sent_user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox_users" ADD CONSTRAINT "Inbox_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox_users" ADD CONSTRAINT "Inbox_users_inbox_id_fkey" FOREIGN KEY ("inbox_id") REFERENCES "Inbox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
