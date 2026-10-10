# Aquafacial Landing Page Lead Generation Update

## Overview

- Landing page URL: `/lp/aquafacial/`
- Previous conversion goal: Direct Treatwell booking / prepaid booking flow
- New conversion goal: Lead form submission on the landing page
- Reason for change: Lower friction for cold Meta Ads traffic and build trust before asking for booking/payment
- Main campaign offer: Aquafacial Aktion in Zürich, CHF 99 statt CHF 180, 1 Stunde Behandlung with Cleansing, Fruchtsäurepeeling, Hyaluron Booster

## What Was Changed

- CTA strategy: primary CTAs now scroll to `#aquafacial-lead-form`.
- Form implementation: added an on-page campaign lead form posting to `/api/contact`.
- Copy changes: rewritten in German with `du`, personal follow-up, no on-page payment pressure, and realistic cosmetic benefit wording.
- Layout changes: rebuilt the route around hero, trust bar, offer contents, lead form, benefits, trust, request steps, FAQ, final CTA, and mobile sticky CTA.
- Results section changes: added a locally served Aquafacial before/after results section directly before the lead form.
- Tracking changes: successful submissions call `trackAquafacialLeadSubmit()`.
- WhatsApp changes: added a fixed bottom-right floating WhatsApp CTA using the shared Beauty Face Lift phone number, WhatsApp logo, and a prefilled Aquafacial appointment message. Since the 2026-10-06 redesign it appears only after 25 % scroll depth and steps aside while the consent banner is open or the lead form (fields and submit button) is on screen.
- WhatsApp tracking: floating CTA clicks use the separate `aquafacial_whatsapp_click` event and do not fire the form Lead event.
- Treatwell link handling: Treatwell is shown as a secondary direct action after successful form submission.
- Mobile sticky CTA changes: mobile/tablet sticky button scrolls to the lead form, appears only after the hero has left the viewport, steps aside while the lead form is on screen, and hides while consent is visible or after success.
- SEO/metadata updates: title, meta description, canonical through `LandingPage.astro`, Open Graph description support, and structured data were updated for the lead-generation offer.

## Lead Form Details

- Required fields: `name`, `phone`, `email`, `privacy_consent`.
- Optional fields: `preferred_time` (`Vormittags`, `Mittags`, `Nachmittags`) and `preferred_date` (`Terminwunsch` date picker).
- Hidden fields: `campaign`, `offer`, `treatment`, `landing_page`, `page_path`, `page_url`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`, `msclkid`.
- Validation behavior: client-side validation blocks missing required fields, invalid email, invalid phone, and missing privacy consent.
- Submission behavior: the browser sends JSON to the existing `/api/contact` Worker route. No success state is shown until the backend returns success.
- Success message: confirms the request was received and that Beauty Face Lift will personally follow up.
- Error message: `Leider konnte deine Anfrage gerade nicht gesendet werden. Bitte versuche es erneut oder kontaktiere uns direkt per WhatsApp.`
- Honeypot behavior: the `company` field remains in the form for backend spam protection, is visually clipped off-screen, non-focusable, `aria-hidden`, and inside an inert container.
- Lead destination: existing Resend notification flow in `worker/routes/contact.ts`.
- UTM handling: URL parameters and existing `sessionStorage` attribution are copied into the payload before submission.
- Privacy consent behavior: the checkbox links to `/datenschutz/` and is required.
- Production anti-spam behavior: this campaign form does not render Cloudflare Turnstile, because the widget can block cold traffic before submission if `challenges.cloudflare.com` fails or is blocked. Anti-spam protection for this LP uses the hidden honeypot field, server-side validation, privacy consent, and the Worker IP rate limit.

# Aquafacial Before / After Section Update

## What Was Added

- New section name: `AquafacialResultsSection`.
- Placement: directly before `#aquafacial-lead-form`.
- Purpose: show approved visual Aquafacial result examples to increase trust before the visitor reaches the lead form.
- CTA behavior: scrolls to `#aquafacial-lead-form`.
- Tracking behavior: the section CTA is a scroll CTA only and does not create Lead tracking events.

## Assets Used

- `aquafacial-result-glow-face.jpg`
- `aquafacial-result-hydrated-skin.jpg`
- `aquafacial-result-cleaner-skin.jpg`
- Source: approved reference website image assets, downloaded into `src/assets/lp/aquafacial/results/` and served locally.
- Display: each approved asset is rendered as one single composite image because the file already contains the before/after layout.
- Runtime behavior: no third-party image hotlinking.

## Copy Added

- Eyebrow: `Aquafacial Ergebnisse`
- Headline: `Sichtbar frischeres Hautgefühl nach der Aquafacial Behandlung`
- Intro text: `Die Beispiele zeigen, wie die Haut nach einer professionellen Aquafacial Behandlung sichtbar frischer, gepflegter und hydratisierter wirken kann.`
- Captions:
  - `Frischer Glow nach der Behandlung`
  - `Gepflegteres und hydratisierter wirkendes Hautbild`
  - `Professionelle Reinigung für ein frisches Hautgefühl`
- Disclaimer: `Individuelle Ergebnisse können variieren. Die Beispielbilder dienen zur Orientierung und ersetzen keine persönliche Einschätzung vor Ort.`
- CTA text: `Unverbindlich Termin anfragen` (was `Aquafacial Termin sichern` until the 2026-10-06 redesign)

## QA Results

- Desktop: section uses a three-column ruled grid (no cards) with one approved composite result image per entry.
- Mobile: entries stack in one column with one composite result image per entry.
- CTA: scrolls to the existing lead form anchor through the existing `data-aquafacial-scroll` handler.
- Form: no form fields, submit behavior, or success-only tracking logic were changed by this section.
- Tracking: no duplicate form Lead event is created from the results CTA.
- Image loading: images are local Astro assets, optimized to WebP output and lazy-loaded.
- Naming compliance: landing page copy uses `Aquafacial` spelling only.

## Lead Delivery And Email Service

- Form endpoint: `POST /api/contact`.
- Worker handler: `worker/routes/contact.ts`.
- Email service: Resend via `https://api.resend.com/emails`.
- Required production secret: `RESEND_API_KEY`.
- Recipient selection order: `CONTACT_TO_EMAIL`, then `OWNER_EMAIL`, then fallback `info@beautyfacelift.ch`.
- Sender selection order: `CONTACT_FROM_EMAIL`, then fallback `Beauty Face Lift <onboarding@resend.dev>`.
- Reply-to behavior: if the lead email is valid, the notification uses the submitted email as `reply_to`.
- Production secret names confirmed in Cloudflare on 2026-06-24: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`.
- Production Turnstile config confirmed on 2026-06-24: `TURNSTILE_SECRET_KEY` exists as a Cloudflare Worker secret and `PUBLIC_TURNSTILE_SITE_KEY` exists as a GitHub repository variable for routes that still render Turnstile. The Aquafacial campaign is exempted server-side by campaign id.
- Secret values are not readable through Wrangler after creation, so the actual recipient/sender addresses must be verified by a real test lead or by re-entering the secrets.
- Current storage behavior: leads are not written to a database. The notification email is the lead destination.

## Tracking Details

### Form Lead

- dataLayer event: aquafacial_lead_submit
- Meta standard event: Lead
- Trigger condition: only after successful form submission
- Duplicate prevention method: page state plus the module-level `aquafacialLeadTracked` guard in `src/lib/track.ts`
- Consent behavior: uses the existing marketing-consent gate in the PPC tracking module.
- GTM recommendation:
  - Trigger type: Custom Event
  - Event name: `aquafacial_lead_submit`
  - Meta event: Lead
  - Event parameters: `content_name = Aquafacial Aktion`, `content_category = Beauty Treatment`, `value = 99`, `currency = CHF`
- Testing notes: verify the event appears only after a successful backend response and never on CTA click, validation error, or failed API response.

### Floating WhatsApp

- dataLayer event: `aquafacial_whatsapp_click`
- Meta standard event: `Contact`
- Trigger condition: only after a click on the fixed bottom-right floating WhatsApp button.
- Placement parameter: `floating_whatsapp`
- Payload guardrails: no form input or PII is sent to dataLayer.
- GTM recommendation:
  - Trigger type: Custom Event
  - Event name: `aquafacial_whatsapp_click`
  - Meta event: Contact
  - Event parameters: `campaign = aquafacial_aktion`, `offer = aquafacial_aktion_99`, `placement = floating_whatsapp`, `value = 99`, `currency = CHF`
- Separation from lead tracking: WhatsApp clicks do not call `trackAquafacialLeadSubmit()` and do not fire Meta Lead.

## QA Results

- Desktop: verified in the in-app browser on the Astro dev server. One H1, no horizontal overflow, and no fresh console errors were observed.
- Responsive floating CTA: current bottom-right placement verified at 390 and 1440 px widths. The button keeps the 50/54/60 px responsive sizing rules and sits above the sticky mobile CTA.
- CTA anchor scrolling: verified in browser from the hero CTA and from the mobile sticky CTA.
- Sticky mobile CTA: verified hidden while the consent banner is visible and visible after consent is no longer shown.
- Floating WhatsApp button: verified with WhatsApp green styling, the WhatsApp logo, responsive sizing, visible focus state, accessible label, shared phone number, prefilled Aquafacial message, `noopener noreferrer`, and separate tracking configuration.
- Form validation: verified in browser. Missing required fields show field-level German validation messages and do not show the success state or Treatwell link. Callback time and appointment date are optional.
- Error state: verified in browser against the local Astro dev server where `/api/contact` is unavailable. The page keeps the form visible, keeps success hidden, re-enables submit, and shows the requested fallback message.
- Success state: verified in system Chrome with a temporary Playwright spec that mocked `/api/contact` as HTTP 200. The form is hidden, the thank-you state receives focus, the body gets `aquafacial-lead-success`, and the secondary Treatwell link becomes visible only after success.
- Tracking separation: verified in the temporary Playwright spec. The test normalized the automation-wrapped `dataLayer.push` to native array behavior, then confirmed `aquafacial_whatsapp_click` fires separately from `aquafacial_lead_submit` and the WhatsApp click does not emit `whatsapp_click` or Meta Lead.
- Backend lead delivery: route accepts Aquafacial fields and uses campaign-specific email subject.
- Turnstile: the Aquafacial campaign no longer renders or requires Turnstile. This avoids the Cloudflare widget failure state shown by some browsers while keeping honeypot, validation, and rate limiting in place.
- Tracking events: static QA covers `trackAquafacialLeadSubmit()`, `aquafacial_lead_submit`, `trackAquafacialWhatsappClick()`, and `aquafacial_whatsapp_click`. The success path calls the Lead helper only after a successful response; the floating WhatsApp button calls the WhatsApp helper only on click.
- Treatwell secondary link: static QA and mocked success browser QA verify the requested direct URL and `noopener noreferrer`.
- WhatsApp/privacy links: static QA covers page links.
- Forbidden naming search: final scan should exclude the QA script's negative-test term list.
- Console errors: none observed in fresh desktop/mobile browser checks without the local Turnstile test key.
- Build/lint/typecheck: `npm run build` is the available compile check. No dedicated lint or typecheck scripts are currently defined in `package.json`.

## Open Points

- Final Meta Events Manager verification must happen in the ad account after deployment.
- Final production inbox delivery must be confirmed with one manual live test lead.
- Final legal/privacy approval remains a business/legal review item.

## Production Deployment Notes

- Live project: Cloudflare Worker `beautyfacelift`.
- Production domains: `beautyfacelift-zuerich.ch` and `www.beautyfacelift-zuerich.ch`.
- Deployment command: `npm run cf:deploy`, which runs `astro build && wrangler deploy --assets=./dist --old-asset-ttl=0 --keep-vars`.
- `--keep-vars` is required so existing Cloudflare dashboard variables remain in place. Wrangler deployments do not delete secrets.
- Because the shared development worktree can contain unrelated dirty files, production deployment should be done from a clean scoped worktree or from a reviewed branch that contains only the intended landing page/supporting changes.
- Post-deploy checks: load `/lp/aquafacial/`, confirm the H1 and lead form render, verify primary CTAs scroll to `#aquafacial-lead-form`, and send one real test lead to confirm Resend delivery.

## Deployment Log

### 2026-06-24

- Deployed from clean scoped worktree `astro-v2-aquafacial-leadgen-deploy` to avoid unrelated dirty workspace changes.
- Production deployment command used public build-time values for Turnstile and Meta Pixel, then ran `npm run cf:deploy`.
- Current Cloudflare Worker version ID: `770f6bf7-61f0-4910-9cac-4e3ef0a9268e`.
- Live verification URL: `https://beautyfacelift-zuerich.ch/lp/aquafacial/?codex_verify=20260624-final5`.
- Verified HTTP 200, campaign H1, lead form, `/api/contact` action, Turnstile widget/site key, Meta Pixel, and escaped success Treatwell URL.
- Historical check before the 2026-06-25 fix: production `/api/contact` rejected valid lead payloads without `cf-turnstile-response` with HTTP 400, confirming the previous Turnstile dependency on canonical hosts.
- Fresh verification commands passed after documentation sync: `npm run qa:aquafacial-lp`, `npm run qa:marketing`, production-style `npm run build`, and `npx wrangler deploy --assets=./dist --old-asset-ttl=0 --keep-vars --dry-run`.
- Final manual check remaining: submit one real test lead through the live form to confirm Resend inbox delivery.

### 2026-06-25 Turnstile Widget Fix

- Root cause: the Aquafacial LP rendered Cloudflare Turnstile and the production Worker required a `cf-turnstile-response`; if `challenges.cloudflare.com` failed or was blocked, visitors saw a Cloudflare error and could not complete the form.
- Fix: removed Turnstile rendering from `/lp/aquafacial/` and exempted the `aquafacial_aktion` campaign from the Worker Turnstile requirement.
- Remaining anti-spam controls: hidden honeypot field, required privacy consent, strict field validation, topic allow-list, phone/email validation, message length limits, and IP rate limiting.

### 2026-06-24 Floating WhatsApp / CRO Polish

- Implemented in branch/worktree `codex/aquafacial-leadgen-live-20260624` / `astro-v2-aquafacial-leadgen-deploy`.
- Added the premium fixed bottom-right WhatsApp CTA, campaign-specific WhatsApp tracking, honeypot accessibility hardening, and extra reassurance copy near the form.
- Verified locally with static QA, production-style build, Wrangler dry run, in-app responsive browser checks, browser validation/error checks, and a temporary Playwright mocked-success check.
- This polish has not been merged to `master` or deployed live yet. Per `AGENTS.md`, going live requires a reviewed PR plus explicit approval to merge/deploy.

## 2026-10-06 Swiss Quiet Luxury Redesign

- Branch: `codex/luxury-lps`. Spec, now archived: `docs/archive/specs/2026-10-06-swiss-quiet-luxury-design-rejected.md` (Landing pages section), plus the Jul-31 Meta-ads audit (section F, mobile hero).
- **Update 2026-10-07:** the client rejected the Swiss visual language. The site-wide system is now "Atelier Glow" ([DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)).
  - The LP keeps everything below: structure, copy, CTA wording, floating-UI rules, form contract and tracking.
  - Its shared tokens now render as Atelier Glow: cream/copper palette, upright Instrument Serif headings, rounded corners, pill buttons.
  - The LP kickers (`.eyebrow`) stay; the QA script requires them.
- Layout: rebuilt in the site design system (Bodoni Moda headings, Instrument Sans body, porcelain/ivory/sand/espresso tokens, hairlines, square corners). Section order, form, endpoint, payload, validation texts, success flow, tracking attributes and WhatsApp/Treatwell links are unchanged.
- Hero: kicker `Aquafacial an der Bahnhofstrasse 94` (replaces `In Zürich nur für kurze Zeit`); H1 unchanged and at most three lines on a 390 px phone; price line `Kennenlernpreis CHF 99.– · statt CHF 180.–`; three benefits (`1 Stunde Behandlung`, `Cleansing, Fruchtsäurepeeling & Hyaluron Booster`, `Persönlich durch Teresa Stimac`); the duplicate offer card/bullet list was removed.
- Hero image: real treatment photo `src/assets/lp/aquafacial/aquafacial-behandlung-zuerich.webp` (copy left, photo right on desktop; a pre-cropped 2:1 photo band under the price line on phones). The page preloads this photo (media-split mobile band / desktop portrait) instead of the campaign poster.
- Campaign video card (poster + lazy MP4/WebM, `data-hero-video-*` hooks unchanged) moved next to `Was ist in der Aquafacial Aktion enthalten?`; its poster is now lazy-loaded.
- CTA copy: every primary CTA, the submit label and the label restored after a failed submit read `Unverbindlich Termin anfragen` (replaces `Jetzt Termin sichern`). The sticky bar keeps `Termin anfragen`.
- Microcopy under the submit button: `Keine Online-Zahlung. Wir melden uns zur Terminbestätigung.`
- Floating UI: sticky offer bar (phones/tablets) only after the hero has left the viewport and never while the lead form is on screen; floating WhatsApp only after 25 % scroll depth and never while the lead form is on screen; both hidden while the consent banner is open, so neither covers the banner or the submit button. While the banner is open the page sets `--lp-sticky-offer-height: 0px` so the banner sits at the bottom edge.
- Form: hairline inputs with 2 px radius, espresso focus ring, bronze/sand invalid state with the unchanged German error messages.
- Open point for the client: the `statt CHF 180.–` comparison price stays on the page and still needs the documented reference-price proof (audit section F).

## 2026-10-07 Conversion and Copy Refinement

Live since 2026-10-07 (PR #27, merge `5e34494`; legal-strip clean-up in PR #28). The offer, form contract, tracking, CTA placements and all client-approved copy pinned by `qa:aquafacial-lp` are unchanged. That covers the H1, the subheadline, the CTA labels, the results texts, the lead-section kicker and title, the form labels, and the success, error and payment microcopy.

- **Section order:**
  - **Before:** hero, trust bar, offer, results, form, benefits, trust, process, studio, FAQ, final.
  - **Now:** hero, offer, "So funktioniert deine Anfrage", results, form, benefits, trust, FAQ, final.
  - **Why:** the visitor learns how easy the request is before reaching the form. Results stay directly before the form, as required.
- **Hero:** the rating proof "★★★★★ 4,8 aus 248+ Bewertungen auf Treatwell" now sits directly under the CTAs. It replaces the uppercase trust bar and fixes the inconsistent "4.8/5 … 249". The third bullet now reads "Persönlich durch Teresa Stimac, 20+ Jahre Erfahrung".
- **Removed:** the "Ruhige Pflege statt schneller Rabatt-Abwicklung" section. Its "discount" framing undercut the offer, and it told visitors to leave a note in the form, which no longer has a message field.
- **Copy:**
  - The offer lead and the "included" list now follow treatment order: Hautabstimmung, then Cleansing, Peeling, Booster, Abschlusspflege, and finally Pflegehinweise für zu Hause.
  - **Benefits:** four outcome-led items replace six hedged ones: Glow; Reinigung; Feuchtigkeit; "Meist keine Ausfallzeit", which is sourced from the Aquafacial treatment page.
  - **Process steps:** tighter, with lower friction.
  - **Trust section:** "20+ Jahre, 4,8, 248+".
  - **FAQ:** nine questions became seven, ordered as visitors raise them (content, fit, payment, next steps, location, limits, online booking). This fixed the answer that promised a form message field and removed the "Landing Page" jargon.
- **Atelier Glow consistency:**
  - **Labels:** sentence-case copper text instead of uppercase tracked labels; this includes the form labels, price label, proof labels and the LP footer in `LandingPage.astro`.
  - **Section overlines:** removed except the QA-required kickers.
  - **Lists:** clay check discs instead of dash markers.
  - **Shapes:** the hero photo is in the arch frame on desktop; photos, the video card and the form card are rounded.
  - **Phones:** compact process steps.
- **Form messages:** they follow the contact page. A send error shows in an error-coloured panel; success is not boxed and leads with a clay tick disc.
- **Legal strip:** sentence case for all ad pages, set in `LandingPage.astro` since the follow-up pass on the other ad pages.
- **Verification:** an independent checker reviewed the change, calibrated with a planted difference, and re-checked the fixes. QA, type check, build and audit pass, with no overflow from 320 to 1440 px.
- **Open points for the client:**
  - the "statt CHF 180.–" reference-price proof;
  - an end date for the Kennenlernpreis;
  - confirming the review count (the page now says "248+", which stays true at 249).

## 2026-10-10 Conversion and design pass (plan approved by the user)

Branch `claude/elegant-davinci-xom06l`. The offer, form contract (field names, hidden attribution, `/api/contact` JSON, Turnstile exemption, honeypot), tracking (`aquafacial_lead_submit` after `response.ok`, `aquafacial_whatsapp_click`), WhatsApp and Treatwell links, the campaign video card and the results component are unchanged. `qa:aquafacial-lp` pins the new copy.

- **Why:** the page spent half of the phone fold on the photo, asked for the form before the benefits and the trust section, repeated the proof numbers twice, and used the one boxed pattern (four step cards) the design system rules out.
- **Section order:** hero → included (video card smaller, 4/12) → benefits → Teresa / trust → results → form → FAQ → closing band. Results stay directly before the form.
- **Hero:** H1 keeps its words and gets the copper accent word (`frischer <em>Glow</em>`); new lead "Cleansing, sanftes Fruchtsäurepeeling und Hyaluron Booster – persönlich von Teresa Stimac, für Haut, die fahl, trocken oder unruhig wirkt."; kicker "Aquafacial Aktion · Bahnhofstrasse 94, Zürich"; WhatsApp link "Kurze Frage? Per WhatsApp"; the rating line links to Treatwell. On phones the order is kicker, H1, lead, price, CTA, rating, photo band, facts, so the primary CTA sits at about 290 px on a 390 px phone and at about 780 px on a 1440×900 desktop.
- **Copy:** included H2 "Das ist in deiner Aquafacial Aktion enthalten"; benefits "Was deine Haut davon hat" with a fit sentence as lead; trust H2 "Persönlich behandelt von Teresa Stimac" with one hairline facts row (20+ Jahre, 4,8 aus 248+ Bewertungen auf Treatwell as a link, address) instead of the second proof grid; lead-section H2 "Aquafacial zum Kennenlernpreis anfragen" (no exclamation mark); closing band "Bereit für frischen Glow?".
- **Form:** a two-line "So geht es weiter" list sits above the fields (replaces the four process cards); callback time and date are labelled "(optional)"; the consent sentence reads "… dass Beauty Face Lift mich zu meiner Anfrage kontaktiert."; the note under the button reads "Keine Online-Zahlung, keine Verpflichtung. Wir melden uns zur Terminbestätigung."
- **FAQ:** nine questions; added "Tut Aquafacial weh oder wird die Haut rot?" and "Wann sollte ich den Termin verschieben?" (same cautious wording as the combo page).
- **Accessibility:** skip link in `LandingPage.astro`, `id="main-content"` on the page.
- **Results component:** the CSS zoom on the first result image was removed so no example is cropped by code.
- **Verification:** `qa:aquafacial-lp`, `qa:contact`, `qa:marketing`, `npm run check`, `npm run build`; headless screenshots at 320 / 390 / 768 / 1440 px with no horizontal overflow; mocked `/api/contact` 201 and 500 (inline success with focus, error keeps the form); page height on a 390 px phone 10 238 px → about 9 300 px.
- **Open for the client:** the review count (Treatwell shows 260, the page says 248+ until confirmed).

