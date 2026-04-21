/*
  Warnings:

  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_messageId_fkey";

-- DropTable
DROP TABLE "Attachment";

-- CreateTable
CREATE TABLE "ProfileBanner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileBanner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileBanner_userId_key" ON "ProfileBanner"("userId");

-- CreateIndex
CREATE INDEX "ProfileBanner_userId_idx" ON "ProfileBanner"("userId");

-- AddForeignKey
ALTER TABLE "ProfileBanner" ADD CONSTRAINT "ProfileBanner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
