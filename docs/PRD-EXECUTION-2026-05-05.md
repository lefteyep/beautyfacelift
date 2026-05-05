# PRD Execution Log - 2026-05-05

## Scope Executed

Executed the safe, high-impact slice from `PRD.md` for the Beauty Face Lift Astro site:

- Corrected public treatment pricing to match the live booking API values that were observed during the review.
- Added earlier mobile booking paths on homepage and treatment pages.
- Improved booking service selection, recovery states, and form accessibility.
- Fixed CTA contrast, mobile navigation submenu polish, footer spacing, and missing animation guards.
- Preserved the existing premium editorial visual system.

## Price Source Used

The implementation used the live `/api/services` values as the source of truth for this slice:

- Hydrafacial Signature: CHF 250, 60 min
- Hydrafacial Platinum: CHF 380, 90 min
- Microneedling Gesicht: CHF 290, 60 min
- Microneedling Gesicht + Hals: CHF 350, 75 min
- Fruchtsaeure Peeling: CHF 180, 45 min
- ColdPlasma Behandlung: CHF 320, 60 min
- Carbon Microneedling: CHF 160, 90 min

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
- Verified the deployed Workers site after release: homepage, Hydrafacial, and booking pages returned 200; `/api/services` returned 7 services; Hydrafacial page exposed CHF 250 and CHF 380 without the old CHF 190 / 280 / 350 values; booking mobile at 390px showed 7 service cards and no document-level horizontal overflow.

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
- Live URL: https://beautyfacelift.mediapaulo.workers.dev/
