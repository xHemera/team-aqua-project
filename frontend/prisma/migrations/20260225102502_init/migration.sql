-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "image" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friends" (
    "first_friend_id" INTEGER NOT NULL,
    "second_friend_id" INTEGER,
    "request_sent" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friends_pkey" PRIMARY KEY ("first_friend_id")
);

-- CreateTable
CREATE TABLE "Decks" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "image" TEXT,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "Decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cards" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "element" TEXT,
    "hp" INTEGER,
    "name" TEXT NOT NULL,
    "cap1" TEXT,
    "cap2" TEXT,
    "prize" INTEGER,
    "retreat" INTEGER,
    "weakness" TEXT,
    "resist" TEXT,
    "deckId" INTEGER,

    CONSTRAINT "Cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "inbox_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("inbox_id")
);

-- CreateTable
CREATE TABLE "Inbox" (
    "id" SERIAL NOT NULL,
    "inboxuid" TEXT,
    "last_sent_user_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inbox_users" (
    "id" SERIAL NOT NULL,
    "inbox_id" INTEGER,
    "user_id" INTEGER,

    CONSTRAINT "Inbox_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- AddForeignKey
ALTER TABLE "Decks" ADD CONSTRAINT "Decks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cards" ADD CONSTRAINT "Cards_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Decks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
