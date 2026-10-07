# Redesign Remaining Work

**Last updated:** May 26, 2026

This document tracks what is still left after the brief-driven redesign pass based on `ads/aquafacial/beautyfacelift-website-redesign-brief.md`.

## Current Constraints

- Use **Aquafacial** in visible copy, schema text, docs, public LLM files, admin labels, and service catalog labels. Do not use the protected alternative spelling in public text.
- Keep existing lowercase URL slugs for now, for example `/behandlungen/aquafacial-zuerich/`, `/blog/was-ist-aquafacial/`, and `/lp/aquafacial/`. Changing slugs requires a separate redirect and campaign plan.
- Do not modify `/lp/aquafacial-microneedling/` without explicit campaign approval. It is connected to an active Meta/Facebook campaign.
- Keep `/termin/` as a noindex automatic Treatwell forwarding bridge. It must preserve UTM, offer, price, service, Meta tracking, and `serviceDetails=TR4124140` for `Aquafacial + Microneedling`.
- Do not invent prices, certifications, opening hours, qualifications, guarantees, or reviews.

## Completed In This Pass

- Global navigation updated with clearer high-intent links and visible `Aquafacial` naming.
- Footer expanded with opening hours and Zurich/Bahnhofstrasse local signal.
- Global mobile sticky CTA added for booking and questions, excluding legal/admin/success pages.
- Homepage reworked with premium Zurich hero, trust bullets, treatment-goal guide, process section, and location section.
- Treatment overview strengthened with goal-based navigation, safer treatment descriptions, comparison CTA, and `#hautziele` anchor.
- `/termin/` fallback content improved while preserving the automatic Treatwell redirect and campaign handoff.
- Contact page source checks preserved for treatment-aware contact fields and success handling.
- Massage page typo fixed from malformed `CHF 135-1200` to `ab CHF 135`.
- Visible naming changed from protected spelling to `Aquafacial` across source, public LLM files, docs, Supabase migrations, and worker service data.
- Build and smoke checks passed after the changes.

## Priority 1 - Review Before Deploy

- [ ] Review all mechanically changed `Aquafacial` copy for legal and brand preference. The spelling change was broad by design.
- [ ] Confirm the protected-name scan stays clean before deployment:
  ```bash
  PROTECTED_NAME="Hydra""facial"; rg -n "$PROTECTED_NAME" . -g "!*node_modules*" -g "!.astro/**" -g "!.git/**"
  ```
- [ ] Re-test `/termin/?service=Aquafacial+%2B+Microneedling&offer=aquafacial-microneedling-aktion&price=170&utm_source=meta` and confirm it forwards to Treatwell with `#serviceDetails=TR4124140`.
- [ ] Review production Meta Events Manager after a test click from the Aquafacial + Microneedling ad flow.
- [ ] Confirm no accidental changes are made to `/lp/aquafacial-microneedling/`.

## Priority 2 - High-Impact Site Work Still Open

- [ ] Decide whether to keep legacy lowercase `aquafacial` slugs or migrate to `aquafacial`.
  - If migrating, implement 301 redirects, canonical updates, sitemap updates, internal link updates, Treatwell/campaign link updates, and Search Console monitoring.
  - If keeping, document that URLs are legacy identifiers while visible copy uses `Aquafacial`.
- [ ] Finish CRO rebuilds for thinner paid landing pages:
  - `/lp/aquafacial/` visible copy should use `Aquafacial`, but URL can stay unchanged for now.
  - `/lp/microneedling/`
  - `/lp/peeling/`
- [ ] Improve remaining core treatment pages beyond naming:
  - Add/standardize quick facts where missing.
  - Tighten "suitable for / not suitable for" copy.
  - Add safer aftercare and expectation sections.
  - Add stronger related-treatment blocks.
- [ ] Review blog articles for remaining high-risk claims. Naming is updated, but some older article copy still uses strong wording such as "patentiert", "tief", "stimulieren", or broad effectiveness statements that may need softer cosmetic wording.
- [ ] Re-check FAQ hub language for medical or guaranteed-result phrasing.

## Priority 3 - SEO And Technical SEO

- [ ] Validate structured data in production after deployment:
  - BeautySalon
  - Service
  - FAQPage
  - Article
  - BreadcrumbList
- [ ] Submit updated sitemap in Google Search Console after deployment.
- [ ] Check indexed titles/descriptions for the old protected spelling and request recrawl where needed.
- [ ] Decide whether `llms.txt` and `llms-full.txt` should continue to mention legacy URLs with `aquafacial` slugs while visible headings use `Aquafacial`.
- [ ] If old-domain overlap exists outside this repo, handle canonicals/redirects externally. Do not configure `beautyfacelift.ch` from this project without a separate migration decision.

## Priority 4 - Tracking And Ads

- [ ] Verify Cloudflare environment variables for GTM, GA4, and Meta are set before scaling ads:
  - `PUBLIC_GTM_ID`
  - `GA4_MEASUREMENT_ID`
  - `GA4_API_SECRET`
  - `PUBLIC_META_PIXEL_ID`
  - `META_PIXEL_ID`
  - `META_ACCESS_TOKEN`
- [ ] Test Treatwell outbound click as the primary proxy conversion.
- [ ] Test Meta CAPI deduplication with `event_id` for click and Schedule events.
- [ ] Confirm marketing consent behavior does not block required campaign attribution handoff.

## Priority 5 - Business Data To Confirm

- [ ] Confirm current prices and durations directly from Treatwell/Teresa before broader price copy updates.
- [ ] Confirm opening hours. Current site data uses:
  - Montag bis Freitag: 09:00 - 18:00
  - Samstag: 10:00 - 16:00
  - Sonntag: Nach Vereinbarung geschlossen
- [ ] Confirm review count and wording before adding any new review or rating claims.
- [ ] Replace remaining placeholder or generic images with verified Teresa/studio/treatment photos where available.
- [ ] Confirm any certifications, qualifications, or device claims before adding them.

## Verification Commands

Run these before considering the redesign pass deployable:

```bash
node scripts/check-redesign-brief-quick-wins.mjs
node scripts/check-contact-concierge.mjs
npm run build
PROTECTED_NAME="Hydra""facial"; rg -n "$PROTECTED_NAME" . -g "!*node_modules*" -g "!.astro/**" -g "!.git/**"
```

Recommended browser checks:

- Desktop: `/`, `/behandlungen/`, `/termin/`.
- Mobile 390px: `/`, `/behandlungen/`, `/kontakt/`.
- Campaign flow: `/lp/aquafacial-microneedling/` to `/termin/` to Treatwell.
