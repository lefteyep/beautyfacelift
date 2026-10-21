# Project Status — beautyfacelift-zuerich.ch

**Last updated:** 21 October 2026

This file is the current status source of truth. Historical implementation notes live under `docs/archive/`.

Current production launch history is in [DOMAIN-LAUNCH.md](DOMAIN-LAUNCH.md). The user subsequently decided to shut down/301-redirect `beautyfacelift.ch` before the campaign; use [OLD-SITE-SHUTDOWN.md](OLD-SITE-SHUTDOWN.md) and preserve email records. Its Worker redirect map is inert until the approved DNS/routing change.

Latest release notes: [RELEASE-2026-05-08-live-update.md](../archive/releases/RELEASE-2026-05-08-live-update.md) and [SEO-SERVICE-HUBS-2026-05-08.md](../archive/releases/SEO-SERVICE-HUBS-2026-05-08.md). Delivery details are in [DELIVERY-2026-05-08.md](../archive/releases/DELIVERY-2026-05-08.md).

## Current milestone — review repairs

**Operating-readiness continuation:** [PR #62](https://github.com/lefteyep/beautyfacelift/pull/62), checkpoint `353e6d7`, passed [CI](https://github.com/lefteyep/beautyfacelift/actions/runs/39645495335). The [current operations record](COCKPIT-OPERATIONS-READINESS-2026-10-21.md) documents the expressly approved synthetic Cloud-D1 Time-Travel drill and full SQL-export/import proof. Both test databases pass 8/8 and match the complete expected schema/data after recovery/import; they remain preserved. The import workflow stopped on an ambiguous CLI response, so it is recorded as failed; the subsequent independent read-only full comparison confirmed the import without repeating it. The user chose to retain the storage alert as a draft: no activation or test notification. No production migration/deploy or policy/provider activation follows from this continuation.

**Current checkpoint after the approved merges:** production is `d019a003` (#59/#60 deployed successfully); #61 is merged only into unreleased `codex/leads-mails-phase1` at `365f6fea`. The new local `codex/cockpit-pilot` candidate integrates current production and prepares the minimum agency workflow, safe feature gates and data-readiness evidence. See [COCKPIT-PILOT-2026-10-21.md](COCKPIT-PILOT-2026-10-21.md) for the current work record and remaining activation gates. Earlier reviewed-source statements below describe the original repair baseline.

**IMPLEMENTED AND LOCALLY VERIFIED ACROSS REPAIR BRANCHES:** [REPAIR-2026-10-21.md](REPAIR-2026-10-21.md) tracks R1–R11, validation and deferred blockers. The record identifies the tested code revisions, full local checks and browser evidence. PR review/CI and deployment verification remain separate; this status does not claim that the repairs are live.

- **Production source reviewed:** `35af1f01877ecbd629376c30a1e2254dacfb49d0` (PR #58 handover; GitHub deployment reported success). The application changes through #54 are deployed; #58 added handover docs and test tooling.
- **Cockpit:** #55 → #56 → #57 are open, stacked and not release-ready. PR #61 repairs the reviewed defects on the unreleased stack; pre-D1 data-handling and authentication gates remain open. Earlier “all gates green” statements were historical manual results.
- **Authentication:** the user selected existing Cloudflare account login and subsequently approved/completed the Free-plan checkout on 21 October. The dashboard confirms Zero Trust Free ($0/month) and team domain `mediapaulo.cloudflareaccess.com`. The user then explicitly chose **draft only** for the concrete cockpit Access setup. [Setup/readiness](COCKPIT-ACCESS-READINESS.md) preserves the new member-restricted Cloudflare provider/exact agency policy proposal; no provider, policy or application was saved and no live login test was run. Existing PIN provider/shared settings preserved. Actual authentication and production rollout remain gates; no separate password service was built.
- **Campaign:** remains paused and still waits for cockpit Phase 1 by the user's decision. Optimisation stays on standard `Lead`; the URL-filtered custom conversion is reporting only. Old-site redirect, Treatwell CHF 170 service and revised dates remain external gates.
- **Guardrails:** customer emails stay off, reminders stay agency-only, Teresa receives no cockpit exposure or test mail. Phase 2 automation is held.

## Deployment

| Environment | URL | Status |
|------------|-----|--------|
| Production | https://beautyfacelift-zuerich.ch | Live on Cloudflare Workers custom domain |
| Production www | https://www.beautyfacelift-zuerich.ch | 301 redirects to apex |
| Temporary Worker | beautyfacelift.mediapaulo.workers.dev | Not canonical; `workers_dev=false`, live check returned 404 |
| GitHub | https://github.com/lefteyep/beautyfacelift | Private repo |
| Supabase | https://izekwngqjllaqibrwotp.supabase.co | Unreachable (NXDOMAIN) since 2026-10-06 — see Infrastructure Notes |

Historical May launch details (not the current deployed Worker version):

- Worker: `beautyfacelift`
- Worker version: `f376e963-48cf-4708-9130-650ed6e48b4b`
- Latest SEO service hub deployment: `e1df2f1a-197f-4b8d-934b-86b5b2bf00c6`
- Nameservers: `ezra.ns.cloudflare.com`, `ryleigh.ns.cloudflare.com`
- Apex live check: `200 OK`
- `www` live check: `301 Moved Permanently` to `https://beautyfacelift-zuerich.ch/`
- Old domain at the May launch: untouched; the October shutdown/redirect decision supersedes that historical constraint

## Deployed October release record

| What | Where | State |
|------|-------|-------|
| "Atelier Glow" redesign + October code health (see [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)) | PR #25, merge `1535d32` | Live |
| Deploy fix: top-level `sharp` override so npm 10 (CI) accepts the lockfile | PR #26, merge `1ec6b0b` | Live (deploy run 37549633593) |
| Aquafacial LP conversion and copy pass | PR #27, merge `5e34494` | Live |
| Same pass for the other ad pages, plus the contact-form fix | PR #28, merge `bbdc22c` | Live (deploy run 37602640573) |
| Wissen articles claims pass, `qa:simple-lps`, worktree clean-up note | PR #31 | Live |
| Combo ad form fix (topic + Turnstile exemption) | PR #32, merge `5516b12` | Live (deploy run 37647740706) |
| `/kontakt/` click-to-load map, SEO snippet trims, lead delivery hardening | PR #33 + #34, merge `356824b` | Live 2026-10-09 (deploy run 37980686988); `/kontakt/` mobile Lighthouse performance 79 → 95 |
| Copy fixes from the site audit (directions, aftercare facts, claims, naming, llms-full) | PR #35, merge `09d918f` | Live 2026-10-09 (deploy run 37982303967) |
| Treatwell alignment: opening hours, massage price, Caviar + Maske Soin Initiale, Aquafacial + Microneedling row | PR #36, merge `e193b15` | Live 2026-10-09 (deploy run 37990053747) |
| Technical SEO: one URL per page (301 for /path and /index.html), one business schema for all pages, robots.txt groups, hub H2s, FAQ combination answers, llms | PR #37, merge `6425f73` | Live 2026-10-09 (deploy run 37991328990) |
| Social share images cropped to 1200×630 per page, Wissen buttons in the treatment FAQs, a real 404 status for /404/ and /404.html | PR #38, merge `7c2dc42` | Live 2026-10-09 (deploy run 37994226911) |
| `/kontakt/` Turnstile hostname (Cloudflare dashboard, no code): live domain added to the widget | — | Fixed 2026-10-09; test enquiry arrived 2026-10-10 |
| Price offers in the Service schema, one Article schema builder, sitemap `lastmod` for articles, Hautpflege button on the Gesichtsbehandlung hub | PR #39, merge `b874fcb` | Live 2026-10-10 (deploy run 37996520012) |
| Google Search Console (domain verified by DNS, sitemap submitted) and contact-form test enquiry (accounts, no code) | — | Done 2026-10-10 |
| Google Tag Manager `GTM-NVC9QKGS` + GA4 `G-4C9M8KMFQY`, Consent Mode v2, consent-gated (see [tracking/GOOGLE-ANALYTICS-GTM.md](tracking/GOOGLE-ANALYTICS-GTM.md)) | PR #40, merge `9e27f9c` | Live 2026-10-10 (deploy run 38003841259) |
| Docs clean-up; privacy policy says bookings run on Treatwell and discloses Google signals | PR #41, merge `171d30c` | Live 2026-10-10 (deploy run 38003958605) |
| Keyboard fixes (menu, mobile contact bar), CSS inlined, font preloads, email link labels | PR #42, merge `6c5043e` | Live 2026-10-10 (deploy run 38004062741) |
| Enquiry email blind copies (`CONTACT_BCC_EMAIL`) and the 2026-10-10 decisions in TODO | PR #44, merge `94cd393` | Live 2026-10-10 (deploy run 38005397603) |
| Enquiry emails from `anfragen@beautyfacelift-zuerich.ch` (verified in Resend) to Teresa, blind copy to the agency (Worker secrets, no code) | — | Done 2026-10-10, two test enquiries arrived |
| Combo ad form counts its Lead only after the server accepted it; `/kontakt/` funnel in GTM version 3; security smoke repaired | PR #45, merge `0166e93` | Live 2026-10-10 (deploy run 38046685413) |
| Aquafacial ad pages: conversion, design and copy pass, both ad pages lead-first | PR #46, merge `019ee66` | Live 2026-10-10 (deploy run 38096543229) |
| Aquafacial ad page imagery: one consistent studio series | PR #47, merge `bbf39f7` | Live 2026-10-11 (deploy run 38101336994) |
| Aquafacial photography: varied Teresa reference series | PR #48, merge `7cf1f22` | Live 2026-10-11 (deploy run 38105742715) |
| Combo ad page: offer end date "bis 14. November 2026", public Meta ad images | PR #50, merge `d4b38c7` | Live 2026-10-13 (deploy run 38449659203) |
| Meta campaign plan for the combo offer (docs only, see [META-CAMPAIGN-AQUAFACIAL-MICRONEEDLING.md](META-CAMPAIGN-AQUAFACIAL-MICRONEEDLING.md) ) | PR #49, merge `bdafe42` | Live 2026-10-20 (docs and ad design files) |
| Meta CAPI: the Worker accepted no event that carried the ad-visit keys (`utm_*`, `fbclid`), so ad traffic had browser events only since 2026-05-08; one shared key list now. Also: combo enquiry email subject and empty "Zeitwunsch" row (CR-3), weekly security smoke, docs refresh | PR #51, merge `d5bef5e` | Live 2026-10-20 (deploy run 39342697963); live test the same day: every server event from an ad-style visit, Lead included, answers 200 |
| Old site `beautyfacelift.ch`: redirect map in the Worker (inert until the DNS moves) and the shutdown plan, see [OLD-SITE-SHUTDOWN.md](OLD-SITE-SHUTDOWN.md) | PR #53, merge `bc69bd0` | Live 2026-10-20 (deploy run 39342902482) |
| Meta campaign start-ready status, Instagram-enabled `_v2` ads (docs only, other session) | PR #52 | Draft, not merged |
| Codex handover, plan copy and test tooling | PR #58, merge `35af1f0` | Deployment reported success on 2026-10-21; cockpit code is still unmerged |
| Release validation and operating guidance | PR #59, merge `a87b1f7` | Live; deploy run 39538508554 passed |
| Public tracking, image metadata/lazy loading and mobile navigation repairs | PR #60, merge `d019a003` | Live; deploy run 39538764913 passed; active Worker version 30970e05 confirmed |
| Cockpit email atomicity/idempotency and uncertain delivery | PR #61, merge `365f6fea` into cockpit branch only | Unreleased; CI run 39539049665 passed |

The release covers:
- **Navigation and core pages:** new navigation with a two-column treatments menu, plus the new homepage and `/behandlungen/` overview.
- **Site-wide clean-up:** no overlines or italics, and "Wissen" instead of "Journal".
- **Page groups:** service hubs, treatment pages and comparison, About/Kontakt/FAQ/utility pages, the Wissen section, and the redesigned ad landing pages.
- **October code health:** restored LP lead tracking, hashed CAPI data, re-openable consent and 0 audit findings.
- **Ad pages (#27, #28):**
  - All five `/lp/*` pages now follow one standard: shorter section flow, conversion copy, the rating line "4,8 aus 248+ Bewertungen" under the hero CTAs, and the shared ad components (OfferBox, TrustStrip, TestimonialStrip, StickyOfferBar, WhatsAppButton).
  - The legal strip is in sentence case.
  - Offers, prices, form fields and tracking hooks are unchanged.
- **Contact form (#28):** the Worker dropped the chosen treatment (`treatment_interest`) from `/kontakt/` enquiries from 2026-06-24 until this release. `npm run qa:contact` now guards every posted field.
- **Wissen articles (#31):**
  - Unverifiable, superlative and medical claims were removed from the five articles, the Aquafacial page step, the Wissen cards and `llms*.txt`.
  - Facts now match the treatment pages, and titles are 60 characters or fewer.
  - The article schema logo now points to `/assets/logo.png`.

The first deploy of PR #25 failed at `npm ci`, so production stayed on the previous version until PR #26.

Live checks on 2026-10-07:
- All main routes, the LPs, `sitemap.xml` and `robots.txt` return 200; `www` returns 301.
- Lighthouse mobile scores:
  - `/`: 98 / 100 / 100 / 100 (performance / accessibility / best practices / SEO; LCP 2.1 s, CLS 0).
  - `/lp/aquafacial/`: 98 / 100 / 100, LCP 2.3 s. Its SEO score is 69 because the page is noindex on purpose.
- After PR #28:
  - All 30 sitemap and `/lp/*` URLs return 200.
  - Their live HTML matches the tested build except for two values CI injects at build time: the Meta Pixel ID and, on `/kontakt/`, the Turnstile site key.

## Pending Release

The review repair milestone is implemented and locally verified across isolated `codex/*` branches. PRs #55–#57 remain unreleased. The pre-D1 checklist and deferred business decisions still block cockpit release. Production changes require a reviewed PR and explicit merge/deploy approval (see `AGENTS.md`).

## Infrastructure Notes (2026-10-06)

- Supabase project `izekwngqjllaqibrwotp` did not resolve (NXDOMAIN) on 2026-10-06, so `/api/services` returns 500 and the admin dashboard / legacy booking widget are unusable. The contact form (Resend) and `/api/track` (Meta CAPI) do not depend on Supabase. The user decided on 2026-10-10 to keep the legacy code for now. It is not needed by the proposed D1 lead tracker; restoration or retirement is a separate decision.
- Meta Pixel ID is present in the production build (`PUBLIC_META_PIXEL_ID` GitHub Actions variable). A labelled ad-style live test on 2026-10-20 accepted the server events, including Lead. That dated test is not a claim of continuous monitoring; repeat approved checks after relevant releases.
- The old WordPress site on `beautyfacelift.ch` is still live and indexed separately.

## Current Key Routes

### Main Pages
All main pages use the "Atelier Glow" system (October 2026). There are no overlines, no italics and no facts asides; each hero has one lead sentence. Counts below are FAQPage JSON-LD questions.

| Page | URL | Status |
|------|-----|--------|
| Homepage | / | Hero with proof line, treatments bento, Teresa, beauty services with starting prices, first-visit steps, reviews, 6 FAQs |
| Treatment overview | /behandlungen/ | Image cards for facial treatments, price rows for beauty services, guide, 4 FAQs, ItemList schema |
| Gesichtsbehandlung Zürich | /behandlungen/gesichtsbehandlung-zuerich/ | Service hub (ServiceHubPage) with a photo hero, price rows, a "Was Sie erwartet" spec list and Service schema |
| Aquafacial | /behandlungen/aquafacial-zuerich/ | Treatment page: hero with price/duration, benefits, price rows, steps, suitability, review, 7 FAQs, booking panel, related treatments |
| Microneedling | /behandlungen/microneedling-zuerich/ | Same treatment-page structure, 8 FAQs |
| Fruchtsäure Peeling | /behandlungen/fruchtsaeure-peeling-zuerich/ | Same treatment-page structure, 8 FAQs |
| ColdPlasma | /behandlungen/coldplasma-zuerich/ | Same treatment-page structure, 7 FAQs |
| Exosome Therapie | /behandlungen/exosome-therapie-zuerich/ | Same treatment-page structure with cautious wording, 9 FAQs |
| Treatment comparison | /behandlungen/vergleich/ | Hairline table on desktop, stacked cards below 1000 px, 5 FAQs |
| Laser-Haarentfernung Zürich | /behandlungen/laser-haarentfernung-zuerich/ | Service hub with a typographic hero, price rows and spec list |
| Waxing Zürich | /behandlungen/waxing-zuerich/ | Service hub with a typographic hero, price rows and spec list |
| Wimpern & Brauen Zürich | /behandlungen/wimpern-brauen-zuerich/ | Service hub with a typographic hero, price rows and spec list |
| Make-up Zürich | /behandlungen/make-up-zuerich/ | Service hub with a typographic hero, price rows and spec list |
| Massage Zürich Bahnhofstrasse | /behandlungen/massage-zuerich-bahnhofstrasse/ | Service hub with a typographic hero, price rows and spec list |
| About | /ueber-mich/ | Portrait hero, story with stats, four principles, three reviews, studio CTA, Person schema |
| Kontakt | /kontakt/ | Contact tiles; enquiry form with an unchanged field/Turnstile/tracking contract; location and hours; 6 FAQs |
| Booking | /termin/ | Noindex Treatwell forwarding bridge with attribution handoff (IDs and script unchanged) |
| Booking confirmation | /buchung-bestaetigt/ | Legacy first-party booking confirmation; not the active Treatwell conversion source |
| FAQ hub | /haeufige-fragen/ | 20 FAQs in 4 groups with a sticky topic index |
| Impressum | /impressum/ | Layout refresh only; legal text unchanged |
| Datenschutz | /datenschutz/ | Layout refresh with a sticky table of contents; legal text unchanged |
| 404 | /404 | Short page with four next-step links |
| Admin | /admin/ | Noindex |

### Wissen (blog, 5 articles; URL stays /blog/)
| Article | URL | Notes |
|---------|-----|-------|
| Wissen index | /blog/ | Feature card, article rows, consultation panel, CollectionPage schema |
| Aquafacial vs. Microneedling | /blog/aquafacial-vs-microneedling/ | 2000+ words; contents list, mid-article CTA, 5 FAQs |
| Hautpflege-Routine Zürich | /blog/hautpflege-routine-zuerich/ | 2000+ words; contents list, mid-article CTA, 5 FAQs |
| Was ist Aquafacial? | /blog/was-ist-aquafacial/ | 2000+ words; contents list, mid-article CTA, 5 FAQs |
| Microneedling Erfahrung | /blog/microneedling-erfahrung/ | 2000+ words; contents list, mid-article CTA, 5 FAQs |
| Anti-Aging Behandlungen Zürich | /blog/anti-aging-behandlungen-zuerich/ | 2000+ words; contents list, mid-article CTA, 5 FAQs |

Article copy was reviewed for claims on 2026-10-07 (PR #31):
- **Claims:** unverifiable, superlative and medical claims were removed or softened.
- **Facts:** prices, durations, sessions and downtime now match the treatment pages.
- **Titles:** all are 60 characters or fewer.
- **Open questions:** listed under "Wissen follow-ups" in [TODO.md](TODO.md).

### Ad Landing Pages (noindex)
All five pages share the Atelier Glow ad-page standard (PR #27, #28). The Aquafacial, combo and Carbon pages are locked by their `qa:*-lp` scripts. The Microneedling and Peeling pages are locked by `npm run qa:simple-lps`, which checks:
- the booking link and analytics hooks;
- the 4,8 rating line;
- "Sie" voice;
- design tokens only, with no italics or uppercase.

| Page | URL | Voice |
|------|-----|-------|
| Aquafacial Aktion (Meta lead form, CHF 99) | /lp/aquafacial/ | du |
| Aquafacial + Microneedling (combo) | /lp/aquafacial-microneedling/ | Sie |
| Carbon Microneedling | /lp/carbon-microneedling/ | Sie |
| Microneedling LP | /lp/microneedling/ | Sie |
| Peeling LP | /lp/peeling/ | Sie |

## SEO & AIO Status

| Feature | Status | Details |
|---------|--------|---------|
| Schema.org (BeautySalon) | Done | Conservative BeautySalon/WebSite schema with canonical URL and address |
| Schema.org (Service) | Done | Treatment schemas avoid unverified rating/price rich-result claims |
| Schema.org (FAQPage) | Done | 105 FAQ items sitewide with JSON-LD (generated from the same data as the visible FAQs) |
| Schema.org (Article) | Done | All 5 blog articles |
| Schema.org (Person) | Done | About page — Teresa Stimac |
| Schema.org (BreadcrumbList) | Done | Treatment pages, blog, FAQ hub |
| Schema.org (ItemList) | Done | Treatment overview |
| Sitemap | Done | Priority-weighted, admin/LP/confirmation filtered |
| robots.txt | Done | Sitemap directive uses production domain; Cloudflare Managed Content Signals are prepended live and should be reviewed if AI crawler access is intended |
| llms.txt | Done | Concise business summary for AI platforms, including six service groups |
| llms-full.txt | Done | Detailed version with treatments, service hubs, pricing, and FAQs |
| Geo meta tags | Done | CH-ZH, lat/long, ICBM |
| max-image-preview:large | Done | All indexed pages |
| OG image dimensions | Done | 1200x630 |
| Article OG tags | Done | published_time, author, section |
| Canonical URLs | Done | Resolves to beautyfacelift-zuerich.ch |
| Image width/height | Done | All img tags have dimensions (CLS prevention) |
| Internal linking | Done | Cross-links between treatment hubs, treatment detail pages, blog, and FAQ pages |

## SEO Service Hub Release (2026-05-08)

The site now uses a grouped service architecture from `SERVICE_GROUPS` in `shared/site.ts`.

Implemented groups:

- Gesicht & Haut
- Laser-Haarentfernung
- Waxing
- Wimpern & Brauen
- Make-up
- Massage

Visible architecture updated in:

- homepage service section
- desktop and mobile treatment navigation
- footer treatment links
- treatment overview
- `llms.txt` and `llms-full.txt`
- sitemap output

Copy-risk review completed across treatment pages, comparison pages, blog posts, homepage, about page, and one ad landing page. High-risk phrasing such as `eingeschleust`, `Narbenreduktion`, `stimuliert`, `PRP`, and `medizinisch formulierte Peelings` was removed or softened.

## Current features and configuration

| Area | Current state at the reviewed production revision |
| --- | --- |
| Public design | Atelier Glow; Swiss Quiet Luxury was rejected. See [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md). |
| Booking | Treatwell through `/termin/`; clicks measure intent, not confirmed appointments. |
| Enquiry email | Resend branded sender `anfragen@beautyfacelift-zuerich.ch` → Teresa `info@beautyfacelift.ch`, agency BCC. Production tests were recorded on 2026-10-10/20. |
| GTM / GA4 | `GTM-NVC9QKGS` / `G-4C9M8KMFQY` live after consent; server-side GA4 intentionally off. |
| Meta | Pixel and CAPI live after consent; shared accepted event-data keys. Campaign is paused. |
| Legacy booking/admin | Supabase reported unreachable since 2026-10-06; booking writes disabled. Retained code is not an operational staff system. |
| D1 lead cockpit | Code exists only on unmerged #55–#57. Storage, private staff access and automation are not deployed by this documentation change. |
| Stripe | Deposits were never enabled and are not part of current Treatwell booking. |

Historical feature/environment tables and the March design record are preserved verbatim in [the pre-repair STATUS snapshot](../archive/reviews/2026-10-21-pre-repair/STATUS.md). They must not be used to infer current credentials or deployment readiness. No live secret inventory was performed in the review.
