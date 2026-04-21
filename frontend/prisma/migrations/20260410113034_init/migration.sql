/*
  Warnings:

  - Made the column `title` on table `Decks` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `user_id` to the `Match_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Decks" ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "Match_history" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Match_history" ADD CONSTRAINT "Match_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
