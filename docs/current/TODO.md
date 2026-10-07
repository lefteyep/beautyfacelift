# TODO — beautyfacelift-zuerich.ch

**Last updated:** October 7, 2026

## Priority 0: Release the October work (agency)
- [x] Fix the CI `npm audit` gate (0 vulnerabilities) — branch `codex/code-health-2026-10`
- [x] Restore `trackLead` for the Aquafacial + Microneedling LP; hashed email/phone on the Aquafacial CAPI Lead
- [x] Re-openable cookie consent ("Cookie-Einstellungen"), compact mobile banner
- [x] `npm run check` at 0 errors; remove `src/api_backup/`
- [x] ~~Swiss Quiet Luxury redesign~~ — rejected by the client on 2026-10-06 and replaced by "Atelier Glow" (`codex/modern-redesign`)
- [x] Release Atelier Glow as one release — live since 2026-10-07 (PR #25; deploy fixed by PR #26)
- [x] After deploy: Lighthouse mobile on `/` (98/100/100/100) and `/lp/aquafacial/` (98/100/100, noindex)
- [ ] Meta Test Events check for Lead + CAPI dedupe on the live LPs
- [x] Aquafacial LP conversion and copy pass — live since 2026-10-07 (PR #27)
- [x] Same pass for the combo, Carbon, Microneedling and Peeling ad pages — live since 2026-10-07 (PR #28)
- [ ] Next real `/kontakt/` enquiry: confirm the email to the studio now shows the chosen treatment (fix live since PR #28)
- [ ] Decide Supabase: restore project `izekwngqjllaqibrwotp` (needed for lead status / Confirmed-Attended events) or decommission the legacy booking widget, admin and `/api/services|slots|bookings|availability`
- [x] Contact form: the Worker dropped the chosen treatment (`treatment_interest`) since 2026-06-24; fixed and live on 2026-10-07 (PR #28). `scripts/check-contact-concierge.mjs` now checks the current Worker and runs as `npm run qa:contact`
- [x] Remove merged/abandoned worktrees under `astro-v2-worktrees/` and the old `astro-v2-*` sibling folders — done 2026-10-07 (13 worktrees; uncommitted state kept in local `backup/2026-10-07/*` branches; record in `../_archives/2026-10-07-cleanup/README.md`)
- [ ] Decide on the local `backup/2026-10-07/agent-git-hygiene` branch: unfinished agent-worktree tooling (`scripts/agent-worktree.mjs`, pre-push hook, `build.yml`) from June — finish it in a PR or drop it

## Priority 0: Decisions for Teresa
- [ ] Aquafacial LP: confirm "statt CHF 180" as a provable regular price and an end date for the Kennenlernpreis (Swiss price-indication rules)
- [ ] Treatwell: create a "Aquafacial Aktion – 60 Min. – CHF 99" service so the post-form link opens the advertised offer
- [ ] Confirm the review source and current count (site shows 4,8 / 5 from 248+; LP shows 249) and allow linking to it
- [ ] Keep or replace the "90 Prozent von deinem Selfie" quote (du-voice on a Sie-voice site)
- [ ] Book a half-day studio photo shoot (Teresa at work, hands, products, room) to replace AI-looking stock imagery
- [ ] Decide the future of the old WordPress site on `beautyfacelift.ch` (301 to the new domain vs. keep separate)
- [ ] Ad pages, reference prices: "statt CHF 250.–" (combo) and "statt CHF 220.–" / "Sie sparen CHF 51" (Carbon) need the same reference-price proof and an end date as the Aquafacial "statt CHF 180.–" (Swiss price-indication rules). There is also a conflict: the Microneedling page, `/behandlungen/vergleich/` and the Microneedling FAQ list "Carbon Laser + Microneedling" at **CHF 250**, while the Carbon ad page uses CHF 220 as its reference price.
  - Answer from the agency on 2026-10-07: both ad prices are time-limited campaign offers, promoted through the Meta campaigns.
  - Still open: each campaign needs an end date. A "statt" reference price should be the price actually charged before the campaign. If Carbon Laser + Microneedling regularly costs CHF 250, "statt CHF 220" understates the saving, so align one of the two
- [ ] Carbon ad page: the three client quotes still carry "TODO: Teresa to supply real testimonials" in the code — confirm they are real, or replace them with verified reviews
- [ ] Combo ad page: the QA-pinned infographic `aquafacial-microneedling-infografik-zuerich.webp` says "Hydrofacial + Microneedling" and "Stimuliert Kollagen" in the image itself; it needs a corrected image (no "Hydro/Hydra", cautious claims)
- [ ] Opening hours: the Carbon page said "Mo–Fr 10:00–20:00 · Sa 09:00–16:00"; the site (`shared/site.ts`) says Mo–Fr 09:00–18:00 · Sa 10:00–16:00. The Carbon page now uses the shared hours — confirm which hours are correct
- [ ] Massage: the price row "Ganzkörpermassage CHF 135–1200" ("Preisspanne laut Treatwell") — CHF 1200 looks like a data error; confirm the real range
- [ ] Gesichtsbehandlung: pages show "45–120 Min.", but no listed Gesichtsbehandlung takes 120 minutes — confirm the duration range
- [ ] ColdPlasma page review: the page used to attribute "Stammkundin seit 2008 — Teresa versteht meine Haut …" to Daniel. It now uses the homepage wording "Stammkunde seit 2008, immer wieder begeistert." – Daniel. Confirm the real review text.
- [ ] Peeling flaking: the peeling page says a fine, barely visible flaking starts about 2–5 days after the treatment. The articles and `llms-full.txt` now follow it (they had said "2–3 Tage" and "2–5 Tage Ausfallzeit"); confirm.
- [x] Wissen articles: unverifiable, superlative and medical claims removed or softened.
  - **Facts:** aligned with the treatment pages.
  - **Titles:** 44–54 characters.
  - **Also cleaned:** "Vortex"/"patentiert" removed from the Aquafacial page, the Wissen cards and `llms*.txt`.
  - **Where:** PR #31, 2026-10-07.
- [x] Aquafacial + Microneedling is one 90-minute session (agency answer, 2026-10-07). The articles now say so. The LP price is a time-limited campaign offer (see the reference-price item above).
- [x] Microneedling treatment page: the stated "Nadeltiefe (0,5 bis 2,5 mm)" was confirmed by the agency on 2026-10-07, so it stays.
- [ ] Wissen follow-ups, parked: the agency said on 2026-10-07 the current wording is fine for now. Revisit with Teresa:
  - **Microneedling preparation:**
    - **Conflict:** the article says to avoid AHA/BHA/Fruchtsäure products in the days before. The treatment page says a light Fruchtsäure peel a few days before can be useful. Which is right?
    - **Contraindications:** the articles list more of them than the treatment pages do (Isotretinoin, Stillzeit, Blutverdünner, Autoimmunerkrankungen, Keloide). Add them to the treatment pages, or trim the articles?
  - **Device details missing from the treatment pages:** the Aquafacial "transparenter Auffangbehälter", ColdPlasma "berührungsfrei", and which Microneedling pen is used. Confirm each before an article mentions it again.
  - **Offers to confirm:**
    - Aquafacial packages (the articles now say "auf Anfrage");
    - Microneedling on Hals/Dekolleté and its price;
    - "individuelle Jahrespläne";
    - the quoted recommendation of a skin analysis "alle drei Monate".
  - **Anti-aging comparison table:** it is down to two rows (Ausfallzeit, Empfindliche Haut) because the other rows contradicted the treatment pages. Rebuild it from treatment-page facts if Teresa wants the comparison.
  - **`microneedling-erfahrung`:** its description says "Ehrlicher Erfahrungsbericht", but the studio wrote it. Rename it to "Ratgeber"?

## Completed (May 7, 2026 — Custom-domain launch)
- [x] Connect `beautyfacelift-zuerich.ch` in Cloudflare DNS
- [x] Switch all-inkl nameservers to Cloudflare (`ezra.ns.cloudflare.com`, `ryleigh.ns.cloudflare.com`)
- [x] Preserve all-inkl MX/SPF/DKIM/DMARC records in Cloudflare
- [x] Remove new-domain all-inkl website records from Cloudflare DNS
- [x] Deploy Worker custom domains for apex and `www`
- [x] Confirm `www.beautyfacelift-zuerich.ch` redirects to the apex with path/query preserved
- [x] Confirm `workers_dev=false`; temporary workers.dev host returned 404
- [x] Confirm sitemap and robots use `https://beautyfacelift-zuerich.ch`

## ✅ Completed (March 19, 2026 — Pixel-Perfect Design Implementation)
- [x] Implement pixel-perfect design from .pen design file across all 24 pages
- [x] Homepage: hero typography, service cards, testimonials, editorial grid
- [x] Navigation: refined spacing, logo sizing, pill CTA
- [x] Footer: 3-column layout, newsletter input, proper padding
- [x] Treatment pages: pricing cards with accent variant, FAQ section styling
- [x] Blog: card grid with hover effects, article typography with drop caps
- [x] 404 page: centered layout with design-system typography
- [x] Termin page: booking section styling
- [x] CSS: comprehensive design token updates (spacing, colors, typography, radii, shadows)
- [x] All pages verified against .pen design file via browser inspector

## ✅ Completed (March 18, 2026 — SEO/AIO Overhaul)
- [x] Expand all 4 treatment pages to 3000+ words (pricing, FAQs, process, testimonials)
- [x] Create treatment comparison page (/behandlungen/vergleich/)
- [x] Create FAQ hub page (/haeufige-fragen/) with 20 categorized FAQs
- [x] Write 5 blog articles (2000+ words each)
- [x] Expand homepage with testimonials, FAQs, ColdPlasma section
- [x] Expand about page with E-E-A-T credentials
- [x] Expand treatment overview with breadcrumbs, guidance, FAQ
- [x] Add llms.txt + llms-full.txt for AI platform discoverability
- [x] Add robots.txt with AI crawler rules; Cloudflare Managed Content Signals should be reviewed separately if AI crawler access is intended
- [x] Improve sitemap (priority-weighted, filtered)
- [x] Add geo meta tags, max-image-preview, OG image dimensions
- [x] Add image width/height to all img tags
- [x] Schema.org coverage for BeautySalon, WebSite, Service, FAQPage, Article, Person, BreadcrumbList, and ItemList; unverified rating/review/price-rich-result claims removed from production SEO metadata
- [x] Fix canonical URLs to resolve against beautyfacelift-zuerich.ch
- [x] Add blog CSS and infrastructure

## Priority 1: Go Live (blocking everything else)
- [ ] Verify domain in Google Search Console + submit sitemap
- [ ] Claim/verify Google Business Profile (Bahnhofstrasse 94, 8001 Zürich)
- [ ] Rotate the Supabase `service_role` key if any previous chat, local file, or deployment log exposed it.
- [ ] Replace weak/test admin credentials before exposing production customer data.
- [ ] Verify `/api/services` on production returns 200 or intentionally document why it may return 500 while Treatwell is active.
- [ ] Replace placeholder images with real Teresa/studio photos
- [ ] Get real treatment prices from Teresa and update pages + Supabase

## Priority 2: Tracking & Analytics (before running ads)
- [ ] Create GTM container + set PUBLIC_GTM_ID in Cloudflare
- [ ] Create GA4 property + set GA4_MEASUREMENT_ID and GA4_API_SECRET
- [ ] Create Meta Pixel + set PUBLIC_META_PIXEL_ID, META_PIXEL_ID, and META_ACCESS_TOKEN
- [ ] Verify conversion tracking (GA4 DebugView + Meta Test Events)
- [ ] Verify Treatwell outbound click as the primary proxy conversion before launching paid campaigns
- [ ] Submit sitemap to Bing Webmaster Tools

## Priority 3: Email & Notifications
- [ ] Set up Resend account + RESEND_API_KEY
- [ ] Deploy or verify Supabase Edge Function: `supabase functions deploy notify-booking`
- [ ] Test full booking flow with real email notification

## Priority 4: Stripe Deposits
- [ ] Set up Stripe account + configure env vars (STRIPE_SECRET_KEY, etc.)
- [ ] Wire DepositStep into BookingWidget flow (component exists, not integrated)
- [ ] Set up Stripe webhook endpoint
- [ ] Test deposit payment flow in Stripe test mode

## Priority 5: Backlinks & Off-Page SEO
- [ ] Submit to local.ch, search.ch, Swiss Yellow Pages
- [ ] Ensure Treatwell profile links to beautyfacelift-zuerich.ch
- [ ] Submit to Zürich business directories
- [ ] Google Merchant Center — add services with pricing
- [ ] Request backlinks from beauty/wellness bloggers

## Priority 6: Ongoing Content
- [ ] Write 2 blog articles per month targeting long-tail keywords:
  - "Gesichtsbehandlung Zürich Erfahrung"
  - "Aquafacial Kosten Schweiz"
  - "Microneedling Aknenarben Zürich"
  - "Kosmetikerin Zürich Bahnhofstrasse"
  - "ColdPlasma Behandlung Erfahrung"
- [ ] Add verified reviews/testimonials only when permission and source are available
- [ ] Run Lighthouse audit and fix any issues below 95

## Priority 7: Future Features
- [ ] WhatsApp Business API for booking notifications
- [ ] Customer reminder emails (24h before appointment)
- [ ] Multi-language support (English version)
- [ ] Booking calendar widget on homepage
- [x] Decide whether to delete `src/api_backup/**` after confirming git history is sufficient as the archive. — Deleted 2026-10-06 (git history keeps it).
- [ ] Decide whether to keep, remove, or revive the legacy first-party BookingWidget after Treatwell/confirmed-booking tracking is settled.
- [x] ~~Design elevation: Phases 2-7~~ — Replaced by pixel-perfect .pen design implementation (March 19, 2026)
