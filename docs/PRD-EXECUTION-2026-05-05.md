# PRD Execution Log - 2026-05-05

Post-launch note as of 2026-05-07: workers.dev references in this execution log are historical. Production is now `https://beautyfacelift-zuerich.ch`, `www` redirects to the apex, and `workers_dev=false` is active.

## Scope Executed

Executed the safe, high-impact slice from `PRD.md` for the Beauty Face Lift Astro site:

- Corrected public treatment pricing to match the live booking API values that were observed during the review.
- Added earlier mobile booking paths on homepage and treatment pages.
- Improved booking service selection, recovery states, and form accessibility.
- Fixed CTA contrast, mobile navigation submenu polish, footer spacing, and missing animation guards.
- Preserved the existing premium editorial visual system.

## Price Source Used

Initial execution used the live `/api/services` values because Teresa's official catalog had not yet been provided. That source was superseded on 2026-05-05 by the official Treatwell catalog:

- Source: https://buchung.treatwell.ch/ort/beauty-face-lift/
- Hydra4Face Basic Intensiv: CHF 180, 60 min
- Hydra4Face Anti Aging: CHF 250, 90 min
- Hydra4Face Gesicht, Hals, Dekolletee: CHF 280, 90 min
- Hydra4Face + coldPLASMA für Akne: CHF 280, 90 min
- Hydra4Face + Microneedling: CHF 170, 90 min
- Microneedling: CHF 210, 90 min
- Micro Needling Anti Aging mit coldPLASMA: CHF 220, 90 min
- Fruchtsäure: CHF 150, 45 min
- BDR Fruchtsäurebehandlung: CHF 150, 60 min
- coldPLASMA Akne/unreine Haut: CHF 180, 90 min
- coldPLASMA Anti Aging Luxus Behandlung: CHF 220, 90 min
- coldPLASMA Stabilisierung Hautbarriere: CHF 220, 90 min
- Carbon Laser Peeling + Microneedling: CHF 250, 90 min
- Carbon Laser Peeling + Maske: CHF 200, 60 min
- Maske Soin initiale (Augenmaske): CHF 30-150, 20 min
- Klassische Ganzkörpermassage: CHF 135-1200, 60 min

The current code patch updates public site copy, visible booking service data for the existing live Supabase rows, and adds `supabase/migrations/004_treatwell_service_catalog.sql` for all exact-price Treatwell services. Migration `005_treatwell_range_price_services.sql` adds the two official Treatwell range-price services; the Worker API exposes display labels while `price_chf` keeps the lower bound for booking/tracking compatibility.

## Files Changed

- `PRD.md`
- `docs/PRD-EXECUTION-2026-05-05.md`
- `src/components/TreatmentActionBar.astro`
- `src/components/booking/BookingWidget.tsx`
- `src/components/booking/steps/TreatmentSelect.tsx`
- `src/components/booking/steps/DateSelect.tsx`
- `src/components/booking/steps/TimeSelect.tsx`
- `src/components/booking/steps/CustomerForm.tsx`
- `src/components/booking/ui/StepIndicator.tsx`
- `src/layouts/Base.astro`
- `src/pages/index.astro`
- `src/pages/behandlungen/index.astro`
- `src/pages/behandlungen/vergleich/index.astro`
- `src/pages/behandlungen/hydrafacial-zuerich/index.astro`
- `src/pages/behandlungen/microneedling-zuerich/index.astro`
- `src/pages/behandlungen/fruchtsaeure-peeling-zuerich/index.astro`
- `src/pages/behandlungen/coldplasma-zuerich/index.astro`
- `src/pages/blog/was-ist-hydrafacial/index.astro`
- `src/pages/blog/hydrafacial-vs-microneedling/index.astro`
- `src/pages/lp/carbon-microneedling/index.astro`
- `src/components/lp/OfferBox.astro`
- `src/components/lp/StickyOfferBar.astro`
- `worker/routes/services.ts`
- `worker/data/officialServices.ts`
- `supabase/migrations/004_treatwell_service_catalog.sql`
- `supabase/migrations/005_treatwell_range_price_services.sql`
- `src/styles/main.css`
- `src/styles/components.css`
- `src/styles/booking.css`

## Before / After Rationale

### Pricing Trust

Before: Hydrafacial and several treatment pages advertised prices that did not match the live booking data.

After: Public price copy, pricing cards, FAQ answers, and JSON-LD offer data now align with the live service values above.

### Mobile Conversion

Before: Mobile users needed more scrolling before finding a direct booking path.

After: The homepage includes an early mobile booking CTA with location/personal-service proof. Treatment pages include a compact early action area with booking and WhatsApp consult paths.

### Booking Funnel

Before: Service cards were clickable but not explicit enough, and API failure states could leave users with little guidance.

After: Services are grouped by treatment family, cards include an explicit selection affordance, and API/empty states offer contact, phone, and WhatsApp recovery actions.

### Accessibility

Before: CTA contrast was below WCAG AA for normal text; the booking stepper and validation state were mostly visual.

After: Primary CTA text contrast was improved. The stepper is now semantic, the current step uses `aria-current`, form fields expose invalid state and descriptions, first invalid field receives focus, and submit exposes busy state.

### Brand Polish

Before: Some mobile nav submenu spacing and footer link rhythm felt less refined than the editorial design.

After: Submenu dots align closer to labels, footer treatment links breathe better, and the additions stay restrained instead of turning the site into a generic SaaS funnel.

## Verification Completed

- Ran `npm run build` successfully.
- Ran local frontend preview with `astro preview` on `http://127.0.0.1:4322/`.
- Captured responsive screenshots for homepage, Hydrafacial, and booking error states.
- Checked mobile document overflow for homepage, Hydrafacial, and booking at a phone-sized viewport; no document-level horizontal scroll was detected.
- Confirmed local booking failure renders a recoverable error state instead of a blank or dead end.
- After live deployment QA, adjusted the mobile booking stepper so the active step label can use the full row below the progress bar instead of truncating inside one column.
- Verified the deployed Workers site after the initial release: homepage, Hydrafacial, and booking pages returned 200; booking mobile at 390px showed 7 service cards and no document-level horizontal overflow. This was superseded by the Treatwell pricing correction described above.

## Environment Notes

- Local Wrangler preview could not fully validate API-backed booking data because the local environment is missing the Supabase anon key. The local failure was useful for validating the new booking recovery state.
- The authenticated admin dashboard was not changed because no live admin credentials were available and several admin files already had unrelated pre-existing worktree edits.
- Existing unrelated dirty files were intentionally not staged or modified as part of this PRD execution.

## Remaining UX Risks

- Teresa should confirm the final active price list, especially whether Carbon Microneedling should stay in booking without a dedicated treatment page.
- Admin dashboard usability still needs an authenticated review.
- Full keyboard and screen reader QA should be done before treating the accessibility pass as complete.
- A real booking test should not be submitted without approval; use a controlled test path or staging data.
- Tone still mixes warmer direct copy with formal service copy in places; a full German tone pass remains open.

## Release Notes

- Branch: `codex/prd-live-ux-fixes`
- Build status before release: passed locally.
- Draft PR: https://github.com/lefteyep/beautyfacelift/pull/1
- Historical live URL at the time: https://beautyfacelift.mediapaulo.workers.dev/
- Current production URL: https://beautyfacelift-zuerich.ch/
