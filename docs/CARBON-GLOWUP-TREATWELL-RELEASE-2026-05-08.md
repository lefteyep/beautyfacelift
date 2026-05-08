# Carbon Microneedling Glow-Up Release - 2026-05-08

## Purpose

This document records the conversion-focused release for the Carbon Microneedling landing page used for Meta Ads traffic in Zürich.

Primary campaign path:

```text
Meta ad -> /lp/carbon-microneedling/ -> /termin/?service=Carbon+Microneedling&offer=glow-up-aktion&price=169 -> Treatwell
```

Primary conversion proxy until confirmed booking import exists:

```text
TreatwellOutboundClick
```

## Live URLs

Production landing page:

```text
https://beautyfacelift-zuerich.ch/lp/carbon-microneedling/
```

Owned booking bridge:

```text
https://beautyfacelift-zuerich.ch/termin/?service=Carbon+Microneedling&offer=glow-up-aktion&price=169
```

Final booking destination:

```text
https://buchung.treatwell.ch/ort/beauty-face-lift/
```

## Offer Contract

The landing page and booking bridge must match the Meta Ads offer exactly:

```text
Glow-Up Aktion
Carbon Peeling + Microneedling
CHF 169.- statt CHF 220.-
Sie sparen CHF 51.-
Buchung über Treatwell
```

The old `CHF 250` price and Aesthetika booking copy must not appear in this landing-page funnel.

Primary CTA:

```text
Termin für CHF 169 sichern
```

WhatsApp prefill:

```text
Hallo Teresa, ich interessiere mich für die Glow-Up Aktion: Carbon Peeling + Microneedling für CHF 169 statt CHF 220.
```

## Page Changes

### Above The Fold

Hero eyebrow:

```text
Glow-Up Aktion · Bahnhofstrasse Zürich
```

Hero headline:

```text
Carbon Peeling + Microneedling für sichtbar frischere, feinere Haut
```

Hero subheadline:

```text
Die 2-in-1 Premium-Gesichtsbehandlung für verfeinerte Poren, glatter wirkende Hauttextur und einen frischen Glow. Persönlich bei Teresa Stimac in Zürich.
```

Hero bullets:

```text
Poren wirken feiner
Frischer Glow statt müder Teint
90 Minuten inkl. Hautanalyse, Carbon Peeling, Microneedling & Hyaluron-Finish
20+ Jahre Erfahrung · 4.8/5 aus 248+ Bewertungen
```

The hero layout was tightened so the offer and primary CTA are visible above the fold on desktop and mobile.

### Full Page Structure

The landing page now follows this conversion sequence:

1. Hero with offer match, treatment visual, primary CTA, WhatsApp CTA, and trust strip.
2. Problem/desire section for enlarged-looking pores, uneven texture, dullness, and low perceived skincare impact.
3. Treatment explanation with included treatment steps.
4. Three-phase method: Carbon Peeling, Microneedling, Hyaluron Finish.
5. Why the 2-in-1 combination works as a premium 90-minute appointment.
6. Benefits focused on fresher-looking skin, refined-looking pores, smoother-looking texture, hydrated skin feel, premium experience, and personal care.
7. Offer section repeating `CHF 169.- statt CHF 220.-`.
8. Realistic result expectation section, including possible redness and a 24-48h calming window.
9. Trust/team section for Teresa Stimac, 20+ years of experience, and Bahnhofstrasse 94.
10. Booking process explaining Treatwell as the final booking page.
11. FAQ with suitability, redness, price, inclusions, booking flow, and contraindication guidance.
12. Final CTA repeating the offer and Treatwell booking route.

## Booking Bridge

`/termin/` remains the tracking bridge before Treatwell.

It now:

- Uses Treatwell as the visible booking destination.
- Preserves `service`, `offer`, and `price` in the forwarded URL.
- Shows the Glow-Up promo context when `offer=glow-up-aktion&price=169` is present.
- Tracks `TreatwellOutboundClick` before redirecting.
- Keeps campaign parameters such as `utm_*`, `fbclid`, `gclid`, `gbraid`, and `wbraid`.

## Tracking

Landing page view tracking:

```text
PageView
LandingPageView
ViewContent
```

Carbon landing-page `ViewContent` payload:

```text
content_name = Carbon Microneedling Glow-Up Aktion
treatment_name = Carbon Microneedling
service = Carbon Microneedling
value = 169
currency = CHF
```

Booking actions:

```text
booking_button_click -> BookingButtonClick
treatwell_outbound_click -> TreatwellOutboundClick
whatsapp_click -> Contact(method=whatsapp)
phone_click -> Contact(method=phone)
```

Recommended Meta UTM structure:

```text
utm_source=meta
utm_medium=paid_social
utm_campaign=ch_zh_carbon_microneedling_glowup_202605
utm_content={{adset.name}}__{{ad.name}}
utm_term={{placement}}
utm_id={{campaign.id}}
```

## Source Files

Main implementation files:

```text
src/pages/lp/carbon-microneedling/index.astro
src/pages/termin/index.astro
src/lib/track.ts
shared/site.ts
src/components/BookingCta.astro
src/components/lp/OfferBox.astro
package.json
scripts/check-carbon-lp-offer.mjs
```

Related tracking documentation:

```text
docs/PPC-TRACKING-SETUP-2026-05-08.md
docs/superpowers/plans/2026-05-08-ppc-treatwell-tracking.md
```

## Regression Check

The release adds:

```powershell
npm run qa:carbon-lp
```

This verifies:

- Carbon LP defines `PROMO_PRICE = 169`.
- Carbon LP defines `REGULAR_PRICE = 220`.
- Carbon LP contains `Glow-Up Aktion`.
- Carbon LP does not contain `CHF 250`.
- Carbon LP does not frame the offer as `Offizieller Preis`.
- Primary CTA says `Termin für CHF 169 sichern`.
- WhatsApp prefill uses `CHF 169 statt CHF 220`.
- `/termin/` contains Treatwell copy and no Aesthetika copy.
- `/termin/` recognizes `glow-up-aktion` promo context.
- `shared/site.ts` forwards `offer` and `price`.
- `track.ts` sends `ViewContent` with `value=169`, `currency=CHF`, and `Carbon Microneedling Glow-Up Aktion`.

## Pre-Deploy Verification

Completed before deployment:

```powershell
npm run qa:carbon-lp
npm run build
```

Rendered local QA:

```text
http://127.0.0.1:4323/lp/carbon-microneedling/
```

Checked viewports:

```text
Desktop: 1280x720
Mobile: 390x844
```

Observed:

- The hero renders with the correct offer.
- `CHF 169` and `CHF 220` are visible above the fold.
- The primary CTA is visible above the fold.
- The sticky mobile offer bar shows the corrected price.
- No browser warnings or errors appeared during desktop in-app browser QA.
- Clicking the hero CTA reached Treatwell with:

```text
https://buchung.treatwell.ch/ort/beauty-face-lift/?service=Carbon+Microneedling&offer=glow-up-aktion&price=169
```

## Deployment Procedure

Because the active workspace contained unrelated uncommitted contact-page work, deployment must run from a clean worktree at the pushed release commit.

Procedure:

```powershell
npm run qa:carbon-lp
npm run build
npm run cf:deploy
```

The deploy command builds Astro and publishes the Cloudflare Worker with static assets:

```powershell
wrangler deploy --assets=./dist --old-asset-ttl=0 --keep-vars
```

## Production Smoke Checks

Run after deploy:

```powershell
Invoke-WebRequest -Uri "https://beautyfacelift-zuerich.ch/lp/carbon-microneedling/" -UseBasicParsing
Invoke-WebRequest -Uri "https://beautyfacelift-zuerich.ch/termin/?service=Carbon+Microneedling&offer=glow-up-aktion&price=169" -UseBasicParsing -MaximumRedirection 0
```

Expected:

- Landing page returns `200`.
- Landing page contains `Glow-Up Aktion`, `CHF 169`, `CHF 220`, and `Termin für CHF 169 sichern`.
- Landing page does not contain `CHF 250` or `Aesthetika`.
- `/termin/` redirects to Treatwell and preserves `service`, `offer`, and `price`.

## Deployment Record

Status: pending live deploy.

Cloudflare Worker:

```text
beautyfacelift
```

Routes:

```text
beautyfacelift-zuerich.ch
www.beautyfacelift-zuerich.ch
```

## Rollback

If the live release needs to be reverted:

1. Identify the previous stable Cloudflare Worker version in the Cloudflare dashboard or Wrangler deployment history.
2. Roll back the Worker version from Cloudflare.
3. If using Git rollback instead, revert the release commit(s), rebuild, and run:

```powershell
npm run cf:deploy
```

4. Smoke-check `/lp/carbon-microneedling/`, `/termin/`, and the homepage.

## Post-Launch Tracking Checks

Before scaling Meta spend:

1. Confirm `PUBLIC_META_PIXEL_ID` is present at build time.
2. Confirm `META_PIXEL_ID` and `META_ACCESS_TOKEN` are configured as Cloudflare Worker secrets.
3. Test the funnel in Meta Events Manager:
   - `PageView`
   - `LandingPageView`
   - `ViewContent`
   - `BookingButtonClick`
   - `TreatwellOutboundClick`
4. Create the primary custom conversion:

```text
BFL - Treatwell Outbound Click
```

5. Optimize paid campaigns for `TreatwellOutboundClick` only after the event is visible and deduplicating correctly.
