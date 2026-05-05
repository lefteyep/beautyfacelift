-- Beauty Face Lift - security hardening
-- Dashboard-friendly version: no DO $$ blocks.
-- Apply after 001_initial_schema.sql and 002_carbon_microneedling.sql.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================
-- ADMIN ALLOWLIST
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS '
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  )
';

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

DROP POLICY IF EXISTS "Admins can read admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;

CREATE POLICY "Admins can read admin users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage admin users"
  ON public.admin_users FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMENT ON TABLE public.admin_users IS
  'Allowlist for Supabase Auth users permitted to access the admin dashboard.';

-- ============================================
-- RLS POLICY HARDENING
-- ============================================

DROP POLICY IF EXISTS "Admin full access to services" ON public.services;
DROP POLICY IF EXISTS "Admin full access to availability" ON public.availability;
DROP POLICY IF EXISTS "Admin full access to blocked dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin full access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin full access to settings" ON public.settings;

DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
DROP POLICY IF EXISTS "Admins can manage availability" ON public.availability;
DROP POLICY IF EXISTS "Admins can manage blocked dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage availability"
  ON public.availability FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage blocked dates"
  ON public.blocked_dates FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- BOOKING INTEGRITY
-- ============================================

UPDATE public.bookings
SET status = 'pending'
WHERE status IS NULL;

ALTER TABLE public.bookings
  ALTER COLUMN service_id SET NOT NULL;

ALTER TABLE public.bookings
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_time_order_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_time_order_check
  CHECK (booking_time < end_time);

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_customer_fields_length_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_customer_fields_length_check
  CHECK (
    char_length(customer_name) BETWEEN 2 AND 120
    AND char_length(customer_email) BETWEEN 3 AND 254
    AND char_length(customer_phone) BETWEEN 8 AND 32
    AND (notes IS NULL OR char_length(notes) <= 1000)
  );

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_deposit_amount_check;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_deposit_amount_check
  CHECK (deposit_amount >= 0);

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_active_slot_overlap_excl;

ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_active_slot_overlap_excl
  EXCLUDE USING gist (
    (
      tsrange(
        (booking_date + booking_time) - INTERVAL '15 minutes',
        (booking_date + end_time) + INTERVAL '15 minutes',
        '[)'
      )
    ) WITH &&
  )
  WHERE (status IN ('pending', 'confirmed'));

CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_customer_email_slot_idx
  ON public.bookings (service_id, booking_date, booking_time, lower(customer_email))
  WHERE status IN ('pending', 'confirmed');

CREATE UNIQUE INDEX IF NOT EXISTS bookings_active_customer_phone_slot_idx
  ON public.bookings (service_id, booking_date, booking_time, customer_phone)
  WHERE status IN ('pending', 'confirmed');

-- Run admin seeding separately after this migration:
-- INSERT INTO public.admin_users (user_id, note)
-- VALUES ('<owner auth.users.id>', 'Current admin')
-- ON CONFLICT (user_id) DO UPDATE SET note = EXCLUDED.note;
