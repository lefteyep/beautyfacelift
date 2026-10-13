# Meta campaign plan — Aquafacial + Microneedling, CHF 170 statt CHF 250

> Written 11 October 2026 for the agency (not a developer). Status: **the user answered section 1 on 2026-10-11; all numbers below use those answers; waiting for the exact start date and for the launch gates in section 3.0**. Nothing in this document changes the website or the tracking code. Change requests for the site are listed in section 6.4 with file paths.
>
> Sources read for this plan: [AQUAFACIAL-LANDING-PAGE-UPDATE.md](AQUAFACIAL-LANDING-PAGE-UPDATE.md) section 9, [PPC-TRACKING.md](PPC-TRACKING.md), [tracking/GOOGLE-ANALYTICS-GTM.md](tracking/GOOGLE-ANALYTICS-GTM.md), [TODO.md](TODO.md) (Meta check 2026-10-10, Decisions for Teresa), [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) section 1, `src/lib/track.ts`, `src/pages/lp/aquafacial-microneedling/index.astro`, `worker/routes/contact.ts`, `worker/routes/track.ts`, and the archived [2026-05-08 PPC tracking plan](../archive/plans/2026-05-08-ppc-treatwell-tracking.md) and [Carbon release note](../archive/releases/CARBON-GLOWUP-TREATWELL-RELEASE-2026-05-08.md) (UTM template). There is no earlier Meta ads audit in `docs/archive/`; the only earlier Meta material is the UTM template and the proxy-conversion guidance, both reused below.

## 0. Summary

- **Offer:** Aquafacial + Microneedling, 90 minutes (shown as "1 Std. 30 Min."), CHF 170 statt CHF 250, at Beauty Face Lift, Bahnhofstrasse 94, 8001 Zürich, treated personally by Teresa Stimac.
- **Landing page:** https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/ (lead-first: request form primary, WhatsApp secondary, Treatwell "Direkt online buchen" tertiary).
- **Inputs from the user (2026-10-11):** about CHF 400 per 30 days, start as soon as the gates are done, offer end date 30 days after the start, about 10 combo appointments per week possible, target CPL under CHF 15 with a ceiling of CHF 25, consumables CHF 30 per treatment, Teresa answers leads within about an hour, Teresa does not appear on camera, the old site stays, the Treatwell CHF 170 service will be created before launch.
- **What the budget buys (section 2):** CHF 400 at CHF 15–25 per lead is 16–27 leads in the month, which at the assumed rates is 6–11 appointments that take place. Capacity (about 40 slots in the month) is not the limit; budget is.
- **Objective:** Leads, website, optimised on a **URL-filtered custom conversion** built on the Meta `Lead` event, so the old WordPress site's Leads (same Pixel) do not feed the optimisation.
- **Source of truth for results:** the enquiry emails (Teresa receives them, the agency is in blind copy), not Ads Manager. Pixel, CAPI and GTM only load after marketing consent, so Meta sees only a share of real leads and its reported CPL will look higher than the true CPL.
- **Structure:** one campaign, **one ad set** with a lifetime budget of CHF 400 and fixed start and end dates, Advantage+ audience with hard controls (15 km around the studio, 25+, German), **three ads** at launch, no retargeting ad set at this budget.
- **Creative:** no Teresa on camera; real studio b-roll filmed by anyone with a phone, Teresa's voice as audio only if she agrees, generated scene clips only as silent b-roll under rules (section 5.5).
- **Hard gates before the first franc:** offer end date on the page, Treatwell CHF 170 offer created, Events Manager test passed with the site's `test_event_code` mechanism, custom conversion created, UTM parameters set on every ad.

## 1. Questions and the user's answers (2026-10-11)

| # | Question | Answer | Used as |
|---|---|---|---|
| Q1 | Monthly budget and start date | about CHF 400 per 30 days, start as soon as possible | lifetime budget **CHF 400** over 30 days (about CHF 13.33/day). **Proposed start: Thursday 15 October 2026**, if the gates in 3.0 are done by Wednesday 18 October; otherwise the first weekday after they are |
| Q2 | Offer end date | 30 days after the start | **end date = start date + 30 days**; with the proposed start that is **Saturday 18 November 2026**. Ads run 30 full days (15 October 00:00 to 13 November 23:59); the offer on the page stays valid through the end date, so nobody who clicked an ad on the last evening finds an expired offer. Written as "bis [Enddatum]" in every ad and on the page (CR-1); inside the two-month limit for a "statt" comparison (8.3) |
| Q3 | Combo appointments per week | as many as possible, about 10 | capacity **10/week**, about 40 in the month; not the binding constraint at this budget |
| Q4 | September CPL and spend | not reported; the user wants a CPL **under CHF 15**, at most **CHF 25** | target CPL **CHF 15**, max CPL **CHF 25**. These are the user's goals, not a measured benchmark; whether CHF 15 is reachable for a website request form in Zürich is unknown until day 18. Ads Manager will show a higher CPL than the true one (3.7) |
| Q5 | Teresa on camera | **no**; the user can generate short AI videos of her | no talking-head ads; rules for generated clips and the voice-only option in 5.5 |
| Q6 | Business Manager and Ads Manager access | yes, full; the user asked to build everything through Meta's MCP server | Meta's own Ads MCP server (open beta since 29 April 2026, reported at `https://mcp.facebook.com/ads`, sign-in with Facebook Business) is **not connected to this session** (checked 2026-10-11). It is added once as a custom connector at claude.ai → Customize → Connectors; a session started afterwards can use it. Everything built through it is created **paused**; publishing (spending money) is the user's explicit go. Whatever the connector cannot create is done by hand from the build sheet in 4.9 |
| Q7 | Old site | keep, even if unused; same persona and target audience | URL-filtered custom conversion stays permanently (3.2); old-site visitors and leads are used as audience suggestions (4.3) |
| Q8 | Treatwell CHF 170 service | will be created when everything else is ready | launch gate (3.0) |
| Q9 | Consumables per treatment | **CHF 30** | `C_var` = 30 |
| Q10 | Who answers leads and how fast | Teresa, as soon as possible, normally within about an hour | supports the assumed lead-to-appointment rate; the sheet records the actual first-contact time |
| Q11 | Gift vouchers | not answered | no voucher angle |
| Q12 | September ads visible | not answered | not blocking |

Still open: the exact start date (depends on the gates), and the September CPL if the user can read it from Ads Manager (10–30 September, columns "Ausgegebener Betrag", "Ergebnisse", "Kosten pro Ergebnis").

## 2. Objectives and unit economics

### 2.1 Facts

| Item | Value | Source |
|---|---|---|
| Ticket, first visit | CHF 170 | offer |
| Regular price | CHF 250 | page, Treatwell regular price confirmed in TODO |
| Duration | 90 minutes, one slot of Teresa's time | page |
| Consumables per treatment | CHF 30 | user, Q9 |
| Budget | CHF 400 per 30 days | user, Q1 |
| Capacity | about 10 combo appointments per week | user, Q3 |
| Target CPL / max CPL | CHF 15 / CHF 25 | user, Q4 (goals, not measurements) |
| Proof points allowed | 4,8 from 248+ reviews on Treatwell; 20+ years of experience | page, TODO |
| Primary conversion | request form → `/api/contact` → `201` → Meta `Lead` (Pixel + CAPI, dedup by `event_id`), GA4 `generate_lead`, `source: aquafacial_microneedling_lp_form`, value 170 CHF | `index.astro`, `track.ts` |
| Secondary | WhatsApp → Meta `Contact` (`method=whatsapp`, value 8) | `track.ts` |
| Tertiary | "Direkt online buchen" → `/termin/` → `BookingButtonClick`, then `TreatwellOutboundClick` on the forward to `buchung.treatwell.ch` | `track.ts`, `/termin/` |
| View | `ViewContent` + `LandingPageView` with value 170 on the LP | `track.ts` `LANDING_PAGE_CONTENT` |
| Consent | Pixel, CAPI and GTM load only after "Marketing akzeptieren" | `MarketingConsent.astro`, `track.ts` |

### 2.2 Assumptions (explicit, replaced by measured values from day 18)

| Symbol | Meaning | Value | Basis |
|---|---|---|---|
| `M1` | contribution of a first visit = 170 − 30 | **CHF 140** | formula; Teresa's time is not costed while slots would otherwise be empty |
| `r_book` | leads that become a confirmed appointment | 50 % | the form requires a phone number, Teresa answers within about an hour (Q10); experience value, measured from day 18 |
| `r_show` | confirmed appointments that take place | 80 % | no deposit ("Muss ich jetzt schon bezahlen? Nein."), personal confirmation and a reminder the day before |
| `r_ls` | lead → show = `r_book` × `r_show` | **40 %** | formula |

### 2.3 Derived numbers

| Metric | Formula | Value |
|---|---|---|
| Break-even CPL (first visit only, no rebooking) | `M1 × r_ls` = 140 × 0.40 | **CHF 56** |
| Target CPL (user) | — | **CHF 15** → cost per show 15 ÷ 0.40 = CHF 38 (22 % of the ticket) |
| Max CPL (user, kill line) | — | **CHF 25** → cost per show CHF 63 (37 % of the ticket) |
| Leads the budget buys at target / at max | 400 ÷ 15 / 400 ÷ 25 | **27 / 16 leads** in the month |
| Appointments booked / taking place | leads × 0.50 / leads × 0.40 | 13 / 11 at target; 8 / 6 at max |
| First-visit revenue | shows × 170 | about CHF 1,100–1,900 for CHF 400 spend |
| Capacity in the month | 10 per week × 4 | 40 slots; the budget fills **15–27 %** of it |
| Leads needed to fill capacity | 10 ÷ 0.40 per week | 25 leads/week |
| Budget needed to fill capacity | 25 × CPL per week | **CHF 375/week at CHF 15, CHF 625/week at CHF 25**, so CHF 1,600–2,700 per month |

Reading: the economics allow a much higher spend (break-even is CHF 56 per lead, the user's ceiling is CHF 25). The CHF 400 month is a **measurement month**: it establishes the true CPL, `r_book` and `r_show`. The month-2 budget is then `25 leads/week × measured true CPL`, capped by what Teresa confirms she can take.

Sensitivity:

| `r_ls` | Break-even CPL | Cost per show at CHF 25 CPL | Leads/week for 10 shows |
|---|---|---|---|
| 30 % | CHF 42 | CHF 83 | 33 |
| 40 % (assumed) | CHF 56 | CHF 63 | 25 |
| 50 % | CHF 70 | CHF 50 | 20 |

Rebooking is deliberately left out. If first-visit clients rebook at the regular price, the break-even moves up; that is decided with data at day 30, not assumed now.

### 2.4 What "success" means

**Day 18, the second read (about CHF 240 spent):**

- Measurement proven: every test lead in Events Manager as browser + server with one `event_id`; the custom conversion counts only LP leads; every email carries `utm_campaign`, `utm_content`, `utm_term` and `fbclid`.
- At least **10 enquiry emails** from the LP with `utm_source=meta` (240 ÷ 25 rounded up), true CPL at or below CHF 25, visibility ratio `V` measured.
- Teresa has reached at least half of the leads and at least 3 appointments are confirmed.
- No ad rejected; link CTR of the best ad above 1 %.

**Day 30 (CHF 400 spent):**

- At least **16 emails** (the CHF 25 ceiling), ideally 26 or more (the CHF 15 goal).
- `r_book`, `r_show` and cost per show measured from Teresa's sheet; cost per show at or below CHF 63.
- The "statt" comparison removed from the page and the ads on the end date (8.3).
- A month-2 decision with a measured true CPL: budget `25 × true CPL` per week if Teresa confirms 10 slots, or a smaller number she names.

## 3. Measurement readiness checklist (before spending a franc)

### 3.0 Launch gates (all must be ticked)

- [ ] Offer end date decided (Q2) and **visible on the page** (change request CR-1 in section 6.4 deployed).
- [ ] Treatwell service "Aquafacial + Microneedling – 90 Min. – CHF 170" exists (Q8), so "Direkt online buchen" after the form shows the advertised price.
- [ ] Events Manager test (3.1) passed on the live page with the site's `test_event_code` mechanism.
- [ ] Custom conversion "BFL – Lead – Kombi LP" (3.2) created and showing the test lead.
- [ ] UTM convention (3.4) applied to every ad; a test click shows the values in the enquiry email.
- [ ] Lead sheet (3.6) created and shared with Teresa; she knows the five status values.
- [x] Ad account `act_442592606954627` can deliver: the user confirmed on 2026-10-11 that the account is not restricted; the block shown in Ads Manager is a display bug. If the first ads stay at zero impressions for more than a few hours after approval, look at Account Quality first.
- [ ] Business Manager: domain `beautyfacelift-zuerich.ch` verified under Brand Safety → Domains; Page, Instagram account, ad account, dataset `1147246982373946` and payment method all in the same Business; "Begünstigter und Zahlender" (beneficiary and payer) filled in if Ads Manager asks for it.
- [ ] Attribution setting of the campaign: 7-day click, 1-day view (Meta default; reporting uses a click-only comparison, see 3.7).
- [ ] Start date fixed (proposed Thursday 15 October 2026); ad set schedule start 00:00 to start + 29 days 23:59; offer end date (start + 30 days, proposed Saturday 18 November 2026) in CR-1 and in the copy.

### 3.1 Events Manager verification (test_event_code)

The site forwards a test code to the Worker, which sends it to Meta as CAPI `test_event_code`, so server events appear in Test Events next to the browser events. The code must match `^TEST[A-Za-z0-9_-]{3,64}$` (`src/lib/track.ts`), which is what Events Manager issues.

1. Events Manager → dataset `1147246982373946` → **Test events** → copy the code (format `TESTxxxxx`).
2. Open, in a fresh private window on a phone and once on desktop:

   ```text
   https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/?utm_source=meta&utm_medium=paid_social&utm_campaign=bfl_ch_meta_lead_aquafacial-microneedling_202610&utm_content=p_zh15km_adv__test_ad&utm_term=test_placement&utm_id=test&fbclid=TESTCLICK123&test_event_code=TESTxxxxx
   ```

3. Click **Marketing akzeptieren**. Expected in Test events, each once as browser and once as server with the same event ID: `PageView`, `LandingPageView`, `ViewContent` (value 170, currency CHF, content_name "Aquafacial Microneedling Aktion"). The server events must show `fbp` and `fbc` (the site builds `_fbc` from `fbclid` after consent), `client_ip_address` and `client_user_agent`.
4. Scroll and wait: `Scroll50`, `TimeOnPage30s`, `HighIntentVisit` (observation events, not used for optimisation).
5. Submit the form with name **"TEST Agentur bitte ignorieren"**, a real phone number, an email, skin goal "Ich bin unsicher". Expected: inline success on the page, then `Lead` browser + server with one event ID, `value` 170, `source` `aquafacial_microneedling_lp_form`, and hashed `em` and `ph` in the server event's user data. The enquiry email must arrive at Teresa's address with the agency in blind copy, carrying the rows Kampagne `aquafacial_microneedling`, Angebot `aquafacial-microneedling-aktion`, UTM Source/Medium/Campaign/Content/Term and fbclid exactly as in the URL. Tell Teresa in advance that a test enquiry is coming.
6. Click **Per WhatsApp anfragen**: `Contact` with `method=whatsapp`. Click **Direkt online buchen** (in the success panel or the closing band): `BookingButtonClick` on the page, then `Schedule` and `TreatwellOutboundClick` from `/termin/` before the forward to `buchung.treatwell.ch`.
7. Repeat the form test with **Ablehnen** on the consent banner: the email must still arrive, and **no** event may appear in Test events. This is the expected consent gap, not a bug.
8. Check Events Manager → Diagnostics: no new warnings after the test. The existing "send fbc with PageView" suggestion should stop appearing for traffic from the new site; if it persists after a week of ads, the remaining PageViews without `fbc` are organic visits or old-site traffic.

Only after step 7: remove `test_event_code` from every URL. The code is remembered per browser session only, so a normal visitor never sends it.

### 3.2 Custom conversions (old-site pollution)

Both sites fire `Lead` into the same dataset. Until the old site is redirected or loses the Pixel (Q7), optimise on a URL-filtered custom conversion:

| Name | Event | Rule | Category | Default value | Use |
|---|---|---|---|---|---|
| **BFL – Lead – Kombi LP** | `Lead` | URL contains `/lp/aquafacial-microneedling/` | Lead | 170 CHF | **optimisation event** of the campaign and the KPI in reports |
| BFL – Lead – neue Website | `Lead` | URL contains `beautyfacelift-zuerich.ch` | Lead | — | reporting: all leads of the new site |
| BFL – Contact – Kombi LP | `Contact` | URL contains `/lp/aquafacial-microneedling/` | Contact | 8 CHF | secondary column |
| BFL – Treatwell – Kombi | `TreatwellOutboundClick` | `event_source_url` contains `/termin/` and `service` contains `Aquafacial + Microneedling` | Other | 10 CHF | tertiary column |

Notes:

- The browser `Lead` carries the page URL; the server `Lead` carries `event_source_url` = the page URL. Both match the rule, and Meta deduplicates them by `event_id`.
- Custom conversions can take up to 24 hours to show the first count; run the test lead at least a day before launch.
- In Events Manager → Lead → "Aufschlüsselung nach URL" (breakdown by URL), note the old-site share once a week. When the old site is redirected or its Pixel removed, keep the custom conversion anyway: it also excludes `/kontakt/` leads from the main site, which are not this offer.
- Do not optimise on the standard `Lead` event while the old site fires; Meta would learn from WordPress contact-form submitters.

### 3.3 Event match quality

Current score 6.1/10 on the dataset, dominated by old-site events. Meta's bands: below 4 poor, 4–5.9 OK, 6–7.9 good, 8–10 great.

What the new site already sends after consent (no change needed):

| Event | Browser | Server user data |
|---|---|---|
| `PageView`, `ViewContent` | Pixel with `_fbp`, `_fbc` cookies | `fbp`, `fbc` (built from `fbclid` if the cookie is missing), IP, user agent |
| `Lead` | Pixel, plus hashed email/phone via the explicit call | `em`, `ph` (SHA-256, phone normalised to 41…), `fbp`, `fbc`, IP, user agent |

What consent allows but the site does not send yet: hashed first and last name (`fn`, `ln`) on `Lead`. The form collects the full name, so this is a small change (CR-2 in section 6.4; the Worker's allow-list in `worker/routes/track.ts` currently accepts only `em`, `ph`, `fbp`, `fbc`). Expected effect: Lead match quality moves toward the "great" band; PageView stays where it is because no identifier beyond cookies exists before the form. Alternative without code: switch on **Automatischer erweiterter Abgleich** (automatic advanced matching) in Events Manager → dataset → Settings for email, phone, first name, last name. It only runs once the Pixel is loaded, which on this site means after consent, so it stays inside the consent setup. Pick one of the two; both together are redundant.

Do not send city, ZIP, date of birth or an external ID: the form does not collect them (PPC-TRACKING.md rule).

### 3.4 UTM naming convention

The ad pages store these keys in `sessionStorage` (`bfl_utm`): `utm_id`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_source_platform`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `matchtype`, `network`, `device`. The combo form forwards `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `gclid`, `msclkid` to the enquiry email. So **the ad set and ad identity must travel in `utm_content` and the placement in `utm_term`**, because those two reach the email; `utm_id` reaches GA4 only.

Put this into the ad's **URL parameters** field (Ads Manager → ad → Tracking → URL-Parameter), never into the link itself, so the landing URL stays `https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/`:

```text
utm_source=meta&utm_medium=paid_social&utm_campaign=bfl_ch_meta_lead_aquafacial-microneedling_202610&utm_content={{adset.name}}__{{ad.name}}&utm_term={{placement}}&utm_id={{campaign.id}}&utm_source_platform=meta
```

Meta fills `{{adset.name}}`, `{{ad.name}}`, `{{placement}}` and `{{campaign.id}}` at delivery. Because the names land in the email, they must be slugs (lowercase, no spaces, no umlauts, parts separated by `_`, words inside a part by `-`):

| Level | Pattern | Examples |
|---|---|---|
| Campaign (Ads Manager name, free text) | `BFL \| Lead \| Kombi Aquafacial+Microneedling CHF 170 \| 2026-10` | — |
| `utm_campaign` | `bfl_ch_meta_lead_<treatment>_<yyyymm>` (archived template) | `bfl_ch_meta_lead_aquafacial-microneedling_202610`; `<yyyymm>` is the launch month and stays the same for the whole run (use `202611` if the start slips into November) |
| Ad set name | `<funnel>_<geo>_<audience>` | `p_zh15km_adv` (prospecting), `rt_lp-ig-video_30d` (retargeting), `p_zh25km_adv` (geo expansion, if ever) |
| Ad name | `<angle>_<format>_<version>` | `glow_reel916_v1`, `first-needling_reel916_v1`, `location_static45_v1`, `teresa_static11_v1`, `enddate_reel916_v1` |

Never rename a live ad set or ad: the name is the attribution key. Create a new version instead (`_v2`).

### 3.5 GA4 key events

GA4 (`G-4C9M8KMFQY`) receives the same dataLayer events through GTM, under the same consent gate, so it will roughly agree with Meta and disagree with the emails by the same factor.

- Mark as key events (GA4 → Admin → Events → star): `generate_lead` (primary), `whatsapp_click`, `treatwell_outbound_click`, `booking_button_click`. Already listed as open in GOOGLE-ANALYTICS-GTM.md; do it as soon as the first events have arrived.
- Build one saved exploration "Kombi LP – Meta": filter `page_path` contains `/lp/aquafacial-microneedling/` and `utm_source` = `meta`; rows `utm_content`; metrics sessions, `cta_click_lead_form`, `generate_lead`. This gives the on-page conversion rate per ad, which Ads Manager cannot show.
- `cta_click_lead_form` (pushed on every request CTA) is **not** in the GTM container's forwarded list; it stays dataLayer-only until GTM is updated (optional, not a gate; see CR-4).

### 3.6 Lead-quality loop

**Source of truth:** the enquiry email (Resend, from `anfragen@beautyfacelift-zuerich.ch`, to Teresa, blind copy to the agency). Every combo lead is one email with the rows listed in 3.1 step 5.

**Sheet** (Google Sheet "Kombi-Leads 2026-Q4", shared agency + Teresa), one row per email, filled by the agency from the blind copy within one business day; Teresa fills only the status columns:

| Column | Filled by | Values |
|---|---|---|
| Datum/Zeit der Anfrage | agency | from the email |
| Name, Telefon, E-Mail | agency | from the email |
| Hautziel | agency | Glow / Poren / Hautstruktur / Trockenheit / Frischer aussehen / Ich bin unsicher |
| utm_content (ad set__ad), utm_term (placement) | agency | from the email rows |
| Status | **Teresa** | `neu` → `kontaktiert` → `gebucht` → `erschienen` / `no-show` / `abgesagt`, or `nicht erreicht` after three attempts over three days |
| Termin-Datum | Teresa | date |
| Umsatz erster Besuch | Teresa | CHF (170, or more if upsold) |
| Folgetermin gebucht? | Teresa | ja/nein |
| Notiz | both | free text (e.g. "wollte nur Preis wissen") |

Teresa's rule: answer within about an hour by WhatsApp or phone (Q10), three contact attempts over three days, confirm the appointment in writing, send a reminder the day before. The sheet records the time of the enquiry and of the first contact, so the real reply time is measured, not assumed. The agency reads the sheet every Monday and computes `r_book`, `r_show`, cost per show and the per-ad true CPL.

**Offline conversion upload via CAPI (`action_source: physical_store` or `other`, event "Schedule" or a custom "AppointmentBooked", matched on hashed email/phone):** technically possible from this setup, but **not worth it in this 30-day run**. Meta needs about 50 optimisation events per ad set per week to learn; at this budget (about 4–6 leads/week → 2–3 bookings) the upload would be a reporting feature, not an optimisation signal, and it costs a weekly manual upload or an automation. Decision: manual sheet for the 30 days; revisit the upload (or a Meta Conversion Leads integration) only if a later month produces 30+ bookings, which would make the "booked" event a plausible optimisation target.

### 3.7 How to read results with consent-gated tracking

- **Visibility ratio** `V = Meta-counted leads (custom conversion, 7-day click) ÷ LP emails with utm_source=meta` in the same week. Expected below 1 because every lead whose visitor clicked "Ablehnen" or ignored the banner is invisible to Meta. Measure it in week 1 and track it weekly; it is unknown today and must not be guessed.
- **True CPL** = spend ÷ emails. **Meta CPL** = spend ÷ Meta-counted leads. Report both; make decisions on true CPL.
- Ad-to-ad comparisons may use Meta CPL (consent choice does not depend on which ad was clicked), but the per-ad **email count by `utm_content`** is the tie-breaker because it is complete.
- Attribution windows: keep the campaign on Meta's default (7-day click, 1-day view) because the optimiser benefits from it; in reports add the comparison column "7-day click" and quote that one, so view-through does not flatter the numbers.
- GA4 will show the same gap as Meta; use it for on-page conversion rate per ad, not for lead totals.
- WhatsApp enquiries that come from ads do not produce an email. Teresa notes them in the sheet with status and the hint "WhatsApp" in the notes; the `Contact` custom conversion counts the clicks (consent-gated) as a sanity check.
- If `V` drops suddenly (for example below half of its week-1 value), suspect a broken consent banner or Pixel load before suspecting the ads: reopen the page with the test code (3.1).

### 3.8 Old site during the campaign

Until Q7 is resolved: the custom conversion handles optimisation, and the weekly URL breakdown (3.2) shows how many Leads still come from `beautyfacelift.ch`. If the user redirects the old site with a 301, old-site Leads stop by themselves; if the old site keeps running with the same Pixel, nothing else is needed for this campaign. Do not add a second Pixel or a new dataset: audiences and match history live on `1147246982373946`.

## 4. Campaign architecture

### 4.1 Objective, conversion location, event

| Setting | Value | Reason |
|---|---|---|
| Campaign objective | **Leads** | the page is a request form |
| Conversion location | **Website** only (no Instant Forms, no Messenger) | leads must land in the email and Teresa's inbox, not in Meta's Leads Center; Instant Forms produce more but weaker leads and bypass the page that sets expectations |
| Business portfolio / ad account | Business `135112460858934`, ad account `act_442592606954627` (from the user's Ads Manager link, 2026-10-11) | the account that ran the September Aquafacial campaign |
| Dataset | `1147246982373946` | the existing Pixel, keeps audiences and match history |
| Conversion event | custom conversion **BFL – Lead – Kombi LP** (3.2) | excludes old-site Leads |
| Performance goal | maximise number of conversions | |
| Bid strategy | highest volume (no cap) | a cost cap at this budget mostly under-delivers; with about CHF 13/day there is no room for bid experiments |
| Attribution | 7-day click, 1-day view (default) | see 3.7 |
| Special ad category | none | cosmetic services are not a special category |
| Budget | **one ad set, lifetime budget CHF 400**, schedule = 30 full days, start date 00:00 to the day before the offer end date, 23:59 | Meta spends exactly the amount by then and never more; the schedule also ends the "statt" ads automatically before the offer ends (8.3) |
| Advantage+ creative "standard enhancements" | **off** for text improvements, overlays, catalogue items and image enhancements; music off for video (ads bring their own sound) | automatic text could introduce claims the copy rules forbid ("schmerzfrei", "garantiert") and cannot be QA'd |
| Dynamic creative / multi-advertiser ads | off | copy must be reviewable as a fixed unit; premium positioning |
| Schedule | all day, no dayparting | the form works 24/7; Teresa answers within about an hour in business hours (Q10) |

If Ads Manager offers the newer "Advantage+ Leads-Kampagne" flow, accept it but keep the audience **controls** and the manual placements below; the plan does not depend on the UI version.

### 4.2 Learning-phase arithmetic and consolidation

Meta's learning phase wants about **50 optimisation events per ad set in 7 days**. At CHF 15–25 per lead that is CHF 750–1,250 per week per ad set; the campaign has about CHF 93 per week. Consequences:

- The ad set stays in "Lernphase eingeschränkt" (learning limited) for the whole month. That is acceptable: delivery still optimises toward the Lead signal, only less stably. Do not fight it by switching to a cheaper event (landing page views, `ViewContent`, `HighIntentVisit`); leads bought on those signals are visitors, not enquiries.
- **One ad set** holds the whole budget; a second ad set would get about CHF 2–3 per day and teach Meta nothing.
- **Three ads** at launch (5.4). Per-ad reading is weak at this volume (each ad sees roughly CHF 40–200 over the month, Meta concentrates spend on one or two); decisions use link CTR and cost per landing page view per ad, and emails by `utm_content` as the tie-breaker. The economic read (true CPL) is made at ad-set level.
- Never edit targeting mid-flight; a budget change, if the user raises the lifetime budget, in steps of at most 20 %.

### 4.3 Audience: Advantage+ audience with hard controls

Use **Advantage+ audience** (Meta broadens from the controls) with these **controls** (hard limits):

| Control | Value | Reason |
|---|---|---|
| Location | **15 km radius around Bahnhofstrasse 94, 8001 Zürich**, "Personen, die an diesem Ort leben" (people living in this location) | covers the city and the agglomeration (Dübendorf, Wallisellen, Kloten, Regensdorf, Dietikon, Adliswil, Thalwil, Zollikon, Küsnacht); "living in" excludes tourists on Bahnhofstrasse, who are the wrong buyers for a 90-minute treatment with follow-up sessions |
| Minimum age | **25** | the ticket and the combination treatment skew older; under-25 traffic is cheap but books rarely for CHF 170 |
| Language | **German (all variants)** | the ads and the page are German "Sie" |
| Exclusions | custom audience "Lead – Kombi LP – 90 Tage" (4.6) | do not pay again for people who already asked |

**Suggestions** to Meta (soft, Meta may exceed them): age 30–60, women, and two custom audiences from the shared Pixel as seeds, because the user confirmed the old site serves the same persona: "Alle Website-Besucher – 180 Tage" (both domains fire the same Pixel, so one audience covers them) and "Lead – alle URLs – 180 Tage" (people who already enquired on either site). Gender cannot be hard-set in Advantage+ audience; that is fine, men who respond are welcome (the page says "Kundinnen und Kunden"). No interest targeting: with Lead optimisation and a 15 km radius, interests only shrink the pool.

Fallback if Advantage+ audience is not offered for this account: original audience, same location, age 25–65, German, no interests, "Advantage detailed targeting" off.

### 4.4 Geo logic (commuters) and expansion

- Core (launch): the 15 km "living in" radius above. Commuters who live inside it are covered.
- Commuters from outside (Winterthur, Baden, Zug, Rapperswil) are a real audience for a studio a few minutes' walk from the Hauptbahnhof, but the plan does not start with them: distance lowers show rate and the budget cannot fund two prospecting ad sets.
- Expansion rule (a later month with a bigger budget only): if prospecting frequency exceeds 2.5 per 7 days **and** true CPL is at or below target **and** capacity still has room, duplicate the prospecting ad set as `p_zh25km_adv` with a 25 km radius plus the towns Winterthur, Baden, Zug, Rapperswil-Jona, with the original ad set's audience excluded. Otherwise do not expand.
- Never use "recently in" or "travelling in" for this offer.

### 4.5 Placements

Manual placements (editing placements switches Advantage+ placements off, which is intended):

| On | Off | Why |
|---|---|---|
| Instagram Feed, Instagram Stories, Instagram Reels, Instagram Explore, Facebook Feed, Facebook Reels, Facebook Stories, Facebook Marketplace, Facebook search results | **Audience Network** (all), **Messenger** (inbox, stories), Facebook in-stream video, Facebook right column, Instagram profile feed | Audience Network and Messenger bring accidental clicks and no enquiries for a premium local service; in-stream interrupts; right column is desktop-only and tiny |

Devices: all. Operating systems: all. Inventory filter: "Moderat" (moderate). Formats per placement: 9:16 for Stories/Reels, 4:5 for feeds, 1:1 as the fallback (section 5).

### 4.6 Retargeting layer (parked at this budget)

A retargeting ad set is **not switched on** in the CHF 400 month: it would receive about CHF 2–3 per day, too little to learn or to reach anyone more than once. Advantage+ audience already re-reaches people who engaged with the ads, and the Lead exclusion keeps the budget off people who already asked.

Create the audiences anyway on day 1 (free, and they fill while the ads run), so a later month can use them:

| Audience | Source | Window | Consent-gated? |
|---|---|---|---|
| LP viewers – Kombi | website, URL contains `/lp/aquafacial-microneedling/` | 30 days | yes (Pixel) |
| LP high intent – Kombi | website event `HighIntentVisit`, URL contains the LP path | 30 days | yes |
| Video viewers 50 % | engagement, "Personen, die mindestens 50 % des Videos angesehen haben", all campaign videos | 30 days | **no** (Meta-side data) |
| Instagram engagers | engagement, Instagram professional account | 90 days | no |
| Facebook Page engagers | engagement, Page | 90 days | no |
| **Lead – Kombi LP – 90 Tage** | website event `Lead`, URL contains the LP path | 90 days | yes; used as **exclusion** |
| Treatwell clickers – Kombi | website event `TreatwellOutboundClick` | 30 days | yes |
| Alle Website-Besucher – 180 Tage | website, all URLs (both domains) | 180 days | yes; audience suggestion (4.3) |
| Lead – alle URLs – 180 Tage | website event `Lead`, any URL | 180 days | yes; audience suggestion (4.3) |

Rule for switching retargeting on in a later month: budget of at least about CHF 30/day, a combined pool (LP viewers + video 50 % + Instagram engagers, minus leads) above about 1,000 people, then an ad set `rt_lp-ig-video_30d` with 15–20 % of the budget, the end-date and trust ads (A5, A4), exclusions Lead 90 d and Treatwell clickers 30 d. Because Pixel audiences only contain consenting visitors, the engagement audiences would be the backbone of that ad set.

Frequency: Leads campaigns have no frequency cap setting. Monitor prospecting frequency; above **2.5 per 7 days** swap the weakest ad for a new version.

### 4.7 Budget and pacing

| Item | Value |
|---|---|
| Ad set `p_zh15km_adv` | lifetime budget **CHF 400**, start date to end date (30 days) |
| Average per day | about CHF 13.33; Meta paces a lifetime budget unevenly (more on days with cheaper opportunities, up to roughly double on some days) and lands on the total by the end date |
| Retargeting | none this month (4.6) |
| Raising the budget mid-flight | only if the user decides to after the day-18 read; raise the lifetime budget in steps of at most 20 % and not more often than every 3 days |

Formula for a later month: `weekly budget = (slots per week ÷ r_ls) × true CPL`, with measured values. With the assumptions and 10 slots: 25 leads × CHF 15–25 = CHF 375–625 per week. Spending above the slots Teresa confirms buys leads she cannot serve.

### 4.8 Exclusions summary

- Lead – Kombi LP – 90 Tage: excluded in every ad set.
- Treatwell clickers 30 d: excluded once a retargeting ad set exists (later month).
- No customer-list exclusion exists (no CRM export); if Teresa can export Treatwell client emails with a lawful basis, that is a later improvement, not a launch item.

### 4.9 Build sheet (exact values for Ads Manager, or for a Meta connector once one is attached)

**Campaign**

| Field | Value |
|---|---|
| Ad account | `act_442592606954627` (Business `135112460858934`) |
| Name | `BFL \| Lead \| Kombi Aquafacial+Microneedling CHF 170 \| 2026-10` (month = launch month) |
| Objective | Leads |
| Special ad categories | none |
| Advantage campaign budget | off |
| A/B test | off |

**Ad set**

| Field | Value |
|---|---|
| Name | `p_zh15km_adv` |
| Conversion location | Website |
| Dataset / Pixel | `1147246982373946` |
| Conversion event | custom conversion `BFL – Lead – Kombi LP` |
| Performance goal | Maximise number of conversions |
| Bid strategy | Highest volume |
| Attribution | 7-day click, 1-day view |
| Budget | Lifetime, CHF 400 |
| Schedule | start date 00:00 → start + 29 days 23:59, Zürich time (proposed 15 October 2026 00:00 → 13 November 2026 23:59) |
| Audience | Advantage+ audience; controls: location = 15 km around "Bahnhofstrasse 94, 8001 Zürich", people living in this location; minimum age 25; languages = German (all); exclude custom audience `Lead – Kombi LP – 90 Tage`. Suggestions: age 30–60, women, custom audiences `Alle Website-Besucher – 180 Tage` and `Lead – alle URLs – 180 Tage` |
| Placements | manual: Instagram Feed, Instagram Stories, Instagram Reels, Instagram Explore, Facebook Feed, Facebook Reels, Facebook Stories, Facebook Marketplace, Facebook search results; everything else off (Audience Network, Messenger, in-stream, right column, Instagram profile feed) |
| Inventory filter | Moderat |
| Devices, OS | all |

**Ads (three at launch, two in reserve)**

| Field | Ad 1 | Ad 2 | Ad 3 | Reserve 1 | Reserve 2 |
|---|---|---|---|---|---|
| Name | `glow_reel916_v1` | `first-needling_static45_v1` | `location_static45_v1` | `teresa_static11_v1` | `enddate_static45_v1` |
| Angle | A1 | A2 | A3 | A4 | A5 |
| Format | 9:16 video 15–20 s, plus 4:5 and 1:1 crops of its cover for feeds | 4:5 static, 1:1 crop | 4:5 static, 1:1 crop | 1:1 static (real portrait), 4:5 crop | 4:5 static, 9:16 Story |
| Primary text, headline, description | section 5.3 A1 (short for Reels and Stories, long for Facebook Feed) | 5.3 A2 | 5.3 A3 | 5.3 A4 | 5.3 A5 |
| CTA button | Mehr dazu | Mehr dazu | Mehr dazu | Mehr dazu | Mehr dazu (Jetzt buchen only once Q8 is done) |
| Website URL | `https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/` | same | same | same | same |
| Display link | `beautyfacelift-zuerich.ch` | same | same | same | same |
| URL parameters | the string in 3.4, identical on every ad | same | same | same | same |
| Identity | Facebook Page Beauty Face Lift + the studio's Instagram account | same | same | same | same |
| Standard enhancements | all off | all off | all off | all off | all off |
| Tracking | website events via the dataset above, nothing else (no app, no offline event set) | same | same | same | same |

Before publishing: preview each ad in the Instagram Reels, Instagram Feed and Facebook Feed previews, check the price, the end date and the Aquafacial spelling, open the preview link on a phone and read the UTM rows in the resulting enquiry email after a labelled test lead (3.1).

## 5. Creative strategy

### 5.1 Rules every ad must pass

- Swiss German, "Sie", "ss" never "ß". The treatment is **Aquafacial** (never any other device or brand name). Microneedling is "kosmetisches Microneedling".
- Claims stay cosmetic and cautious: "kann … unterstützen", "glatter wirkende Haut", "optisch feinere Poren", "frischer wirken". Forbidden: "garantiert", "schmerzfrei", "keine Ausfallzeit", "Falten weg", "Narben entfernen", "Kollagen aufbauen", "medizinisch", "heilt", any number of years younger.
- Meta personal-attributes rule: the text never asserts or implies something about the viewer's skin, age or health. Not allowed: "Haben Sie grosse Poren?", "Ihre müde Haut", "Für Akne-Haut". Allowed: describing the treatment and what it is meant for in the third person ("für Haut, die mehr Glow braucht" is still borderline; prefer "für mehr Glow").
- Meta personal-health rule: no before/after images, no zoomed-in skin "problems", no imagery that invites negative self-perception. No before/after material exists and none will be generated.
- Price claims exactly as on the page: "CHF 170 statt CHF 250", "1 Std. 30 Min." or "90 Minuten", and the end date from Q2. No "nur noch 3 Plätze" unless Teresa confirms the number that week.
- Proof points only: "4,8 von 5 aus über 248 Bewertungen auf Treatwell", "20+ Jahre Erfahrung", "persönlich von Teresa Stimac", "Bahnhofstrasse 94, wenige Gehminuten vom Hauptbahnhof" (the site's own wording; no exact number of minutes is stated anywhere, so none is used) (the page's directions name the Hauptbahnhof and the tram stop Bahnhofstrasse/HB).
- Text on images under about 20 % of the area, no logo overlay inside photos, no text inside the Stories safe zones (top 14 %, bottom 20 % of a 9:16).
- Captions burned in on every video (sound off by default in feeds).
- Headlines ≤ 40 characters, primary text with the offer in the first line (feeds truncate after about 125 characters), description ≤ 30 characters.
- CTA button: Meta localises the label; choose **"Mehr dazu" (Learn more)** for every ad this month (cold traffic needs the page before it asks). **"Jetzt buchen" (Book now)** fits only the end-date ad in the final week, and only once the Treatwell CHF 170 offer is live (Q8). If "Angebot anfordern" (Get quote) is offered, it is a valid alternative for prospecting; never "Registrieren" or "Kaufen".
- Link: the plain LP URL; UTM parameters in the URL-parameters field (3.4). Display link: `beautyfacelift-zuerich.ch`.
- Visual direction follows the page: warm, calm, cream and copper, Instrument Serif headline, real studio photos and studio b-roll (5.5), no stock faces.

### 5.2 The angles

Teresa does not appear on camera (Q5), so no angle depends on a talking head. Her presence comes from the real portrait, her written quote on the page, optional voice-only lines (5.5) and text on screen.

| # | Angle | Who it is for | Hook (first line) | Format at launch | Reserve |
|---|---|---|---|---|---|
| A1 | **Glow in 90 Minuten** (offer + outcome) | people in and around Zürich who want fresher, smoother-looking skin and know roughly what a facial is | "Aquafacial + Microneedling in einer Sitzung: 90 Minuten für frischeren Glow – CHF 170 statt CHF 250." | 9:16 video 15–20 s from studio b-roll with text on screen | 4:5 static |
| A2 | **Erstes Microneedling? So läuft es ab** (hesitation) | people who have heard of Microneedling and hesitate: does it hurt, does it fit me, what happens after | "Zum ersten Mal Microneedling? Drei ehrliche Antworten, bevor Sie anfragen." | 4:5 static quote card with three short answers | 9:16 clip with Teresa's voice over calm b-roll, if she records the lines |
| A3 | **Nach der Arbeit an der Bahnhofstrasse** (convenience) | commuters and city workers; a few minutes' walk from the HB, open until 20:00 Mo–Fr and Saturdays | "Bahnhofstrasse 94, wenige Gehminuten vom HB: Aquafacial + Microneedling nach der Arbeit oder am Samstag." | 4:5 static (street entrance or studio door) | 9:16 walk-in clip, 10 s |
| A4 | **Teresa, 20+ Jahre, eine Person** (trust) | people who want to know who treats them | "Bei Beauty Face Lift behandelt Teresa Stimac persönlich – seit über 20 Jahren, 4,8 von 5 aus über 248 Bewertungen." | reserve: 1:1 static with the real portrait and the stars line | — |
| A5 | **Angebot bis [Enddatum]** (end date, last week) | everyone in the audience in the final 7 days | "Noch bis [Enddatum]: Aquafacial + Microneedling für CHF 170 statt CHF 250." | reserve: 4:5 static price card, 9:16 Story | — |

What the first 3 seconds show:

- **A1:** the Aquafacial handpiece gliding on skin in close-up (real b-roll, no face), warm window light, caption "90 Minuten. Ein Termin." → cut to the price card.
- **A2:** the question "Zum ersten Mal Microneedling?" as a text card over a still of the treatment room, then the three answers one by one; no face.
- **A3:** the studio entrance on Bahnhofstrasse 94 from the street with the tram passing, caption "Wenige Gehminuten vom HB"; cut inside to the treatment room.
- **A4:** Teresa's real portrait (the one on the page), caption "Teresa Stimac, 20+ Jahre" and the stars line; static.
- **A5:** price card with the end date, then the hero photo from the page; nothing else.

### 5.3 Ad copy drafts (Swiss German, "Sie")

Each ad has a short primary text (feeds, Reels) and a long variant (Facebook Feed test). Headline and description are the same for both. Replace `[Enddatum]` with the offer end date (start + 30 days), written out: with the proposed start "14. November"; in the description field the short form "14.11." is fine.

**A1 — Glow in 90 Minuten** (`glow_reel916_v1`, `glow_static45_v1`)

Primary text, short:

> Aquafacial + Microneedling in einer Sitzung: 90 Minuten für frischeren Glow und glatter wirkende Haut.
> Kombi-Angebot CHF 170 statt CHF 250, gültig bis [Enddatum].
> Persönlich von Teresa Stimac, Bahnhofstrasse 94, Zürich. Unverbindlich anfragen – ohne Online-Zahlung.

Primary text, long:

> Aquafacial reinigt sanft und versorgt die Haut mit Feuchtigkeit. Kosmetisches Microneedling setzt danach feine Mikroimpulse. Zusammen in einer Sitzung von 1 Std. 30 Min.: Hautanalyse, Aquafacial, Microneedling, beruhigende Abschlusspflege und klare After-Care-Hinweise.
>
> Kombi-Angebot: CHF 170 statt CHF 250, gültig bis [Enddatum].
>
> Teresa Stimac behandelt persönlich – seit über 20 Jahren, 4,8 von 5 aus über 248 Bewertungen auf Treatwell. Beauty Face Lift, Bahnhofstrasse 94, wenige Gehminuten vom Hauptbahnhof.
>
> Sie fragen unverbindlich an, Teresa meldet sich und stimmt die Behandlung auf Ihre Haut ab. Keine Online-Zahlung.

Headline: `Aquafacial + Microneedling, CHF 170 statt 250`
Description: `90 Min. · Bahnhofstrasse 94 · bis [Enddatum]`
CTA: Mehr dazu

**A2 — Erstes Microneedling? So läuft es ab** (`first-needling_reel916_v1`, `first-needling_static45_v1`)

Primary text, short:

> Zum ersten Mal Microneedling? Teresa Stimac erklärt in 30 Sekunden, was Sie erwartet: Hautanalyse zuerst, kontrollierte Intensität, Rötungen sind möglich und beruhigen sich meist innerhalb von 24–48 Stunden.
> Kombi mit Aquafacial: CHF 170 statt CHF 250, bis [Enddatum]. Unverbindlich anfragen.

Primary text, long:

> Viele fragen sich vor dem ersten Microneedling drei Dinge: Tut es weh? Passt es zu meiner Haut? Wie sehe ich danach aus?
>
> Ehrliche Antworten: Viele empfinden es als leichtes Piksen oder Wärme; die Intensität wird individuell angepasst. Ob die Kombination passt, wird vor Ort in der Hautanalyse angeschaut – Sie müssen das nicht vorher wissen. Nach der Behandlung sind Rötungen möglich; die Haut beruhigt sich je nach Hauttyp meist innerhalb von Stunden bis 24–48 Stunden.
>
> Aquafacial + kosmetisches Microneedling in einer Sitzung von 1 Std. 30 Min., CHF 170 statt CHF 250, gültig bis [Enddatum]. Persönlich von Teresa Stimac, 20+ Jahre Erfahrung, Bahnhofstrasse 94, Zürich.
>
> Unverbindlich anfragen, ohne Online-Zahlung.

Headline: `Erstes Microneedling? So läuft es ab`
Description: `Mit Aquafacial · CHF 170 statt 250`
CTA: Mehr dazu

**A3 — Nach der Arbeit an der Bahnhofstrasse** (`location_static45_v1`, `location_reel916_v1`)

Primary text, short:

> Bahnhofstrasse 94, wenige Gehminuten vom Hauptbahnhof: Aquafacial + Microneedling nach der Arbeit oder am Samstag.
> 1 Std. 30 Min., CHF 170 statt CHF 250, bis [Enddatum]. Mo–Fr bis 20 Uhr, Sa bis 16 Uhr. Unverbindlich anfragen.

Primary text, long:

> Ein Termin, der in die Woche passt: Beauty Face Lift liegt an der Bahnhofstrasse 94, wenige Gehminuten vom Hauptbahnhof, die Tramhaltestelle Bahnhofstrasse/HB liegt direkt in der Nähe. Geöffnet Mo–Fr 10–20 Uhr und Sa 10–16 Uhr.
>
> Das Kombi-Angebot: Aquafacial + kosmetisches Microneedling in einer Sitzung von 1 Std. 30 Min., mit Hautanalyse und Abschlusspflege. CHF 170 statt CHF 250, gültig bis [Enddatum].
>
> Persönlich von Teresa Stimac, 4,8 von 5 aus über 248 Bewertungen auf Treatwell. Senden Sie Ihren Terminwunsch unverbindlich – Teresa meldet sich.

Headline: `Nahe HB: Aquafacial + Microneedling`
Description: `CHF 170 statt 250 · Mo–Fr bis 20 Uhr`
CTA: Mehr dazu

**A4 — Teresa, 20+ Jahre** (`teresa_static11_v1`, `teresa_reel916_v1`)

Primary text, short:

> Bei Beauty Face Lift behandelt Teresa Stimac persönlich – seit über 20 Jahren, 4,8 von 5 aus über 248 Bewertungen auf Treatwell.
> Aquafacial + Microneedling, 1 Std. 30 Min., CHF 170 statt CHF 250, bis [Enddatum]. Bahnhofstrasse 94, Zürich.

Primary text, long:

> Kein Standardprogramm: Teresa Stimac schaut zuerst, was Ihre Haut aktuell braucht, und stimmt Aquafacial und kosmetisches Microneedling darauf ab. Eine Person, ein Studio an der Bahnhofstrasse 94, seit über 20 Jahren.
>
> Kombi-Angebot: 1 Std. 30 Min. mit Hautanalyse, Aquafacial, Microneedling und beruhigender Abschlusspflege. CHF 170 statt CHF 250, gültig bis [Enddatum].
>
> 4,8 von 5 aus über 248 Bewertungen auf Treatwell. Unverbindlich anfragen – ohne Online-Zahlung.

Headline: `Persönlich von Teresa Stimac, Zürich`
Description: `Aquafacial + Microneedling · CHF 170`
CTA: Mehr dazu

**A5 — Angebot bis [Enddatum]** (final week, `enddate_static45_v1`, `enddate_reel916_v1`)

Primary text:

> Noch bis [Enddatum]: Aquafacial + Microneedling für CHF 170 statt CHF 250 bei Beauty Face Lift, Bahnhofstrasse 94.
> 1 Std. 30 Min. mit Hautanalyse und Abschlusspflege, persönlich von Teresa Stimac. Terminwunsch senden oder direkt online buchen.

Headline: `Kombi-Angebot bis [Enddatum]`
Description: `CHF 170 statt 250 · 90 Min.`
CTA: Jetzt buchen (only once the Treatwell CHF 170 offer exists, otherwise Mehr dazu)

Note on A2 and A4: "Ihre Haut" appears only in the sense "Teresa stimmt die Behandlung auf Ihre Haut ab", which describes the service, not an attribute of the viewer. If Meta's review still flags it, replace with "auf die Haut abgestimmt".

### 5.4 Formats and the launch set

| Angle | 9:16 (Reels/Stories) | 4:5 (feeds) | 1:1 (fallback) |
|---|---|---|---|
| A1 | video 15–20 s, 3 cuts, price card at 3 s and at the end, captions | static: real treatment photo or the page's hero, price chip "CHF 170 statt 250 · 90 Min. · bis [Enddatum]" | same static cropped |
| A2 | optional clip with Teresa's voice (5.5) over b-roll | static quote card: question + three answers + price line | same |
| A3 | walk-in 10 s: street → door → room | static: door or street photo, "Wenige Gehminuten vom HB" | same |
| A4 | — | static: real portrait + stars line | primary |
| A5 | Story 8 s: price card + end date | static: price card | same |

Launch set: **A1 video, A2 static, A3 static** (three ads in one ad set). Reserve: A4 for day 11, A5 for the final week (5.6). Statics use the real photographs in the repo (`src/assets/marketing/teresa_portrait.jpg`, the real treatment photo) wherever possible; the page's generated scenes may be used only under the rules in 5.5.

### 5.5 Footage without Teresa on camera

Three sources, in order of preference:

1. **Real b-roll, no faces, filmed by anyone with a phone in the studio** (the user, a friend, Teresa holding the phone). Vertical 9:16, 1080p or 4K, steady (lean on a shelf or a small tripod), window light from the side, no overhead neon, no music in the room, about 30 cm distance for close-ups. Hands, devices, the room, the street. No client faces without a signed consent; hands and the back of a head are fine. **No before/after, no "problem skin" close-ups.**
2. **Teresa's voice only.** If she agrees, she records the ten lines below as voice memos on her phone (about two minutes, no face). They go over the b-roll with captions. Her voice is real, so nothing is faked.
3. **Generated scene clips** (the user's AI videos of Teresa), only as silent b-roll and only under these rules: the same style and setting as the page's generated photographs (consent for her likeness is on record in [AQUAFACIAL-LANDING-PAGE-UPDATE.md](AQUAFACIAL-LANDING-PAGE-UPDATE.md), "2026-10 Imagery"); **no synthetic speech, lip-sync or any animation that makes her appear to say or do something she did not**; no depiction of results; clips of 2–4 seconds under text or her real voice; Meta may attach an "AI info" label to such content, which is acceptable for scenes and would be embarrassing for a fake talking head. If in doubt, use source 1.

Shot list (sources 1 and 3):

| # | Shot | Length | Used in |
|---|---|---|---|
| S1 | Aquafacial handpiece gliding over a cheek, close-up, slow | 10 s | A1 |
| S2 | The transparent water container of the Aquafacial device during use (do not name the device brand on screen) | 5 s | A1 |
| S3 | Microneedling pen in a gloved hand, shown to camera, then a short controlled pass on skin (slow, calm) | 10 s | A2 |
| S4 | Applying the calming aftercare mask or cream, hands only | 8 s | A1, A2 |
| S5 | The treatment room: a slow pan from the window to the bed | 8 s | A2, A3, A4 |
| S6 | Street: the entrance at Bahnhofstrasse 94 with the tram passing, then the door and the name plate | 10 s | A3 |
| S7 | Walk-in: from the door to the room in one take | 10 s | A3 |
| S8 | Skin analysis lamp and the workstation, hands only | 8 s | A2 |
| S9 | **Audio only:** Teresa records lines 1–10 below as voice memos, two takes each | 10 × 10 s | A2, A4 |
| S10 | Detail: the product shelf / clean workstation, slow | 5 s | fillers |

Ten lines Teresa can say (voice memo; she may rephrase in her own words, the meaning and the cautious wording must stay):

1. "Ich bin Teresa Stimac, und ich behandle Sie persönlich – seit über 20 Jahren hier an der Bahnhofstrasse."
2. "Zum ersten Mal Microneedling? Dann schauen wir zuerst in der Hautanalyse, ob die Kombination für Sie passt."
3. "Aquafacial reinigt sanft und gibt der Haut Feuchtigkeit. Das ist die Vorbereitung für den zweiten Schritt."
4. "Beim kosmetischen Microneedling setze ich feine Mikroimpulse – kontrolliert und individuell dosiert."
5. "Viele empfinden es als leichtes Piksen oder Wärme. Die Intensität stimme ich auf Sie ab."
6. "Nach der Behandlung kann die Haut gerötet sein. Je nach Hauttyp beruhigt sie sich meist innerhalb von 24 bis 48 Stunden."
7. "Zum Schluss gibt es eine beruhigende Abschlusspflege und klare Hinweise für die nächsten zwei Tage."
8. "Das Kombi-Angebot gilt bis [Enddatum]: beide Behandlungen in einer Sitzung, 1 Stunde 30 Minuten, für 170 statt 250 Franken."
9. "Sie fragen unverbindlich an – ich melde mich persönlich bei Ihnen und wir finden einen Termin."
10. "Wir sind nur wenige Gehminuten vom Hauptbahnhof, Montag bis Freitag bis 20 Uhr und am Samstag bis 16 Uhr."

Lines she must not say: anything with "garantiert", "schmerzfrei", "keine Ausfallzeit", "Falten", "Narben", "Akne", "Kollagen", "medizinisch", "jünger". Without her voice, the same lines become text cards.

### 5.6 Refresh cadence (30 days)

- Day 11: the weakest ad (lowest link CTR with at least 1,000 impressions, or no email after CHF 50 of spend) is replaced by A4 or by a `_v2` of the best ad with a new first 3 seconds.
- Day 23: the weakest ad is replaced by A5 (end-date ad) for the final week.
- Never more than one new ad per week at this budget; each new ad replaces a retired one, so the ad set always holds three.

## 6. Offer and landing-page alignment

### 6.1 Ad promise → page element

| Ad element | Page element that confirms it (as live on 2026-10-11) |
|---|---|
| "Aquafacial + Microneedling", "Kombi-Angebot" | eyebrow "Aktion: Aquafacial + Microneedling in Zürich"; H1 "Aquafacial + Microneedling: frischer Glow, glatter wirkende Haut" |
| "90 Minuten" / "1 Std. 30 Min." | hero lead "1 Std. 30 Min. mit Hautanalyse, Aquafacial, kosmetischem Microneedling und Abschlusspflege"; offer line "Kombi-Angebot · 1 Std. 30 Min." |
| "CHF 170 statt CHF 250" | hero offer line "CHF 170.– · statt CHF 250.–"; FAQ 1; closing band; sticky bar |
| "gültig bis [Enddatum]" | **missing on the page** → CR-1 below. Today only the hidden Product schema has `priceValidUntil: '2026-12-31'`, which is not visible and will not match the real end date (start + 30 days) |
| "persönlich von Teresa Stimac, 20+ Jahre" | hero bullet "Persönlich durch Teresa Stimac, 20+ Jahre Erfahrung"; trust section with her real portrait and quote |
| "4,8 von 5 aus über 248 Bewertungen auf Treatwell" | rating line under the hero CTAs, linked to Treatwell; facts row in the trust section |
| "Bahnhofstrasse 94, wenige Gehminuten vom HB", opening hours | location section "Bahnhofstrasse 94 · Zürich" with directions (Hauptbahnhof, tram stop Bahnhofstrasse/HB) and the opening hours from `OPENING_HOURS` |
| "Unverbindlich anfragen, ohne Online-Zahlung" | primary CTA "Unverbindlich Termin anfragen"; "So geht es weiter" above the form; FAQ "Muss ich jetzt schon bezahlen? Nein." |
| A2's honest answers (Piksen, Rötungen, 24–48 h) | FAQ "Ist Microneedling schmerzhaft?", "Gibt es Ausfallzeit?", expectations section "Realistische Ergebnisse statt übertriebener Versprechen" |
| A5 "direkt online buchen" | "Direkt online buchen" link after the form, in the FAQ and in the closing band → `/termin/` → Treatwell; **shows CHF 200 until the Treatwell CHF 170 offer exists** (Q8) |

The ad copy in section 5 uses only wording that exists on the page, so review and visitor expectations match.

### 6.2 Where the ads link

- Link: `https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/` exactly, no `#anfrage` anchor (landing mid-page skips the trust content and breaks the sticky-bar logic that watches the hero), no `/termin/`, never Treatwell directly.
- Tracking parameters only in the ad's URL-parameters field (3.4). The page stores them in `sessionStorage`, forwards them into the enquiry email and into every Meta/GA4 event.
- Display link `beautyfacelift-zuerich.ch`. The page is `noindex` on purpose; that is irrelevant for ads.
- Instagram profile link and Page CTA button should point to the same LP during the campaign (organic traffic then lands on the same measured page; use `utm_source=instagram&utm_medium=organic_social&utm_campaign=bfl_ch_organic_aquafacial-microneedling_202610` on that link, following the archived organic template).

### 6.3 Urgency without fake scarcity

- **Real urgency = the end date** (Q2), shown in the ads and on the page. Nothing else is needed.
- Capacity statements ("Teresa behandelt persönlich, die Zahl der Kombi-Termine pro Woche ist begrenzt") are true in substance and allowed only once Q3 is answered; never with an invented number of free slots.
- Not allowed: countdown timers, "nur heute", "letzte Chance" before the final week, "fast ausgebucht" without Teresa's confirmation that week.
- Define what the end date means (decision for the user, default as assumption): **requests received by the end date get the offer; the appointment itself may take place up to four weeks later.** Put the same sentence into FAQ 1 (CR-1), so a late enquiry is not disappointed when the next free slot is after the end date.

### 6.4 Change requests for the site (not done in this task)

| ID | File(s) | Change | Reason | Priority |
|---|---|---|---|---|
| **CR-1** | `src/pages/lp/aquafacial-microneedling/index.astro` (constants block near `PROMO_PRICE`, hero offer line `lp-hero-offer`, `faqs[0].a`, closing band `lp-final-lead`, sticky bar `lp-mobile-sticky-offer`, `structuredData.offers.priceValidUntil`); `scripts/check-aquafacial-lp-offer.mjs` (pin the visible date string) | Add `OFFER_VALID_UNTIL` (ISO) and `OFFER_VALID_UNTIL_LABEL` ("bis <Enddatum>", start date + 30 days), render the label in the hero offer line, FAQ 1 (with the "request by the end date, appointment within four weeks" sentence), the closing band and the sticky bar; derive `priceValidUntil` from the same constant instead of the hard-coded `2026-12-31` | Swiss price-indication rules require a time-limited "statt" comparison; the ads promise the date; the schema must not contradict the page | **launch gate** |
| **CR-2** | `src/lib/track.ts` (`trackLead`, `hashedContactData`), `worker/routes/track.ts` (user-data allow-list currently `em`, `ph`, `fbp`, `fbc` at the `sanitizeUserData` check), `src/pages/lp/aquafacial-microneedling/index.astro` (the `trackLead` call after `response.ok`) | Accept `firstName`/`lastName`, hash them (lowercase, trimmed) as `fn`/`ln`, allow them in the Worker, pass the split `name` field from the form | Raises Lead match quality with data the form already collects under consent; alternative without code: automatic advanced matching in Events Manager (3.3) | nice to have, week 2 |
| **CR-3** | `worker/routes/contact.ts` (subject selection near `isAquafacialLead`, the `timeLabel`/Zeitwunsch row) | Subject "Neue Kombi-Anfrage: Aquafacial + Microneedling – {name}" when `campaign === 'aquafacial_microneedling'`; omit the empty "Zeitwunsch: Nicht angegeben" row | Teresa and the agency can filter the campaign's emails by subject; the lead sheet (3.6) is built from them; already listed in TODO | week 1 |
| **CR-4** | `docs/current/tracking/gtm-container-GTM-NVC9QKGS.json` (export after the change) and `tracking/GOOGLE-ANALYTICS-GTM.md` | Forward `cta_click_lead_form` with `button_location` to GA4 | On-page funnel per ad (CTA click → lead) in the GA4 exploration (3.5) | optional |
| **CR-5** | `src/pages/lp/aquafacial-microneedling/index.astro` (rating line, `studioFacts`), `scripts/check-aquafacial-lp-offer.mjs` (pin at "4,8 aus 248+") | Update to the confirmed count only after Teresa confirms the source (TODO "Confirm the review source and current count") | Ads and page must say the same number; "248+" stays true meanwhile | after confirmation |

No change is requested to the consent gate: loading the Pixel or CAPI before consent would fix the attribution gap at the price of the site's privacy position, and that is not the agency's call.

## 7. Launch plan (30 days)

Days count from the start date (day 1 = launch day). Ads run days 1–30; the offer end date is the day after day 30.

Proposed calendar (start Thursday 15 October 2026):

| Milestone | Day | Date |
|---|---|---|
| Gates done, campaign built paused, previews approved | 0 | Wednesday 18 October |
| Launch | 1 | Thursday 15 October |
| First read, first ad swap | 11 | Sunday 25 October (read on Monday 26 October) |
| Second read, month-2 proposal | 18 | Sunday 1 November (read on Monday 2 November) |
| End-date ad in | 23 | Friday 6 November |
| Third read | 28 | Wednesday 11 November |
| Last ad day | 30 | Friday 13 November |
| Offer end date, "statt" removed from the page | 31 | Saturday 18 November (removal deployed on Monday 16 November at the latest; the ads have already stopped) |

### 7.1 Day by day

| Days | Theme | Agency does | Teresa does | Decision |
|---|---|---|---|---|
| −7 to 0 | **Prepare** | CR-1 (end date on the page) implemented, reviewed and deployed; custom conversions and audiences created; Events Manager test (3.1) passed; three ads built with UTMs; previews approved by the user; lead sheet created; campaign scheduled with start and end dates | creates the Treatwell CHF 170 service (Q8); records the ten voice lines if she agrees; lets someone film the shot list (5.5); confirms she answers within about an hour | all gates in 3.0 ticked → go |
| 1–10 | **Test** | launch; no edits for 10 days except policy rejections or a broken link; daily 10-minute check (spend pacing, rejections, email arrival, first-reply time); emails into the sheet | answers every lead; fills status | none; let it learn |
| 11 | **First read** | per-ad link CTR, cost per landing page view, emails by `utm_content`; ad-set true CPL and visibility ratio `V`; apply the ad rules (7.3); swap the weakest ad (5.6); report #1 | reports which leads were reachable | which two ads carry on, which reserve comes in |
| 12–22 | **Run** | daily check; day 18 second read: true CPL, first `r_book`; report #2 with the month-2 budget proposal if true CPL ≤ CHF 25 | first appointments take place; marks `erschienen` / `no-show` | raise the lifetime budget now (user) or keep CHF 400 |
| 23 | **End-date push** | A5 replaces the weakest ad; all live copy shows "bis [Enddatum]" | — | — |
| 24–30 | **Run out** | no new ads; day 28 third read; the ad set ends on day 30 at 23:59 by schedule; the offer stays valid one more day | last appointments before the end date; the "appointment within four weeks" rule (6.3) applies to late requests | — |
| 30–32 | **Close** | "statt" removed from the page the same day (CR-1's constant); final report: true CPL, `r_book`, `r_show`, cost per show, revenue, `V`; month-2 decision (budget = 25 leads/week × true CPL, capped by the slots Teresa confirms; a new "statt" comparison needs the waiting time in 8.3) | confirms slots for the next month | continue without "statt", pause, or a new offer |

### 7.2 Budget pacing

- Lifetime budget CHF 400 with start and end dates (4.7). Meta paces unevenly across days and may spend roughly double the average on some days; judge pacing weekly: after day 10 about one third of the budget should be spent, after day 20 about two thirds.
- Raising the budget is the user's decision after the day-11 or day-18 read: steps of at most 20 %, not more often than every 3 days.
- There is no scaling cap to watch this month: 10 slots per week need 25 leads per week, and the budget buys about 4–6.

### 7.3 Kill and scale rules (target CHF 15, max CHF 25, break-even CHF 56)

| Level | Rule | Action |
|---|---|---|
| Ad | spend ≥ 2 × max CPL (**CHF 50**) with **0** emails | pause |
| Ad | link CTR < 0.6 % after 1,000 impressions, while another ad is above 1 % | pause at the next read |
| Ad set | day-18 true CPL > **CHF 25** with ≥ 5 leads | swap creative (5.6); do **not** touch targeting |
| Ad set | day-18 true CPL > break-even (**CHF 56**), or fewer than 4 emails after CHF 200 spent | stop and escalate to the user with the diagnosis in 8.8 |
| Scale (user decision) | day-18 true CPL ≤ **CHF 25** with ≥ 6 emails, `V` measured, Teresa reaching ≥ 50 % of leads | propose raising the lifetime budget toward `25 leads/week × true CPL` in 20 % steps |
| Lead quality | `r_book` < 35 % over 15+ leads | review reply speed and the phone validation first (not the ads); check the share of "Ich bin unsicher" skin goals per ad |

### 7.4 Frequency and refresh

- Prospecting frequency above 2.5 per 7 days: swap the weakest ad for a new version (4.6).
- Creative refresh per 5.6: day 11 and day 23, one new ad each.

### 7.5 Weekly report template (every Monday, one page)

Ads Manager columns (date range: last 7 days and lifetime, comparison window "7-day click"; breakdown by ad; export as CSV into the report sheet):

| Column | Source |
|---|---|
| Ausgegebener Betrag (spend) | Ads Manager |
| Impressionen, Reichweite, Frequenz | Ads Manager |
| CPM | Ads Manager |
| Link-Klicks, CTR (Link-Klickrate) | Ads Manager |
| Landing Page Aufrufe, Kosten pro LPV | Ads Manager |
| BFL – Lead – Kombi LP (Meta leads), Kosten pro Lead (Meta CPL) | Ads Manager, custom conversion |
| BFL – Contact – Kombi LP (WhatsApp clicks) | Ads Manager |
| BFL – Treatwell – Kombi (outbound clicks) | Ads Manager |

Added by the agency:

| Column | Formula / source |
|---|---|
| Enquiry emails (LP, utm_source=meta) | count from the blind copies, by `utm_content` |
| **True CPL** | spend ÷ emails |
| Visibility ratio `V` | Meta leads ÷ emails |
| On-page conversion | emails ÷ landing page views (trend only) |
| Kontaktiert, Gebucht, Erschienen, No-Show, Nicht erreicht | lead sheet (3.6) |
| `r_book`, `r_show`, first-contact time | sheet |
| Cost per show | spend ÷ erschienen (lags 1–3 weeks; report cumulative) |
| First-visit revenue, ROAS (first visit) | sheet; revenue ÷ spend |
| GA4 `generate_lead` (filter LP + meta) | GA4 exploration (3.5) |
| Notes | best ad, frequency, rejections, lead quality remarks, next changes |

### 7.6 Who does what

| Who | Every day | Every Monday | On events |
|---|---|---|---|
| Agency (the user) | 10-minute check: spend, rejections, email arrival, reply time; move new emails into the sheet | report (7.5); apply rules (7.3); plan the day-11 and day-23 swaps | policy rejection: fix and resubmit within 24 h; `V` collapse: rerun 3.1 |
| Teresa | answer leads within about an hour; three attempts over three days; update status | tell the agency how far out appointments are booked and any lead remarks | voice lines before launch; next-month slots by day 28 |
| Claude (this repo) | — | update the decisions log (section 9) when the user reports numbers or decisions | implement CR-1 to CR-5 on request, on a branch, with QA |

## 8. Risks and compliance

### 8.1 Policy rejections and how to avoid them

| Trigger | How the plan avoids it | If rejected anyway |
|---|---|---|
| Personal attributes (implying the viewer's skin condition, age, health) | copy describes the treatment, never the viewer (5.1); no "Ihre Poren/Falten/Akne" | remove the sentence, resubmit; do not appeal with the same text |
| Personal health: before/after, "unrealistic results", negative self-perception | no before/after, no problem close-ups, cautious outcome wording ("kann … wirken") | replace the image, not just the text |
| Misleading claims / price | price, duration and end date identical to the page; end date visible on the page (CR-1) | check the page first; rejections here usually mean the page and ad disagree |
| Landing page quality (non-functional, mismatched) | page live, fast, matches the promise; test link opened in a private window before submitting | wait for CR-1 deployment before resubmitting |
| Brand/device names | "Aquafacial" only; no device brand on screen (5.5 S2) | — |
| Account-level: unverified domain, missing payer/beneficiary | 3.0 gates | complete Business Manager data, resubmit |

Keep at least one plain, already-approved static ad (A3 or A2) live at all times, so a rejection never leaves the ad set empty.

### 8.2 Consent-gate attribution gap

Pixel, CAPI and GTM load only after "Marketing akzeptieren"; visitors who click "Ablehnen" or ignore the banner are invisible to Meta and GA4 but still send enquiries. Effects and mitigations:

- Meta's CPL is **too high** by the factor `1/V`; the optimiser learns from a subset of leads. The subset is not biased by ad, so creative decisions stay valid; budget decisions use true CPL (3.7).
- Retargeting pools from the Pixel are smaller than the real traffic; the engagement audiences (4.6) compensate.
- `V` is unknown today; it is measured in week 1 and reported weekly. Any attempt to "fix" it by loading tags before consent is out of scope (6.4 note).

### 8.3 Swiss price indication (PBV) and the "statt" price

- A comparison with the business's own previous price ("statt CHF 250") is allowed only if that price was actually charged immediately before, for at least twice as long as the comparison is advertised, and the comparison may be advertised for **at most two months** (Preisbekanntgabeverordnung, Art. 16; the SECO guide to the PBV explains the rule). The user keeps "statt CHF 250" (decided 2026-10-10); the run is 30 days (Q2), which is inside the limit, and the end date is shown everywhere (CR-1). The CHF 250 must have been charged for at least the 60 days before launch.
- **Risk to flag, not re-decided here:** Treatwell currently lists the combination at a **sale price of CHF 200 statt 250**. If CHF 200 has been the price actually charged online immediately before the campaign, the "statt 250" comparison is weaker than the page assumes. Mitigation the user already owns: create the CHF 170 service on Treatwell (Q8) and make sure the regular CHF 250 listing is the one charged outside this campaign; keep a dated screenshot of the regular price list from before launch in the project files.
- After the end date, the "statt" comparison must disappear from the page and the ads the same day. A **new** "statt CHF 250" comparison (for example in January) is only possible after the regular price has again been charged for at least twice the new comparison period; a four-week January comparison would need eight weeks of CHF 250 before it. Practical consequence: a month-2 continuation right after the end date can advertise CHF 170 as the plain campaign price without "statt", or a different offer, but not "statt CHF 250" again. Decide at day 30.

### 8.4 Old-site Pixel pollution

Covered by the custom conversion (3.2) and the weekly URL breakdown. Residual risk: Meta's **audiences** (LP viewers, Lead exclusion) are already URL-scoped; the dataset's overall EMQ and diagnostics stay mixed until Q7 is resolved, which only affects the score, not delivery.

### 8.5 Treatwell price mismatch

Until the CHF 170 service exists, a visitor who clicks "Direkt online buchen" sees CHF 200. The page makes the form primary, so exposure is limited, but a complaint ("the ad said 170") is a policy and trust risk. Rule: **do not launch without Q8**, or, if the user insists on launching first, Teresa honours CHF 170 for every combo booking during the campaign and every CTA stays "Mehr dazu" (no "Jetzt buchen") until the service exists.

### 8.6 Capacity overflow

Not a risk this month: the budget buys about 16–27 leads, capacity is about 40 slots. The rules stay for a bigger month: appointments booked more than three weeks out → budget −20 %; more than five weeks out → pause prospecting. Teresa's reply template for a full calendar (agreed before launch, plain and true): the next free combo appointment, the end-date rule from 6.3, and the option of holding the request at the offer price. Never claim "ausgebucht" in ads as a sales tactic.

### 8.7 Seasonality

- **Timing of this run:** with a start in the second half of October the 30 days end before the late-November CPM rise. If the start slips into November, the final week overlaps Black Friday (27 November 2026); expect higher CPMs then and do not read that week as a trend.
- **November:** normal; the best weeks for this offer.
- **Late November to Christmas:** CPMs rise with retail advertising (Black Friday, gifting); expect Meta CPL to drift up 20–40 % in late November and December (experience value, not a forecast for this account). Mitigation: if a later month scales, do it in early November while CPMs are still normal, keep the end-date creative for the last week, do not raise budgets in December to chase volume. A gift-voucher angle is allowed only if Q11 is yes; otherwise a "Termin vor Weihnachten" timing message is enough.
- **Between Christmas and New Year:** low attention; let the campaign end on the end date rather than running into the holidays.
- **January:** strong month for skin treatments and cheap CPMs in the first two weeks; winter is also the season cosmetic studios usually recommend for Microneedling because of lower sun exposure (say it cautiously, "in den Wintermonaten gut planbar", not as a medical claim). Restart with a fresh offer framing that respects 8.3.

### 8.8 If true CPL is above the ceiling at day 18 (above CHF 25, or above CHF 50 = 2 × max)

Diagnose in this order, act on the first failing step:

1. **Measurement:** is `V` plausible and are emails arriving? If Meta CPL is high but true CPL is fine, nothing is wrong with the ads. Remember that CHF 25 true CPL can show as CHF 40–50 in Ads Manager when half of the visitors decline consent.
2. **Creative:** link CTR below 0.8 % or CPM far above the first days → the hook, not the offer. Replace the weakest ad with a `_v2` of the best; test a different first 3 seconds (treatment close-up vs. price card vs. street).
3. **Landing:** landing page views ÷ link clicks below 70 % → load or consent-banner friction; run Lighthouse on mobile and the 3.1 test on a slow connection; check nothing changed on the page.
4. **Page conversion:** emails ÷ landing page views below 3 % with healthy CTR → the offer or the form; check the end date is visible (CR-1), the first screen shows the price and the CTA, and the WhatsApp path is not stealing form leads (WhatsApp enquiries count as leads in the sheet).
5. **Lead quality:** if `r_book` is high (above 60 %) a higher CPL may still be fine: cost per show is what matters; recompute with the measured `r_ls`.
6. **Economics:** if after the fixes true CPL stays above CHF 56 (break-even) by day 21, stop the ad set and bring the numbers to the user: the choices are a different offer, a different audience (4.4), or a different lead path (WhatsApp-first ads, Instant Forms with their weaker lead quality). Do not solve it by loosening claims or adding scarcity.

### 8.9 Other risks

- **Reply speed:** every hour of delay lowers `r_book`; agreed in Q10 and visible in the sheet (time of enquiry vs. time of first contact).
- **Comments on ads:** answer within 24 hours in "Sie", move individual skin questions to WhatsApp ("gerne persönlich"), hide spam; never give medical advice in comments.
- **Image consistency:** ads use Teresa's real portrait and studio b-roll, the page still uses partly generated scenes; the new real image set resolves it. Until then, keep the real portrait on the page's trust section as the visual bridge. Generated clips of Teresa follow the rules in 5.5.
- **Account hygiene:** 64 inactive campaigns stay inactive; do not reuse an old campaign (its learning and attribution are stale); archive them after the test.

## 9. Decisions log and next steps

**Decided in this plan (routine calls, the user can overrule):** Leads objective on the URL-filtered custom conversion; one ad set with a CHF 400 lifetime budget and fixed dates; Advantage+ audience with hard controls (15 km, 25+, German) and the old site's Pixel audiences as suggestions; manual placements without Audience Network and Messenger; three ads at launch, two in reserve; no retargeting ad set this month; "Mehr dazu" as the button; no synthetic talking Teresa, voice-only or text instead; the enquiry emails as the source of truth; no offline conversion upload; no change to the consent gate.

**Still needed from the user:**

1. Confirm the proposed start (Thursday 15 October 2026) and offer end date (Saturday 18 November 2026), or name others; CR-1 and the ads use them.
2. Approval to implement CR-1 (end date on the page) on a branch and to deploy it; the site change is small and listed in 6.4.
3. Add Meta's Ads MCP server as a custom connector at claude.ai → Customize → Connectors (URL reported as `https://mcp.facebook.com/ads`; use the URL Meta's sign-in shows if it differs), sign in with the Facebook Business account that owns the ad account, then start a new session and point it at this document. It builds everything from 4.9 **paused**; nothing spends money until the user says go. Without the connector, the build sheet in 4.9 is the hand-over for Ads Manager.
4. Who produces the three launch creatives (A1 video, A2 static, A3 static) and whether Teresa records the ten voice lines.
5. The Treatwell CHF 170 service (Q8) before launch.
6. Optional: the September CPL from Ads Manager, to compare with the CHF 15 goal.

**Set up in Meta (admin needed):**

1. Business Manager: verify `beautyfacelift-zuerich.ch`, confirm Page, Instagram, ad account, dataset and payment are in one Business, fill in beneficiary/payer if asked.
2. Events Manager: run the test in 3.1; create the four custom conversions in 3.2; optionally switch on automatic advanced matching (3.3) if CR-2 is not implemented.
3. Audiences: create the nine custom audiences in 4.6 on day 1.
4. Campaign: build per 4.9 with the UTM string from 3.4 in every ad; send previews to the user for approval before publishing.
5. Lead sheet: create per 3.6 and share with Teresa.

**Launch day (proposed Thursday 15 October 2026, 09:00):**

1. Open the live page in a private window: price, "statt", end date (CR-1), form works (do not submit).
2. Events Manager → Test events with the test code: PageView, ViewContent, then one labelled test lead → Lead browser + server, email received. Remove the code afterwards.
3. Custom conversion "BFL – Lead – Kombi LP" shows yesterday's test lead.
4. Treatwell shows the CHF 170 combo service.
5. Publish the campaign; check within 30 minutes that all ads are "Aktiv" (not "In Prüfung" for more than a few hours).
6. Click one live ad from a phone (Instagram), accept consent, read the email's UTM rows: ad set and ad names must appear in `utm_content`.
7. Tell Teresa the campaign is live and that the first enquiries can arrive the same day.
8. Set calendar reminders for day 11, day 18, day 23, day 30 and the offer end date (remove "statt").

**Meta objects created through the Meta Ads connector** (ad account `act_442592606954627`; everything paused, nothing published):

| Created | Object | ID | Status |
|---|---|---|---|
| 2026-10-11 | Audience "BFL – Lead – Kombi LP – 90 Tage" (Lead + URL contains `/lp/aquafacial-microneedling/`, 90 days; exclusion) | `120254199137810195` | filling |
| 2026-10-11 | Audience "BFL – Lead – alle URLs – 180 Tage" (Lead on both domains, 180 days; suggestion) | `120254199137880195` | filling |
| 2026-10-11 | Audience "BFL – LP Besucher – Kombi – 30 Tage" (later retargeting) | `120254199138010195` | filling |
| 2026-10-11 | Audience "BFL – High Intent – Kombi – 30 Tage" (later retargeting) | `120254199138230195` | filling |
| 2026-10-11 | Audience "BFL – Treatwell Klick – 30 Tage" (later exclusion) | `120254199138260195` | filling |
| 2026-10-11 | Campaign "BFL \| Lead \| Kombi Aquafacial+Microneedling CHF 170 \| 2026-10" (Leads, no campaign budget) | `120254199138320195` | PAUSED |
| 2026-10-12 | Ad set "p_zh15km_adv": lifetime CHF 400, 15 Oct 00:00 – 13 Nov 23:59, optimises on the Pixel's Lead event, 15 km around the studio (living in or frequently in), minimum age 25 (suggestions 30–60, women), German, exclusion "Lead – Kombi LP – 90 Tage", suggestions "Webseite Besucher - beide domains" and "Lead – alle URLs – 180 Tage", Facebook + Instagram feeds, Stories, Reels, search, Explore | `120254207820210195` | PAUSED |
| 2026-10-13 | Creative "glow_static45_v1 (Facebook)": image `glow_45.jpg` by URL, Glow text, Facebook identity only | `1122592603653354` | not editable; Instagram needs a new creative |
| 2026-10-13 | Creative "first-needling_static45_v1 (Facebook)": image `first-needling_45.jpg`, Microneedling text | `1120214557409175` | same |
| 2026-10-13 | Creative "teresa_static45_v1 (Facebook)": image `teresa_45.jpg`, Teresa trust text | `2988695684856112` | same |
| 2026-10-13 | Ad "glow_static45_v1" in ad set `p_zh15km_adv` | `120254230713110195` | PAUSED |
| 2026-10-13 | Ad "first-needling_static45_v1" | `120254230713520195` | PAUSED |
| 2026-10-13 | Ad "teresa_static45_v1" | `120254230714620195` | PAUSED |

Reused existing audiences instead of duplicating them: "Webseite Besucher - beide domains" (`120248671679130195`), "IG Interaktions" (`120248671698950195`), "Facebook Interaktions" (`120248671688500195`).

Not possible through the connector: the custom conversions in 3.2 (no tool for them; the ad set optimises on the Pixel's Lead event instead, see the decisions log) and linking the Instagram account to the ad account (none is linked, so ads would run on Facebook only; the user does this in Business Settings). The language control was set through the connector (locale 5, German, the value earlier ad sets in this account used).

**Decisions log** (append below as the campaign runs):

| Date | Decision / number reported | By |
|---|---|---|
| 2026-10-11 | Plan written; all numbers were assumptions pending the user's answers | Claude (agency session) |
| 2026-10-11 | User answered section 1: CHF 400 per 30 days, start as soon as possible, end date start + 30 days, about 10 slots/week, target CPL under CHF 15 and max CHF 25, consumables CHF 30, Teresa not on camera (AI clips possible), full Meta access, old site kept (same persona), Treatwell CHF 170 service before launch, Teresa answers within about an hour. Plan updated: one ad set, lifetime budget, three ads, no retargeting this month, 30-day schedule, creative without Teresa on camera, build sheet 4.9 | Claude, from the user's answers |
| 2026-10-11 | Proposed start Thursday 15 October 2026, offer end date Saturday 18 November 2026 (start + 30 days), ads run 15 October to 13 November. The user asked to build through Meta's MCP server; it is not connected to this session, so the build happens in a new session after the connector is added, everything paused until the user's go | Claude |
| 2026-10-11 | Ad account `act_442592606954627` in Business `135112460858934` confirmed by the user's Ads Manager link. The user is signed in to Facebook in Chrome on their own computer; this cloud session cannot use that browser, so the Meta build waits for the Ads MCP connector (added at claude.ai, then a new session). The user reports the account block shown in Ads Manager as a bug | Claude |
| 2026-10-11 | User confirmed the ad account is not restricted. Checked other build routes: Meta's own Ads MCP server is not in Claude's connector directory (custom connector only), and the five Facebook connections in the agency's Make account expired between 2022 and 2024. Every route to build in Meta needs one Facebook sign-in by the user | Claude |
| 2026-10-11 | Meta Ads connector working in the cloud session. Read-only check: 64 campaigns, all paused; last 28 days: "Aquafacial 99 - Juni 26 – Leads" CHF 247.82 for 45 Meta-counted results (CHF 5.51 each; not verified enquiries, Resend showed no real enquiry from the new site in the 15 days before 2026-10-10), two Carbon campaigns CHF 63.04 with no results. Created five audiences and the paused campaign (IDs above) | Claude |
| 2026-10-12 | User asked Claude to do everything except linking Instagram, the AI-label decision, merging PR #50 and Teresa's lead sheet. Decisions: (1) the connector cannot create custom conversions, so the ad set optimises on the Pixel's standard Lead event; the ads link only to the combo page, so the leads credited to this ad set are combo-page leads, and the user confirmed old-site visitors are the same persona; (2) dates fixed: ads 15 October – 13 November 2026, offer end date 14 November 2026 (start + 30 days); (3) launch ads built from the two real photos plus a text card (`design/ads/2026-10-kombi/`): glow (A1, static instead of video), first Microneedling (A2) and Teresa trust (A4, replacing A3 because no real photo of the entrance exists); (4) "2 Min. vom HB" in the plan was not a verified fact; replaced everywhere by the site's "wenige Gehminuten vom Hauptbahnhof"; (5) the Treatwell CHF 170 service cannot be created from here (no Treatwell access); (6) publishing stays with the user's explicit "go" | Claude |
| 2026-10-12 | Read-only Pixel check (dataset `1147246982373946`, 5–12 October): Lead events 9 from `beautyfacelift-zuerich.ch` (all on 9–10 October, the test enquiries) and 3 from `beautyfacelift.ch`; PageView arrives from both domains; match quality 6.1/10 on PageView, ViewContent and LandingPageView (keys: IP, user agent, fbp; fbc only appears once ads send clicks). Still open before the ads can be built: PR #50 merged (end date and ad images live) and an Instagram account linked to the ad account | Claude |
| 2026-10-13 | PR #50 merged with the user's approval and deployed (deploy run 38449659203): the end date "bis 14. November 2026" and the six ad images are live. Meta's media upload (by file or URL) and per-placement images are not yet enabled for this ad account in the connector, so each ad uses one 4:5 image passed by URL (Meta fits it into Stories and Reels). The three creatives use the Facebook identity only because no Instagram account is linked; once it is linked, create Instagram-enabled copies (or switch the identity per ad in Ads Manager) before publishing. Campaign, ad set and three ads are complete and paused; publishing waits for the user's "go" | Claude |
