-- Migration: create profiles table, RLS, policies, and trigger for auth.users
-- Generated: 2025-11-20

-- 1. Create table `profiles`
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  phone_number text,
  role text default 'customer', -- 'admin', 'barber', 'customer'
  avatar_url text,
  primary key (id)
);

-- 2. Enable Row Level Security and policies
alter table public.profiles enable row level security;

-- Allow anyone to select public profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Public profiles are viewable by everyone.'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "Public profiles are viewable by everyone."
        ON public.profiles FOR SELECT
        USING ( true );
    $q$;
  END IF;
END$$;

-- Allow users to insert their own profile (id must equal auth.uid())
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert their own profile.'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "Users can insert their own profile."
        ON public.profiles FOR INSERT
        WITH CHECK ( auth.uid() = id );
    $q$;
  END IF;
END$$;

-- Allow users to update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can update own profile.'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "Users can update own profile."
        ON public.profiles FOR UPDATE
        USING ( auth.uid() = id );
    $q$;
  END IF;
END$$;

-- 3. Create trigger function to copy new auth.users entries into profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Copy some basic metadata from auth.users.raw_user_meta_data if present
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Create trigger after insert on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional: ensure owner/permissions for function are sane (depends on Supabase defaults)
