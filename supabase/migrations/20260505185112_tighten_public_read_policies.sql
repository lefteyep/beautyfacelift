-- Avoid redundant policy evaluation for authenticated users.
-- Public read policies only need to apply to anonymous API reads; admin access
-- is already covered by the authenticated admin policies.

DROP POLICY IF EXISTS "Admins can read admin users" ON public.admin_users;

DROP POLICY IF EXISTS "Public can read active services" ON public.services;
CREATE POLICY "Public can read active services"
  ON public.services FOR SELECT
  TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can read active availability" ON public.availability;
CREATE POLICY "Public can read active availability"
  ON public.availability FOR SELECT
  TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can read blocked dates" ON public.blocked_dates;
CREATE POLICY "Public can read blocked dates"
  ON public.blocked_dates FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Public can read settings" ON public.settings;
CREATE POLICY "Public can read settings"
  ON public.settings FOR SELECT
  TO anon
  USING (true);
