/*
  Warnings:

  - Added the required column `xp` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "xp" INTEGER NOT NULL;
