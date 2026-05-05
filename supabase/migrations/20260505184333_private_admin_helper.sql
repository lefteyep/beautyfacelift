-- Move the admin helper out of the exposed public schema so it cannot be
-- called through PostgREST RPC while remaining usable by RLS policies.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins can read admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;

CREATE POLICY "Admins can read admin users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "Admins can manage admin users"
  ON public.admin_users FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Admins can manage availability" ON public.availability;
CREATE POLICY "Admins can manage availability"
  ON public.availability FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Admins can manage blocked dates" ON public.blocked_dates;
CREATE POLICY "Admins can manage blocked dates"
  ON public.blocked_dates FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
CREATE POLICY "Admins can manage bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

DROP FUNCTION IF EXISTS public.is_admin();
