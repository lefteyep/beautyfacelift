# PPC Tracking Setup - Treatwell Proxy Launch

## Implemented Site Events

The site now uses `/termin/` as the owned booking-forward page before sending users to:

```text
https://buchung.treatwell.ch/ort/beauty-face-lift/
```

All booking links should stay pointed at `/termin/` or `bookingLinkForService(service)`. The final Treatwell redirect fires `treatwell_outbound_click`, which is the launch proxy conversion.

Aquafacial + Microneedling campaign traffic with `offer=aquafacial-microneedling-aktion` is deep-linked into Treatwell's exact service detail modal:

```text
https://buchung.treatwell.ch/ort/beauty-face-lift/?...&service=Aquafacial+%2B+Microneedling&offer=aquafacial-microneedling-aktion&price=170#serviceDetails=TR4124140
```

| dataLayer event | Meta browser/CAPI event | Use |
|---|---|---|
| `page_view` | `PageView` | Observation |
| `landing_page_view` | `LandingPageView` | Retargeting |
| `treatment_view` | `ViewContent` | Retargeting |
| `booking_button_click` | `BookingButtonClick` | Secondary conversion |
| `treatwell_outbound_click` | `TreatwellOutboundClick` | Primary proxy conversion |
| `/termin/` forward | `Schedule` | Standard Meta event for custom-conversion compatibility |
| `phone_click` | `Contact` with `method=phone` | Secondary conversion |
| `whatsapp_click` | `Contact` with `method=whatsapp` | Secondary conversion |
| `scroll_50` | `Scroll50` | Observation |
| `scroll_90` | `Scroll90` | Observation |
| `time_on_page_30s` | `TimeOnPage30s` | Observation |
| `high_intent_visit` | `HighIntentVisit` | Retargeting/secondary |

Core parameters include `event_id`, `page_path`, `page_type`, `treatment_name`, `button_location`, `destination_url`, `link_domain`, `value`, `currency`, and campaign parameters such as `utm_source`, `utm_campaign`, `campaign_id`, `adset_id`, `ad_id`, `placement`, `creative_angle`, `gclid`, and `fbclid`.

Meta CAPI matching data is consent-gated. After marketing consent, the site sends IP address and User Agent from the Worker request, `_fbp` from the browser cookie, and `_fbc` from the browser cookie. If `_fbc` is missing but a valid `fbclid` exists in the current URL or stored campaign parameters, the site creates `_fbc` in Meta's `fb.1.<timestamp>.<fbclid>` format before the browser Pixel and CAPI events fire. Do not send email, phone, name, ZIP, DOB, city, state, `fb_login_id`, or `external_id` for PageView events unless that data is actually collected with consent.

For Meta Events Manager troubleshooting, append `test_event_code=TEST...` to the test URL. The browser stores that code for the session and forwards it only to `/api/track`, where the Worker validates it and sends it as Meta's CAPI `test_event_code`. This lets Test Events show the server-side CAPI events alongside browser events.

## Live Deployment Status

As of 2026-05-08, the site code is ready to deploy to Cloudflare Workers with Treatwell as the temporary booking destination.

Current deployment behavior:

- `/termin/` forwards users to `https://buchung.treatwell.ch/ort/beauty-face-lift/`.
- Booking CTAs fire `booking_button_click` before navigation to `/termin/`.
- `/termin/` fires `treatwell_outbound_click` before forwarding to Treatwell.
- `/api/track` accepts Meta CAPI events and optional GA4 Measurement Protocol forwarding.
- Marketing tags and server-side marketing events only fire after the visitor grants marketing consent.
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

The site can be deployed before these values exist, but paid campaign optimization should not start until at least consent-approved Meta Pixel browser events and `TreatwellOutboundClick` are visible in Meta Events Manager.

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

If the GitHub `master` deploy workflow is used later, add `PUBLIC_META_PIXEL_ID` as a GitHub repository variable. The workflow already passes it into the `npm run build` step.

After private Worker secrets and public build variables are set, rebuild and redeploy:

```powershell
npm run cf:deploy
```

## Meta Ads

1. Verify `PUBLIC_META_PIXEL_ID`, `META_PIXEL_ID`, and `META_ACCESS_TOKEN` are configured for the deployment environment.
   The site initializes Meta Pixel only after marketing consent when `PUBLIC_META_PIXEL_ID` is present, so do not also fire a second Meta Pixel base tag from GTM unless the direct site bootstrap is removed.
2. In Events Manager, test these events:
   - `PageView`
   - `LandingPageView`
   - `ViewContent`
   - `BookingButtonClick`
   - `Schedule`
   - `TreatwellOutboundClick`
   - `Contact`
   - `HighIntentVisit`
3. Create custom conversions:
   - `BFL - Treatwell Booking Intent`: standard event `Schedule`, category `Termin vereinbaren`, with rules `page_path contains /termin/` and `link_domain contains buchung.treatwell.ch`.
   - `BFL - Aquafacial Treatwell Booking Intent`: event `TreatwellOutboundClick` or `Schedule`, with rules `service equals Aquafacial + Microneedling` and `link_domain contains buchung.treatwell.ch`.
   - `BFL - Booking Button Click`: event `BookingButtonClick`.
   - `BFL - High Intent Visit`: event `HighIntentVisit`.
   - `BFL - Contact Click`: event `Contact`.
4. Start campaigns with the Leads objective and optimize for `BFL - Treatwell Booking Intent` once event volume is stable.
5. Use Traffic/Landing Page Views only as a short ramp if the proxy conversion has too little volume.
6. Do not create Purchase/Schedule optimization until real booking confirmation tracking exists.

## Meta UTM Template

Use this as the ad URL for the Aquafacial + Microneedling campaign:

```text
https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/?utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_id={{campaign.id}}&utm_term={{adset.name}}&utm_content={{ad.name}}&utm_source_platform={{site_source_name}}&campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}&placement={{placement}}&creative_angle=glow_texture
```

Recommended `creative_angle` values for the first test:

```text
glow_texture
bahnhofstrasse_trust
aquafacial_microneedling_combo
aktion_170
teresa_expertise
```

The `/termin/` bridge preserves these parameters and adds the Treatwell service hash for the Aquafacial offer. Do not place the Treatwell URL directly in ads unless you deliberately want to skip first-party landing page tracking.

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
campaign_id
adset_id
ad_id
placement
creative_angle
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
- After marketing consent, confirm server events include `_fbp` and `_fbc`; `_fbc` should be created from `fbclid` if the cookie was not already present.
- Confirm `booking_button_click` fires before navigation to `/termin/`.
- Confirm `/termin/` appends UTMs, `campaign_id`, `adset_id`, `ad_id`, `placement`, `creative_angle`, `service`, `offer`, and `price` to the Treatwell URL.
- For Aquafacial + Microneedling, confirm the final Treatwell URL ends with `#serviceDetails=TR4124140`.
- Confirm `treatwell_outbound_click` and `Schedule` fire once before redirect.
- With consent denied, confirm no Meta Pixel, GTM, or `/api/track` marketing event fires.
- With consent granted, confirm Meta Pixel browser events and CAPI events fire.
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
4. Redeploy so the browser Pixel ID is embedded in the static Astro output and available after marketing consent.
5. Open Meta Events Manager Test Events and visit a paid-style URL, for example:

   ```text
   https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/?utm_source=meta&utm_medium=paid_social&utm_campaign=bfl_ch_meta_aquafacial_microneedling_202605&utm_id=TEST_CAMPAIGN&utm_term=test_adset&utm_content=test_ad&utm_source_platform=meta&campaign_id=TEST_CAMPAIGN&adset_id=TEST_ADSET&ad_id=TEST_AD&placement=instagram_stories&creative_angle=glow_texture&fbclid=test&test_event_code=TEST12345
   ```

6. Accept marketing consent, click a booking CTA, and confirm this sequence:
   - `PageView`
   - `LandingPageView`
   - `ViewContent`
   - `BookingButtonClick`
   - `HighIntentVisit`
   - `Schedule`
   - `TreatwellOutboundClick`
7. Create Meta custom conversions:
   - `BFL - Treatwell Booking Intent`: event `Schedule`, rules `page_path contains /termin/` and `link_domain contains buchung.treatwell.ch`, primary launch optimization.
   - `BFL - Aquafacial Treatwell Booking Intent`: event `TreatwellOutboundClick` or `Schedule`, rules `service equals Aquafacial + Microneedling` and `link_domain contains buchung.treatwell.ch`, campaign-specific optimization/reporting.
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
