/*
  Warnings:

  - You are about to drop the column `reportedPlayerId` on the `Reported_Conv` table. All the data in the column will be lost.
  - Added the required column `reportedUser` to the `Reported_Conv` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reported_Conv" DROP COLUMN "reportedPlayerId",
ADD COLUMN     "reportedUser" TEXT NOT NULL;
