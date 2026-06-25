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
- WhatsApp changes: added a fixed bottom-right floating WhatsApp CTA using the shared Beauty Face Lift phone number, WhatsApp logo, and a prefilled Aquafacial appointment message.
- WhatsApp tracking: floating CTA clicks use the separate `aquafacial_whatsapp_click` event and do not fire the form Lead event.
- Treatwell link handling: Treatwell is shown as a secondary direct action after successful form submission.
- Mobile sticky CTA changes: mobile/tablet sticky button now scrolls to the lead form and hides while consent is visible or after success.
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
- CTA text: `Aquafacial Termin sichern`

## QA Results

- Desktop: section uses a three-card grid with one approved composite result image per card.
- Mobile: cards stack in one column with one composite result image per card.
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
