-- ============================================================
-- SatyaLens (SATYAAA) Supabase Database Schema & Initial Seed
-- Copy & Run this SQL script in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  is_verified INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow anon & authenticated read/write for service API
CREATE POLICY "Allow public select on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on users" ON public.users FOR DELETE USING (true);

-- 2. Seed Default Accounts
INSERT INTO public.users (id, name, email, password_hash, role, is_verified, created_at)
VALUES 
  ('usr_admin_01', 'SatyaLens Admin', 'admin@satyalens.gov.np', '$2a$10$w8T.N0Gv.cO4.Z4YJ8... (SatyaAdmin@2026)', 'admin', 1, NOW()),
  ('usr_sample_01', 'Satya Verified User', 'satya@example.com', '$2a$10$e8T... (Satya@123)', 'user', 1, NOW())
ON CONFLICT (email) DO NOTHING;

-- 3. Create Digital Forensic Verifications Log Table
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  media_target TEXT NOT NULL,
  category TEXT NOT NULL,
  verdict TEXT NOT NULL,
  confidence_score INT DEFAULT 96,
  primary_evidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert/select on verifications" ON public.verifications FOR ALL USING (true);
