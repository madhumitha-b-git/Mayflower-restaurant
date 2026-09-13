-- Migration: Create user_profiles table for customer loyalty, authentication, & state persistence
-- File: supabase/migrations/20260913000009_create_user_profiles_table.sql

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT DEFAULT 'Customer',
  reward_points INT DEFAULT 200,
  tier TEXT DEFAULT 'Green',
  total_visits INT DEFAULT 0,
  joined_date TEXT,
  transactions JSONB DEFAULT '[]'::jsonb,
  reservations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read on user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow public write on user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow public update on user_profiles" ON public.user_profiles;

-- Create permissive RLS policies for application access
CREATE POLICY "Allow public read on user_profiles"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow public write on user_profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on user_profiles"
  ON public.user_profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);
