/*
  Warnings:

  - Added the required column `blocked` to the `Friends` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Friends" ADD COLUMN     "blocked" BOOLEAN NOT NULL,
ALTER COLUMN "friendId" SET DATA TYPE TEXT;
