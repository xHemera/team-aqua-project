/*
  Warnings:

  - The primary key for the `Friends` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_pkey",
ADD CONSTRAINT "Friends_pkey" PRIMARY KEY ("friendId");
