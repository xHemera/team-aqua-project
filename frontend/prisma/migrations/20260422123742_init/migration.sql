-- AlterTable
ALTER TABLE "Inbox" ADD COLUMN     "report_id" TEXT;

-- CreateTable
CREATE TABLE "Reported_Conv" (
    "id" TEXT NOT NULL,
    "inboxId" TEXT NOT NULL,
    "reportedPlayerId" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reported_Conv_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reported_Conv_inboxId_key" ON "Reported_Conv"("inboxId");

-- AddForeignKey
ALTER TABLE "Reported_Conv" ADD CONSTRAINT "Reported_Conv_inboxId_fkey" FOREIGN KEY ("inboxId") REFERENCES "Inbox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
