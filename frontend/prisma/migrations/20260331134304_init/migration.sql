/*
  Warnings:

  - Made the column `unread_messages` on table `Inbox_users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Inbox_users" ALTER COLUMN "unread_messages" SET NOT NULL;
