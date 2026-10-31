# Meta campaign — Carbon-Peeling + Microneedling, CHF 175 statt CHF 250

Status 2026-10-31: the ad page `/lp/carbon-microneedling/` is rebuilt for this offer (package 1). Ad images and texts (package 2) and the Meta build (package 3) follow in their own pull requests. Nothing runs on Meta yet; the campaign is switched on only after the launch gates below and the user's go.

This is the only campaign that starts. There is no Carbon-only campaign. The older Aquafacial + Microneedling campaign (CHF 170, [META-CAMPAIGN-AQUAFACIAL-MICRONEEDLING.md](META-CAMPAIGN-AQUAFACIAL-MICRONEEDLING.md)) stays paused and is the template for structure, measurement and the build sheet.

## 1. Summary

- **Offer:** Carbon-Peeling + Microneedling, two treatments in one session of 90 minutes, **CHF 175 statt CHF 250** (Sie sparen CHF 75.–), **valid until Monday, 30 November 2026**.
- **Goal (user, 2026-10-31):** a **Treatwell booking** is the primary goal. Every primary button on the ad page leads through `/termin/` to the Treatwell service. The request form stays as the secondary path for people who want to ask first; each enquiry is stored in the lead cockpit and e-mailed to Teresa with the agency in BCC.
- **Meta optimisation (recommendation, set in package 3):** the standard event `Schedule`, which `/termin/` sends (Pixel and CAPI, same event id) when it hands the visitor to Treatwell. For reporting, a custom conversion «BFL – Schedule – Carbon» (`Schedule`, URL contains `carbon-microneedling-aktion`) can be created in Events Manager by the user. The form `Lead` is the fallback optimisation event if `Schedule` brings too little volume after the learning phase.
- **Frame decided by the user (2026-10-31):** lifetime budget CHF 400 in one ad set, ending Sunday 29 November 2026 23:59; audience 15 km around Bahnhofstrasse 94, people living there, 25+, German, Advantage+ audience; Instagram placements; all images generated (Teresa's face is never generated), no Meta AI label; the page stays `noindex, nofollow`. If the ads start after 10 November, the end date is decided again.

## 2. Offer facts and their sources

| Fact | Value on the page | Source |
|---|---|---|
| Regular price | CHF 250 | Treatwell, «Carbon Laser Peeling + Microneedling», 90 Min. (TODO.md, Treatwell comparison 2026-10-09; the treatment pages list the same price) |
| Saving | «Sie sparen CHF 75.– (30 %)» | 75 of 250 is exactly 30 %; percentage added on the user's decision 2026-10-31 |
| Campaign price | CHF 175 | agreed with Teresa on 2026-10-31 (user). Teresa sets CHF 175 on Treatwell as a **time-limited Aktionspreis until 30 November**, not as a new regular price; screenshot the CHF 250 listing before the change. |
| End date | 30. November 2026 | user decision 2026-10-31 (today + 30 days); one constant `OFFER_VALID_UNTIL` on the page |
| Duration | 90 Min. | Treatwell |
| Treatment steps, in this order | Reinigung → Fruchtsäure-Peeling → Carbon-Peeling → Diamantabrasion → Microneedling → Maske → LED-Licht (1 h 30 min) | Teresa's list, passed on by the user on 2026-10-31; order confirmed by the user the same day («LDL Licht» in her message means LED-Licht, user) |
| Details of the steps | skin analysis before the treatment; Carbon lotion applied and treated with the laser; Microneedling depth set to the skin type; after-care advice | treatment description of the user, 2026-10-31 |
| After-care | SPF 30–50 daily, keep the skin moist, a few days without retinol, acid or peeling products, 24–48 hours no heat and no intense sport | treatment description of the user, 2026-10-31 |
| Not suitable | active infection, inflamed acne, damaged skin; pregnancy | treatment description (first three); pregnancy kept as a cautious exclusion (user decision 2026-10-31) |
| «Dipl. Visagistin & Kosmetikerin» | trust block | Teresa's Treatwell profile; the user confirmed on 2026-10-31 that it applies |
| «seit über 20 Jahren im Beruf und selbstständig» | trust block | statement of the user, 2026-10-31 (no written source) |
| Rating | «4,8 aus 260+ Bewertungen auf Treatwell» | Treatwell showed 4.8 from 261 reviews on 2026-10-31; the line links to the Treatwell page |
| Treatwell service detail | `TR4124153` | user, 2026-10-31; `/termin/` opens it directly |
| Reviews | 42 Treatwell reviews, verbatim, with name, month and treatment; six in view, the rest behind «Weitere Bewertungen anzeigen» | treatwell.ch venue page, read 2026-10-31 (177 reviews with text; Treatwell counts 261 ratings). Selection: 5 stars, German, named reviewer, face treatments, at most two per name (the most recent, Microneedling first; user, 2026-10-31); left out: result promises or descriptions, the other facial brand name, prices, other venues, English and very short reviews. Data in `src/pages/lp/carbon-microneedling/_reviews.ts`; checked against Treatwell with a checksum. |

**Kept off the page:** Hyaluron and a numbing cream. Teresa's list of the steps (2026-10-31) does not name them. The mask is on her list and appears plainly as «Maske», without promises.

**To check with Teresa:** the site's comparison page says Microneedling and a Fruchtsäure-Peeling need «mindestens 2–4 Wochen Abstand» (TODO.md, facts to confirm). Her Carbon treatment combines both in one session; the two statements should be reconciled.

**Never on the page or in ads:** the effect claims of the treatment description (collagen, acne bacteria, scars, «tightens pores», rejuvenation), «keine Ausfallzeit», invented testimonials. Cosmetic claims stay cautious («kann … unterstützen», «kann … wirken»). «Laser» appears only in the method step («mit dem Laser behandelt»), never in the headline, the title or the ads, because Meta can read it as a medical service.

## 3. Page contract (`/lp/carbon-microneedling/`)

- **Flow:** booking first. Every primary button («Jetzt auf Treatwell buchen»; «Jetzt buchen» in the mobile sticky bar) goes to `/termin/?service=Carbon+Microneedling&offer=carbon-microneedling-aktion&price=175`, which shows the Aktion note and forwards to the Treatwell service `TR4124153`. Under each booking button sits one secondary text link to the form («Lieber zuerst Fragen klären? Unverbindlich anfragen.»). After a sent request, the success message offers the booking link again. WhatsApp sits in the closing band and in the floating disc.
- **Sections:** hero (kicker, H1, lead, price line with end date, CTAs, rating line) → «Das ist inbegriffen» → «Typische Behandlungsziele» → «So läuft die Behandlung ab» (three steps: Reinigung und Peelings, Microneedling, Maske und LED-Licht; no lead) → «Persönlich behandelt von Teresa Stimac» → «Bewertungen auf Treatwell» → form → FAQ → studio and directions (map loads on request) → closing band; mobile sticky bar and floating WhatsApp.
- **End date** appears in the hero price line, FAQ 1, the closing band, the meta description and the schema `priceValidUntil`, all from `OFFER_VALID_UNTIL = '2026-11-30'`.
- **Form:** JSON `POST /api/contact` with `topic` «Ich möchte einen Termin buchen», `source` `carbon-microneedling-lp`, `campaign` `carbon_microneedling`, `offer` `carbon-microneedling-aktion`, `treatment` `Carbon Microneedling`, `landing_page`, `page_path`, `page_url`, `referrer`, `utm_*`, `fbclid`, `gclid`, `msclkid`. Required: name, phone/WhatsApp, privacy consent. No Turnstile widget (the Worker exempts the campaign); honeypot and rate limit stay.
- **Images (interim, user decision 2026-10-31):** Teresa on the page with existing, consented images only, nothing newly generated. Hero (4:5 arch, 16:9 band on phones, also the schema image): `src/assets/lp/aquafacial/personal-treatment-zuerich.webp`; skin-analysis slot and Open Graph image (the layout crops the share image to 1.91:1 from the centre, which keeps both faces in this 4:3 photo but would cut them off the 4:5 hero): `src/assets/lp/aquafacial/hautanalyse-beratung-zuerich.webp`; Microneedling step: `src/assets/lp/aquafacial/microneedling-close-up-zuerich.webp`; trust block: her real portrait `src/assets/marketing/teresa_portrait.jpg`, unedited. The Carbon step and the after-care step keep their placeholders from `src/assets/marketing/` until PR #67 lands the Carbon series in `src/assets/lp/carbon/`; the swap points stay marked `IMAGE SWAP 1–6`. Not used: the Aquafacial hero and close-up (they show the Aquafacial device). Alt texts are factual, no captions.
- **Locks:** `npm run qa:carbon-lp` (`scripts/check-carbon-lp-offer.mjs`) pins prices, saving, end date (three places and schema), labels, slug, CTAs, form fields, the absence of the old offer and of the banned claims, the `/termin/` note and `TR4124153`, and the tracking values. `qa:marketing` pins the ViewContent name and the neutral «Typische Behandlungsziele» framing; `qa:leads` pins the copies in `shared/leads.ts`.

## 4. Tracking and lead cockpit

| Layer | Value |
|---|---|
| `data-treatment` on every CTA | `Carbon Microneedling` |
| `data-button-location` | Booking (to `/termin/`): `lp_hero_booking`, `offer_section_booking`, `trust_section_booking`, `lp_final_booking`, `sticky_booking`, `form_success_booking`. Form links (`data-lead-cta`): `lp_hero_lead`, `offer_section_lead`, `trust_section_lead`, `lp_final_lead`; `lead_form_submit`. Other: `lp_hero_reviews`, `trust_reviews`, `reviews_treatwell`, `reviews_show_more`, `location_map_load` |
| WhatsApp `source` | `carbon_final`, `carbon_floating_whatsapp` |
| `data-source` | `carbon_location` (route link) |
| ViewContent | `content_name` «Carbon Microneedling Aktion», value 175 CHF (`LANDING_PAGE_CONTENT` in `src/lib/track.ts`) |
| Booking click (ad page) | the site-wide click tracking in `src/lib/track.ts` counts every `/termin/` link: `BookingButtonClick` (Pixel `trackCustom` and CAPI, same event id, `button_location`, `treatment_name` «Carbon Microneedling»), GA4 `booking_button_click`, plus `HighIntentVisit`. No page-specific code. |
| Hand-off to Treatwell (`/termin/`) | `TreatwellOutboundClick` (custom) and the standard `Schedule` (Pixel and CAPI, each with its own event id), GA4 `treatwell_outbound_click`; `service` «Carbon Microneedling», the page URL carries `offer=carbon-microneedling-aktion` |
| Lead | browser `fbq('track','Lead')` and the server event through `/api/track` with the same `event_id`, value 175 CHF, `source` `carbon_microneedling_lp_form`, hashed e-mail/phone; sent only after the Worker accepted the enquiry (2xx) |
| GA4 | `generate_lead`; `cta_click_lead_form` with `treatment_name` «Carbon Microneedling» |
| Cockpit | `source` `carbon-microneedling-lp` (chip «Carbon»), `campaign` `carbon_microneedling`; the offer label and end date come from `CAMPAIGN_OFFERS.carbon_microneedling` in `shared/leads.ts` |
| Owner e-mail subject | «Neue Kombi-Anfrage: Carbon-Peeling + Microneedling – {Name}» |
| Customer confirmation | variant `carbon_microneedling` exists, but customer mails stay off (`LEADS_CUSTOMER_MAILS` unset) |

**What is measurable:** page views, booking clicks, hand-offs to Treatwell and form leads, all only for visitors who accepted marketing cookies (the Pixel and CAPI calls are consent-gated). **What is not:** whether a visitor completes the booking on Treatwell (foreign domain, no Treatwell pixel or callback). Completed bookings can only be counted from Teresa's Treatwell calendar (appointments for «Carbon Laser Peeling + Microneedling» at CHF 175 during the campaign); the user knows and accepts this.

`shared/tracking.ts` is unchanged: the campaign keys and CAPI event-data keys already cover everything. Proof without a live submit: `npm run harness:leads-ingest` case 2c posts a Carbon enquiry to the production host without a Turnstile token and checks the stored source, campaign, offer, the resolved campaign offer and the owner-mail subject.

## 5. Launch gates (all before the ads go on)

1. The user's cockpit tests passed (login, manual entry, labelled test enquiry).
2. Treatwell shows CHF 175 for Carbon Laser Peeling + Microneedling as a time-limited Aktionspreis; screenshot of the CHF 250 listing saved before the change.
3. The end date is identical everywhere: page, ad images, ad texts, ad set end (29.11. 23:59).
4. A test click on «Jetzt auf Treatwell buchen» (by the user, with marketing cookies accepted, without completing a Treatwell booking) shows `BookingButtonClick`, `TreatwellOutboundClick` and `Schedule` in Events Manager. A labelled test enquiry from the new page (Teresa warned beforehand, name «TEST Agentur bitte ignorieren») shows the `Lead` in Events Manager and the lead in the cockpit.
5. The user's go in chat.

## 6. Change log

- 2026-10-31, user decisions on the CRO audit: saving shown as «Sie sparen CHF 75.– (30 %)»; Treatwell hand-off hint («Treatwell zeigt den Aktionspreis von CHF 175.–») prepared under the hero button but switched off behind `TREATWELL_SHOWS_PROMO = false` until the orchestrator confirms the CHF 175 Aktionspreis on Treatwell; optional form fields, kicker and WhatsApp stay as they are; guarantee, scarcity and the Treatwell payment FAQ go to the client for facts. Interim images: Teresa on the page with existing images (see section 3, Images). `qa:carbon-lp` pins the label, the switch (and its absence in `dist/`), the image mapping and the alt texts.
- 2026-10-31, CRO pass (audit `docs/orchestrator/handover/CARBON-LP-CRO-AUDIT-2026-10-31.md` in the main copy, git-excluded): the hero lead names the benefit in the cautious «kann …» form («Das Carbon-Peeling kann die Haut optisch klären, das Microneedling die natürliche Hauterneuerung unterstützen …», after ad text 1) instead of listing the steps; «Typische Behandlungsziele» moved above the steps; the steps lead (a repeat of the step titles) removed; form lead «Für alle, die vor der Buchung noch eine Frage haben.», «ohne Online-Zahlung» once under the submit button; FAQ «Kann ich direkt online buchen?» moved to second place; the six reviews in view carry six different names (display rule in the page, data unchanged); success heading without exclamation mark. `qa:carbon-lp` pins the new wording and order. Open B items (Treatwell hand-off hint, guarantee, scarcity, saving in percent, fewer form fields, kicker, Treatwell payment FAQ) wait for the user.
- 2026-10-31, reviews, second round (user): at most two reviews per name, so 42 instead of 50 (Pascale 7 → 2, Daniel 4 → 2, Rahel 3 → 2); `qa:carbon-lp` checks the limit.
- 2026-10-31, reviews (user: as many as possible): 50 verbatim Treatwell reviews between the trust section and the form, six in view, the rest behind a button that only the script adds (without JavaScript all show). `qa:carbon-lp` checks the data for banned words and the section structure.

- 2026-10-31, re-brief (user's go): the campaign goal is a Treatwell booking. Every primary CTA goes through `/termin/` to Treatwell; the form is the secondary path with one text link per CTA group; hero bullets removed (hero = H1, lead, price line, CTAs); FAQ recommends booking online; `qa:carbon-lp` and `qa:marketing` pin the new structure.

- 2026-10-31, later: Teresa's list of the steps built in (Reinigung, Fruchtsäure-Peeling, Carbon-Peeling, Diamantabrasion, Microneedling, Maske, LED-Licht, order confirmed by the user); Hyaluron and numbing cream stay off.
- 2026-10-31: offer agreed with Teresa (user). Package 1: ad page rebuilt on the lead-form flow, CHF 175 statt CHF 250 until 30 November 2026; testimonials, Hyaluron, mask and numbing cream removed; Carbon campaign added to the lead cockpit vocabulary and the Worker; `qa:carbon-lp` rewritten.
