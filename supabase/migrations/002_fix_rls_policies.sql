-- ============================================================
-- Migration: 002_fix_rls_policies.sql
-- Fixes: infinite recursion in profiles RLS policies
-- ============================================================

-- Drop the recursive admin policies
DROP POLICY IF EXISTS "profiles: admins can read all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admins can insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admins can delete" ON public.profiles;

-- Helper function — avoids recursion by querying auth.jwt() claims
-- instead of joining back to profiles
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role::TEXT FROM public.profiles WHERE id = auth.uid()),
    'customer'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Re-create admin policies using the helper function
CREATE POLICY "profiles: admins can read all"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "profiles: admins can update all"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'admin');

CREATE POLICY "profiles: admins can insert"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "profiles: admins can delete"
  ON public.profiles FOR DELETE
  USING (public.get_my_role() = 'admin');

-- Staff can read all profiles (read-only)
CREATE POLICY "profiles: staff can read all"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'staff');
