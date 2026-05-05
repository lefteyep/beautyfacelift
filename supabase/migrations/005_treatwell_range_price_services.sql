-- Adds the two official Treatwell services that publish price ranges.
-- Source checked on 2026-05-05: https://buchung.treatwell.ch/ort/beauty-face-lift/
-- `price_chf` stores the lower bound for existing booking/tracking compatibility.
-- The Worker API maps these slugs to visible range labels.

WITH range_services (
  name,
  slug,
  description,
  duration_minutes,
  price_chf,
  category,
  sort_order
) AS (
  VALUES
    (
      'Maske Soin initiale (Augenmaske)',
      'maske-soin-initiale-augenmaske',
      'Augenmaske mit offizieller Treatwell-Preisspanne je nach Umfang.',
      20,
      30.00,
      'Augenbrauen & Wimpern',
      56
    ),
    (
      'Klassische Ganzkörpermassage',
      'klassische-ganzkoerpermassage',
      'Klassische Ganzkörpermassage mit offizieller Treatwell-Preisspanne je nach Buchungsumfang.',
      60,
      135.00,
      'Massagen',
      111
    )
)
INSERT INTO services (
  name,
  slug,
  description,
  duration_minutes,
  price_chf,
  deposit_chf,
  category,
  sort_order,
  is_active
)
SELECT
  name,
  slug,
  description,
  duration_minutes,
  price_chf,
  0,
  category,
  sort_order,
  true
FROM range_services
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  price_chf = EXCLUDED.price_chf,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  deposit_chf = services.deposit_chf;
