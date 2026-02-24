-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "image" TEXT,
    "phone" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friends" (
    "first_friend_id" INTEGER NOT NULL,
    "second_friend_id" INTEGER,
    "request_sent" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("first_friend_id")
);

-- CreateTable
CREATE TABLE "decks" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "image" TEXT,
    "body" TEXT,
    "ownerId" INTEGER NOT NULL,
    "status" TEXT,
    "holder_Id" INTEGER,
    "since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "inbox_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("inbox_id")
);

-- CreateTable
CREATE TABLE "inbox" (
    "id" SERIAL NOT NULL,
    "inboxuid" TEXT,
    "last_sent_user_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbox_users" (
    "id" SERIAL NOT NULL,
    "inbox_id" INTEGER,
    "user_id" INTEGER,

    CONSTRAINT "inbox_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_users" (
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER,

    CONSTRAINT "event_users_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "type" TEXT,
    "desc" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entry_cost" INTEGER,
    "status" TEXT,
    "adress_name" TEXT,
    "users" INTEGER,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
