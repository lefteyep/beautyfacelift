# Treatment CTA Update

Date: 2026-05-08

## Scope

Removed the weak "Beratung zuerst" treatment intro pattern and replaced it with clearer action-oriented copy. The new CTA language presents the next step as planning or booking the treatment, with WhatsApp reserved for short questions.

## User-Facing Changes

- Exosome Therapie page: replaced "Beratung zuerst" with "Behandlung planen".
- Exosome Therapie page: changed the primary button from "Beratung buchen" to "Termin buchen".
- Exosome Therapie page: changed the secondary button from "Rückfrage stellen" to "Frage per WhatsApp".
- Shared treatment CTA: changed the repeated treatment-page intro from "Direkt buchen" to "Behandlung planen".
- Shared treatment CTA: changed "Beratung fragen" to "Frage per WhatsApp".
- Shared booking CTA: changed the secondary CTA label to "Frage per WhatsApp".

## Implementation Touchpoints

- `src/components/TreatmentActionBar.astro`
- `src/components/BookingCta.astro`
- `src/pages/behandlungen/exosome-therapie-zuerich/index.astro`

## Verification

- `rg "Beratung zuerst|BERATUNG ZUERST|Beratung buchen|Rückfrage stellen|Beratung fragen" src` returned no remaining matches.
- `npm run build` completed successfully.
- In-app browser check on `http://127.0.0.1:4321/behandlungen/exosome-therapie-zuerich/` confirmed the new labels on desktop.
- Mobile viewport check at `390x844` confirmed the CTA block stacks cleanly and keeps the new labels readable.
- Browser console check returned no relevant warnings or errors for the tested page.

## Deployment Notes

This note documents the treatment CTA subset of the broader 2026-05-08 live release. The full release scope, including homepage hero copy and layout refinements, is documented in `docs/DELIVERY-2026-05-08.md` and `docs/RELEASE-2026-05-08-live-update.md`.

The CTA changes were deployed to `https://beautyfacelift-zuerich.ch` as part of Cloudflare Worker version `564dba2f-2c24-4f1e-b98f-625ed007fa92`.
