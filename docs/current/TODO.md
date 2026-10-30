# TODO — beautyfacelift-zuerich.ch

**Last updated:** 30 October 2026

## Current priority — agency pilot live, then activation steps

- [x] **Controlled cockpit rollout (stage 5), done 2026-10-30:** PR #62 merged into `master` as `e2e53d7`; deploy run [40996067370](https://github.com/lefteyep/beautyfacelift/actions/runs/40996067370) succeeded (`npm run validate` green, D1 migration `0001_leads.sql` applied to `beautyfacelift-leads`, Worker version `01404b09-3727-4a67-81e8-ef592093e609`, cron `*/15 * * * *`). Verified on production: public pages 200; anonymous `/admin/` and `/admin/leads/` → 302 to `mediapaulo.cloudflareaccess.com`; D1 tables `leads`, `lead_events`, `d1_migrations` (the lead tables are empty). GitHub marked #55 and #56 as merged; #57 is superseded and closed separately.
- [x] Cockpit login, user decision 2026-10-30: one-time PIN by e-mail, session 2 weeks, agency-only (see [LEAD-COCKPIT.md](LEAD-COCKPIT.md#access-application-created-2026-10-30)).
- [ ] **Capture on (this config PR, `codex/leads-capture-on`):** `LEADS_CAPTURE` `on`; `LEADS_REMINDERS` and `LEADS_DATA_OPERATIONS` stay `off`, `LEADS_CUSTOMER_MAILS` stays unset, recipients unchanged. Needs review and the user's explicit merge/deploy approval.
- [ ] Labelled test enquiry after capture is live: the lead appears in the cockpit and the owner e-mail arrives as before.
- [ ] Reminders activation (`LEADS_REMINDERS`), a separate reviewed change; recipients stay agency-only.
- [ ] Privacy for stored leads: retention decided 2026-10-30 (24 months after last contact, earlier on request) and published on the privacy page (`src/pages/datenschutz/index.astro`, section 4) with the capture-on PR; the agency is described without name; IP/User-Agent are stated as not stored in D1. Still open: who executes deletions (manual procedure, `LEADS_DATA_OPERATIONS` off) and the monitoring owner.
- [ ] Storage alert activation (the alert is still a draft).
- [ ] Campaign launch decision (user).

The items below are the 21 October list; the items above supersede their rollout and login statements.

- [x] Implement and locally verify R1–R11 across the repair branches; [REPAIR-2026-10-21.md](REPAIR-2026-10-21.md) records the exact revisions and evidence. PR integration/deployment and cockpit rollout are separate gates.
- [x] Reconcile current operating docs with the verified implementation and record the combined checks. Follow the rollout gates below before enabling D1/cockpit.
- [ ] Before D1 ingestion (now tracked above as the privacy decisions and storage alert activation): approve disclosure, retention/deletion policy and tested procedure, storage-failure alerting and lead reconciliation/recovery. Owner emails can succeed when D1 storage fails, so the cockpit is not guaranteed complete. Detailed gates and ownership are in the repair record.
- [x] Prepare the smallest useful agency workflow under the subsequent autonomous-work instruction: enquiry capture/list, contact/status, manual booked/outcome recording, telephone/WhatsApp capture and missing-enquiry recovery. Reviewable draft: [PR #62](https://github.com/lefteyep/beautyfacelift/pull/62); no go-live approval follows from this preparation.
- [x] Authentication provider selected by user (21 October; superseded on 2026-10-30 by the one-time PIN by e-mail): existing Cloudflare account login through Access, replacing the email-PIN recommendation. [Exact setup/readiness](COCKPIT-ACCESS-READINESS.md) updated; existing JWT/allow-list guard retained.
- [x] Complete account-holder Free enrollment after the user's approval; independently confirm Zero Trust Free ($0/month), team domain `mediapaulo.cloudflareaccess.com` and existing account/app/provider state. No payment details copied.
- [x] Record the user's concrete Access decision (21 October; superseded on 2026-10-30 when the Access application was created): **«Nur als Entwurf behalten»**. Preserve the member-restricted Cloudflare provider and exact agency/1h application-policy proposal in [the readiness document](COCKPIT-ACCESS-READINESS.md); no Cloudflare object saved or live login test run. Do not repeatedly request activation; resume only if the user changes this decision.
- [x] Reconcile the entry-point/runbook/index/setup documents with the selected login, completed Free enrollment and draft-only decisions. Replace the old potentially outbound cron recipe with existing stubbed checks/preview. Independent data-procedure review confirms field/recovery/erasure/mail separation; clarify exact-ID detail lookup because contact search does not search UUIDs. No application change or live operation required.
- [x] Verify public provider facts for the disclosure review from current official Cloudflare/Resend sources: public DPA parties/transfer references, D1 location-hint versus jurisdiction, and Resend Ireland dispatch versus US storage. [Recorded evidence and remaining account-specific documents](LEAD-DATA-DISCLOSURE-DRAFT.md#public-provider-facts-verified-on-21-october-2026); no contracts accepted, locations changed or retention period adopted. The user reaffirmed that Access and the storage alarm remain drafts.
- [x] Actual Access setup: the application was created on 2026-10-30 (one-time PIN by e-mail, 2-week session, agency-only policy); anonymous `/admin/` and `/admin/leads/` answer 302 to the Access login on production. No separate password service or membership invitation.
- [ ] Preserve the campaign gate: cockpit Phase 1 first (deployed 2026-10-30), then Treatwell CHF 170 service, old-site shutdown/301 redirect, revised start/end date and approved funnel verification. Standard `Lead` remains the optimisation event; custom conversion is report-only.
- [ ] Keep customer emails off and reminders off (agency-only once activated); no Teresa cockpit links/test emails. Hold Phase 2 automation and legacy Supabase restore/delete.

The dated October records and unresolved client/content tasks below remain useful history/backlog. This section and the repair checklist supersede their earlier rollout order. The complete pre-repair TODO is [archived](../archive/reviews/2026-10-21-pre-repair/TODO.md).

## Next work packages — local coordination

The user now requests autonomous technical completion by the local coordinator and permits native agents/sessions as needed. Root coordinates evidence and integration; editing agents use separate worktrees with fresh briefs. [The pilot record](COCKPIT-PILOT-2026-10-21.md) tracks the active packages. No relay/heartbeat or old chats are needed. Recommendations do not authorize production activation, payment/terms, client exposure or campaign writes.

| Order / session | Owner and scope | Required outcome / dependency |
| --- | --- | --- |
| 1 — Minimum cockpit workflow | Root integrates native manual-entry agent | Implemented and verified with synthetic desktop/mobile browser workflows in draft #62. Initial reminders/customer mail off; no imports/newsletters/parsing/Phase 2. Teresa access remains later. |
| 2 — Data readiness before D1 | Root integrates native data agent; user/data owner approves policy | Approved isolated Cloud-D1 Time Travel and full SQL-export/import independently verified: both targets 8/8 and complete expected data/schema match. Both DBs retained; CLI import-response failure documented, no repeated import. Remaining: approved purpose/retention/roles, real-data operations/rollout and independently monitored alerts; user keeps the alert as a draft. |
| 3 — Authentication setup | Done 2026-10-30 | Access application "Beauty Face Lift – Agenturcockpit" created; login one-time PIN by e-mail, session 2 weeks, agency-only (user decision 2026-10-30). The 21 October draft-only decision (member-restricted Cloudflare provider, 1h policy) is superseded. |
| 4 — Agency-only integration and pilot | Root | Combined candidate in #62; full local gate at `e842d192` and continuation CI at `353e6d7` passed. [Operations readiness](COCKPIT-OPERATIONS-READINESS-2026-10-21.md) records actual D1/account state, the saved inactive alert proposal and the isolated recovery/export/import evidence. Merged as `e2e53d7` on 2026-10-30; GitHub marked #55 and #56 as merged, #57 is superseded and closed separately. |
| 5 — Controlled cockpit rollout | Done 2026-10-30 | Merged and deployed (deploy run 40996067370, migration `0001_leads.sql`, Worker version `01404b09-3727-4a67-81e8-ef592093e609`). Next: capture on (config PR `codex/leads-capture-on`), labelled test enquiry, reminders activation; Teresa access only after successful testing. No automatic customer-email activation. |
| 6 — Campaign readiness and launch decision | User owns commercial dates/Treatwell and domain activation; root verifies | [Public evidence](CAMPAIGN-READINESS-2026-10-21.md): Treatwell combo is CHF 200/90 min, old homepage stays HTTP 200, live offer ends 14 November while paused schedule says 13 November. Resolve those and the cockpit gate before a separately approved launch. |
| Later — Content/SEO and backlog | Dedicated sessions from the backlog | Verified reviews/claims, profile links and remaining indexing tasks, ordered after the operational gates. Legacy Supabase restore/delete and Phase 2 stay separate decisions. |

GitHub reports `master` as unprotected at this review. The new workflow blocks deployment when validation fails; making `validate` a required merge check is a separate repository-administration hardening task, not an assertion that protection already exists.

## Completed October work (historical agency record)
- [x] **Cloudflare Turnstile hostname, fixed 2026-10-09.** The `/kontakt/` widget (site key `0x4AAAAAADJrGrDTfF7fQrgC`, "beautyfacelift-contact-production") only allowed `beautyfacelift.ch`, `www.beautyfacelift.ch` and the workers.dev host. On the live domain it returned error 110200 ("Verbinden zur Website nicht möglich"), so the Worker rejected every `/kontakt/` enquiry since the domain launch.
  - **Fix:** `beautyfacelift-zuerich.ch` and `www.beautyfacelift-zuerich.ch` were added under Turnstile → widget → Hostname Management. In a normal Chrome the widget now passes on its own ("Erfolg!").
  - [x] **Test enquiry, 2026-10-10:** the form showed "Erfolg!", the Worker accepted the enquiry, and the email arrived with the chosen treatment.
- [x] **Where enquiries land, switched on 2026-10-10:**
  - **Sender:** `anfragen@beautyfacelift-zuerich.ch`. The domain is verified in Resend.
  - **Recipients:** Teresa (`info@beautyfacelift.ch`) receives the enquiries. The agency gets a blind copy through `CONTACT_BCC_EMAIL` (`mediapaulo@gmail.com`, PR #44), so "Reply all" never shows the agency address.
  - **Before:** every enquiry went only to the agency, from Resend's test sender `onboarding@resend.dev`.
  - **Tests:** two labelled test enquiries arrived.
- [x] Combo ad form `/lp/aquafacial-microneedling/` fixed on 2026-10-07. Since 2026-05-26 every submission had been rejected for two reasons:
  - its hidden topic was not an allowed contact topic;
  - the Worker required Turnstile, but the page has no widget.

  It now sends topic "Ich möchte einen Termin buchen" and the Turnstile-exempt campaign `aquafacial_microneedling`. `qa:contact` checks both for every ad form.
- [x] Lead delivery hardening, 2026-10-09 (PR #34, from the site audit's form-contract findings):
  - **`/kontakt/` "Egal, was am schnellsten ist":** the Worker rejected this contact option. It now takes the list from `shared/site.ts`, and `qa:contact` guards it.
  - **Turnstile outage:** a failing siteverify call now returns a clean 503 instead of crashing the Worker. An API safety net catches any other error.
  - **Error messages:** they now scroll into view and take focus on `/kontakt/` and `/lp/aquafacial/`. `/kontakt/` also gets a fresh Turnstile token after an error.
  - **Combo form:**
    - client checks now match the server's (email, phone);
    - the campaign data reaches the email (offer, UTM, fbclid, page);
    - the skin goal reaches the email;
    - the honeypot is inert and inputs have maxlength.
  - **`/kontakt/`:** inert honeypot and maxlength.
  - **Email:** the time is labelled "Zeitwunsch" (the Aquafacial campaign keeps "Telefonisch erreichbar"), and there is no empty "Terminwunsch" row.
  - **Worker error page:** it is in Atelier Glow style with no overline label, and its back button returns to the form the visitor came from.
  - **`/lp/aquafacial/`:** the date picker blocks past dates.
- [x] Fix the CI `npm audit` gate (0 vulnerabilities) — branch `codex/code-health-2026-10`
- [x] Restore `trackLead` for the Aquafacial + Microneedling LP; hashed email/phone on the Aquafacial CAPI Lead
- [x] Re-openable cookie consent ("Cookie-Einstellungen"), compact mobile banner
- [x] `npm run check` at 0 errors; remove `src/api_backup/`
- [x] ~~Swiss Quiet Luxury redesign~~ — rejected by the client on 2026-10-06 and replaced by "Atelier Glow" (`codex/modern-redesign`)
- [x] Release Atelier Glow as one release — live since 2026-10-07 (PR #25; deploy fixed by PR #26)
- [x] After deploy: Lighthouse mobile on `/` (98/100/100/100) and `/lp/aquafacial/` (98/100/100, noindex)
- [x] Meta check, 2026-10-10 (Events Manager, Pixel `1147246982373946`): 30 Leads in the last 28 days (latest 12 hours before), every event from browser and server, no active diagnostics errors, match quality 6.1/10. Meta suggests sending `fbc` with PageView.
  - **Ads, checked read-only in Ads Manager on 2026-10-10:**
    - All 64 campaigns are inactive, so the new site gets no paid traffic.
    - The Aquafacial campaign had 35 results from 10 to 19 September, 8 from 20 to 30 September, and none in October.
  - **Where the Pixel Leads come from:** mostly the old WordPress site `beautyfacelift.ch`, which fires the same Pixel (PixelYourSite + Contact Form 7).
    - In the 15 days before 2026-10-10, Resend shows no real enquiry from the new site.
    - In the 7 days before, the Cloudflare logs show only bot POSTs to `/api/contact`.
    - Until the old site is redirected or loses the Pixel, filter Leads by URL in Events Manager.
- [x] Combo ad form counted its Lead on submit, even when the server then rejected the enquiry. PR #45 moved the count to `/kontakt/danke/`; since the 2026-10-10 lead-first rebuild the form sends JSON and counts the Lead on the page itself, only after the Worker answered 201 (same `generate_lead` event, so GTM/GA4 are unchanged). Reports that used `/kontakt/danke/` page views as a proxy for combo leads will show zero from now on; event-based counting is unaffected.
- [x] Security smoke repaired (PR #45). It targeted the disabled workers.dev host, expected a CSP part browsers ignore in report-only mode, and sent a contact topic the Worker no longer accepts. See SECURITY.md.
- [x] Aquafacial LP conversion and copy pass — live since 2026-10-07 (PR #27)
- [x] Same pass for the combo, Carbon, Microneedling and Peeling ad pages — live since 2026-10-07 (PR #28)
- [x] `/kontakt/` email shows the chosen treatment (test enquiry 2026-10-10)
- [x] Decide Supabase: decided on 2026-10-10 to keep the legacy booking system for now. See "Legacy booking system (decision)" in Priority 1.
- [x] Contact form: the Worker dropped the chosen treatment (`treatment_interest`) since 2026-06-24; fixed and live on 2026-10-07 (PR #28). `scripts/check-contact-concierge.mjs` now checks the current Worker and runs as `npm run qa:contact`
- [x] Remove merged/abandoned worktrees under `astro-v2-worktrees/` and the old `astro-v2-*` sibling folders — done 2026-10-07 (13 worktrees; uncommitted state kept in local `backup/2026-10-07/*` branches; record in `../_archives/2026-10-07-cleanup/README.md`)
- [ ] Decide on the local `backup/2026-10-07/agent-git-hygiene` branch: unfinished agent-worktree tooling (`scripts/agent-worktree.mjs`, pre-push hook, `build.yml`) from June — finish it in a PR or drop it

- [x] Technical SEO from the site audit (PR #37, 2026-10-09):
  - **Duplicate URLs:** `/path` and `/path/index.html` now 301 to `/path/` (they answered 200), and www takes one hop.
  - **Business schema:** one shared builder (`src/lib/schema.ts`) for the homepage, /kontakt/, /ueber-mich/, /termin/ and every Service provider. It carries the same @id, phone, hours, geo and sameAs everywhere.
  - **robots.txt:** the Disallow lines now also apply to Googlebot, Bingbot and the AI bots.
  - **Hubs:** the H2 is now "<Name> Preise".
  - **FAQ:** the combination answers no longer contradict each other.
  - **llms:** the booking lines are fixed and the Wissen articles are listed.
  - **launch:check:** it now reads the docs from `docs/current/`.
- [x] Visible SEO follow-ups (PR #38, 2026-10-09):
  - **Social share images:** every page now gets a real 1200×630 JPG cropped from its own photo (Teresa's portrait is cropped from the top). Before, one portrait PNG was declared as 1200×630 and previews cut her face off.
  - **Internal links:** the FAQ block of the Aquafacial, Microneedling, ColdPlasma and Fruchtsäure pages and of /behandlungen/vergleich/ has a button to its Wissen article. The map is in `src/pages/blog/_posts.ts`. Both FAQ buttons now carry `data-button-location`.
  - **Soft 404:** `/404/` and `/404.html` answered 200; the Worker now sends 404.
- [x] Structured data and sitemap follow-ups (PR #39, 2026-10-09):
  - **Gesichtsbehandlung hub:** "Was Sie erwartet" has a button to the Hautpflege-Routine article.
  - **Price offers:** the Service schema of the four treatment pages with prices and of the six hubs lists the visible price rows as offers, built from the same arrays as the price list. Exosome shows no price and has no offers.
  - **Article schema:** built once in `BlogPost.astro` from `_posts.ts`. It uses the article's own picture (16:9, 4:3 and 1:1 crops), Teresa with her /ueber-mich/ link, the business as publisher, and one modified date.
  - **Sitemap:** articles carry `lastmod` from their modified date. Other pages have none rather than a guessed one.

## Priority 0: Decisions for Teresa
- [x] Aquafacial LP "statt CHF 180": the user decided on 2026-10-10 to keep the "statt" prices as they are.
- [ ] Treatwell: create a "Aquafacial Aktion – 60 Min. – CHF 99" service so the post-form link opens the advertised offer
- [ ] Treatwell: create the "Aquafacial + Microneedling – 90 Min. – CHF 170" offer. Since the 2026-10-10 lead-first rebuild the combo ad page only links to Treatwell after a request ("Direkt online buchen"); until the offer exists that link shows Treatwell's CHF 200 sale price. The user takes this on (2026-10-10).
- [ ] Confirm the review source and current count (site shows 4,8 / 5 from 248+; LP shows 249) and allow linking to it
- [ ] Keep or replace the "90 Prozent von deinem Selfie" quote (du-voice on a Sie-voice site)
- [ ] Book a half-day studio photo shoot (Teresa at work, hands, products, room) to replace AI-looking stock imagery
- [ ] Old WordPress site `beautyfacelift.ch`: **decided on 2026-10-20 to shut it down before the Meta campaign starts** (the user does this). Recommendation: 301 every old URL to its counterpart on the new domain instead of switching the site off, and update the Google Business Profile link at the same time. The redirect map is live in the Worker (PR #53) and stays inert until the DNS moves; the steps and the after-switch checklist are in [OLD-SITE-SHUTDOWN.md](OLD-SITE-SHUTDOWN.md). It still sends Leads to the same Meta Pixel until then.
- [x] Ad pages, reference prices, decided by the user on 2026-10-10: the "statt" prices stay as they are. Earlier note: "statt CHF 250.–" (combo) and "statt CHF 220.–" / "Sie sparen CHF 51" (Carbon) need the same reference-price proof and an end date as the Aquafacial "statt CHF 180.–" (Swiss price-indication rules). There is also a conflict: the Microneedling page, `/behandlungen/vergleich/` and the Microneedling FAQ list "Carbon Laser + Microneedling" at **CHF 250**, while the Carbon ad page uses CHF 220 as its reference price.
  - Answer from the agency on 2026-10-07: both ad prices are time-limited campaign offers, promoted through the Meta campaigns.
  - Still open: each campaign needs an end date. A "statt" reference price should be the price actually charged before the campaign. If Carbon Laser + Microneedling regularly costs CHF 250, "statt CHF 220" understates the saving, so align one of the two
- [x] Combo enquiry emails (PR #51): the subject is now "Neue Kombi-Anfrage: Aquafacial + Microneedling – Name", so Teresa and the agency can filter the campaign, and the empty "Zeitwunsch: Nicht angegeben" row is gone (the combo form has no time field). Before, the subject only named the topic.
- [ ] Carbon ad page: the three client quotes still carry "TODO: Teresa to supply real testimonials" in the code — confirm they are real, or replace them with verified reviews
- [ ] Combo ad page infographic `aquafacial-microneedling-infografik-zuerich.webp`: it says "Hydrofacial + Microneedling" and "Stimuliert Kollagen" in the image itself. Since 2026-10-10 the page no longer renders it (QA now asserts its absence); the file stays in `src/assets/lp/aquafacial/` until a corrected image exists (no "Hydro/Hydra", cautious claims), or it can be deleted.
- [x] Opening hours aligned with Treatwell (the agency's source of truth) on 2026-10-09 (PR #36): Mo–Fr 10:00–20:00, Sa 10:00–16:00, So geschlossen. The /kontakt/ `openingHoursSpecification` is now built from `OPENING_HOURS`, so they can't drift.
  - **Still to do:** check that the Google Business Profile shows the same hours.
- [ ] Testimonials: the same reviewers are quoted with different wording on different pages.
  - **Daniel:** homepage and ColdPlasma page "Stammkunde seit 2008, immer wieder begeistert." vs. /ueber-mich/ "Seit 2008 bei Teresa, absolute Vertrauenssache …".
  - **Andreas:** homepage "Teresa ist charmant, warm und absolut professionell." vs. /ueber-mich/ a longer text labelled "Verifizierter Kunde".
  - **Next step:** find the verbatim texts on Treatwell/Google (agency task), then keep one `REVIEWS` source used by all pages. Ask Teresa only about quotes that can't be found, together with the permission to quote them.
- [ ] Facts to confirm with Teresa (2026-10-09 audit):
  - Is "LED-Lichttherapie" offered? The Aquafacial page mentions it as an option, but no price row or Treatwell service lists it.
  - The Aquafacial page says only pregnancy-friendly active ingredients are used: confirm, or replace with "please discuss with your gynaecologist first".
  - The interval between Microneedling and Fruchtsäure Peeling:
    - `/behandlungen/vergleich/` says "mindestens 2–4 Wochen Abstand".
    - The Microneedling FAQ says a light peel "einige Tage vorher" can be useful.
  - "Für jedes Alter" (Aquafacial) vs. "Mindestalter 18 Jahre" (llms-full).
  - Which car parks to recommend (Urania, Globus?). The directions now name the Hauptbahnhof and the tram stop Bahnhofstrasse/HB instead of Paradeplatz.
- [x] Massage: Treatwell lists the Klassische Ganzkörpermassage "ab CHF 135", 1 Std. The site row now says so; "CHF 135–1200" was a data error (PR #36).
- [x] Gesichtsbehandlung "45–120 Min." is correct: Treatwell's "Maske Soin Initiale" takes 2 Std. The hub now lists it and "Caviar" (CHF 235, 90 Min.) next to the other classic facials (PR #36).
- [ ] Treatwell comparison, 2026-10-09: every price and duration on the site matches Treatwell. Open points:
  - **Exosome Therapie:** it has its own page and a booking button, but Treatwell has no such service, so the button lands on the general Treatwell page. Add the service on Treatwell, or change the page's CTA to the contact form or WhatsApp.
  - **Not shown on the site:**
    - Treatwell "BDR Stimulationsbehandlung intensiv" (CHF 210, 90 Min.);
    - "Carbon Laser Peeling + Maske" (CHF 200, 60 Min.);
    - "Augenbrauen & Wimpern färben" (CHF 65 / CHF 55 during a facial);
    - "Brauenlifting RefectoCil" (CHF 65).

    Decide whether the treatment pages should list them (they need a short description from Teresa).
  - **Campaign price vs. booking price:** Treatwell shows sale prices "Hydra4Face Basic Intensiv CHF 144 statt 180" and "Hydra4Face + Microneedling CHF 200 statt 250". The ads promise CHF 99 (Aquafacial) and CHF 170 (combo). A visitor who books through Treatwell from the ad sees a different price. Align the Treatwell sale prices with the campaign prices, or create the campaign services (see the CHF 99 item above).
  - **Carbon reference price:** Treatwell confirms "Carbon Laser Peeling + Microneedling" at CHF 250. The Carbon ad's "statt CHF 220" is therefore not the regular price; use CHF 250 or another price Teresa can document.
  - **Combo reference price:** Treatwell confirms "Hydra4Face + Microneedling" at a regular CHF 250, which backs the combo ad's "statt CHF 250".
  - **Reviews:** Treatwell now shows 4.8 from **260** reviews. "248+" on the site is still true; update it with the next ad-page change, since the ad pages pin the string in QA.
  - **Teresa's title:** Treatwell describes her as "dipl. Visagistin & Kosmetikerin". The site states no diploma (the Wissen pass removed "diplomierte Kosmetikerin" as unsourced). If Teresa confirms it, "dipl. Kosmetikerin" could go back on /ueber-mich/.
  - **Naming:** Treatwell's "Hydra4Face …" services *are* the site's Aquafacial treatments. hydra4face is the brand of the device. The site says "Aquafacial" (client rule: no "Hydra"); prices and durations match one to one:
    - Basic Intensiv: 60 Min., CHF 180
    - Anti Aging: 90 Min., CHF 250
    - Gesicht/Hals/Dekolletee: 90 Min., CHF 280
    - + coldPLASMA: 90 Min., CHF 280
    - + Microneedling: 90 Min., CHF 250
- [ ] ColdPlasma page review: the page used to attribute "Stammkundin seit 2008 — Teresa versteht meine Haut …" to Daniel. It now uses the homepage wording "Stammkunde seit 2008, immer wieder begeistert." – Daniel. Confirm the real review text.
- [ ] Peeling flaking: the peeling page says a fine, barely visible flaking starts about 2–5 days after the treatment. The articles and `llms-full.txt` now follow it (they had said "2–3 Tage" and "2–5 Tage Ausfallzeit"); confirm.
- [x] Wissen articles: unverifiable, superlative and medical claims removed or softened.
  - **Facts:** aligned with the treatment pages.
  - **Titles:** 44–54 characters.
  - **Also cleaned:** "Vortex"/"patentiert" removed from the Aquafacial page, the Wissen cards and `llms*.txt`.
  - **Where:** PR #31, 2026-10-07.
- [x] Aquafacial + Microneedling is one 90-minute session (agency answer, 2026-10-07). The articles now say so. The LP price is a time-limited campaign offer (see the reference-price item above).
- [x] Microneedling treatment page: the stated "Nadeltiefe (0,5 bis 2,5 mm)" was confirmed by the agency on 2026-10-07, so it stays.
- [ ] Wissen follow-ups, parked: the agency said on 2026-10-07 the current wording is fine for now. Revisit with Teresa:
  - **Microneedling preparation:**
    - **Conflict:** the article says to avoid AHA/BHA/Fruchtsäure products in the days before. The treatment page says a light Fruchtsäure peel a few days before can be useful. Which is right?
    - **Contraindications:** the articles list more of them than the treatment pages do (Isotretinoin, Stillzeit, Blutverdünner, Autoimmunerkrankungen, Keloide). Add them to the treatment pages, or trim the articles?
  - **Device details missing from the treatment pages:** the Aquafacial "transparenter Auffangbehälter", ColdPlasma "berührungsfrei", and which Microneedling pen is used. Confirm each before an article mentions it again.
  - **Offers to confirm:**
    - Aquafacial packages (the articles now say "auf Anfrage");
    - Microneedling on Hals/Dekolleté and its price;
    - "individuelle Jahrespläne";
    - the quoted recommendation of a skin analysis "alle drei Monate".
  - **Anti-aging comparison table:** it is down to two rows (Ausfallzeit, Empfindliche Haut) because the other rows contradicted the treatment pages. Rebuild it from treatment-page facts if Teresa wants the comparison.
  - **`microneedling-erfahrung`:** its description says "Ehrlicher Erfahrungsbericht", but the studio wrote it. Rename it to "Ratgeber"?

Finished work from March to May 2026, and the items dropped on 2026-10-10, are in [../archive/TODO-history-2026.md](../archive/TODO-history-2026.md).

## Priority 1: Go Live (blocking everything else)
- [x] Google Search Console, 2026-10-10: domain property `beautyfacelift-zuerich.ch` verified by DNS TXT record in Cloudflare (Google login `mediapaulo@gmail.com`), `sitemap.xml` submitted. Google had not fetched it yet on the day of submission.
  - **2026-10-20:** sitemap read on 2026-10-17 (25 URLs). First 10 days: 193 impressions, 2 clicks, average position 16.7. 7 pages indexed, 18 "Gefunden – zurzeit nicht indexiert" (every treatment page and `/behandlungen/`): Google knows them but has not crawled them, normal for a new domain with few links. Indexing was requested by hand for `/behandlungen/`, Aquafacial, Microneedling, Gesichtsbehandlung, ColdPlasma, Fruchtsäure-Peeling, Vergleich and Exosome (Laser-Haarentfernung and Waxing were already indexed). Still to request on a later day (quota about 10 per day): Make-up, Massage, Wimpern & Brauen, the five Wissen articles. Top queries so far: hair removal, waxing and brow lifting, not Aquafacial; "Brauenlifting" has no page (Treatwell lists it at CHF 65).
- [ ] Google Business Profile: the profile "Beauty Face Lift" (4,2 from 46 Google reviews) exists, but another Google account manages it, most likely Teresa's. Its website link still points to the old `beautyfacelift.ch`. Teresa should add `mediapaulo@gmail.com` as a manager, or change the website to `https://beautyfacelift-zuerich.ch/` herself. The user takes this on (2026-10-10).
- [ ] **Legacy booking system (decision):** the first-party booking widget, the admin page, `/api/services|slots|availability|bookings` and the Supabase project `izekwngqjllaqibrwotp` have been dead since 2026-10-06 (NXDOMAIN). Bookings run on Treatwell.
  - **Decided (user, 2026-10-10):** keep it for now.
    - Nobody has the admin login, and the login cannot work anyway: the Supabase project no longer resolves.
    - The local backup folder `_archives/supabase-backup-2026-05-05` is empty.
    - To check the data first, log in at supabase.com with the account that created the project, to see whether it was paused or deleted. Removal stays the recommendation.
  - After removal, delete:
    - the Worker secrets `SUPABASE_SERVICE_ROLE_KEY` and `PUBLIC_SUPABASE_ANON_KEY`;
    - the GitHub variable `PUBLIC_SUPABASE_URL` and the GitHub secret `PUBLIC_SUPABASE_ANON_KEY`;
    - the Supabase project.
  - If the system is kept instead, rotate the `service_role` key and replace the admin credentials (see SECURITY.md).
- [x] Prices and durations match Treatwell (PR #36, 2026-10-09)

## Priority 2: Tracking & Analytics (before running ads)
- [x] GTM container `GTM-NVC9QKGS` and GA4 property `G-4C9M8KMFQY`, created 2026-10-10. The GitHub variable `PUBLIC_GTM_ID` is set. Setup and open items are in [tracking/GOOGLE-ANALYTICS-GTM.md](tracking/GOOGLE-ANALYTICS-GTM.md). Server-side GA4 (`GA4_API_SECRET`) stays off on purpose.
- [x] Meta Pixel and CAPI live (see the Meta check above)
- [x] **Meta CAPI rejected every event from an ad visit (PR #51).** Found on 2026-10-20 in the launch test for the combo campaign: the page attaches the attribution keys (`utm_*`, `fbclid`, …) to every event, but the Worker's allow-list for `/api/track` did not contain them and rejected the whole event with 400 "Invalid event_data". Both lists date from 2026-05-08, so since then only visits without ad parameters reached the Conversions API; ad clicks (the September campaign included) had browser events only, and the server `Lead` for ad visits never arrived. The two lists are now one file, `shared/tracking.ts`, and `qa:marketing` guards it. Re-run the Events Manager test (campaign plan, section 3.1) after the deploy.
- [ ] GA4 key events: events arrive (11 types in the first 10 days, including the first real combo lead). `generate_lead` was marked as a key event on 2026-10-20. Still to mark once they fire: `aquafacial_lead_submit`, `treatwell_outbound_click`, `booking_button_click`, `whatsapp_click`, `phone_click`. Google signals has been on since 2026-10-10.
- [ ] Meta campaign "BFL | Lead | Kombi Aquafacial+Microneedling CHF 170 | 2026-10" (1 ad set `p_zh15km_adv`; 3 `_v1` Facebook-only ads that stay paused, and since 2026-10-19 3 `_v2` Facebook + Instagram ads, see PR #52) was built on 2026-10-11 and is paused. The launch gates are in the campaign plan (PR #49, section 3.0); the offer on the page ends 14 November 2026.
  - **Done on 2026-10-20:** custom conversion "BFL – Lead – Kombi LP" (ID 1596786311924725: Lead, URL contains `/lp/aquafacial-microneedling/`, value 170) created in Events Manager; the ads carry the UTM convention inside the link URL (per-ad `utm_content`, `{{placement}}`, `{{campaign.id}}`); the domain is verified in Business Manager; the lead sheet is at `../output/leads/Kombi-Leads-2026-Q4.xlsx` (outside the repo, to share with Teresa).
  - **Decided (user, 2026-10-20):** the ad set keeps the standard Lead as its optimisation event; the custom conversion is a report column only. The old website `beautyfacelift.ch` will be shut down before the campaign starts, so its Lead events (19 in the four weeks to 2026-10-19, latest 14 October, versus 9 test leads on the new site) stop by themselves. When it is shut down, redirect it (301) to the new domain rather than switching it off, so its Google rankings and links carry over.
  - **Events Manager test done on 2026-10-20** (after PR #51 went live): ad-style visit with `test_event_code`, consent accepted, scroll and time events, one labelled test enquiry ("TEST Agentur bitte ignorieren"). Every server event answered 200 (PageView, LandingPageView, ViewContent, Scroll50, TimeOnPage30s, HighIntentVisit, Lead); the enquiry e-mail went out to Teresa with the agency in blind copy.
  - **Still open:** the Treatwell CHF 170 service; the start date (the ad set is scheduled 15 October to 13 November, so the start must be moved when it is switched on).
- [x] GTM version 3 (published 2026-10-10) forwards the `/kontakt/` form funnel to GA4: `contact_form_start`, `contact_form_submit_success`, `contact_form_submit_error`. GA4 has matching custom dimensions for topic, treatment interest and error type.
- [ ] Verify Treatwell outbound-click reporting before launch. Optimisation stays on standard `Lead`; an outbound click is not a confirmed booking.
- [ ] Submit sitemap to Bing Webmaster Tools

## Priority 3: Email
- [x] Resend sends the form emails. `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` and `TURNSTILE_SECRET_KEY` are Worker secrets, and the test enquiry on 2026-10-10 arrived. The branded sender and Teresa as recipient have been live since 2026-10-10, see "Where enquiries land" at the top.

## Priority 5: Backlinks & Off-Page SEO
- [ ] Submit to local.ch, search.ch, Swiss Yellow Pages
- [ ] Ensure Treatwell profile links to beautyfacelift-zuerich.ch
- [ ] Submit to Zürich business directories
- [ ] Google Merchant Center — add services with pricing
- [ ] Request backlinks from beauty/wellness bloggers

## Priority 6: Ongoing Content
- [ ] Write 2 blog articles per month targeting long-tail keywords:
  - "Gesichtsbehandlung Zürich Erfahrung"
  - "Aquafacial Kosten Schweiz"
  - "Microneedling Aknenarben Zürich"
  - "Kosmetikerin Zürich Bahnhofstrasse"
  - "ColdPlasma Behandlung Erfahrung"
- [ ] Add verified reviews/testimonials only when permission and source are available
- [x] Run Lighthouse audit and fix any issues below 95. Results of the 2026-10-07 mobile run on 16 live page types:
  - **13 page types:** 97–100 in every category.
  - **Ad pages:** SEO 69, because they are noindex on purpose.
  - **`/termin/`:** it redirects to Treatwell, so Lighthouse measures Treatwell's page.
  - **`/kontakt/`:** performance 79 and best practices 92. The causes were the auto-loading Google Maps embed (17 requests, about 470 KB) and the Turnstile error. Now fixed:
    - the map loads only on click (PR #33);
    - the CSP allows the map frame (PR #32);
    - the Turnstile hostname was fixed on 2026-10-09 (see the top of this file).
  - **Static SEO audit of all 36 pages:** only one title over 60 characters and three descriptions over 160; all four are fixed in PR #33.

## Priority 7: Future Features
- [ ] Multi-language support (English version)
- [x] Decide whether to delete `src/api_backup/**` after confirming git history is sufficient as the archive. — Deleted 2026-10-06 (git history keeps it).
- [ ] Legacy BookingWidget: covered by the "Legacy booking system (decision)" item in Priority 1.
- [x] ~~Design elevation: Phases 2-7~~ — Replaced by pixel-perfect .pen design implementation (March 19, 2026)
