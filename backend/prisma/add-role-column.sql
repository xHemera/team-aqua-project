-- Add role column to user table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE "user" ADD COLUMN role VARCHAR(50) DEFAULT 'user';
        RAISE NOTICE 'Column role added to user table';
    ELSE
        RAISE NOTICE 'Column role already exists in user table';
    END IF;
END $$;
