# TODO history 2026

Moved out of [../current/TODO.md](../current/TODO.md) on 2026-10-10 so the open list stays short. Nothing here needs action.

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

## Dropped on 2026-10-10 (bookings run on Treatwell)

Treatwell takes the bookings, confirms them, sends the reminders and handles payment. So these old setup items no longer apply:

- **Booking emails:** the Supabase Edge Function `notify-booking`, and "test full booking flow with real email notification".
- **Stripe deposits:** the account, env vars, wiring `DepositStep` into the BookingWidget, the webhook and test mode.
- **WhatsApp Business API** for booking notifications.
- **Reminder emails** to customers 24 hours before the appointment.
- **Booking calendar widget** on the homepage.
- **"Replace placeholder images with real Teresa/studio photos":** it stays in TODO.md once, as the photo-shoot decision for Teresa.
