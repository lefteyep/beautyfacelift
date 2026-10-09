# Google Tag Manager and Google Analytics 4

Set up on 2026-10-10 by the agency (Google login `mediapaulo@gmail.com`). The site event list and the Meta side are in [../PPC-TRACKING.md](../PPC-TRACKING.md).

## Accounts and IDs

| What | Name | ID |
|------|------|----|
| GTM account | Beauty Face Lift (country Switzerland, anonymous data sharing off) | `6381624605` |
| GTM web container | beautyfacelift-zuerich.ch | **`GTM-NVC9QKGS`** (container `266658438`) |
| GA4 account | Beauty Face Lift (only "technical support" data sharing on) | `411490027` |
| GA4 property | beautyfacelift-zuerich.ch (Switzerland time zone, CHF, beauty & fitness, small) | `558320074` |
| GA4 web stream | Beauty Face Lift Website, `https://beautyfacelift-zuerich.ch`, enhanced measurement on | stream `16098601503`, **`G-4C9M8KMFQY`** |

The site reads the container ID from `PUBLIC_GTM_ID` at build time. CI takes it from the GitHub repository variable `PUBLIC_GTM_ID` (`.github/workflows/deploy.yml`).

## Consent

- Nothing from Google loads before the visitor accepts marketing cookies. `src/lib/track.ts` loads GTM only after consent, on the main site and on the ad pages.
- When GTM loads, the site first sends Consent Mode v2 `default` with `ad_storage`, `analytics_storage`, `ad_user_data` and `ad_personalization` all `granted`. Google Ads needs these signals in CH/EU for conversions and remarketing.
- If the visitor withdraws consent on the page, the site sends a Consent Mode `update` with all four `denied`.

## What the container does

The container is versioned as code in [gtm-container-GTM-NVC9QKGS.json](gtm-container-GTM-NVC9QKGS.json). To rebuild it, use GTM → Admin → Import container, then publish. Version 2 ("v1 – GA4 Google-Tag + Website-Events") was published on 2026-10-10.

- **Google-Tag – GA4 (G-4C9M8KMFQY):** fires on Initialization – All Pages and sends the page views.
- **GA4-Ereignis – Website-Events:** forwards the site's own dataLayer events under the same name. The trigger is "CE – Website-Events" ("CE" stands for Custom Event).
  - Events: `generate_lead`, `aquafacial_lead_submit`, `booking_button_click`, `treatwell_outbound_click`, `whatsapp_click`, `aquafacial_whatsapp_click`, `phone_click`, `email_click`, `view_content`, `landing_page_view`, `treatment_view`, `high_intent_visit`.
  - Not forwarded: `scroll_50`, `scroll_90` and `time_on_page_30s`, because GA4 measures scrolling and engagement itself.
  - Parameters come from the "DLV – …" variables ("DLV" stands for Data Layer Variable): `page_type`, `treatment_name`, `button_location`, `source`, `destination_url`, `link_domain`, `method`, `content_name`, `content_category`, `service`, `campaign`, `offer`, `value`, `currency`.

The server-side GA4 path in `/api/track` (`GA4_MEASUREMENT_ID` + `GA4_API_SECRET`) stays off on purpose. It would send events under a different client ID than the browser tag and count them twice.

## GA4 property settings

- **Data retention:** 14 months for event and user data. The default was 2 months.
- **Custom dimensions (event scope):** Button Position (`button_location`), Behandlung (`treatment_name`), Seitentyp (`page_type`), Kontaktweg (`method`), Service (`service`), Angebot (`offer`).

## Still to do

- [x] **Google signals:** switched on 2026-10-10 at the user's request. It is allowed in all regions, and the privacy policy discloses it, with myactivity.google.com.
- [ ] **Key events:** mark them once the events have arrived (GA4 → Admin → Events → "Letzte Ereignisse", star icon). Mark `generate_lead`, `aquafacial_lead_submit`, `treatwell_outbound_click`, `booking_button_click`, `whatsapp_click` and `phone_click`.
- [ ] **Google Ads:** once a Google Ads account runs for the studio, link it (GA4 → Admin → Product links → Google Ads). Then import the key events as conversions.
- [ ] **Verification:** after the first live deploy with `PUBLIC_GTM_ID`, check GA4 Realtime and DebugView.
