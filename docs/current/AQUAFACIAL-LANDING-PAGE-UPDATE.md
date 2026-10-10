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

> Superseded on 2026-10-10 by section 9: the request form is now the primary action; Treatwell booking is a text link.

- Primary CTA: `Jetzt Termin buchen` (until 2026-10-10).
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
- `npm run astro -- check`: passes with 0 errors since the 2026-10-06 code-health cleanup (previously failed on repo-wide type issues outside this LP). `npm run check` now runs `astro check` plus a Worker type-check (`tsc -p worker`).
- `npm run qa:worker`: local Wrangler started, but the smoke script failed at the local `/termin/` fetch after a 301 response.
- Live `/lp/aquafacial-microneedling/`: verified HTTP 200 after deployment.
- Live LP HTML: verified new H1, updated WhatsApp CTA, three-image hero stack, canonical URL and no prohibited Hydro/Hydra treatment spelling.
- Live browser pass: verified the page opens at the live URL, mobile viewport matches the mobile breakpoint, hero H1 is centered on mobile, hero CTAs are side by side at 1.15rem, mobile sticky is hidden at the top of the page and all visible images load after lazy-scroll.
- Live old Hydro/Hydra slugs: verified HTTP 404 for the old LP, service and blog URLs.
- Live `/termin/` booking bridge HTML: verified Aquafacial offer parameter, Treatwell base URL, `serviceDetails` logic and service detail id `TR4124140`.
- Live sitemap: verified Aquafacial service/blog URLs are present, old Hydro/Hydra URLs are absent, and the paid LP remains excluded by `/lp/` noindex/sitemap policy.
- Tracking code paths: verified LP `data-button-location` tracking attributes remain, and shared landing layout Meta/GTM loaders remain environment- and consent-controlled.
- `npm run launch:check`: still expects legacy docs at `docs/SETUP.md`, `docs/SITEMAP.md` and `docs/domain-launch-beautyfacelift-zuerich.md`.

## 7. Open Points / Recommendations

- Confirm in Meta/TikTok/Google ad settings that destination URLs now point to `/lp/aquafacial-microneedling/`.
- For future deploys, re-check the live LP, old URL status, booking bridge and Treatwell service detail destination.
- If the LP should become organic SEO content, remove `/lp/` from the noindex/sitemap exclusion deliberately and update the CRO/SEO plan. Current behavior keeps it as a paid campaign landing page.
- ~~Existing repo-wide `astro check` errors should be fixed in a separate technical cleanup branch.~~ Done 2026-10-06 (`npm run check`).

## 8. 2026-10-06 Shared LP Layout And Component Restyle

> Superseded: the Swiss Quiet Luxury direction was rejected. The layout and these components were restyled to "Atelier Glow" and are live since 2026-10-07 (PR #25, #27, #28). See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md). The behaviour notes below (consent-aware sticky bar and WhatsApp, legal strip with `Cookie-Einstellungen`) still apply.

- `src/layouts/LandingPage.astro` and the shared `src/components/lp/*` components (OfferBox, StickyOfferBar, TrustStrip, TestimonialStrip, FAQAccordion, WhatsAppButton, BenefitIcon, AquafacialResultsSection) were restyled to the Swiss Quiet Luxury system on branch `codex/luxury-lps`. Component props, class names and `data-*` attributes are unchanged, so this page keeps working without markup changes; its own page redesign runs separately.
- LandingPage: centred monogram masthead (no menu) and a legal strip (sentence case since PR #28) that keeps `Cookie-Einstellungen` (`data-bfl-consent-open`). The legal strip now only reserves bottom space for a sticky bar when the page sets `--lp-sticky-offer-height`.
- WhatsAppButton (sticky variant) is hidden while the consent banner is open; StickyOfferBar sets `--lp-sticky-offer-height: 0px` while the banner is open (the bar is hidden then), so the banner sits at the bottom edge.

## 9. 2026-10-10 Lead-first rebuild (plan approved by the user)

Branch `claude/elegant-davinci-xom06l`. Decided with the user: one offer, one audience, one primary action. The request form is primary everywhere; WhatsApp is secondary; Treatwell booking stays as the text link "Direkt online buchen" after a successful request, in one FAQ answer and in the closing band. The user creates the matching CHF 170 offer on Treatwell (today Treatwell lists the combo at CHF 200, see TODO). `qa:aquafacial-combo-lp` pins the new contract.

- **CTAs:** `Unverbindlich Termin anfragen` in the hero, under the included list, in the trust section, in the closing band and as the submit label; sticky bar `Termin anfragen`. The old `Jetzt Termin buchen`, `Hautanalyse & Termin anfragen`, `Kombi-Behandlung buchen` and `Terminwunsch senden` are gone.
- **Hero:** H1 "Aquafacial + Microneedling: frischer <em>Glow</em>, glatter wirkende Haut" (three lines on a 390 px phone, replaces the four-line "Ganzheitliche Kombi-Behandlung … straffere und regenerierte Haut"); lead "1 Std. 30 Min. mit Hautanalyse, Aquafacial, kosmetischem Microneedling und Abschlusspflege – persönlich von Teresa Stimac in Zürich."; the three facts are shown on phones too; rating line links to Treatwell; photo band below the CTA on phones.
- **Sections removed:** the desire grid ("Wenn Ihre Haut mehr braucht …"), the OfferBox price card and the promises TrustStrip, the two-step section with the infographic, the separate process cards, the booking panel, the second proof grid. The infographic `aquafacial-microneedling-infografik-zuerich.webp` is no longer rendered (it prints "Hydrofacial + Microneedling" and a clinical blue palette); the file stays in the repo until a corrected image exists.
- **Sections kept and merged:** included list (with the personal-treatment photo beside it); "Warum Aquafacial und Microneedling zusammen sinnvoll sein können" as three photo steps with the "geeignet bei" lists under steps 1 and 2; "Realistische Ergebnisse …" as three hairline rows with the glow photo; trust with quote, photo and one facts row; FAQ (ten questions, added "Muss ich jetzt schon bezahlen?" and "Kann ich auch direkt online buchen?"); location with click-to-load map (same pattern as `/kontakt/`, no Google request before the visitor asks); closing band.
- **Form:** centred shell like `/lp/aquafacial/`, two-line "So geht es weiter" above the fields. Fields: Vor- und Nachname*, Telefon / WhatsApp*, E-Mail (optional), Was möchten Sie verbessern? (optional select, `skinGoal`), Terminwunsch (optional date, `preferred_date`), Kurze Nachricht (optional, `leadNote`), consent. "Kontaktweg" and the required time select are gone. The form sends JSON to `/api/contact` (`fetch`), shows an inline success with focus and the Treatwell link, keeps the form on a failed send with the error in a `role="alert"` panel, and shows field-level German messages. The Worker needs name, phone or email, and consent for this campaign, which the form satisfies.
- **Tracking:** `window.bflTracking.trackLead({ source: 'aquafacial_microneedling_lp_form', value: 170, currency: 'CHF', email, phone })` runs only after `response.ok` (keeps the PR #45 guarantee). The native-POST `queueLead` → `/kontakt/danke/` path is no longer used by this page; the helper stays in `track.ts` for other forms. `cta_click_lead_form` is still pushed on request CTAs.
- **Floating UI:** sticky bar (one button) appears after the hero leaves the viewport, is `inert` while hidden, hides while the form is on screen, while the consent banner is open and after success; the floating WhatsApp disc comes from `WhatsAppButton variant="sticky"` and also steps aside while the form is on screen.
- **Design system:** tokens only, hairline rows instead of cards, `--section-y` padding, skip link, `id="main-content"`.
- **Verification:** `qa:aquafacial-combo-lp`, `qa:contact`, `qa:marketing`, `npm run check`, `npm run build`; headless screenshots at 320 / 390 / 768 / 1440 px, no horizontal overflow, primary CTA at about 225 px on a 390 px phone; mocked `/api/contact` 201 and 500 with a stubbed `trackLead` (called once on 201, never on 500). Page height on a 390 px phone 14 472 px → about 11 000 px.

