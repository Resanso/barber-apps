-- Migration: convert timestamptz columns to timestamp without time zone
-- This makes DB store wall-clock times exactly as provided by the client

BEGIN;

ALTER TABLE public.private_items
  ALTER COLUMN service_time TYPE timestamp without time zone USING (service_time AT TIME ZONE 'UTC'),
  ALTER COLUMN eta_start TYPE timestamp without time zone USING (eta_start AT TIME ZONE 'UTC'),
  ALTER COLUMN eta_end TYPE timestamp without time zone USING (eta_end AT TIME ZONE 'UTC');

COMMIT;
