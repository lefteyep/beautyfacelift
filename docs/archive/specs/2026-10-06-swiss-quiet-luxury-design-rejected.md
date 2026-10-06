# Luxury Redesign — "Swiss Quiet Luxury"

**Date:** 2026-10-06 · **Branch:** `codex/luxury-redesign` (based on `codex/code-health-2026-10`)
**Approved by:** mediapaulo (direction "Swiss Quiet Luxury", landing pages "Redesign LPs fully")
**Review:** https://claude.ai/artifact/X6STYwJ9NM8e8T7k1d27tt

## Goal

Reposition beautyfacelift-zuerich.ch from "nice local studio template" to a high-end, modern cosmetic brand that matches its Bahnhofstrasse 94 address. Restraint over ornament: typography, whitespace, real photography and hairline structure carry the luxury; gold becomes detail, not fill.

## Non-goals (must not change)

- URLs, page set, `<title>`/meta descriptions, canonical/OG tags, JSON-LD content, sitemap behaviour.
- Tracking: every `data-*` attribute used by `src/lib/track.ts` (`data-button-location`, `data-source`, `data-treatment`, `data-aquafacial-*`, `data-whatsapp-placement`, `data-bfl-consent-*`), form field `name`s, form endpoints, the Treatwell/WhatsApp hrefs, Meta/CAPI events.
- Worker/API code, Supabase, booking widget logic.
- Logo files and existing photography (no new images are invented; AI-looking stock is not presented as "our studio").
- Facts: prices, durations, ratings, addresses, phone numbers are copied from existing content, never invented.

## Design tokens (source of truth: `src/styles/main.css`)

### Colour

| Token | Hex | Role |
|---|---|---|
| `--porcelain` | `#F7F4EF` | page background |
| `--ivory` | `#FBF9F5` | raised surfaces, inputs |
| `--sand` | `#ECE4D8` | alternate section band |
| `--stone` | `#CFC4B4` | strong rules, image placeholders |
| `--espresso` | `#171411` | primary text, primary buttons, dark bands, footer |
| `--umber` | `#3A332C` | body text (11.3:1 on porcelain) |
| `--taupe` | `#6B6258` | muted text, captions (≥4.7:1 on porcelain/sand) |
| `--bronze` | `#7A5C34` | accent text, eyebrows, active states (≥4.89:1 on all light surfaces) |
| `--bronze-light` | `#C2A475` | accent on espresso (7.7:1), hairline highlights |
| `--champagne` | `#D9C6A5` | muted text on espresso |
| `--rule` / `--rule-strong` | `rgba(23,20,17,.12)` / `.24` | hairlines |

Legacy aliases (`--bg-*`, `--text-*`, `--accent*`, `--gold*`, `--border-*`, `--paper*`, `--ink*`) remain and point at the new tokens so untouched markup restyles automatically.

### Type

- **Display:** `Bodoni Moda Variable` (opsz 6–96, wght 400–900, roman + italic). Headings weight 400, `font-optical-sizing: auto`, letter-spacing −0.01em to −0.025em at large sizes. Italic is allowed for one accent word per heading (`<em>`), coloured `--bronze`.
- **Text/UI:** `Instrument Sans Variable` (wght 400–700, wdth 75–100). Body 400. Labels 600, uppercase, 0.16–0.2em tracking.
- Cormorant Garamond, Inter and JetBrains Mono are removed.

| Token | Size | Use |
|---|---|---|
| `--fs-display` | clamp(3rem, 7vw, 6.25rem) | homepage H1 |
| `--fs-h1` | clamp(2.6rem, 5.2vw, 4.75rem) | page H1 |
| `--fs-h2` | clamp(2rem, 3.6vw, 3.25rem) | section titles |
| `--fs-h3` | clamp(1.4rem, 1.9vw, 1.75rem) | sub-heads, list titles |
| `--fs-lead` | clamp(1.125rem, 1.4vw, 1.3rem) | intro paragraphs |
| `--fs-body` | 1.0625rem (17px), line-height 1.7 | running text, max 66ch |
| `--fs-small` | 0.9rem | captions, meta |
| `--fs-label` | 0.72rem, 600, uppercase, 0.18em | eyebrows, buttons, nav |

### Space, shape, depth, motion

- Container `--container: 1320px`, gutter `--gutter: clamp(20px, 5vw, 72px)`.
- Section rhythm `--section-y: clamp(88px, 11vw, 168px)`; tight variant `clamp(56px, 7vw, 104px)`.
- Corners: **0** on images, cards, buttons, bands; **2px** on inputs only. No pills.
- Shadows: none, except the nav dropdown and the consent banner (`--shadow-float`).
- Motion: existing GSAP reveals kept but subtle (≤24px translate, 0.9–1.2s expo). Image hover: scale 1.03 over 1.2s. Remove grain overlay and scroll indicator. Respect `prefers-reduced-motion`.

## Components

- **Buttons:** `.btn` + `.btn-primary` (espresso fill, porcelain label, 52px tall, 0 30px padding, label type), `.btn-secondary` (1px espresso border, transparent), `.btn-link` (label type, underline offset 6px, trailing `→` that slides 4px on hover). Inverted variants on dark bands via `.on-dark` context. Legacy `.pill-btn` = primary, `.pill-btn-outline` / `.pill-btn-ghost` = secondary, `.pill-btn-dark` = primary inverted, `.pill-btn-sm` = 44px.
- **Eyebrow:** `.eyebrow` (also legacy `.sub-display`): label type in `--bronze`, optionally preceded by a 28px hairline.
- **Hairline list (`.index-list`)**: replaces boxed cards for service groups, benefits, combinations. Each row: title (display h3) + text + optional meta + arrow; separated by `--rule`. Numerals only where order is meaningful (process steps).
- **Fact rows (`.facts`)**: label/value rows (Dauer, Preis, Downtime, Geeignet für) — already good; restyle only.
- **Price menu (`.price-menu`)**: rows — name + duration left, `CHF` price right in display numerals, note below; no cards, grid never leaves orphans.
- **Quote:** display italic, German quotes „…“, attribution in label type.
- **FAQ:** `<details>` rows on hairlines; question in display 1.35rem; `+` drawn with CSS, rotates to `×`.
- **Navigation:** three-zone grid on desktop — left: Behandlungen (mega dropdown), Über mich, Journal (→ `/blog/`); centre: monogram logo; right: Kontakt, primary "Termin buchen" button. Porcelain background with hairline bottom; compacts on scroll. Treatment heroes no longer force a dark nav. Mobile: logo left, menu button right, full-screen porcelain overlay with display-serif links.
- **Footer:** espresso band; large display wordmark; 4 columns (Studio, Kontakt, Behandlungen, Wissen); legal row incl. "Cookie-Einstellungen".
- **Consent banner:** ivory panel, hairline border, `--shadow-float`, espresso/secondary buttons.

## Page compositions

- **Home:** (1) split hero — eyebrow, display H1 with italic accent, lead, primary + link CTA; tall 4:5 image of Teresa at work with editorial caption; (2) trust line on hairlines (20+ Jahre · 4,8/5 aus 248+ Bewertungen auf Treatwell · Bahnhofstrasse 94 · persönlich von Teresa); (3) intro statement rewritten for people (keywords kept naturally) + 3×2 service-group index; (4) signature treatments as an editorial index (name, one-liner, "ab CHF" where the treatment page states it, thumbnail); (5) Teresa portrait + „…“ quote + bio; (6) "Ihr erster Besuch" — consultation, location, booking, from existing facts; (7) reviews with source link; (8) FAQ (first-visit questions first); (9) espresso closing CTA band.
- **Treatment pages (5 bespoke + `ServiceHubPage` hubs + `/behandlungen/vergleich/`):** split hero (H1 in display serif, never "Hydra"), facts block, experience section, process (numbered — real sequence), suitability, price menu, review quote, FAQ, booking band, related treatments as index list. Duplicate booking bar under the hero removed (nav CTA + booking band remain).
- **/behandlungen/:** editorial overview — intro, groups as index list, signature treatments with images, comparison link.
- **About:** hero with portrait above the fold, name, role and credentials; philosophy; values (no marquee); CTA band.
- **Blog index + article layout:** index as editorial list with image; article with lead image, byline row, 66ch body at 400 weight, pull quotes, related posts.
- **FAQ, Kontakt, Termin, Impressum, Datenschutz, 404, Buchung bestätigt:** restyled on the system; Kontakt keeps all form behaviour.
- **Landing pages (`/lp/*`), full redesign:** same section order and all tracking/form contracts, rebuilt in the new language. Aquafacial LP applies the Jul-31 audit hero: kicker "Aquafacial an der Bahnhofstrasse 94", H1 ≤ 4 lines on mobile, price line "Kennenlernpreis CHF 99.– · statt CHF 180.–", max three benefits, primary CTA "Unverbindlich Termin anfragen" + microcopy "Keine Online-Zahlung. Wir melden uns zur Terminbestätigung.", WhatsApp float only after 25% scroll, sticky bar only after the hero. QA scripts updated in the same commit wherever approved copy changes.

## Copy fixes (customer-facing)

- Remove agency/tracking jargon: "Suchintention", "kaufnahe Leistungen", "vorübergehend über Treatwell", "Kampagnen- und Behandlungsangaben übergeben". Replacement tone: "Buchen Sie online — Teresa bestätigt Details und Eignung persönlich."
- Aquafacial hero: "Aquafacial", never "Hydra".
- Keyword-stuffed paragraphs rewritten as natural sentences (keep the place/service terms).
- German typographic quotes „…“ everywhere.
- Rating: single shared constant (`4,8`, `248+`), with Treatwell as named source and link.

## Verification

- `npm run check` (0 errors), `npm audit --audit-level=moderate`, `npm run build` (36 pages), all `qa:*` scripts.
- Screenshot pass at 1440 and 390 for every page type; no horizontal overflow; consent banner never hides the primary CTA.
- Contrast: every text/background pair in the token table ≥ 4.5:1 (labels included).
- Lighthouse mobile on `/` and `/lp/aquafacial/`: performance not lower than today (98 on LP), accessibility ≥ 96.
