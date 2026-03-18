# TODO — beautyfacelift.ch

**Last updated:** March 18, 2026

## ✅ Completed (March 18, 2026 — SEO/AIO Overhaul)
- [x] Expand all 4 treatment pages to 3000+ words (pricing, FAQs, process, testimonials)
- [x] Create treatment comparison page (/behandlungen/vergleich/)
- [x] Create FAQ hub page (/haeufige-fragen/) with 20 categorized FAQs
- [x] Write 5 blog articles (2000+ words each)
- [x] Expand homepage with testimonials, FAQs, ColdPlasma section
- [x] Expand about page with E-E-A-T credentials
- [x] Expand treatment overview with breadcrumbs, guidance, FAQ
- [x] Add llms.txt + llms-full.txt for AI platform discoverability
- [x] Add robots.txt with 10 AI crawler allowances
- [x] Improve sitemap (priority-weighted, filtered)
- [x] Add geo meta tags, max-image-preview, OG image dimensions
- [x] Add image width/height to all img tags
- [x] Rich Schema.org: AggregateRating, AggregateOffer, reviews, Article, Person
- [x] Fix canonical URLs to resolve against beautyfacelift.ch
- [x] Add blog CSS and infrastructure

## Priority 1: Go Live (blocking everything else)
- [ ] Connect custom domain `beautyfacelift.ch` in Cloudflare DNS
- [ ] Verify domain in Google Search Console + submit sitemap
- [ ] Claim/verify Google Business Profile (Bahnhofstrasse 94, 8001 Zürich)
- [ ] Change admin password from test123 to a strong password
- [ ] Replace placeholder images with real Teresa/studio photos
- [ ] Get real treatment prices from Teresa and update pages + Supabase

## Priority 2: Tracking & Analytics (before running ads)
- [ ] Create GTM container + set PUBLIC_GTM_ID in Cloudflare
- [ ] Create GA4 property + set GA4_MEASUREMENT_ID and GA4_API_SECRET
- [ ] Create Meta Pixel + set META_PIXEL_ID and META_ACCESS_TOKEN
- [ ] Verify conversion tracking (GA4 DebugView + Meta Test Events)
- [ ] Submit sitemap to Bing Webmaster Tools

## Priority 3: Email & Notifications
- [ ] Set up Resend account + RESEND_API_KEY
- [ ] Deploy Supabase Edge Function: `supabase functions deploy notify-booking`
- [ ] Test full booking flow with real email notification

## Priority 4: Stripe Deposits
- [ ] Set up Stripe account + configure env vars (STRIPE_SECRET_KEY, etc.)
- [ ] Wire DepositStep into BookingWidget flow (component exists, not integrated)
- [ ] Set up Stripe webhook endpoint
- [ ] Test deposit payment flow in Stripe test mode

## Priority 5: Backlinks & Off-Page SEO
- [ ] Submit to local.ch, search.ch, Swiss Yellow Pages
- [ ] Ensure Treatwell profile links to beautyfacelift.ch
- [ ] Submit to Zürich business directories
- [ ] Google Merchant Center — add services with pricing
- [ ] Request backlinks from beauty/wellness bloggers

## Priority 6: Ongoing Content
- [ ] Write 2 blog articles per month targeting long-tail keywords:
  - "Gesichtsbehandlung Zürich Erfahrung"
  - "Hydrafacial Kosten Schweiz"
  - "Microneedling Aknenarben vorher nachher"
  - "Beste Kosmetikerin Zürich"
  - "ColdPlasma Behandlung Erfahrung"
- [ ] Add Google reviews widget / more testimonials
- [ ] Run Lighthouse audit and fix any issues below 95

## Priority 7: Future Features
- [ ] WhatsApp Business API for booking notifications
- [ ] Customer reminder emails (24h before appointment)
- [ ] Multi-language support (English version)
- [ ] Booking calendar widget on homepage
- [ ] Design elevation: Phases 2-7 (paused, see project_design_redesign.md)
