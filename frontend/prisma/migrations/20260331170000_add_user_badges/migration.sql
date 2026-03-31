-- Add badges column to User
ALTER TABLE "user"
ADD COLUMN "badges" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
