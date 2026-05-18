# PPC Treatwell Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Track and optimize PPC traffic while bookings temporarily happen on the external Treatwell booking page.

**Architecture:** Use Beauty Face Lift landing pages and `/termin/` as the owned tracking layer. Fire browser events through GTM/dataLayer and send high-value proxy events to `/api/track` for Meta CAPI before redirecting users to Treatwell.

**Tech Stack:** Astro, Cloudflare Worker, GTM, GA4, Google Ads conversion tracking, Meta Pixel, Meta Conversions API.

---

## Summary

- Treat `treatwell_outbound_click` as the primary proxy conversion until confirmed booking tracking exists.
- Send all booking CTAs to `/termin/?service={Treatment}` so the site can preserve UTMs, fire proxy events, and redirect to `https://buchung.treatwell.ch/ort/beauty-face-lift/`.
- Use GTM for browser tags and `/api/track` for server-side Meta CAPI events.
- Keep engagement events observable, but optimize paid campaigns only toward high-intent proxy actions.

## Key Changes

- Update the shared booking destination from Aesthetika to Treatwell.
- Update `/termin/` copy, structured data, fallback link, and redirect behavior for Treatwell.
- Add dataLayer pushes for:
  - `landing_page_view`
  - `treatment_view`
  - `booking_button_click`
  - `treatwell_outbound_click`
  - `phone_click`
  - `whatsapp_click`
  - `scroll_50`
  - `scroll_90`
  - `time_on_page_30s`
  - `high_intent_visit`
- Add client-side helper support for event IDs, Meta browser events, and `/api/track` CAPI calls.
- Expand `/api/track` event validation so it accepts the PPC proxy events and maps them to GA4 Measurement Protocol names.
- Document the GTM, GA4, Google Ads, and Meta Ads setup in a handoff-ready tracking guide.

## Event Rules

| Event | Trigger | Primary platform use |
|---|---|---|
| `page_view` | Every page load | GA4/Meta observation |
| `landing_page_view` | Path starts `/lp/` or paid click parameters are present | Meta retargeting, GA4 analysis |
| `treatment_view` | Path starts `/behandlungen/` or treatment context exists | Meta retargeting, GA4 analysis |
| `booking_button_click` | Owned CTA to `/termin/` or Treatwell | Secondary conversion |
| `treatwell_outbound_click` | `/termin/` redirect or direct Treatwell click | Primary proxy conversion |
| `phone_click` | `tel:` link click | Secondary conversion |
| `whatsapp_click` | `wa.me` or WhatsApp API link click | Secondary conversion |
| `scroll_50` | 50% page scroll once | Observation |
| `scroll_90` | 90% page scroll once | Observation |
| `time_on_page_30s` | 30 seconds on page once | Observation |
| `high_intent_visit` | Booking/contact click or 30s plus 50% scroll | Secondary conversion/retargeting |

## Platform Setup

- Meta:
  - Start with Leads objective, Website conversion location.
  - Optimize for custom conversion `TreatwellOutboundClick` once stable.
  - Use Traffic/Landing Page Views only as a short ramp if conversion volume is too low.
  - Create retargeting audiences for LP visitors, treatment viewers, booking clickers, Treatwell outbound clickers, and contact clickers.
- Google Ads:
  - Make `BFL - Treatwell Outbound Click` Primary, count One, proxy value CHF 10.
  - Keep `booking_button_click`, `phone_click`, `whatsapp_click`, and `high_intent_visit` Secondary.
  - Use Search first with Maximize Conversions after conversion validation.
  - Avoid double-counting by using either native Google Ads tags or imported GA4 key events as the primary source, not both.
- GTM:
  - Enable page, click, and scroll built-ins.
  - Create dataLayer variables for event metadata and campaign parameters.
  - Fire GA4 event tags for all events.
  - Fire Meta Pixel events for high-value events.
  - Fire Google Ads conversions for `treatwell_outbound_click` and optional secondary events.

## UTM Templates

- Meta Ads:
  `utm_id={{campaign.id}}&utm_source=meta&utm_medium=paid_social&utm_campaign=bfl_ch_meta_{funnel}_{treatment}_{yyyymm}&utm_content={{adset.name}}__{{ad.name}}&utm_term={{placement}}&utm_source_platform=meta`
- Google Search:
  `utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_id={campaignid}&utm_term={keyword}&utm_content={adgroupid}_{creative}&utm_source_platform=google_ads&matchtype={matchtype}&network={network}&device={device}`
- Google Performance Max:
  `utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_id={campaignid}&utm_term=pmax&utm_content=pmax_asset_group&utm_source_platform=google_ads`
- Google Demand Gen:
  `utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_id={campaignid}&utm_term=demand_gen&utm_content={creative}&utm_source_platform=google_ads`
- Organic social:
  `utm_source=instagram&utm_medium=organic_social&utm_campaign=bfl_ch_organic_{treatment}_{yyyymm}&utm_content={post_slug}`
- WhatsApp:
  `utm_source=whatsapp&utm_medium=message&utm_campaign=bfl_ch_whatsapp_{audience}_{yyyymm}&utm_content={message_variant}`
- Email:
  `utm_source=newsletter&utm_medium=email&utm_campaign=bfl_ch_email_{theme}_{yyyymm}&utm_content={link_location}`

## QA Checklist

- GTM loads on LPs, treatment pages, contact pages, and `/termin/`.
- GA4 DebugView receives all events with expected parameters.
- Meta Events Manager receives browser events and CAPI events without duplicate warnings.
- Google Tag Assistant shows the primary conversion only on `treatwell_outbound_click`.
- UTMs, `gclid`, `fbclid`, and `service` persist from landing page to `/termin/` and into the Treatwell URL when accepted.
- Phone and WhatsApp links work on mobile.
- Consent mode behavior is visible in Tag Assistant if a CMP is active.
- No click or redirect event fires twice.
- Users still reach Treatwell if analytics requests fail.

## Assumptions

- Treatwell does not currently allow installing GTM, GA4, or Meta Pixel on the booking confirmation page.
- The launch booking destination is `https://buchung.treatwell.ch/ort/beauty-face-lift/`.
- Confirmed booking and revenue tracking will replace proxy optimization when the Beautyfacelift/Aesthetika integration is ready.
