# Meta campaign plan — Aquafacial + Microneedling, CHF 170 statt CHF 250

> Written 11 October 2026 for the agency (not a developer). Status: **plan, awaiting the user's answers in section 1 and approval**. Nothing in this document changes the website or the tracking code. Change requests for the site are listed in section 6.4 with file paths.
>
> Sources read for this plan: [AQUAFACIAL-LANDING-PAGE-UPDATE.md](AQUAFACIAL-LANDING-PAGE-UPDATE.md) section 9, [PPC-TRACKING.md](PPC-TRACKING.md), [tracking/GOOGLE-ANALYTICS-GTM.md](tracking/GOOGLE-ANALYTICS-GTM.md), [TODO.md](TODO.md) (Meta check 2026-10-10, Decisions for Teresa), [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) section 1, `src/lib/track.ts`, `src/pages/lp/aquafacial-microneedling/index.astro`, `worker/routes/contact.ts`, `worker/routes/track.ts`, and the archived [2026-05-08 PPC tracking plan](../archive/plans/2026-05-08-ppc-treatwell-tracking.md) and [Carbon release note](../archive/releases/CARBON-GLOWUP-TREATWELL-RELEASE-2026-05-08.md) (UTM template). There is no earlier Meta ads audit in `docs/archive/`; the only earlier Meta material is the UTM template and the proxy-conversion guidance, both reused below.

## 0. Summary

- **Offer:** Aquafacial + Microneedling, 90 minutes (shown as "1 Std. 30 Min."), CHF 170 statt CHF 250, at Beauty Face Lift, Bahnhofstrasse 94, 8001 Zürich, treated personally by Teresa Stimac.
- **Landing page:** https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/ (lead-first: request form primary, WhatsApp secondary, Treatwell "Direkt online buchen" tertiary).
- **Objective:** Leads, website, optimised on a **URL-filtered custom conversion** built on the Meta `Lead` event, so the old WordPress site's Leads (same Pixel) do not feed the optimisation.
- **Source of truth for results:** the enquiry emails (Teresa receives them, the agency is in blind copy), not Ads Manager. Pixel, CAPI and GTM only load after marketing consent, so Meta sees only a share of real leads.
- **Structure:** one campaign, one prospecting ad set (Advantage+ audience with hard controls: 15 km around the studio, 25+, German), four ads (four angles), and a retargeting ad set from week 3.
- **Hard gates before the first franc:** offer end date on the page, Treatwell CHF 170 offer created, Events Manager test passed with the site's `test_event_code` mechanism, custom conversion created, UTM parameters set on every ad.
- **Numbers:** every number that is not a confirmed fact is an explicit assumption with its formula (section 2). Target CPL and the kill/scale thresholds are derived from those assumptions and must be re-derived once the user answers section 1.

## 1. Questions for the user (answer in a few minutes)

Defaults are used wherever an answer is missing, so the plan can start. Each default is marked **(assumption)** throughout the document.

| # | Question | Default if not answered | Why it matters |
|---|---|---|---|
| Q1 | Monthly budget range and start date? | **CHF 1,500/month (CHF 50/day)**, start Monday **2026-10-27** if the gates in section 3.0 are done, otherwise Monday 2026-11-03 (assumption) | Sets the number of leads the campaign can buy and whether a retargeting ad set is affordable. |
| Q2 | Offer end date (the "statt CHF 250" needs one)? | **Saturday 2026-12-20** (eight weeks after 27 October; stays inside the two-month limit for a "statt" comparison, see section 8.3) (assumption) | Required by Swiss price-indication rules and by the ad copy ("bis 20. Dezember"). |
| Q3 | How many 90-minute combo appointments per week can Teresa actually take for this campaign? | **6 per week** (assumption) | Caps the lead volume and therefore the budget. Overflow turns paid leads into lost leads. |
| Q4 | Spend and cost per result of the September Aquafacial campaign (Ads Manager: 10–30 September, columns "Ausgegebener Betrag", "Ergebnisse", "Kosten pro Ergebnis")? | Unknown; the plan uses a **target CPL of CHF 30** derived in section 2 (assumption) | The only real benchmark for this account. Replaces the assumption in every threshold. |
| Q5 | Does Teresa agree to appear in ads and in simple phone video (face and voice)? | **Yes** (she already appears in the page photography) (assumption) | Angles 2 and 4 are built on her. Fallback: hands, studio, text on screen, no face. |
| Q6 | Does the agency have full access to Business Manager (admin), the ad account, the Facebook Page, the Instagram account and the dataset/Pixel `1147246982373946`? | **Yes, full** (assumption) | Custom conversions, audiences, domain verification and payment settings need admin rights. |
| Q7 | Will the old WordPress site `beautyfacelift.ch` be redirected (301) to the new domain, lose its Pixel, or stay as it is during the campaign? | **Stays as it is** (assumption) | Decides whether the URL-filtered custom conversion is a temporary or a permanent measure. |
| Q8 | Does the Treatwell service "Aquafacial + Microneedling – 90 Min. – CHF 170" exist yet? | **Not yet** → it is a launch gate (section 3.0) | The page's "Direkt online buchen" link currently lands on Treatwell's CHF 200 sale price. |
| Q9 | Variable cost of one combo treatment (consumables: needling cartridge, serums, mask)? | **CHF 25** (assumption) | Needed for the break-even CPL. Teresa's time is not costed while slots would otherwise be empty. |
| Q10 | Who answers leads, through which channel, and within how long? | **Teresa, by WhatsApp or phone, within 2 business hours, Mo–Fr 10–20, Sa 10–16** (assumption) | Speed-to-lead is the biggest lever on the lead-to-appointment rate. |
| Q11 | Does Teresa sell gift vouchers (for a November–December angle)? | **No voucher angle** until confirmed | Never invent an offer. |
| Q12 | Can the agency see the September ads (creatives and copy) in Ads Manager? | **Yes** (assumption) | Avoids repeating what already fatigued; not blocking. |

## 2. Objectives and unit economics

### 2.1 Facts

| Item | Value | Source |
|---|---|---|
| Ticket, first visit | CHF 170 | offer |
| Regular price | CHF 250 | page, Treatwell regular price confirmed in TODO |
| Duration | 90 minutes, one slot of Teresa's time | page |
| Proof points allowed | 4,8 from 248+ reviews on Treatwell; 20+ years of experience | page, TODO |
| Primary conversion | request form → `/api/contact` → `201` → Meta `Lead` (Pixel + CAPI, dedup by `event_id`), GA4 `generate_lead`, `source: aquafacial_microneedling_lp_form`, value 170 CHF | `index.astro`, `track.ts` |
| Secondary | WhatsApp → Meta `Contact` (`method=whatsapp`, value 8) | `track.ts` |
| Tertiary | "Direkt online buchen" → `/termin/` → `BookingButtonClick`, then `TreatwellOutboundClick` on the forward to `buchung.treatwell.ch` | `track.ts`, `/termin/` |
| View | `ViewContent` + `LandingPageView` with value 170 on the LP | `track.ts` `LANDING_PAGE_CONTENT` |
| Consent | Pixel, CAPI and GTM load only after "Marketing akzeptieren" | `MarketingConsent.astro`, `track.ts` |

### 2.2 Assumptions (explicit, to be replaced by Q3, Q4, Q9 and by week-2 data)

| Symbol | Meaning | Assumed value | Basis |
|---|---|---|---|
| `C_var` | consumables per treatment | CHF 25 | Q9 |
| `M1` | contribution of a first visit = 170 − `C_var` | **CHF 145** | formula |
| `r_book` | leads that become a confirmed appointment | 50 % | lead form requires a phone number; Teresa confirms personally; experience value for local beauty lead forms, to be measured from week 2 |
| `r_show` | confirmed appointments that show up | 80 % | no deposit on the page ("Muss ich jetzt schon bezahlen? Nein."); personal confirmation and a reminder message the day before |
| `r_ls` | lead → show = `r_book` × `r_show` | **40 %** | formula |
| `Cap` | combo slots per week | 6 | Q3 |

### 2.3 Derived targets

| Metric | Formula | Value with the assumptions |
|---|---|---|
| Break-even CPL (first visit only, no rebooking) | `M1 × r_ls` = 145 × 0.40 | **CHF 58** |
| Target CPL | break-even × 0.5, so the first visit still leaves about CHF 70 before Teresa's time | **CHF 30** |
| Max CPL (kill line) | break-even × 0.75 | **CHF 45** |
| Target cost per show | target CPL ÷ `r_ls` = 30 ÷ 0.40 | CHF 75 (44 % of the ticket) |
| Leads needed per week to fill capacity | `Cap` ÷ `r_ls` = 6 ÷ 0.40 | **15 leads/week** |
| Weekly budget that fills capacity at target CPL | 15 × 30 | **CHF 450/week ≈ CHF 1,950/month** |
| Weekly budget at max CPL | 15 × 45 | CHF 675/week |
| What the default budget buys (Q1: CHF 350/week) at target CPL | 350 ÷ 30 | about 12 leads/week → about 5 shows/week → about CHF 800 first-visit revenue/week |

Sensitivity, so nobody is surprised when the real rates differ:

| `r_ls` | Break-even CPL | Target CPL (×0.5) | Leads/week for 6 shows |
|---|---|---|---|
| 30 % | CHF 44 | CHF 22 | 20 |
| 40 % (assumed) | CHF 58 | CHF 29 → rounded to 30 | 15 |
| 50 % | CHF 73 | CHF 36 | 12 |

Rebooking is deliberately left out of the targets. If Teresa reports that first-visit clients rebook at the regular price, the break-even moves up and the user can relax the kill line; that decision is made with data in week 6, not assumed now.

### 2.4 What "success" means

**Week 2 (after 14 days of spend):**

- Measurement is proven: every test lead shows in Events Manager as browser + server with one `event_id`, the custom conversion counts only LP leads, every email carries `utm_campaign`, `utm_content`, `utm_term` and `fbclid`.
- At least 10 enquiry emails from the LP with `utm_source=meta` (the source of truth), true CPL (spend ÷ emails) at or below CHF 45 (max), with the visibility ratio (Meta-counted leads ÷ emails) known.
- Teresa has reached at least half of the leads and at least 3 appointments are confirmed.
- No ad rejected for policy; frequency on prospecting below 2.5 per 7 days.
- A clear winner among the four angles (lowest true CPL with at least 4 leads), or a clear loser to cut.

**Week 6 (end of the test period):**

- True CPL at or below CHF 30 over the trailing 14 days, with at least 10 leads/week while capacity allows.
- `r_book` and `r_show` measured from Teresa's sheet (section 3.6); cost per show at or below CHF 75.
- Capacity used but not overflowed: no lead waits more than 2 business days for an answer, no appointment offered later than 3 weeks out.
- Decision made for the period after the offer end date (section 7, week 6).

## 3. Measurement readiness checklist (before spending a franc)

### 3.0 Launch gates (all must be ticked)

- [ ] Offer end date decided (Q2) and **visible on the page** (change request CR-1 in section 6.4 deployed).
- [ ] Treatwell service "Aquafacial + Microneedling – 90 Min. – CHF 170" exists (Q8), so "Direkt online buchen" after the form shows the advertised price.
- [ ] Events Manager test (3.1) passed on the live page with the site's `test_event_code` mechanism.
- [ ] Custom conversion "BFL – Lead – Kombi LP" (3.2) created and showing the test lead.
- [ ] UTM convention (3.4) applied to every ad; a test click shows the values in the enquiry email.
- [ ] Lead sheet (3.6) created and shared with Teresa; she knows the five status values.
- [ ] Business Manager: domain `beautyfacelift-zuerich.ch` verified under Brand Safety → Domains; Page, Instagram account, ad account, dataset `1147246982373946` and payment method all in the same Business; "Begünstigter und Zahlender" (beneficiary and payer) filled in if Ads Manager asks for it.
- [ ] Attribution setting of the campaign: 7-day click, 1-day view (Meta default; reporting uses a click-only comparison, see 3.7).

### 3.1 Events Manager verification (test_event_code)

The site forwards a test code to the Worker, which sends it to Meta as CAPI `test_event_code`, so server events appear in Test Events next to the browser events. The code must match `^TEST[A-Za-z0-9_-]{3,64}$` (`src/lib/track.ts`), which is what Events Manager issues.

1. Events Manager → dataset `1147246982373946` → **Test events** → copy the code (format `TESTxxxxx`).
2. Open, in a fresh private window on a phone and once on desktop:

   ```text
   https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/?utm_source=meta&utm_medium=paid_social&utm_campaign=bfl_ch_meta_lead_aquafacial-microneedling_202611&utm_content=p_zh15km_adv__test_ad&utm_term=test_placement&utm_id=test&fbclid=TESTCLICK123&test_event_code=TESTxxxxx
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
utm_source=meta&utm_medium=paid_social&utm_campaign=bfl_ch_meta_lead_aquafacial-microneedling_202611&utm_content={{adset.name}}__{{ad.name}}&utm_term={{placement}}&utm_id={{campaign.id}}&utm_source_platform=meta
```

Meta fills `{{adset.name}}`, `{{ad.name}}`, `{{placement}}` and `{{campaign.id}}` at delivery. Because the names land in the email, they must be slugs (lowercase, no spaces, no umlauts, parts separated by `_`, words inside a part by `-`):

| Level | Pattern | Examples |
|---|---|---|
| Campaign (Ads Manager name, free text) | `BFL \| Lead \| Kombi Aquafacial+Microneedling CHF 170 \| 2026-11` | — |
| `utm_campaign` | `bfl_ch_meta_lead_<treatment>_<yyyymm>` (archived template) | `bfl_ch_meta_lead_aquafacial-microneedling_202611`; keep the same value when the campaign runs into December, the month is the launch month |
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

Teresa's rule: answer within 2 business hours by WhatsApp or phone (Q10), three contact attempts over three days, confirm the appointment in writing, send a reminder the day before. The agency reads the sheet every Monday and computes `r_book`, `r_show`, cost per show and the per-ad true CPL.

**Offline conversion upload via CAPI (`action_source: physical_store` or `other`, event "Schedule" or a custom "AppointmentBooked", matched on hashed email/phone):** technically possible from this setup, but **not worth it in the first six weeks**. Meta needs about 50 optimisation events per ad set per week to learn; at the assumed volume (about 12 leads/week → about 6 bookings → about 5 shows) the upload would be a reporting feature, not an optimisation signal, and it costs a weekly manual upload or an automation. Decision: manual sheet for six weeks; revisit the upload (or a Meta Conversion Leads integration) only if the campaign produces 30+ bookings per month for two months, which would make the "booked" event a plausible optimisation target.

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
| Dataset | `1147246982373946` | the existing Pixel, keeps audiences and match history |
| Conversion event | custom conversion **BFL – Lead – Kombi LP** (3.2) | excludes old-site Leads |
| Performance goal | maximise number of conversions | |
| Bid strategy | highest volume (no cap) for the whole test period | a cost cap at this budget mostly under-delivers; consider a cost cap at 1.2 × target CPL only after week 4 if CPL swings more than ±50 % week to week |
| Attribution | 7-day click, 1-day view (default) | see 3.7 |
| Special ad category | none | cosmetic services are not a special category |
| Budget type | **ad set budgets (ABO)**, not campaign budget | with CHF 50/day Meta's campaign budget tends to starve the small retargeting ad set; ABO guarantees its spend |
| Advantage+ creative "standard enhancements" | **off** for text improvements, overlays, catalogue items and image enhancements; music off for video (ads bring their own sound) | automatic text could introduce claims the copy rules forbid ("schmerzfrei", "garantiert") and cannot be QA'd |
| Dynamic creative / multi-advertiser ads | off | copy must be reviewable as a fixed unit; premium positioning |
| Schedule | all day, no dayparting | the form works 24/7; Teresa answers in business hours (Q10) |
| Campaign end | the **offer end date** (Q2), set as the ad set end date, so no "statt" ad runs past it | PBV, see 8.3 |

If Ads Manager offers the newer "Advantage+ Leads-Kampagne" flow, accept it but keep the audience **controls** and the manual placements below; the plan does not depend on the UI version.

### 4.2 Learning-phase arithmetic and consolidation

Meta's learning phase wants about **50 optimisation events per ad set in 7 days**. At the target CPL that is 50 × CHF 30 = **CHF 1,500 per week per ad set**, three to four times the default budget. Consequences:

- With CHF 50/day the campaign will stay in "Lernphase eingeschränkt" (learning limited). That is acceptable: delivery still optimises, only less stably. Do not fight it by switching to a cheaper event (landing page views, `ViewContent`, `HighIntentVisit`); leads bought on those signals are visitors, not enquiries.
- Therefore **one prospecting ad set** holds the whole prospecting budget; angles are tested as **ads inside that ad set**, not as separate ad sets. Meta allocates between ads; the agency reads per-ad true CPL from the emails (3.6).
- Budget changes of more than 20 % at once, or editing targeting, restart learning. Scale in steps of ≤ 20 % no more than every 3 days (section 7).
- Only if Q1 is at least CHF 150/day and capacity (Q3) allows it does a second prospecting ad set (geo expansion, 4.4) make sense.

### 4.3 Audience: Advantage+ audience with hard controls

Use **Advantage+ audience** (Meta broadens from the controls) with these **controls** (hard limits):

| Control | Value | Reason |
|---|---|---|
| Location | **15 km radius around Bahnhofstrasse 94, 8001 Zürich**, "Personen, die an diesem Ort leben" (people living in this location) | covers the city and the agglomeration (Dübendorf, Wallisellen, Kloten, Regensdorf, Dietikon, Adliswil, Thalwil, Zollikon, Küsnacht); "living in" excludes tourists on Bahnhofstrasse, who are the wrong buyers for a 90-minute treatment with follow-up sessions |
| Minimum age | **25** | the ticket and the combination treatment skew older; under-25 traffic is cheap but books rarely for CHF 170 |
| Language | **German (all variants)** | the ads and the page are German "Sie" |
| Exclusions | custom audience "Lead – Kombi LP – 90 Tage" (4.6) | do not pay again for people who already asked |

**Suggestions** to Meta (soft, Meta may exceed them): age 30–60, women. Gender cannot be hard-set in Advantage+ audience; that is fine, men who respond are welcome (the page says "Kundinnen und Kunden"). No interest targeting: with Lead optimisation and a 15 km radius, interests only shrink the pool.

Fallback if Advantage+ audience is not offered for this account: original audience, same location, age 25–65, German, no interests, "Advantage detailed targeting" off.

### 4.4 Geo logic (commuters) and expansion

- Core (launch): the 15 km "living in" radius above. Commuters who live inside it are covered.
- Commuters from outside (Winterthur, Baden, Zug, Rapperswil) are a real audience for a studio two minutes from the Hauptbahnhof, but the plan does not start with them: distance lowers show rate and the budget cannot fund two prospecting ad sets.
- Expansion rule (week 4 or later): if prospecting frequency exceeds 2.5 per 7 days **and** true CPL is at or below target **and** capacity still has room, duplicate the prospecting ad set as `p_zh25km_adv` with a 25 km radius plus the towns Winterthur, Baden, Zug, Rapperswil-Jona, with the original ad set's audience excluded. Otherwise do not expand.
- Never use "recently in" or "travelling in" for this offer.

### 4.5 Placements

Manual placements (editing placements switches Advantage+ placements off, which is intended):

| On | Off | Why |
|---|---|---|
| Instagram Feed, Instagram Stories, Instagram Reels, Instagram Explore, Facebook Feed, Facebook Reels, Facebook Stories, Facebook Marketplace, Facebook search results | **Audience Network** (all), **Messenger** (inbox, stories), Facebook in-stream video, Facebook right column, Instagram profile feed | Audience Network and Messenger bring accidental clicks and no enquiries for a premium local service; in-stream interrupts; right column is desktop-only and tiny |

Devices: all. Operating systems: all. Inventory filter: "Moderat" (moderate). Formats per placement: 9:16 for Stories/Reels, 4:5 for feeds, 1:1 as the fallback (section 5).

### 4.6 Retargeting layer (ad set `rt_lp-ig-video_30d`)

Custom audiences to create on day 1 (they need time to fill):

| Audience | Source | Window | Consent-gated? |
|---|---|---|---|
| LP viewers – Kombi | website, URL contains `/lp/aquafacial-microneedling/` | 30 days | yes (Pixel) |
| LP high intent – Kombi | website event `HighIntentVisit`, URL contains the LP path | 30 days | yes |
| Video viewers 50 % | engagement, "Personen, die mindestens 50 % des Videos angesehen haben", all campaign videos | 30 days | **no** (Meta-side data) |
| Instagram engagers | engagement, Instagram professional account, "alle Personen, die mit diesem Konto interagiert haben" | 90 days | no |
| Facebook Page engagers | engagement, Page | 90 days | no |
| **Lead – Kombi LP – 90 Tage** | website event `Lead`, URL contains the LP path | 90 days | yes; used as **exclusion** everywhere |
| Treatwell clickers – Kombi | website event `TreatwellOutboundClick` | 30 days | yes; excluded from retargeting (they went to book) |

Because Pixel audiences only contain consenting visitors, **the engagement audiences (video, Instagram, Page) are the backbone of retargeting** here; they do not depend on the consent banner.

When it earns its budget (rule, not a fact): switch the retargeting ad set on when the combined pool (LP viewers + video 50 % + IG engagers, minus leads) exceeds about **1,000 people** and the campaign has spent at least **CHF 300**. Expected: start of week 3 at the default budget. Before that, retargeting would show the same ad to the same few hundred people many times a day.

Retargeting ad set settings: audiences above (included), exclusions Lead 90 d and Treatwell clickers 30 d, location same 15 km radius, no other controls, same placements, budget **CHF 8/day** of the CHF 50 (about 15–20 %), creative: the end-date ad and the Teresa trust ad (section 5), CTA "Jetzt anfragen"-type button (see 5.1).

Frequency: Leads campaigns have no frequency cap setting. Monitor instead: prospecting above **2.5 per 7 days** → add a creative version or expand (4.4); retargeting above **4 per 7 days** → swap creative or pause for 3 days.

### 4.7 Budget split and pacing

| Period | Prospecting `p_zh15km_adv` | Retargeting `rt_lp-ig-video_30d` | Daily total (Q1 default) |
|---|---|---|---|
| Weeks 1–2 | CHF 50/day | off (audiences filling) | CHF 50 |
| Weeks 3–6 | CHF 42/day | CHF 8/day | CHF 50 |
| When scaling (section 7) | +20 % steps | keep at ~15–20 % of total | up to the capacity-derived cap: 15 leads/week ÷ true conversion rate |

Formula for the weekly cap at any time: `weekly budget max = (Cap ÷ r_ls) × true CPL` with the measured values; with the assumptions that is 15 × 30 = CHF 450/week. Spending above it buys leads Teresa cannot serve.

### 4.8 Exclusions summary

- Lead – Kombi LP – 90 Tage: excluded in every ad set.
- Treatwell clickers 30 d: excluded in retargeting.
- No customer-list exclusion exists (no CRM export); if Teresa can export Treatwell client emails with a lawful basis, that is a later improvement, not a launch item.

## 5. Creative strategy

### 5.1 Rules every ad must pass

- Swiss German, "Sie", "ss" never "ß". The treatment is **Aquafacial** (never any other device or brand name). Microneedling is "kosmetisches Microneedling".
- Claims stay cosmetic and cautious: "kann … unterstützen", "glatter wirkende Haut", "optisch feinere Poren", "frischer wirken". Forbidden: "garantiert", "schmerzfrei", "keine Ausfallzeit", "Falten weg", "Narben entfernen", "Kollagen aufbauen", "medizinisch", "heilt", any number of years younger.
- Meta personal-attributes rule: the text never asserts or implies something about the viewer's skin, age or health. Not allowed: "Haben Sie grosse Poren?", "Ihre müde Haut", "Für Akne-Haut". Allowed: describing the treatment and what it is meant for in the third person ("für Haut, die mehr Glow braucht" is still borderline; prefer "für mehr Glow").
- Meta personal-health rule: no before/after images, no zoomed-in skin "problems", no imagery that invites negative self-perception. No before/after material exists and none will be generated.
- Price claims exactly as on the page: "CHF 170 statt CHF 250", "1 Std. 30 Min." or "90 Minuten", and the end date from Q2. No "nur noch 3 Plätze" unless Teresa confirms the number that week.
- Proof points only: "4,8 von 5 aus über 248 Bewertungen auf Treatwell", "20+ Jahre Erfahrung", "persönlich von Teresa Stimac", "Bahnhofstrasse 94, 2 Minuten vom Hauptbahnhof" (the page's directions name the Hauptbahnhof and the tram stop Bahnhofstrasse/HB).
- Text on images under about 20 % of the area, no logo overlay inside photos, no text inside the Stories safe zones (top 14 %, bottom 20 % of a 9:16).
- Captions burned in on every video (sound off by default in feeds).
- Headlines ≤ 40 characters, primary text with the offer in the first line (feeds truncate after about 125 characters), description ≤ 30 characters.
- CTA button: Meta localises the label; choose **"Mehr dazu" (Learn more)** for prospecting (cold traffic needs the page before it asks) and **"Jetzt buchen" (Book now)** only in retargeting, where the page's "Direkt online buchen" path exists and the Treatwell CHF 170 offer is live (Q8). If "Angebot anfordern" (Get quote) is offered, it is a valid alternative for prospecting; never "Registrieren" or "Kaufen".
- Link: the plain LP URL; UTM parameters in the URL-parameters field (3.4). Display link: `beautyfacelift-zuerich.ch`.
- Visual direction follows the page: warm, calm, cream and copper, Instrument Serif headline, real studio photos or Teresa's phone footage, no stock faces.

### 5.2 The four angles

| # | Angle | Who it is for | Hook (first line) | Primary format | Also |
|---|---|---|---|---|---|
| A1 | **Glow in 90 Minuten** (offer + outcome) | people in and around Zürich who want fresher, smoother-looking skin and know roughly what a facial is | "Aquafacial + Microneedling in einer Sitzung: 90 Minuten für frischeren Glow – CHF 170 statt CHF 250." | 9:16 Reel, 15–20 s | 4:5 static |
| A2 | **Erstes Microneedling? So läuft es ab** (hesitation) | people who have heard of Microneedling and hesitate: does it hurt, does it fit me, what happens after | "Zum ersten Mal Microneedling? Teresa erklärt in 30 Sekunden, was Sie erwartet." | 9:16 talking-head video, 25–35 s, Teresa to camera | 4:5 static quote card |
| A3 | **Nach der Arbeit an der Bahnhofstrasse** (convenience) | commuters and city workers; the studio is two minutes from the HB, open until 20:00 Mo–Fr and Saturdays | "Bahnhofstrasse 94, zwei Minuten vom HB: Aquafacial + Microneedling nach der Arbeit oder am Samstag." | 4:5 static (street entrance / studio door) | 9:16 walk-in clip, 10 s |
| A4 | **Teresa, 20+ Jahre, eine Person** (trust) | people who want to know who treats them; also the main retargeting creative | "Bei Beauty Face Lift behandelt Teresa Stimac persönlich – seit über 20 Jahren, 4,8 von 5 aus über 248 Bewertungen." | 1:1 / 4:5 static portrait with a short line | 9:16 Teresa clip |
| A5 (retargeting only, from week 3) | **Angebot bis [Datum]** (end date) | LP viewers, video viewers, engagers | "Noch bis 20. Dezember: Aquafacial + Microneedling für CHF 170 statt CHF 250." (date from Q2) | 9:16 Story, 8 s | 4:5 static |

What the first 3 seconds show:

- **A1:** the water-based Aquafacial handpiece gliding on skin in close-up, warm window light, caption "90 Minuten. Ein Termin." → cut to the price card.
- **A2:** Teresa, face to camera, already mid-sentence "Zum ersten Mal Microneedling?" with the caption burned in; no music; she holds the pen briefly up.
- **A3:** the studio entrance on Bahnhofstrasse 94 from the street with the tram passing, caption "2 Min. vom HB"; cut inside to the treatment room.
- **A4:** Teresa's real portrait (the one on the page), caption "Teresa Stimac, 20+ Jahre" and the stars line; static, no motion needed.
- **A5:** price card with the end date, then the hero photo from the page; nothing else.

### 5.3 Ad copy drafts (Swiss German, "Sie")

Each ad has a short primary text (feeds, Reels) and a long variant (Facebook Feed test). Headline and description are the same for both. Replace `[20. Dezember]` with the Q2 date.

**A1 — Glow in 90 Minuten** (`glow_reel916_v1`, `glow_static45_v1`)

Primary text, short:

> Aquafacial + Microneedling in einer Sitzung: 90 Minuten für frischeren Glow und glatter wirkende Haut.
> Kombi-Angebot CHF 170 statt CHF 250, gültig bis [20. Dezember].
> Persönlich von Teresa Stimac, Bahnhofstrasse 94, Zürich. Unverbindlich anfragen – ohne Online-Zahlung.

Primary text, long:

> Aquafacial reinigt sanft und versorgt die Haut mit Feuchtigkeit. Kosmetisches Microneedling setzt danach feine Mikroimpulse. Zusammen in einer Sitzung von 1 Std. 30 Min.: Hautanalyse, Aquafacial, Microneedling, beruhigende Abschlusspflege und klare After-Care-Hinweise.
>
> Kombi-Angebot: CHF 170 statt CHF 250, gültig bis [20. Dezember].
>
> Teresa Stimac behandelt persönlich – seit über 20 Jahren, 4,8 von 5 aus über 248 Bewertungen auf Treatwell. Beauty Face Lift, Bahnhofstrasse 94, zwei Minuten vom Hauptbahnhof.
>
> Sie fragen unverbindlich an, Teresa meldet sich und stimmt die Behandlung auf Ihre Haut ab. Keine Online-Zahlung.

Headline: `Aquafacial + Microneedling, CHF 170 statt 250`
Description: `90 Min. · Bahnhofstrasse 94 · bis [20.12.]`
CTA: Mehr dazu

**A2 — Erstes Microneedling? So läuft es ab** (`first-needling_reel916_v1`, `first-needling_static45_v1`)

Primary text, short:

> Zum ersten Mal Microneedling? Teresa Stimac erklärt in 30 Sekunden, was Sie erwartet: Hautanalyse zuerst, kontrollierte Intensität, Rötungen sind möglich und beruhigen sich meist innerhalb von 24–48 Stunden.
> Kombi mit Aquafacial: CHF 170 statt CHF 250, bis [20. Dezember]. Unverbindlich anfragen.

Primary text, long:

> Viele fragen sich vor dem ersten Microneedling drei Dinge: Tut es weh? Passt es zu meiner Haut? Wie sehe ich danach aus?
>
> Ehrliche Antworten: Viele empfinden es als leichtes Piksen oder Wärme; die Intensität wird individuell angepasst. Ob die Kombination passt, wird vor Ort in der Hautanalyse angeschaut – Sie müssen das nicht vorher wissen. Nach der Behandlung sind Rötungen möglich; die Haut beruhigt sich je nach Hauttyp meist innerhalb von Stunden bis 24–48 Stunden.
>
> Aquafacial + kosmetisches Microneedling in einer Sitzung von 1 Std. 30 Min., CHF 170 statt CHF 250, gültig bis [20. Dezember]. Persönlich von Teresa Stimac, 20+ Jahre Erfahrung, Bahnhofstrasse 94, Zürich.
>
> Unverbindlich anfragen, ohne Online-Zahlung.

Headline: `Erstes Microneedling? So läuft es ab`
Description: `Mit Aquafacial · CHF 170 statt 250`
CTA: Mehr dazu

**A3 — Nach der Arbeit an der Bahnhofstrasse** (`location_static45_v1`, `location_reel916_v1`)

Primary text, short:

> Bahnhofstrasse 94, zwei Minuten vom Hauptbahnhof: Aquafacial + Microneedling nach der Arbeit oder am Samstag.
> 1 Std. 30 Min., CHF 170 statt CHF 250, bis [20. Dezember]. Mo–Fr bis 20 Uhr, Sa bis 16 Uhr. Unverbindlich anfragen.

Primary text, long:

> Ein Termin, der in die Woche passt: Beauty Face Lift liegt an der Bahnhofstrasse 94, zwei Minuten vom Hauptbahnhof und direkt an der Tramhaltestelle Bahnhofstrasse/HB. Geöffnet Mo–Fr 10–20 Uhr und Sa 10–16 Uhr.
>
> Das Kombi-Angebot: Aquafacial + kosmetisches Microneedling in einer Sitzung von 1 Std. 30 Min., mit Hautanalyse und Abschlusspflege. CHF 170 statt CHF 250, gültig bis [20. Dezember].
>
> Persönlich von Teresa Stimac, 4,8 von 5 aus über 248 Bewertungen auf Treatwell. Senden Sie Ihren Terminwunsch unverbindlich – Teresa meldet sich.

Headline: `2 Min. vom HB: Aquafacial + Microneedling`
Description: `CHF 170 statt 250 · Mo–Fr bis 20 Uhr`
CTA: Mehr dazu

**A4 — Teresa, 20+ Jahre** (`teresa_static11_v1`, `teresa_reel916_v1`)

Primary text, short:

> Bei Beauty Face Lift behandelt Teresa Stimac persönlich – seit über 20 Jahren, 4,8 von 5 aus über 248 Bewertungen auf Treatwell.
> Aquafacial + Microneedling, 1 Std. 30 Min., CHF 170 statt CHF 250, bis [20. Dezember]. Bahnhofstrasse 94, Zürich.

Primary text, long:

> Kein Standardprogramm: Teresa Stimac schaut zuerst, was Ihre Haut aktuell braucht, und stimmt Aquafacial und kosmetisches Microneedling darauf ab. Eine Person, ein Studio an der Bahnhofstrasse 94, seit über 20 Jahren.
>
> Kombi-Angebot: 1 Std. 30 Min. mit Hautanalyse, Aquafacial, Microneedling und beruhigender Abschlusspflege. CHF 170 statt CHF 250, gültig bis [20. Dezember].
>
> 4,8 von 5 aus über 248 Bewertungen auf Treatwell. Unverbindlich anfragen – ohne Online-Zahlung.

Headline: `Persönlich von Teresa Stimac, Zürich`
Description: `Aquafacial + Microneedling · CHF 170`
CTA: Mehr dazu

**A5 — Angebot bis [Datum]** (retargeting, `enddate_reel916_v1`, `enddate_static45_v1`)

Primary text:

> Noch bis [20. Dezember]: Aquafacial + Microneedling für CHF 170 statt CHF 250 bei Beauty Face Lift, Bahnhofstrasse 94.
> 1 Std. 30 Min. mit Hautanalyse und Abschlusspflege, persönlich von Teresa Stimac. Terminwunsch senden oder direkt online buchen.

Headline: `Kombi-Angebot bis [20. Dezember]`
Description: `CHF 170 statt 250 · 90 Min.`
CTA: Jetzt buchen (only once the Treatwell CHF 170 offer exists, otherwise Mehr dazu)

Note on A2 and A4: "Ihre Haut" appears only in the sense "Teresa stimmt die Behandlung auf Ihre Haut ab", which describes the service, not an attribute of the viewer. If Meta's review still flags it, replace with "auf die Haut abgestimmt".

### 5.4 Formats and versions per angle

| Angle | 9:16 (Reels/Stories) | 4:5 (feeds) | 1:1 (fallback) |
|---|---|---|---|
| A1 | Reel 15–20 s, 3 cuts, price card at 3 s and at the end | static: hero photo, price chip "CHF 170 statt 250 · 90 Min." | same static cropped |
| A2 | Teresa talking head 25–35 s, captions, pen in hand | static quote card: "Zum ersten Mal Microneedling?" + 3 short answers | same |
| A3 | walk-in 10 s: street → door → room | static: door/street photo, "2 Min. vom HB" | same |
| A4 | Teresa clip 10–15 s (lines 1 and 9 below) | static: real portrait + stars line | same |
| A5 | Story 8 s: price card + end date | static: price card | same |

Launch set (week 1): A1 Reel + A1 static, A2 video, A3 static, A4 static = **5 ads in one ad set**. Keep it at 4–6; more splits the budget into noise.

### 5.5 What Teresa films with a phone (shot list)

Phone in 9:16 (vertical), 1080p or 4K, steady (lean on a shelf or use a small tripod), window light from the side, no overhead neon, no music in the room, a 30 cm distance for close-ups. Nothing is edited on her side; she sends the raw clips. No client faces unless the client has signed a consent; hands and the back of a head are fine. **No before/after, no "problem skin" close-ups.**

| # | Shot | Length | Used in |
|---|---|---|---|
| S1 | Aquafacial handpiece gliding over a cheek, close-up, slow | 10 s | A1 |
| S2 | The transparent water container of the Aquafacial device during use (do not name the device brand on screen) | 5 s | A1 |
| S3 | Microneedling pen in Teresa's gloved hand, shown to camera, then a short controlled pass on skin (slow, calm) | 10 s | A2 |
| S4 | Teresa applying the calming aftercare mask or cream, hands only | 8 s | A1, A2 |
| S5 | The treatment room: a slow pan from the window to the bed | 8 s | A3, A4 |
| S6 | Street: the entrance at Bahnhofstrasse 94 with the tram passing, then the door and the name plate | 10 s | A3 |
| S7 | Walk-in: from the door to the room in one take | 10 s | A3 |
| S8 | Teresa at the skin analysis: looking at skin with the lamp, hands and profile | 8 s | A2, A4 |
| S9 | Teresa to camera, lines 1–10 below, each line as a separate clip, two takes each | 10 × 10 s | A2, A4 |
| S10 | Detail: the product shelf / clean workstation, slow | 5 s | fillers |

Ten lines Teresa can say on camera (she may rephrase in her own words; the meaning and the cautious wording must stay):

1. "Ich bin Teresa Stimac, und ich behandle Sie persönlich – seit über 20 Jahren hier an der Bahnhofstrasse."
2. "Zum ersten Mal Microneedling? Dann schauen wir zuerst in der Hautanalyse, ob die Kombination für Sie passt."
3. "Aquafacial reinigt sanft und gibt der Haut Feuchtigkeit. Das ist die Vorbereitung für den zweiten Schritt."
4. "Beim kosmetischen Microneedling setze ich feine Mikroimpulse – kontrolliert und individuell dosiert."
5. "Viele empfinden es als leichtes Piksen oder Wärme. Die Intensität stimme ich auf Sie ab."
6. "Nach der Behandlung kann die Haut gerötet sein. Je nach Hauttyp beruhigt sie sich meist innerhalb von 24 bis 48 Stunden."
7. "Zum Schluss gibt es eine beruhigende Abschlusspflege und klare Hinweise für die nächsten zwei Tage."
8. "Das Kombi-Angebot gilt bis [20. Dezember]: beide Behandlungen in einer Sitzung, 1 Stunde 30 Minuten, für 170 statt 250 Franken."
9. "Sie fragen unverbindlich an – ich melde mich persönlich bei Ihnen und wir finden einen Termin."
10. "Wir sind zwei Minuten vom Hauptbahnhof, Montag bis Freitag bis 20 Uhr und am Samstag bis 16 Uhr."

Lines she must not say: anything with "garantiert", "schmerzfrei", "keine Ausfallzeit", "Falten", "Narben", "Akne", "Kollagen", "medizinisch", "jünger".

### 5.6 Refresh cadence

- Week 3: one new version of the best angle (new first 3 seconds, same copy), plus the A5 end-date creative for retargeting.
- Week 5: second shoot with Teresa (the real studio photo set that is being produced separately can replace the generated page photos in statics then); retire any ad above frequency 3 or with true CPL above max for two weeks.
- Rule: never more than two new ads per week into the prospecting ad set; each new ad replaces a retired one.

## 6. Offer and landing-page alignment

### 6.1 Ad promise → page element

| Ad element | Page element that confirms it (as live on 2026-10-11) |
|---|---|
| "Aquafacial + Microneedling", "Kombi-Angebot" | eyebrow "Aktion: Aquafacial + Microneedling in Zürich"; H1 "Aquafacial + Microneedling: frischer Glow, glatter wirkende Haut" |
| "90 Minuten" / "1 Std. 30 Min." | hero lead "1 Std. 30 Min. mit Hautanalyse, Aquafacial, kosmetischem Microneedling und Abschlusspflege"; offer line "Kombi-Angebot · 1 Std. 30 Min." |
| "CHF 170 statt CHF 250" | hero offer line "CHF 170.– · statt CHF 250.–"; FAQ 1; closing band; sticky bar |
| "gültig bis [20. Dezember]" | **missing on the page** → CR-1 below. Today only the hidden Product schema has `priceValidUntil: '2026-12-31'`, which is not visible and does not match Q2 |
| "persönlich von Teresa Stimac, 20+ Jahre" | hero bullet "Persönlich durch Teresa Stimac, 20+ Jahre Erfahrung"; trust section with her real portrait and quote |
| "4,8 von 5 aus über 248 Bewertungen auf Treatwell" | rating line under the hero CTAs, linked to Treatwell; facts row in the trust section |
| "Bahnhofstrasse 94, 2 Min. vom HB", opening hours | location section "Bahnhofstrasse 94 · Zürich" with directions (Hauptbahnhof, tram stop Bahnhofstrasse/HB) and the opening hours from `OPENING_HOURS` |
| "Unverbindlich anfragen, ohne Online-Zahlung" | primary CTA "Unverbindlich Termin anfragen"; "So geht es weiter" above the form; FAQ "Muss ich jetzt schon bezahlen? Nein." |
| A2's honest answers (Piksen, Rötungen, 24–48 h) | FAQ "Ist Microneedling schmerzhaft?", "Gibt es Ausfallzeit?", expectations section "Realistische Ergebnisse statt übertriebener Versprechen" |
| A5 "direkt online buchen" | "Direkt online buchen" link after the form, in the FAQ and in the closing band → `/termin/` → Treatwell; **shows CHF 200 until the Treatwell CHF 170 offer exists** (Q8) |

The ad copy in section 5 uses only wording that exists on the page, so review and visitor expectations match.

### 6.2 Where the ads link

- Link: `https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/` exactly, no `#anfrage` anchor (landing mid-page skips the trust content and breaks the sticky-bar logic that watches the hero), no `/termin/`, never Treatwell directly.
- Tracking parameters only in the ad's URL-parameters field (3.4). The page stores them in `sessionStorage`, forwards them into the enquiry email and into every Meta/GA4 event.
- Display link `beautyfacelift-zuerich.ch`. The page is `noindex` on purpose; that is irrelevant for ads.
- Instagram profile link and Page CTA button should point to the same LP during the campaign (organic traffic then lands on the same measured page; use `utm_source=instagram&utm_medium=organic_social&utm_campaign=bfl_ch_organic_aquafacial-microneedling_202611` on that link, following the archived organic template).

### 6.3 Urgency without fake scarcity

- **Real urgency = the end date** (Q2), shown in the ads and on the page. Nothing else is needed.
- Capacity statements ("Teresa behandelt persönlich, die Zahl der Kombi-Termine pro Woche ist begrenzt") are true in substance and allowed only once Q3 is answered; never with an invented number of free slots.
- Not allowed: countdown timers, "nur heute", "letzte Chance" before the final week, "fast ausgebucht" without Teresa's confirmation that week.
- Define what the end date means (decision for the user, default as assumption): **requests received by the end date get the offer; the appointment itself may take place up to four weeks later.** Put the same sentence into FAQ 1 (CR-1), so a December enquiry is not disappointed in January.

### 6.4 Change requests for the site (not done in this task)

| ID | File(s) | Change | Reason | Priority |
|---|---|---|---|---|
| **CR-1** | `src/pages/lp/aquafacial-microneedling/index.astro` (constants block near `PROMO_PRICE`, hero offer line `lp-hero-offer`, `faqs[0].a`, closing band `lp-final-lead`, sticky bar `lp-mobile-sticky-offer`, `structuredData.offers.priceValidUntil`); `scripts/check-aquafacial-lp-offer.mjs` (pin the visible date string) | Add `OFFER_VALID_UNTIL` (ISO) and `OFFER_VALID_UNTIL_LABEL` ("bis 20. Dezember 2026"), render the label in the hero offer line, FAQ 1 (with the "request by the end date, appointment within four weeks" sentence), the closing band and the sticky bar; derive `priceValidUntil` from the same constant instead of the hard-coded `2026-12-31` | Swiss price-indication rules require a time-limited "statt" comparison; the ads promise the date; the schema must not contradict the page | **launch gate** |
| **CR-2** | `src/lib/track.ts` (`trackLead`, `hashedContactData`), `worker/routes/track.ts` (user-data allow-list currently `em`, `ph`, `fbp`, `fbc` at the `sanitizeUserData` check), `src/pages/lp/aquafacial-microneedling/index.astro` (the `trackLead` call after `response.ok`) | Accept `firstName`/`lastName`, hash them (lowercase, trimmed) as `fn`/`ln`, allow them in the Worker, pass the split `name` field from the form | Raises Lead match quality with data the form already collects under consent; alternative without code: automatic advanced matching in Events Manager (3.3) | nice to have, week 2 |
| **CR-3** | `worker/routes/contact.ts` (subject selection near `isAquafacialLead`, the `timeLabel`/Zeitwunsch row) | Subject "Neue Kombi-Anfrage: Aquafacial + Microneedling – {name}" when `campaign === 'aquafacial_microneedling'`; omit the empty "Zeitwunsch: Nicht angegeben" row | Teresa and the agency can filter the campaign's emails by subject; the lead sheet (3.6) is built from them; already listed in TODO | week 1 |
| **CR-4** | `docs/current/tracking/gtm-container-GTM-NVC9QKGS.json` (export after the change) and `tracking/GOOGLE-ANALYTICS-GTM.md` | Forward `cta_click_lead_form` with `button_location` to GA4 | On-page funnel per ad (CTA click → lead) in the GA4 exploration (3.5) | optional |
| **CR-5** | `src/pages/lp/aquafacial-microneedling/index.astro` (rating line, `studioFacts`), `scripts/check-aquafacial-lp-offer.mjs` (pin at "4,8 aus 248+") | Update to the confirmed count only after Teresa confirms the source (TODO "Confirm the review source and current count") | Ads and page must say the same number; "248+" stays true meanwhile | after confirmation |

No change is requested to the consent gate: loading the Pixel or CAPI before consent would fix the attribution gap at the price of the site's privacy position, and that is not the agency's call.

## 7. Launch plan (first 6 weeks)

Dates assume Q1's default start (Monday 2026-10-27) and Q2's default end (Saturday 2026-12-20). Shift everything by the same offset if the start moves.

### 7.1 Week by week

| Week | Dates | Theme | Agency does | Teresa does | Decision at the end of the week |
|---|---|---|---|---|---|
| 0 | 13–26 Oct | **Prepare** | answers to section 1 collected; CR-1 (end date) requested and deployed; custom conversions and audiences created; Events Manager test (3.1) passed; ads built with UTMs; lead sheet created; ad previews sent to the user for approval | films the shot list (5.5) in one afternoon; creates the Treatwell CHF 170 service (Q8); agrees the end date; confirms she will answer leads within 2 business hours | all gates in 3.0 ticked → go |
| 1 | 27 Oct–2 Nov | **Test** | launch Monday 09:00 with 5 ads in `p_zh15km_adv` at CHF 50/day; no edits for 7 days except policy rejections or a broken link; daily 10-minute check (spend pacing, rejections, email arrival, first-reply time) | answers every lead; fills status in the sheet | none; let it learn |
| 2 | 3–9 Nov | **Read** | first full read on day 8: per-ad spend, Meta leads, emails by `utm_content`, true CPL, visibility ratio `V`; apply ad-level kill rules (7.3); report #1 | continues; reports which leads were reachable | which 2–3 ads carry on |
| 3 | 10–16 Nov | **Consolidate** | pause losers, add `_v2` of the winner (new first 3 s); switch on `rt_lp-ig-video_30d` at CHF 8/day with A5 and A4 (prospecting to CHF 42/day); report #2 with first `r_book` | first appointments take place; marks `erschienen`/`no-show` | retargeting earns its budget? (4.6 rule) |
| 4 | 17–23 Nov | **Scale** | if true CPL ≤ CHF 30 over the trailing 7 days with ≥ 7 leads and capacity used < 80 %: +20 % budget; else hold; geo expansion check (4.4); report #3 | updates the sheet; tells the agency how far out appointments are being booked | scale or hold |
| 5 | 24–30 Nov | **Refresh** | second shoot's material into new statics/clips; retire ads with frequency > 3 or true CPL > CHF 45 for two weeks; add A5 end-date ad to prospecting rotation for the final three weeks; report #4 with cost per show | second phone shoot (15 minutes) | creative set for December |
| 6 | 1–7 Dec | **Decide** | end-of-test report (true CPL, `r_book`, `r_show`, cost per show, revenue); decision for 8–20 Dec (hold, scale within capacity, or wind down); January plan started (8.7) | confirms December capacity and holiday dates | continue to the end date? budget for the last two weeks? |
| run-out | 8–20 Dec | **End date** | end-date messaging in all live ads; stop prospecting 3 days before the end date if no appointment before Christmas can be offered and the "appointment within four weeks" rule is not wanted; ad sets end automatically on the end date | last pre-holiday appointments | the offer ends; the "statt" comparison is removed from the page the same day (CR-1's constant) |

### 7.2 Daily budget pacing

- Daily budgets, constant. Meta may spend up to 75 % more than the daily budget on a single day but never more than seven times the daily budget per calendar week; judge pacing weekly.
- Change budgets at most every 3 days and by at most 20 % per step; larger jumps restart learning.
- Scaling cap at any time: `(Cap ÷ r_ls) × true CPL` per week (4.7). With the assumptions: CHF 450/week. The cap moves with the measured values.
- If appointments are being booked more than three weeks out, cut the budget by 20 % rather than pausing: a pause loses learning and the consent-independent engagement audiences keep filling only while ads run.

### 7.3 Kill and scale rules (numbers from section 2; re-derive after Q4 and week 2)

| Level | Rule | Action |
|---|---|---|
| Ad | spend ≥ 2 × target CPL (**CHF 60**) with **0** emails | pause |
| Ad | spend ≥ 4 × target CPL (**CHF 120**) and true CPL > max (**CHF 45**) | pause, replace with a `_v2` of a better angle |
| Ad | link CTR < 0.6 % after 2,000 impressions | pause (the hook does not work regardless of CPL) |
| Ad set (prospecting) | trailing 7-day true CPL > **CHF 45** with ≥ 5 leads | swap creative; do **not** touch targeting |
| Ad set (prospecting) | trailing 14-day true CPL > break-even (**CHF 58**) | reduce to CHF 30/day and escalate to the user (8.8) |
| Ad set (retargeting) | frequency > 4 per 7 days, or 14-day true CPL > CHF 45 | swap creative or pause 3 days |
| Scale | trailing 7-day true CPL ≤ **CHF 30** with ≥ 7 leads, capacity used < 80 %, prospecting frequency < 2.5 | +20 % budget |
| Stop scaling | weekly emails ≥ **15** (capacity-derived) or frequency ≥ 2.5 | hold; consider 4.4 expansion |
| Lead quality | `r_book` < 35 % over 20+ leads | review reply speed and the phone validation first (not the ads); check the share of "Ich bin unsicher" skin goals per ad |

### 7.4 Frequency and refresh

- Prospecting: act above 2.5 per 7 days; retargeting: act above 4 per 7 days (4.6).
- Creative refresh per 5.6: week 3 (winner v2 + end-date ad), week 5 (second shoot), never more than two new ads per week.

### 7.5 Weekly report template (every Monday, one page)

Ads Manager columns (date range: last 7 days, comparison window "7-day click"; breakdown by ad; export as CSV into the report sheet):

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
| On-page conversion | emails ÷ landing page views (consent-independent numerator, consent-gated denominator; trend only) |
| Kontaktiert, Gebucht, Erschienen, No-Show, Nicht erreicht | lead sheet (3.6) |
| `r_book`, `r_show` | sheet |
| Cost per show | spend ÷ erschienen (lags 1–3 weeks; report cumulative) |
| First-visit revenue, ROAS (first visit) | sheet; revenue ÷ spend |
| GA4 `generate_lead` (filter LP + meta) | GA4 exploration (3.5) |
| Notes | best ad, frequency, rejections, lead quality remarks, next week's changes |

### 7.6 Who does what each week

| Who | Every day | Every Monday | On events |
|---|---|---|---|
| Agency (the user) | 10-minute check: spend, rejections, email arrival, reply time; move new emails into the sheet | report (7.5); apply rules (7.3); plan creative changes | policy rejection: fix and resubmit within 24 h; `V` collapse: rerun 3.1 |
| Teresa | answer leads within 2 business hours; three attempts over three days; update status | tell the agency how far out appointments are booked and any lead remarks | second shoot in week 5; December availability by week 6 |
| Claude (this repo) | — | update this document's "Decisions log" (section 9) when the user reports numbers or decisions | implement CR-1 to CR-5 on request, on a branch, with QA |

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

Keep at least one plain, already-approved ad (A1 static) live at all times, so a rejection never leaves the ad set empty.

### 8.2 Consent-gate attribution gap

Pixel, CAPI and GTM load only after "Marketing akzeptieren"; visitors who click "Ablehnen" or ignore the banner are invisible to Meta and GA4 but still send enquiries. Effects and mitigations:

- Meta's CPL is **too high** by the factor `1/V`; the optimiser learns from a subset of leads. The subset is not biased by ad, so creative decisions stay valid; budget decisions use true CPL (3.7).
- Retargeting pools from the Pixel are smaller than the real traffic; the engagement audiences (4.6) compensate.
- `V` is unknown today; it is measured in week 1 and reported weekly. Any attempt to "fix" it by loading tags before consent is out of scope (6.4 note).

### 8.3 Swiss price indication (PBV) and the "statt" price

- A comparison with the business's own previous price ("statt CHF 250") is allowed only if that price was actually charged immediately before, for at least twice as long as the comparison is advertised, and the comparison may be advertised for **at most two months** (Preisbekanntgabeverordnung, Art. 16; the SECO guide to the PBV explains the rule). The user keeps "statt CHF 250" (decided 2026-10-10); this plan therefore sets the end date at most eight weeks after launch (Q2 default) and shows it everywhere (CR-1).
- **Risk to flag, not re-decided here:** Treatwell currently lists the combination at a **sale price of CHF 200 statt 250**. If CHF 200 has been the price actually charged online immediately before the campaign, the "statt 250" comparison is weaker than the page assumes. Mitigation the user already owns: create the CHF 170 service on Treatwell (Q8) and make sure the regular CHF 250 listing is the one charged outside this campaign; keep a dated screenshot of the regular price list from before launch in the project files.
- After the end date, the "statt" comparison must disappear from the page and the ads the same day. A **new** "statt CHF 250" comparison (for example in January) is only possible after the regular price has again been charged for at least twice the new comparison period; a four-week January comparison would need eight weeks of CHF 250 before it. Practical consequence: January either advertises CHF 170 as the plain campaign price without "statt", or a different offer. Decide in week 6.

### 8.4 Old-site Pixel pollution

Covered by the custom conversion (3.2) and the weekly URL breakdown. Residual risk: Meta's **audiences** (LP viewers, Lead exclusion) are already URL-scoped; the dataset's overall EMQ and diagnostics stay mixed until Q7 is resolved, which only affects the score, not delivery.

### 8.5 Treatwell price mismatch

Until the CHF 170 service exists, a visitor who clicks "Direkt online buchen" sees CHF 200. The page makes the form primary, so exposure is limited, but a complaint ("the ad said 170") is a policy and trust risk. Rule: **do not launch without Q8**, or, if the user insists on launching first, Teresa honours CHF 170 for every combo booking during the campaign and the retargeting CTA stays "Mehr dazu" (no "Jetzt buchen") until the service exists.

### 8.6 Capacity overflow

- Weekly cap in 7.2; stop-scaling rule at 15 emails/week (7.3).
- Appointments booked more than three weeks out → budget −20 %; more than five weeks out → pause prospecting, keep retargeting at CHF 8/day.
- Teresa's reply template for overflow (agreed in week 0, plain and true): the next free combo appointment, the end-date rule from 6.3, and the option of the request being held at the offer price.
- Never claim "ausgebucht" in ads as a sales tactic.

### 8.7 Seasonality

- **November:** normal; the best weeks for this offer. Spend the plan's budget here.
- **Late November to Christmas:** CPMs rise with retail advertising (Black Friday, gifting); expect Meta CPL to drift up 20–40 % in late November and December (experience value, not a forecast for this account). Mitigation: scale in week 4 while CPMs are still normal, keep the end-date creative for December, do not raise budgets in December to chase volume. A gift-voucher angle is allowed only if Q11 is yes; otherwise a "Termin vor Weihnachten" timing message is enough.
- **Between Christmas and New Year:** low attention; let the campaign end on the end date rather than running into the holidays.
- **January:** strong month for skin treatments and cheap CPMs in the first two weeks; winter is also the season cosmetic studios usually recommend for Microneedling because of lower sun exposure (say it cautiously, "in den Wintermonaten gut planbar", not as a medical claim). Restart with a fresh offer framing that respects 8.3.

### 8.8 If CPL is 2 × target after week 2 (true CPL ≈ CHF 60, at break-even)

Diagnose in this order, act on the first failing step:

1. **Measurement:** is `V` plausible and are emails arriving? If Meta CPL is high but true CPL is fine, nothing is wrong with the ads.
2. **Creative:** link CTR below 0.8 % or CPM far above the first week → the hook, not the offer. Replace the two weakest ads with `_v2` of the best; test a different first 3 seconds (Teresa's face vs. treatment close-up).
3. **Landing:** landing page views ÷ link clicks below 70 % → load or consent-banner friction; run Lighthouse on mobile and the 3.1 test on a slow connection; check nothing changed on the page.
4. **Page conversion:** emails ÷ landing page views below 3 % with healthy CTR → the offer or the form; check the end date is visible (CR-1), the first screen shows the price and the CTA, and the WhatsApp path is not stealing form leads (WhatsApp enquiries count as leads in the sheet).
5. **Lead quality:** if `r_book` is high (above 60 %) the higher CPL may still be fine: cost per show is what matters; recompute the kill line with the measured `r_ls`.
6. **Economics:** if after the fixes true CPL stays above CHF 58 for 14 days, reduce to CHF 30/day (keep learning alive), stop scaling, and bring the numbers to the user: the choices are a different offer, a different audience (4.4), or stopping. Do not solve it by loosening claims or adding scarcity.

### 8.9 Other risks

- **Reply speed:** every hour of delay lowers `r_book`; agreed in Q10 and visible in the sheet (time of enquiry vs. time of first contact).
- **Comments on ads:** answer within 24 hours in "Sie", move individual skin questions to WhatsApp ("gerne persönlich"), hide spam; never give medical advice in comments.
- **Image consistency:** ads use Teresa's real portrait and phone footage, the page still uses partly generated scenes; the new real image set resolves it. Until then, keep the real portrait on the page's trust section as the visual bridge.
- **Account hygiene:** 64 inactive campaigns stay inactive; do not reuse an old campaign (its learning and attribution are stale); archive them after the test.

## 9. Decisions log and next steps

**Decided in this plan (routine calls, the user can overrule):** Leads objective on the URL-filtered custom conversion; one prospecting ad set with Advantage+ audience and hard controls (15 km, 25+, German); manual placements without Audience Network and Messenger; ad set budgets, not campaign budget; retargeting from week 3 at about 15–20 % of budget; four angles plus an end-date ad; "Mehr dazu" as the prospecting button; the enquiry emails as the source of truth; no offline conversion upload in the first six weeks; no change to the consent gate.

**The user must answer:** section 1 (Q1–Q12), above all budget and start (Q1), end date (Q2), capacity (Q3), the September CPL (Q4), Teresa on camera (Q5), the Treatwell CHF 170 service (Q8), and the meaning of the end date (6.3).

**The user must set up in Meta (admin needed):**

1. Business Manager: verify `beautyfacelift-zuerich.ch`, confirm Page, Instagram, ad account, dataset and payment are in one Business, fill in beneficiary/payer if asked.
2. Events Manager: run the test in 3.1; create the four custom conversions in 3.2; optionally switch on automatic advanced matching (3.3) if CR-2 is not implemented.
3. Audiences: create the seven custom audiences in 4.6 on day 1.
4. Campaign: build per 4.1–4.7 with the UTM string from 3.4 in every ad; send previews to the user for approval before publishing.
5. Lead sheet: create per 3.6 and share with Teresa.

**Launch day (Monday, 09:00):**

1. Open the live page in a private window: price, "statt", end date (CR-1), form works (do not submit).
2. Events Manager → Test events with the test code: PageView, ViewContent, then one labelled test lead → Lead browser + server, email received. Remove the code afterwards.
3. Custom conversion "BFL – Lead – Kombi LP" shows yesterday's test lead.
4. Treatwell shows the CHF 170 combo service.
5. Publish the campaign; check within 30 minutes that all ads are "Aktiv" (not "In Prüfung" for more than a few hours).
6. Click one live ad from a phone (Instagram), accept consent, read the email's UTM rows: ad set and ad names must appear in `utm_content`.
7. Tell Teresa the campaign is live and that the first enquiries can arrive the same day.
8. Set a calendar reminder for day 8 (first read) and for the end date (remove "statt").

**Decisions log** (append below as the campaign runs):

| Date | Decision / number reported | By |
|---|---|---|
| 2026-10-11 | Plan written; all numbers in sections 2 and 7 are assumptions until Q1–Q4 and Q9 are answered | Claude (agency session) |
