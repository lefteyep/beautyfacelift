# PPC Tracking — current site events and campaign use

Updated 21 October 2026. The review repairs are **IMPLEMENTED AND LOCALLY VERIFIED ACROSS REPAIR BRANCHES**; see [REPAIR-2026-10-21.md](REPAIR-2026-10-21.md). Historical setup commands are [archived](../archive/reviews/2026-10-21-pre-repair/PPC-TRACKING.md).

## Implemented Site Events

Google Tag Manager (`GTM-NVC9QKGS`) forwards these dataLayer events to GA4 (`G-4C9M8KMFQY`) since 2026-10-10. The setup is in [tracking/GOOGLE-ANALYTICS-GTM.md](tracking/GOOGLE-ANALYTICS-GTM.md).

The site now uses `/termin/` as the owned booking-forward page before sending users to:

```text
https://buchung.treatwell.ch/ort/beauty-face-lift/
```

All booking links should stay pointed at `/termin/` or `bookingLinkForService(service)`. The final Treatwell redirect fires `treatwell_outbound_click`, a booking-intent proxy. It does not prove a booking. The current combo campaign optimises on standard `Lead`, not this click; use [the campaign checklist](META-CAMPAIGN-AQUAFACIAL-MICRONEEDLING.md).

| dataLayer event | Meta browser/CAPI event | Use |
|---|---|---|
| `page_view` | `PageView` | Observation |
| `landing_page_view` | `LandingPageView` | Retargeting |
| `treatment_view` | `ViewContent` | Retargeting |
| `booking_button_click` | `BookingButtonClick` | Secondary conversion |
| `treatwell_outbound_click` | `TreatwellOutboundClick` | Booking-intent proxy; secondary for the current combo campaign |
| `/termin/` forward | `Schedule` | Booking-intent event; not a confirmed appointment |
| `generate_lead` | `Lead` | Accepted enquiry; current combo-campaign optimisation event |
| `phone_click` | `Contact` with `method=phone` | Secondary conversion |
| `whatsapp_click` | `Contact` with `method=whatsapp` | Secondary conversion |
| `scroll_50` | `Scroll50` | Observation |
| `scroll_90` | `Scroll90` | Observation |
| `time_on_page_30s` | `TimeOnPage30s` | Observation |
| `high_intent_visit` | `HighIntentVisit` | Retargeting/secondary |

Core parameters include `event_id`, `page_path`, `page_type`, `treatment_name`, `button_location`, `destination_url`, `link_domain`, `value`, `currency`, and campaign parameters such as `utm_source`, `utm_campaign`, `gclid`, and `fbclid`.

Meta CAPI matching data is consent-gated. After marketing consent, the site sends IP address and User Agent from the Worker request, `_fbp` from the browser cookie, and `_fbc` from the browser cookie. If `_fbc` is missing but a valid `fbclid` exists in the current URL or stored campaign parameters, the site creates `_fbc` in Meta's `fb.1.<timestamp>.<fbclid>` format before the browser Pixel and CAPI events fire. Do not send email, phone, name, ZIP, DOB, city, state, `fb_login_id`, or `external_id` for PageView events unless that data is actually collected with consent.

The event-data keys the page may send and the Worker accepts are one list in `shared/tracking.ts`; a key added on one side only would make the Worker reject every event that carries it. For Meta Events Manager troubleshooting, append `test_event_code=TEST...` to the test URL. The browser stores that code for the session and forwards it only to `/api/track`, where the Worker validates it and sends it as Meta's CAPI `test_event_code`. This lets Test Events show the server-side CAPI events alongside browser events.

## Live Deployment Status

Production source reviewed on 2026-10-21 is `35af1f0`; the site is already deployed on Cloudflare Workers and bookings use Treatwell. Pixel/CAPI and GTM/GA4 were configured in October. A labelled ad-style test on 2026-10-20 accepted the server events including Lead; that dated observation is not ongoing monitoring.

Current deployment behavior:

- `/termin/` forwards users to `https://buchung.treatwell.ch/ort/beauty-face-lift/`.
- Booking CTAs fire `booking_button_click` before navigation to `/termin/`.
- `/termin/` fires `treatwell_outbound_click` before forwarding to Treatwell.
- `/api/track` accepts Meta CAPI events and optional GA4 Measurement Protocol forwarding.
- Marketing tags and server-side marketing events only fire after the visitor grants marketing consent.
- If Meta, GTM, or GA4 variables are missing, tracking calls are skipped gracefully and users still reach Treatwell.

Recorded configuration (no live secret inventory was performed in this review):

| Variable | Location | Recorded state |
| --- | --- | --- |
| `PUBLIC_META_PIXEL_ID` | GitHub Actions build variable | Configured for browser Pixel `1147246982373946` |
| `META_PIXEL_ID`, `META_ACCESS_TOKEN` | Worker secrets | CAPI configured; successful labelled test recorded 2026-10-20 |
| `PUBLIC_GTM_ID` | GitHub Actions build variable | `GTM-NVC9QKGS`, live since 2026-10-10 |
| `GA4_MEASUREMENT_ID`, `GA4_API_SECRET` | Optional Worker configuration | Intentionally off; GA4 runs through GTM, avoiding duplicate forwarding |

Astro embeds `PUBLIC_*` at build time; dashboard-only changes to Worker variables do not rebuild static HTML. Use the reviewed GitHub release process, not manual `cf:deploy`/Wrangler deployment. Do not recreate configured properties or enable server-side GA4 from historical setup commands.

## Meta campaign use

- Preserve standard Pixel `Lead` optimisation for the combo campaign. Custom conversion **BFL – Lead – Kombi LP** (`1596786311924725`) is a reporting column only.
- The campaign remains paused and waits for cockpit Phase 1 by the user's decision, plus Treatwell CHF 170 service, old-site shutdown/301 redirect, revised dates and an approved funnel test.
- Do not add a second Pixel base tag in GTM; the site already initialises it after consent.
- Fix and verify R2 (request provenance/content type) and R9 (current click ID replacing a stale cookie) in the repair milestone. Before verification, current production can use a stale `_fbc` on repeat paid visits; do not describe that as repaired already.
- `Schedule`, `TreatwellOutboundClick`, phone and WhatsApp events measure intent/contact clicks. Verified appointments/outcomes require the staff record, not a click event.
- Offline conversions, new audiences/conversions and further automation are outside this repair. Historical recommendations are retained in the archive.

## GTM And GA4

Create dataLayer variables for:

```text
event_id
page_path
page_type
treatment_name
button_location
destination_url
link_domain
value
currency
utm_id
utm_source
utm_medium
utm_campaign
utm_content
utm_term
utm_source_platform
gclid
gbraid
wbraid
fbclid
matchtype
network
device
```

Create custom event triggers:

```text
landing_page_view
treatment_view
booking_button_click
treatwell_outbound_click
phone_click
whatsapp_click
scroll_50
scroll_90
time_on_page_30s
high_intent_visit
```

Create GA4 event tags with the same event names and pass through the matching parameters. `generate_lead` was marked as a key event on 2026-10-20. Mark `aquafacial_lead_submit`, `treatwell_outbound_click`, `booking_button_click`, `whatsapp_click` and `phone_click` as they fire and are verified. A GA4 key-event flag is not a decision to change the Meta campaign optimisation event.

## Google Ads

Use native Google Ads conversion tags or imported GA4 key events, but do not make both primary for the same action.

Historical Google Ads recommendations below are not current account configuration or an approved campaign launch. Review separately before any Google Ads work:

| Conversion | Source | Primary | Count | Value |
|---|---|---:|---|---:|
| `BFL - Treatwell Outbound Click` | Google Ads tag or GA4 import | Yes | One | CHF 10 |
| `BFL - Booking Button Click` | Google Ads tag or GA4 import | No | One | CHF 5 |
| `BFL - Phone Click` | Google Ads tag or GA4 import | No | One | CHF 8 |
| `BFL - WhatsApp Click` | Google Ads tag or GA4 import | No | One | CHF 8 |
| `BFL - High Intent Visit` | GA4 import | No | One | CHF 2 |

## QA

- Open a landing page with UTMs and `fbclid`, then click a booking CTA.
- After marketing consent, confirm server events include `_fbp` and `_fbc`; `_fbc` should be created from `fbclid` if the cookie was not already present.
- Confirm `booking_button_click` fires before navigation to `/termin/`.
- Confirm `/termin/` appends UTMs and `service` to the Treatwell URL.
- Confirm `treatwell_outbound_click` and `Schedule` fire once before redirect.
- With consent denied, confirm no Meta Pixel, GTM, or `/api/track` marketing event fires.
- With consent granted, confirm Meta Pixel browser events and CAPI events fire.
- Confirm Meta Events Manager shows browser and server events deduplicated by `event_id`.
- Confirm GA4 DebugView receives all dataLayer-backed events.
- Confirm Tag Assistant shows the Google Ads conversion only on `treatwell_outbound_click`.
- Confirm phone and WhatsApp clicks work on mobile.
- Confirm users still reach Treatwell if `/api/track` fails.

## Current verification order

1. Finish and verify the focused repair milestone against the final revision, using source checks and local stubbed harnesses. No real form submissions or marketing POSTs in routine repair tests.
2. Recheck consent-denied behavior, accepted-lead counting and browser/server deduplication using the approved harness/browser approach. Live labelled-test enquiries require explicit authorization because they email Teresa.
3. Preserve the cockpit-before-campaign business gate and resolve pre-D1 data readiness/authentication as separate scoped work; authentication remains deferred now.
4. Before an approved campaign launch, verify the Treatwell offer, old-site redirect/email preservation, dates, `_v2` previews and UTMs. Keep standard Lead optimisation and report-only custom conversion.
5. Reconcile actual enquiry notifications, stored leads and manually verified booking outcomes. GA4/Meta are consent-limited; Treatwell outbound clicks do not prove appointments. No Phase 2 automation in this repair.
