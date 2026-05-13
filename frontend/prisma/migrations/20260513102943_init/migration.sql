/*
  Warnings:

  - You are about to drop the column `aBoost` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `berserk` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `countering` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `dBoost` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `nturnEffect` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `poisened` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `silenced` on the `Character` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Character" DROP COLUMN "aBoost",
DROP COLUMN "berserk",
DROP COLUMN "countering",
DROP COLUMN "dBoost",
DROP COLUMN "nturnEffect",
DROP COLUMN "poisened",
DROP COLUMN "silenced";
