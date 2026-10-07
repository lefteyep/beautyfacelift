-- Beauty Face Lift — Initial Database Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor)

-- ============================================
-- TABLES
-- ============================================

-- Services (treatments offered)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  price_chf DECIMAL(10,2) NOT NULL,
  deposit_chf DECIMAL(10,2) DEFAULT 0,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Availability (working hours per day of week)
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL,  -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Blocked dates (holidays, vacations, sick days)
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending | confirmed | cancelled | completed
  deposit_paid BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  stripe_payment_id TEXT,
  notes TEXT,
  utm_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Settings (business configuration)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date_time ON bookings(booking_date, booking_time);
CREATE INDEX idx_services_active ON services(is_active);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active services"
  ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to services"
  ON services FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active availability"
  ON availability FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to availability"
  ON availability FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read blocked dates"
  ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "Admin full access to blocked dates"
  ON blocked_dates FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can create bookings"
  ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to bookings"
  ON bookings FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read settings"
  ON settings FOR SELECT USING (true);
CREATE POLICY "Admin full access to settings"
  ON settings FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA: Services
-- ============================================

INSERT INTO services (name, slug, description, duration_minutes, price_chf, deposit_chf, category, sort_order) VALUES
  ('Aquafacial Signature', 'aquafacial-signature', 'Tiefenreinigung, Vitalisierung und Glow mit patentierter Vortex-Technologie.', 60, 250.00, 50.00, 'Aquafacial', 1),
  ('Aquafacial Platinum', 'aquafacial-platinum', 'Premium Aquafacial mit zusätzlichen Anti-Aging Seren und LED-Lichttherapie.', 90, 380.00, 80.00, 'Aquafacial', 2),
  ('Microneedling Gesicht', 'microneedling-gesicht', 'Kollagenstimulation und Hautverjüngung für das Gesicht.', 60, 290.00, 60.00, 'Microneedling', 3),
  ('Microneedling Gesicht + Hals', 'microneedling-gesicht-hals', 'Erweiterte Microneedling Behandlung für Gesicht und Hals.', 75, 350.00, 70.00, 'Microneedling', 4),
  ('Fruchtsäure Peeling', 'fruchtsaeure-peeling', 'Intensive Hauterneuerung mit AHA-Säuren für einen klaren Teint.', 45, 180.00, 0, 'Peeling', 5),
  ('ColdPlasma Behandlung', 'coldplasma', 'Innovative Plasma-Technologie zur Zellerneuerung und Wirkstoffeinschleusung.', 60, 320.00, 60.00, 'ColdPlasma', 6);

-- SEED DATA: Availability (Mon-Fri 09:00-18:00, Sat 10:00-16:00)
INSERT INTO availability (day_of_week, start_time, end_time, is_active) VALUES
  (1, '09:00', '18:00', true),  -- Monday
  (2, '09:00', '18:00', true),  -- Tuesday
  (3, '09:00', '18:00', true),  -- Wednesday
  (4, '09:00', '18:00', true),  -- Thursday
  (5, '09:00', '18:00', true),  -- Friday
  (6, '10:00', '16:00', true),  -- Saturday
  (0, '00:00', '00:00', false); -- Sunday (closed)

-- SEED DATA: Settings
INSERT INTO settings (key, value) VALUES
  ('slot_interval_minutes', '30'),
  ('booking_buffer_minutes', '15');
