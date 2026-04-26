-- ==========================================
-- BursaMind Full Supabase Setup SQL
-- ==========================================
-- This file contains all tables, triggers, and RLS policies 
-- required for a fresh BursaMind project.
--
-- IMPORTANT:
-- These policies are simplified for MVP/demo purposes.
-- Production environments should use stricter role-based RLS:
-- 1. Restrict municipality updates to municipality role profiles only.
-- 2. Municipality staff registration should require admin approval in production.
-- 3. Storage bucket 'report-images' must be created manually in Supabase Storage.
-- ==========================================

-- 0. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('citizen', 'municipality')),
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  latitude double precision,
  longitude double precision,
  category text NOT NULL,
  department text NOT NULL,
  risk_score integer NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'rejected')),
  ai_summary text NOT NULL,
  recommended_action text NOT NULL,
  municipality_response text,
  response_updated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Update Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  return new;
END;
$$ LANGUAGE plpgsql;

-- 4. Apply Triggers
DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;
CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_report_update ON public.reports;
CREATE TRIGGER on_report_update
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 6. Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 7. Reports RLS Policies
DROP POLICY IF EXISTS "Anyone can view reports for MVP" ON public.reports;
CREATE POLICY "Anyone can view reports for MVP" ON public.reports
  FOR SELECT USING (true); -- Allows anon and authenticated users to see map/dashboard markers

DROP POLICY IF EXISTS "Authenticated users can insert reports" ON public.reports;
CREATE POLICY "Authenticated users can insert reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Authenticated users can update reports" ON public.reports;
CREATE POLICY "Authenticated users can update reports" ON public.reports
  FOR UPDATE TO authenticated USING (true); -- Simplified for MVP municipality/owner updates

-- 8. Storage Policy (report-images bucket)
-- NOTE: Create the 'report-images' bucket manually in Supabase Dashboard first.
-- Enable 'Public' access for the bucket for simple demo image display.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public select for report-images" ON storage.objects;
CREATE POLICY "Public select for report-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-images');

DROP POLICY IF EXISTS "Authenticated insert for report-images" ON storage.objects;
CREATE POLICY "Authenticated insert for report-images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'report-images');

DROP POLICY IF EXISTS "Authenticated update/delete for report-images" ON storage.objects;
CREATE POLICY "Authenticated update/delete for report-images" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'report-images');
