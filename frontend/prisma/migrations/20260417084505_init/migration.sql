/*
  Warnings:

  - You are about to drop the `Cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Decks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cards" DROP CONSTRAINT "Cards_deckId_fkey";

-- DropForeignKey
ALTER TABLE "Decks" DROP CONSTRAINT "Decks_userId_fkey";

-- DropTable
DROP TABLE "Cards";

-- DropTable
DROP TABLE "Decks";
