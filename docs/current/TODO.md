# TODO — beautyfacelift-zuerich.ch

**Last updated:** May 18, 2026

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
- [ ] Decide whether to delete `src/api_backup/**` after confirming git history is sufficient as the archive.
- [ ] Decide whether to keep, remove, or revive the legacy first-party BookingWidget after Treatwell/confirmed-booking tracking is settled.
- [x] ~~Design elevation: Phases 2-7~~ — Replaced by pixel-perfect .pen design implementation (March 19, 2026)
