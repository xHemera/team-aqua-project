/*
  Warnings:

  - You are about to drop the column `opponentDeck` on the `Match_history` table. All the data in the column will be lost.
  - You are about to drop the column `playedDeck` on the `Match_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match_history" DROP COLUMN "opponentDeck",
DROP COLUMN "playedDeck",
ADD COLUMN     "opponentTeam" TEXT[],
ADD COLUMN     "playerTeam" TEXT[];
