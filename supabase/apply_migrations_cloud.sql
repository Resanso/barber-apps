-- Combined migrations for Profiles and Bookings
-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- This will create `public.profiles`, `public.bookings`, related policies and triggers.
-- Review before running and run as a project admin.

-- Ensure pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1. Create table `profiles`
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  phone_number text,
  role text default 'customer',
  avatar_url text,
  primary key (id)
);

alter table public.profiles enable row level security;

-- Allow anyone to select public profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

-- Allow users to insert their own profile (id must equal auth.uid())
drop policy if exists "Users can insert their own profile." on public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- Allow users to update their own profile
drop policy if exists "Users can update own profile." on public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 2. Trigger function to copy new auth.users entries into profiles
-- 2. Trigger function to copy new auth.users entries into profiles
-- Add a small errors table to capture issues during profile creation
create table if not exists public.auth_user_creation_errors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  error_message text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Try to insert a profile derived from auth.user metadata.
  -- Support multiple metadata field names to be robust across Supabase versions.
  begin
    insert into public.profiles (id, full_name, avatar_url)
    values (
      new.id,
      coalesce(
        (new.raw_user_meta_data->>'full_name')::text,
        (new.user_metadata->>'full_name')::text,
        (new.raw_user_meta_data->>'fullName')::text
      ),
      coalesce(
        (new.raw_user_meta_data->>'avatar_url')::text,
        (new.user_metadata->>'avatar_url')::text,
        (new.raw_user_meta_data->>'avatarUrl')::text
      )
    )
    on conflict (id) do nothing;
  exception when others then
    -- Capture the error but do not abort the auth.user insert
    begin
      insert into public.auth_user_creation_errors(user_id, error_message, payload)
      values (new.id, sqlerrm, to_jsonb(new));
    exception when others then
      -- best-effort logging; swallow to avoid failing the parent transaction
      null;
    end;
  end;

  return new;
end;
$$;

-- Create trigger after insert on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Create bookings table
create table if not exists public.bookings (
  id uuid not null default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  barber_id uuid references public.profiles(id) on delete set null,
  service text,
  start_time timestamptz not null,
  end_time timestamptz,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

create index if not exists idx_bookings_barber_start on public.bookings(barber_id, start_time);
-- Ensure critical columns exist (safe when re-running migrations)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_id uuid;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS barber_id uuid;

-- Ensure foreign key constraints exist (added via conditional DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE t.relname = 'bookings' AND a.attname = 'customer_id' AND c.contype = 'f'
  ) THEN
    ALTER TABLE public.bookings ADD CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE t.relname = 'bookings' AND a.attname = 'barber_id' AND c.contype = 'f'
  ) THEN
    ALTER TABLE public.bookings ADD CONSTRAINT fk_bookings_barber FOREIGN KEY (barber_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END
$$;

create index if not exists idx_bookings_barber_start on public.bookings(barber_id, start_time);
create index if not exists idx_bookings_customer_start on public.bookings(customer_id, start_time);

alter table public.bookings enable row level security;

-- Select policy: allow customer (owner) or barber assigned or admin to view
drop policy if exists "Bookings: allow select to involved users and admins" on public.bookings;
CREATE POLICY "Bookings: allow select to involved users and admins"
  ON public.bookings FOR SELECT
  USING (
    customer_id = auth.uid()
    OR barber_id = auth.uid()
    OR exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "Bookings: users can insert their own bookings" on public.bookings;
CREATE POLICY "Bookings: users can insert their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK ( customer_id = auth.uid() );

drop policy if exists "Bookings: update by owner or barber/admin" on public.bookings;
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

drop policy if exists "Bookings: delete by admin only" on public.bookings;
CREATE POLICY "Bookings: delete by admin only"
  ON public.bookings FOR DELETE
  USING ( exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );

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

-- End of migrations
