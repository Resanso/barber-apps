-- Migration: create bookings table with relations to profiles and RLS policies
-- Generated: 2025-11-20

-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1. Create bookings table
create table if not exists public.bookings (
  id uuid not null default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  barber_id uuid references public.profiles(id) on delete set null,
  service text,
  start_time timestamptz not null,
  end_time timestamptz,
  status text not null default 'pending', -- pending, confirmed, cancelled, completed
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

-- Index to speed up queries by barber and start_time
create index if not exists idx_bookings_barber_start on public.bookings(barber_id, start_time);
create index if not exists idx_bookings_customer_start on public.bookings(customer_id, start_time);

-- 2. Enable Row Level Security
alter table public.bookings enable row level security;

-- Helper: check if current user is barber or admin
-- We'll use an EXISTS(...) check against public.profiles

-- Select policy: allow customer (owner) or barber assigned or admin to view
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Bookings: allow select to involved users and admins'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "Bookings: allow select to involved users and admins"
        ON public.bookings FOR SELECT
        USING (
          customer_id = auth.uid()
          OR barber_id = auth.uid()
          OR exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
        );
    $q$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Bookings: users can insert their own bookings'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "Bookings: users can insert their own bookings"
        ON public.bookings FOR INSERT
        WITH CHECK ( customer_id = auth.uid() );
    $q$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Bookings: update by owner or barber/admin'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "Bookings: update by owner or barber/admin"
        ON public.bookings FOR UPDATE
        USING (
          customer_id = auth.uid()
          OR barber_id = auth.uid()
          OR exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
        )
        WITH CHECK (
          (customer_id = auth.uid())
          OR (barber_id = auth.uid())
          OR exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
        );
    $q$;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Bookings: delete by admin only'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "Bookings: delete by admin only"
        ON public.bookings FOR DELETE
        USING ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );
    $q$;
  END IF;
END$$;

-- Trigger to update `updated_at` timestamp on modifications
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_bookings_set_updated_at on public.bookings;
create trigger trg_bookings_set_updated_at
  before update on public.bookings
  for each row execute procedure public.set_updated_at();
