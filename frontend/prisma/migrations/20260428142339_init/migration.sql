-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "msg_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sizeLabel" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "previewUrl" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_msg_id_fkey" FOREIGN KEY ("msg_id") REFERENCES "Messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
