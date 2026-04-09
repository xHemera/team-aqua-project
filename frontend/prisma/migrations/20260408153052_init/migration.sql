/*
  Warnings:

  - You are about to drop the column `friendIds` on the `Friends` table. All the data in the column will be lost.
  - Added the required column `friendId` to the `Friends` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Friends" DROP COLUMN "friendIds",
ADD COLUMN     "friendId" INTEGER NOT NULL;
