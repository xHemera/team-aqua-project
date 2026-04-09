/*
  Warnings:

  - You are about to drop the column `blocked` on the `Friends` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Friends" DROP COLUMN "blocked";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "blockedUsers" TEXT[];
