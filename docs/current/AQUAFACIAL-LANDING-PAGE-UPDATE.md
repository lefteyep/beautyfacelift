# Aquafacial Landing Page Update Documentation

## 1. Overview

Live campaign URL:
`https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/`

Campaign purpose:
Promote the `Aquafacial + Microneedling` combination treatment in Zurich with the existing offer details: CHF 170 instead of CHF 250, 90 minutes, personal skin analysis, treatment, calming after-care and clear follow-up guidance.

Naming restriction:
The public website, landing page, route, asset names, metadata, CTAs, FAQ, structured content, tracking labels and documentation must use `Aquafacial`. The previous Hydro/Hydra treatment naming must not appear.

## 2. What Was Changed

- Renamed the campaign route to `/lp/aquafacial-microneedling/`.
- Renamed related treatment and blog routes to Aquafacial equivalents.
- Updated landing page copy, metadata, Open Graph/Twitter metadata, JSON-LD product and FAQ schema, form source values, booking offer slug and tracking labels.
- Updated the Treatwell bridge mapping for `Aquafacial + Microneedling` to service detail id `TR4124140`.
- Renamed campaign imagery and source assets to SEO-friendly Aquafacial names.
- Kept the current premium landing page structure, hero image stack, direct booking CTA priority, WhatsApp CTAs, lead form, trust proof, FAQ and location section.
- Updated shared navigation/service data, public manifest/LLM files, scripts and Worker contact source allowlist.

## 3. Compliance Notes

- The landing page uses realistic cosmetic positioning and avoids guaranteed-result language.
- The page explains expected outcomes as visual/cosmetic benefits, not medical claims.
- The lead form no longer depends on Turnstile on this LP.
- The form posts to the existing `/api/contact` endpoint with source `aquafacial-microneedling-lp`.
- Old campaign source routes were removed instead of redirecting with prohibited naming in source code.

## 4. SEO Setup

- Title: `Aquafacial + Microneedling Zürich | CHF 170 statt CHF 250`
- Canonical: `https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/`
- OG/Twitter image: optimized hero WebP.
- Structured data: Product + FAQPage with Aquafacial naming and CHF 170 offer.
- Sitemap behavior: `/lp/` routes remain `noindex, nofollow` and excluded from sitemap by the existing project config. Aquafacial service/blog pages are included in the sitemap.

## 5. Campaign Notes

- Primary CTA: `Jetzt Termin buchen`.
- Secondary CTA: `Per WhatsApp anfragen`.
- Booking bridge URL passes:
  - `service=Aquafacial + Microneedling`
  - `offer=aquafacial-microneedling-aktion`
  - `price=170`
- Treatwell service detail target is `TR4124140`.
- Tracking labels use `Aquafacial Microneedling Aktion` and `Aquafacial + Microneedling`.

## 6. QA Checklist

- `npm run qa:aquafacial-lp`: passed.
- `npm run build`: passed, 36 pages generated.
- Source scan for prohibited Hydro/Hydra treatment variants: passed.
- Built `dist` scan for prohibited Hydro/Hydra treatment variants: passed.
- Filename scan for prohibited Hydro/Hydra treatment variants: passed.
- Old generated LP files are absent from `dist`; new Aquafacial LP file is present.
- `npm run qa:docs`: passed.
- `npm run lint`: not available in this repo.
- `npm run typecheck`: not available in this repo.
- `npm run astro -- check`: fails on existing repo-wide type issues outside this LP, including `astro.config.mjs`, `src/api_backup/*`, `src/components/Nav.astro`, `src/lib/track.ts`, Supabase Deno globals and Worker globals.
- `npm run qa:worker`: local Wrangler started, but the smoke script failed at the local `/termin/` fetch after a 301 response. Live route verification is required after deployment.
- `npm run launch:check`: still expects legacy docs at `docs/SETUP.md`, `docs/SITEMAP.md` and `docs/domain-launch-beautyfacelift-zuerich.md`.

## 7. Open Points / Recommendations

- Confirm in Meta/TikTok/Google ad settings that destination URLs now point to `/lp/aquafacial-microneedling/`.
- After deployment, re-check the live LP, old URL status, booking bridge and Treatwell service detail destination.
- If the LP should become organic SEO content, remove `/lp/` from the noindex/sitemap exclusion deliberately and update the CRO/SEO plan. Current behavior keeps it as a paid campaign landing page.
- Existing repo-wide `astro check` errors should be fixed in a separate technical cleanup branch.
