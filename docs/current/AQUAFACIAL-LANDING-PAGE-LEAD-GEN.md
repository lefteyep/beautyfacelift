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
- Tracking changes: successful submissions call `trackAquafacialLeadSubmit()`.
- Treatwell link handling: Treatwell is shown as a secondary direct action after successful form submission.
- Mobile sticky CTA changes: mobile/tablet sticky button now scrolls to the lead form and hides while consent is visible or after success.
- SEO/metadata updates: title, meta description, canonical through `LandingPage.astro`, Open Graph description support, and structured data were updated for the lead-generation offer.

## Lead Form Details

- Required fields: `name`, `phone`, `email`, `preferred_contact_method`, `privacy_consent`.
- Optional fields: `preferred_time`, `skin_concern`, `message`.
- Hidden fields: `campaign`, `offer`, `treatment`, `landing_page`, `page_path`, `page_url`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`, `msclkid`.
- Validation behavior: client-side validation blocks missing required fields, invalid email, invalid phone, missing contact method, and missing privacy consent.
- Submission behavior: the browser sends JSON to the existing `/api/contact` Worker route. No success state is shown until the backend returns success.
- Success message: confirms the request was received and that Beauty Face Lift will personally follow up.
- Error message: `Leider konnte deine Anfrage gerade nicht gesendet werden. Bitte versuche es erneut oder kontaktiere uns direkt per WhatsApp.`
- Lead destination: existing Resend notification flow in `worker/routes/contact.ts`.
- UTM handling: URL parameters and existing `sessionStorage` attribution are copied into the payload before submission.
- Privacy consent behavior: the checkbox links to `/datenschutz/` and is required.
- Production anti-spam behavior: the form renders Cloudflare Turnstile when `PUBLIC_TURNSTILE_SITE_KEY` is available at build time, submitting `cf-turnstile-response` through the existing form payload.

## Lead Delivery And Email Service

- Form endpoint: `POST /api/contact`.
- Worker handler: `worker/routes/contact.ts`.
- Email service: Resend via `https://api.resend.com/emails`.
- Required production secret: `RESEND_API_KEY`.
- Recipient selection order: `CONTACT_TO_EMAIL`, then `OWNER_EMAIL`, then fallback `info@beautyfacelift.ch`.
- Sender selection order: `CONTACT_FROM_EMAIL`, then fallback `Beauty Face Lift <onboarding@resend.dev>`.
- Reply-to behavior: if the lead email is valid, the notification uses the submitted email as `reply_to`.
- Production secret names confirmed in Cloudflare on 2026-06-24: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`.
- Production Turnstile config confirmed on 2026-06-24: `TURNSTILE_SECRET_KEY` exists as a Cloudflare Worker secret and `PUBLIC_TURNSTILE_SITE_KEY` exists as a GitHub repository variable.
- Secret values are not readable through Wrangler after creation, so the actual recipient/sender addresses must be verified by a real test lead or by re-entering the secrets.
- Current storage behavior: leads are not written to a database. The notification email is the lead destination.

## Tracking Details

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

## QA Results

- Desktop: verified in the in-app browser on the Astro dev server. One H1, no horizontal overflow, and no console errors were observed.
- Mobile: verified at 390 x 844. The hero, form, and trust sections fit without horizontal overflow.
- CTA anchor scrolling: covered by `npm run qa:aquafacial-lp` and verified in browser from the mobile sticky CTA.
- Sticky mobile CTA: verified hidden while the consent banner is visible, visible after consent dismissal, and hidden after successful lead submission.
- Form validation: verified in browser. Missing required fields show field-level German validation messages and do not show the success state.
- Form submission: verified with a local mocked 201 `/api/contact` response. Production Resend secrets are present, but actual inbox delivery still needs one manual live submission through Turnstile.
- Success state: verified with the mocked backend response. The form is hidden, the thank-you state is shown, and the secondary direct booking link is available only after success.
- Error state: verified at API level with a valid local lead payload returning HTTP 503 when email delivery is not configured. The page maps failed backend responses to the requested fallback message.
- Backend lead delivery: route accepts Aquafacial fields and uses campaign-specific email subject.
- Turnstile: production contact submissions require Turnstile on canonical hosts. The LP now renders the widget when `PUBLIC_TURNSTILE_SITE_KEY` is available during build.
- Tracking events: static QA covers `trackAquafacialLeadSubmit()` and the `aquafacial_lead_submit` event contract. The success path calls the helper only after a successful response.
- Treatwell secondary link: static QA and mocked success browser QA verify the requested direct URL.
- WhatsApp/privacy links: static QA covers page links.
- Forbidden naming search: final scan should exclude the QA script's negative-test term list.
- Console errors: none observed in desktop or mobile browser checks.
- Build/lint/typecheck: `npm run build` is the available compile check. No dedicated lint or typecheck scripts are currently defined in `package.json`.

## Open Points

- Final Meta Events Manager verification must happen in the ad account after deployment.
- Final production inbox delivery must be confirmed with one manual Turnstile-verified live test lead.
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
- Verified production `/api/contact` rejects valid lead payloads without `cf-turnstile-response` with HTTP 400, confirming Turnstile enforcement on canonical hosts.
- Fresh verification commands passed after documentation sync: `npm run qa:aquafacial-lp`, `npm run qa:marketing`, production-style `npm run build`, and `npx wrangler deploy --assets=./dist --old-asset-ttl=0 --keep-vars --dry-run`.
- Final manual check remaining: submit one real test lead through the live form to confirm Resend inbox delivery.
