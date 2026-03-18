# TODO — beautyfacelift.ch

## Priority 1: Go Live
- [ ] Connect custom domain `beautyfacelift.ch` in Cloudflare
- [ ] Change admin password from test123 to a strong password
- [ ] Set up Resend account + deploy notify-booking edge function
- [ ] Test full booking flow on production with real email

## Priority 2: Monetization (before running ads)
- [ ] Set up Stripe account + configure deposit env vars
- [ ] Wire DepositStep into BookingWidget flow (component exists but not integrated)
- [ ] Test deposit payment flow in Stripe test mode
- [ ] Set up Stripe webhook endpoint

## Priority 3: Ad Tracking (before spending ad budget)
- [ ] Create GTM container + set PUBLIC_GTM_ID
- [ ] Create GA4 property + set env vars
- [ ] Create Meta Pixel + set env vars
- [ ] Verify conversion tracking fires correctly (GA4 DebugView + Meta Test Events)
- [ ] Set up Google Ads conversion tracking in GTM
- [ ] Set up Meta Ads conversion tracking in GTM
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools

## Priority 4: Content & SEO Polish
- [ ] Replace placeholder images with real Teresa/studio photos
- [ ] Get real treatment prices from Teresa and update Supabase services table
- [ ] Add Google Business Profile and link in schema.org sameAs
- [ ] Expand treatment page content to 500+ words each
- [ ] Add more FAQ questions (target 5+ per treatment page)
- [ ] Run Lighthouse audit and fix any issues below 95

## Priority 5: Future Features
- [ ] WhatsApp Business API integration for booking notifications
- [ ] Customer reminder emails (24h before appointment)
- [ ] Multi-language support (English version)
- [ ] Online reviews / testimonials section
- [ ] Blog / skincare tips content section
- [ ] Booking calendar widget on homepage
