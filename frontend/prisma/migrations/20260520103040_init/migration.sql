/*
  Warnings:

  - Added the required column `xp` to the `Spell` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Spell" ADD COLUMN     "xp" INTEGER NOT NULL;
