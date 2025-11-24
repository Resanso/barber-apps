-- Migration: add status column to private_items
ALTER TABLE public.private_items
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'at queue';

-- Optional: add constraint to allow only two values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'private_items_status_type'
    ) THEN
        CREATE TYPE private_items_status_type AS ENUM ('at served', 'at queue');
        ALTER TABLE public.private_items ALTER COLUMN status TYPE private_items_status_type USING status::private_items_status_type;
    END IF;
EXCEPTION WHEN undefined_function THEN
    -- ignore
END$$;
