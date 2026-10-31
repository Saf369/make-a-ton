-- Migration 003: Extend profiles table with department, title, location, timezone, language

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS department TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS title TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC+04:00',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English (United States)';

-- Update trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
BEGIN
  BEGIN
    v_role := (NEW.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'customer'::user_role;
  END;

  INSERT INTO public.profiles (
    id, email, full_name, organization, role, phone, department, title, location, timezone, language, is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'organization', ''),
    COALESCE(v_role, 'customer'::user_role),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    COALESCE(NEW.raw_user_meta_data->>'title', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC+04:00'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'English (United States)'),
    COALESCE((NEW.raw_user_meta_data->>'is_active')::boolean, true)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    organization = CASE WHEN EXCLUDED.organization <> '' THEN EXCLUDED.organization ELSE public.profiles.organization END,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create user_directory view with all fields
DROP VIEW IF EXISTS public.user_directory CASCADE;

CREATE OR REPLACE VIEW public.user_directory AS
  SELECT
    id,
    email,
    full_name,
    organization,
    phone,
    role,
    department,
    title,
    location,
    timezone,
    language,
    is_active,
    created_at,
    updated_at
  FROM public.profiles;
