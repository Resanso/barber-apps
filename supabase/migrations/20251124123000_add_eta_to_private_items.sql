-- Migration: add eta_start and eta_end timestamp columns to private_items
ALTER TABLE public.private_items
ADD COLUMN IF NOT EXISTS eta_start timestamptz NULL,
ADD COLUMN IF NOT EXISTS eta_end timestamptz NULL;

-- Ensure existing rows have NULLs (safe no-op if already null)
UPDATE public.private_items
SET eta_start = NULL
WHERE eta_start IS NULL;

UPDATE public.private_items
SET eta_end = NULL
WHERE eta_end IS NULL;
