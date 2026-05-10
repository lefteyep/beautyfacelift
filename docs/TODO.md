# TODO — beautyfacelift.ch

**Last updated:** May 10, 2026

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
- [ ] Replace weak/test admin password with a strong unique password
- [ ] Replace placeholder images with real Teresa/studio photos
- [x] Align public prices with the official Treatwell catalog

## Priority 2: Tracking & Analytics (before running ads)
- [ ] Create GTM container + set PUBLIC_GTM_ID in Cloudflare
- [ ] Create GA4 property + set GA4_MEASUREMENT_ID and GA4_API_SECRET
- [ ] Create Meta Pixel + set PUBLIC_META_PIXEL_ID, META_PIXEL_ID, and META_ACCESS_TOKEN
- [ ] Verify Meta Test Events: PageView on ad LPs and Lead on Treatwell booking clicks
- [ ] Decide whether confirmed Treatwell bookings can be imported later via Treatwell export, CRM import, or offline conversions
- [ ] Submit sitemap to Bing Webmaster Tools

## Priority 3: Email & Notifications
- [ ] Set up Resend account + RESEND_API_KEY
- [ ] Deploy Supabase Edge Function: `supabase functions deploy notify-booking`
- [ ] Test full booking flow with real email notification

## Priority 4: Stripe Deposits
- [ ] Set up Stripe account + configure env vars (STRIPE_SECRET_KEY, etc.)
- [ ] Keep Stripe deposit work paused while public booking stays on Treatwell
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
- [x] ~~Design elevation: Phases 2-7~~ — Replaced by pixel-perfect .pen design implementation (March 19, 2026)
