-- CreateTable
CREATE TABLE "Match_history" (
    "id" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playedDeck" TEXT NOT NULL,
    "opponentDeck" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,

    CONSTRAINT "Match_history_pkey" PRIMARY KEY ("id")
);
