-- Adds the Carbon Microneedling service used by /lp/carbon-microneedling/.
-- Meta lead campaign promo: CHF 160 instead of CHF 220 (27% discount) for new customers.
-- The LP references services.category='Carbon Microneedling' — keep the value stable so
-- BookingWidget's `preselectedCategory` can auto-advance past the treatment step.

INSERT INTO services (name, slug, description, duration_minutes, price_chf, deposit_chf, category, sort_order, is_active)
VALUES (
  'Carbon Microneedling',
  'carbon-microneedling',
  'Carbon-Peeling + Microneedling + Hyaluron-Infusion in einer 90-minuetigen Sitzung. Glow-Up-Methode Zuerich.',
  90,
  160.00,
  30.00,
  'Carbon Microneedling',
  7,
  true
)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      duration_minutes = EXCLUDED.duration_minutes,
      price_chf = EXCLUDED.price_chf,
      deposit_chf = EXCLUDED.deposit_chf,
      category = EXCLUDED.category,
      sort_order = EXCLUDED.sort_order,
      is_active = EXCLUDED.is_active;
