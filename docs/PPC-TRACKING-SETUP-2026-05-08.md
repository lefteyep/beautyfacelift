# PPC Tracking Setup - Treatwell Proxy Launch

## Implemented Site Events

The site now uses `/termin/` as the owned booking-forward page before sending users to:

```text
https://buchung.treatwell.ch/ort/beauty-face-lift/
```

All booking links should stay pointed at `/termin/` or `bookingLinkForService(service)`. The final Treatwell redirect fires `treatwell_outbound_click`, which is the launch proxy conversion.

| dataLayer event | Meta browser/CAPI event | Use |
|---|---|---|
| `page_view` | `PageView` | Observation |
| `landing_page_view` | `LandingPageView` | Retargeting |
| `treatment_view` | `ViewContent` | Retargeting |
| `booking_button_click` | `BookingButtonClick` | Secondary conversion |
| `treatwell_outbound_click` | `TreatwellOutboundClick` | Primary proxy conversion |
| `phone_click` | `Contact` with `method=phone` | Secondary conversion |
| `whatsapp_click` | `Contact` with `method=whatsapp` | Secondary conversion |
| `scroll_50` | `Scroll50` | Observation |
| `scroll_90` | `Scroll90` | Observation |
| `time_on_page_30s` | `TimeOnPage30s` | Observation |
| `high_intent_visit` | `HighIntentVisit` | Retargeting/secondary |

Core parameters include `event_id`, `page_path`, `page_type`, `treatment_name`, `button_location`, `destination_url`, `link_domain`, `value`, `currency`, and campaign parameters such as `utm_source`, `utm_campaign`, `gclid`, and `fbclid`.

## Live Deployment Status

As of 2026-05-08, the site code is ready to deploy to Cloudflare Workers with Treatwell as the temporary booking destination.

Current deployment behavior:

- `/termin/` forwards users to `https://buchung.treatwell.ch/ort/beauty-face-lift/`.
- Booking CTAs fire `booking_button_click` before navigation to `/termin/`.
- `/termin/` fires `treatwell_outbound_click` before forwarding to Treatwell.
- `/api/track` accepts Meta CAPI events and optional GA4 Measurement Protocol forwarding.
- If Meta, GTM, or GA4 variables are missing, tracking calls are skipped gracefully and users still reach Treatwell.

Current Cloudflare environment check before launch showed these PPC variables are not configured yet:

| Variable | Type | Required for | Current status |
|---|---|---|---|
| `PUBLIC_META_PIXEL_ID` | build-time public env | Meta browser Pixel | Missing |
| `META_PIXEL_ID` | Worker secret | Meta Conversions API | Missing |
| `META_ACCESS_TOKEN` | Worker secret | Meta Conversions API | Missing |
| `PUBLIC_GTM_ID` | build-time public env | GTM container loading | Missing |
| `GA4_MEASUREMENT_ID` | Worker secret | GA4 Measurement Protocol | Missing |
| `GA4_API_SECRET` | Worker secret | GA4 Measurement Protocol | Missing |

The site can be deployed before these values exist, but paid campaign optimization should not start until at least Meta Pixel browser events and `TreatwellOutboundClick` are visible in Meta Events Manager.

Recommended Cloudflare setup after IDs are available:

```powershell
npx wrangler secret put META_PIXEL_ID
npx wrangler secret put META_ACCESS_TOKEN
npx wrangler secret put GA4_MEASUREMENT_ID
npx wrangler secret put GA4_API_SECRET
```

Set public IDs in the shell or CI environment that runs `astro build`. Astro embeds `PUBLIC_*` values at build time, so putting these only in `wrangler.jsonc` is not enough for the static HTML:

```powershell
$env:PUBLIC_META_PIXEL_ID = "123456789012345"
$env:PUBLIC_GTM_ID = "GTM-XXXXXXX"
npm run cf:deploy
```

If the GitHub `master` deploy workflow is used later, add these as GitHub repository variables/secrets and pass them into the `npm run build` step as environment variables.

After private Worker secrets and public build variables are set, rebuild and redeploy:

```powershell
npm run cf:deploy
```

## Meta Ads

1. Verify `PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID`, and `META_ACCESS_TOKEN` are configured for the deployment environment.
   The site initializes Meta Pixel directly when `PUBLIC_META_PIXEL_ID` is present, so do not also fire a second Meta Pixel base tag from GTM unless the direct site bootstrap is removed.
2. In Events Manager, test these events:
   - `PageView`
   - `LandingPageView`
   - `ViewContent`
   - `BookingButtonClick`
   - `TreatwellOutboundClick`
   - `Contact`
   - `HighIntentVisit`
3. Create custom conversions:
   - `BFL - Treatwell Outbound Click`: event `TreatwellOutboundClick`.
   - `BFL - Booking Button Click`: event `BookingButtonClick`.
   - `BFL - High Intent Visit`: event `HighIntentVisit`.
   - `BFL - Contact Click`: event `Contact`.
4. Start campaigns with the Leads objective and optimize for `BFL - Treatwell Outbound Click` once event volume is stable.
5. Use Traffic/Landing Page Views only as a short ramp if the proxy conversion has too little volume.
6. Do not create Purchase/Schedule optimization until real booking confirmation tracking exists.

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

Create GA4 event tags with the same event names and pass through the matching parameters. Mark only `treatwell_outbound_click` as the initial key event for paid optimization analysis.

## Google Ads

Use native Google Ads conversion tags or imported GA4 key events, but do not make both primary for the same action.

Recommended launch conversion actions:

| Conversion | Source | Primary | Count | Value |
|---|---|---:|---|---:|
| `BFL - Treatwell Outbound Click` | Google Ads tag or GA4 import | Yes | One | CHF 10 |
| `BFL - Booking Button Click` | Google Ads tag or GA4 import | No | One | CHF 5 |
| `BFL - Phone Click` | Google Ads tag or GA4 import | No | One | CHF 8 |
| `BFL - WhatsApp Click` | Google Ads tag or GA4 import | No | One | CHF 8 |
| `BFL - High Intent Visit` | GA4 import | No | One | CHF 2 |

## QA

- Open a landing page with UTMs and `fbclid`, then click a booking CTA.
- Confirm `booking_button_click` fires before navigation to `/termin/`.
- Confirm `/termin/` appends UTMs and `service` to the Treatwell URL.
- Confirm `treatwell_outbound_click` fires once before redirect.
- Confirm Meta Events Manager shows browser and server events deduplicated by `event_id`.
- Confirm GA4 DebugView receives all dataLayer-backed events.
- Confirm Tag Assistant shows the Google Ads conversion only on `treatwell_outbound_click`.
- Confirm phone and WhatsApp clicks work on mobile.
- Confirm users still reach Treatwell if `/api/track` fails.

## Next Steps

Use this order after the live deploy:

1. Create or confirm the Meta Pixel for Beauty Face Lift.
2. Generate a Meta Conversions API access token in Events Manager.
3. Add `PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID`, and `META_ACCESS_TOKEN` to Cloudflare.
4. Redeploy so the browser Pixel ID is embedded in the static Astro output.
5. Open Meta Events Manager Test Events and visit a paid-style URL, for example:

   ```text
   https://beautyfacelift-zuerich.ch/lp/carbon-microneedling/?utm_source=meta&utm_medium=paid_social&utm_campaign=bfl_ch_meta_launch_carbon_202605&utm_content=test_ad&fbclid=test
   ```

6. Click a booking CTA and confirm this sequence:
   - `PageView`
   - `LandingPageView`
   - `ViewContent`
   - `BookingButtonClick`
   - `HighIntentVisit`
   - `TreatwellOutboundClick`
7. Create Meta custom conversions:
   - `BFL - Treatwell Outbound Click`: event `TreatwellOutboundClick`, primary launch optimization.
   - `BFL - Booking Button Click`: event `BookingButtonClick`, secondary.
   - `BFL - Contact Click`: event `Contact`, secondary.
   - `BFL - High Intent Visit`: event `HighIntentVisit`, retargeting/secondary.
8. Create retargeting audiences:
   - All website visitors, 30 days.
   - Landing page viewers, 30 days.
   - Treatment viewers, 30 days.
   - Booking button clickers, 30 days.
   - Treatwell outbound clickers, 30 days.
   - Contact clickers, 30 days.
9. Launch Meta with Leads objective, website conversion location, and optimize for `BFL - Treatwell Outbound Click` once the event is verified. Use landing page views only as a short learning/ramp fallback if event volume is too low.
10. Create GTM and GA4 only after Meta is verified, so duplicate Meta browser events are avoided.
11. In Google Ads, use either native Google Ads conversion tags or imported GA4 key events for `treatwell_outbound_click`; keep only one source primary.
12. Reconcile Treatwell bookings manually every week by campaign, date, service, and voucher/offer code until real booking confirmation tracking is available.
13. When Beautyfacelift/Aesthetika booking integration is ready, replace `TreatwellOutboundClick` as the primary optimization event with the real confirmed booking event.
