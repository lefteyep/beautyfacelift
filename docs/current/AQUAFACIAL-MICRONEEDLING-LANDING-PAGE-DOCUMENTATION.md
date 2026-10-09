# Landing Page Documentation

Landing page:
`Aquafacial + Microneedling Zürich`

Final URL:
`https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/`

Document status:
Production documentation for the live campaign landing page.

Last documented:
October 7, 2026 — conversion and copy pass on top of the site-wide "Atelier Glow" system ([DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)). See "2026-10-07 Conversion and Copy Refinement" below.
- **Unchanged since June 2, 2026:** offer, prices, form contract (fields, names, hidden inputs, consent, honeypot) and tracking.
- **History:** the October 6 "Swiss Quiet Luxury" restyle was rejected by the client. Its spec is archived at `docs/archive/specs/2026-10-06-swiss-quiet-luxury-design-rejected.md`.

## 2026-10-07 Conversion and Copy Refinement

Live since 2026-10-07 (PR #28, merge `bbdc22c`). Same quality bar as the approved `/lp/aquafacial/` pass (PR #27). The offer (CHF 170 statt CHF 250, 1 Std. 30 Min.), the form contract, every `data-button-location` / `data-treatment` / `data-source` hook, the sticky-bar gating and the tracking script are unchanged. The page still addresses visitors with "Sie".

- **Section order:**
  - **Before (17):** hero, desire, treatment plan + included panel, combination + infographic, image story, two-step focus, benefits, trust, OfferBox, expectations, process, form, FAQ, location, reassurance strip, booking panel, final.
  - **Now (13):** hero, offer (included list + OfferBox price card + promises strip), desire, the three steps with photos, two-step focus with the infographic, trust, expectations, process, form, FAQ, booking panel, location, final.
  - **Why:** the price-led Meta ad is confirmed right after the hero (what is included, price, CTA), as on `/lp/aquafacial/`. The three treatment phases and the three step photos told the same story twice, so they are now one section of numbered image cards. The combination section repeated the phases and the focus columns, so its infographic moved into the two-step section. The benefits section repeated desire and expectations and was cut. The booking panel no longer has its own section head.
- **Hero:**
  - The rating proof "★★★★★ 4,8 aus 248+ Bewertungen" sits directly under the CTAs, as on the treatment pages. It replaces the uppercase tracked trust line ("4,8/5 · 248+ BEWERTUNGEN · 20+ JAHRE ERFAHRUNG · BAHNHOFSTRASSE 94").
  - The photo sits in the site's arch frame on desktop (`var(--r-pill) var(--r-pill) var(--r-lg) var(--r-lg)`, 4:5, centred on Teresa); phones keep the full-bleed 16:9 band on top.
  - **Subtitle:** "Die Kombi-Behandlung verbindet … und Sie sich eine ehrliche Einschätzung vor der Behandlung wünschen." → "Gründliche Aquafacial Pflege, intensive Feuchtigkeit und kontrolliertes Microneedling in einem Termin – ideal, wenn Ihre Haut müde, fahl oder unruhig wirkt."
  - **Price line:** "KOMBI-ANGEBOT CHF 170.– statt ~~CHF 250.–~~ / 1 Std. 30 Min. inklusive …" → "Kombi-Angebot · 1 Std. 30 Min. CHF 170.– · statt CHF 250.–" (sentence case, like the Aquafacial page).
  - **Bullets (desktop only, tick discs):** four "Für …" lines → "Hautanalyse, Aquafacial, Microneedling und Abschlusspflege", "Für mehr Glow, optisch feinere Poren und glatter wirkende Haut", "Persönlich durch Teresa Stimac, 20+ Jahre Erfahrung".
- **Copy (old → new):**
  - **Offer H2:** new "Das ist im Kombi-Angebot enthalten"; it replaces the "Enthalten im Aktionspreis" panel. The OfferBox is the shared default card, as on the carbon page, without a label above the price. Its offer line reads "Aquafacial + Microneedling Kombi-Angebot" (was "Aktionsangebot Zürich" / "Aquafacial + Microneedling") and its note "1 Std. 30 Min. · Hautanalyse inklusive". The footnote under the OfferBox was removed.
  - **Desire:** the five rows became four (the non-skin-goal row "Ruhige Durchführung" was dropped). The lead is now one sentence.
  - **Steps:** "Professionelle Pflege und Anti-Aging" (image story) is gone. Its three photos now illustrate the three phases under "Warum Aquafacial und Microneedling zusammen sinnvoll sein können".
  - **Two-step focus:** each column keeps its pinned title. The intro is shortened and the lists have four items instead of five; "Gepflegteres Hautgefühl" and "Gezielte kosmetische Hautverfeinerung" were filler.
  - **Trust:** the dash list was cut. The proof row "4,8/5 · 20+ Jahre · 8001 Zürich" → "20+ Jahre Erfahrung · 4,8 Bewertung auf Treatwell · 248+ Bewertungen", matching `/lp/aquafacial/`.
  - **Form section:** the dash list was cut; the lead is shorter. The form note → "Keine Online-Zahlung. Das Studio meldet sich persönlich bei Ihnen."
  - **FAQ:** "Alles, was Sie vor der Behandlung wissen sollten" → "Häufige Fragen zur Kombi-Behandlung". Eleven questions became eight; no fact was dropped:
    - duration and price are merged into "Was ist im Kombi-Angebot enthalten?";
    - "Für wen …" is merged into "Muss ich schon wissen …";
    - make-up is merged into the after-care answer.
  - **Booking panel:** the section head "Direktbuchung / Direkt einen freien Termin wählen" + lead became the panel's own title "Direkt einen freien Termin wählen" with "Service und Aktionspreis sind in der Online-Buchung bereits vorbereitet."
  - **Final band:** "Bereit für frischer, gepflegter wirkende Haut?" → "Aquafacial + Microneedling für CHF 170.– statt CHF 250.–" (offer-led close, like `/lp/aquafacial/`). The dotted offer line was removed.
  - **Duration:** visible copy now uses one name, "1 Std. 30 Min." (no more "90 Minuten" in the booking panel, FAQ and final band). The meta description and structured data keep "90 Min." / "90 Minuten".
- **Atelier Glow consistency:**
  - **Overlines:** every decorative section overline was removed (Behandlungsziel, Die Sitzung, Warum diese Kombination?, Behandlungsablauf, Aquafacial + Microneedling, Realistische Vorteile, Qualität & Vertrauen, Realistische Erwartung, Ablauf, Hautanalyse & Terminwunsch, Häufige Fragen, Direktbuchung and the final-band kicker).
  - **Labels:** no uppercase or tracked labels remain. This covers the price label, form labels, quote caption, sticky bar and, through the shared components, the OfferBox, TrustStrip and legal strip.
  - **Lists:** the site's tick-list marker (shell disc carrying a hairline copper tick). The QA-pinned `border-left: 1px solid var(--bronze)` tick sits inside the disc. Dash lists are gone.
  - **Shapes:**
    - the hero is an arch;
    - photos use `.media` (`--r-lg`);
    - the infographic, map, form card (`--r-xl`) and the shared OfferBox card are rounded;
    - the hero WhatsApp is a text link with the arrow disc (as on the reference and carbon pages); the form and closing WhatsApp buttons are the shared secondary pills;
    - the sticky WhatsApp is a round disc with the glyph.
  - **Boxes and bars:** the bordered "included" panel inside an ivory band and the quote's left accent bar are gone. The form error panel no longer uses a left bar either.
  - **Form messages:**
    - The `role="alert"` summary uses the contact page's error-tinted rounded panel, with no left bar.
    - Invalid fields keep master's states (bronze border and label, consent outline); the unchanged script sets `aria-invalid` and focuses the first invalid field.
    - The CSS-generated "Bitte ausfüllen" hint was removed. The page has no per-field error elements, so none were invented.
- **Pinned by `qa:aquafacial-combo-lp` and kept despite the rules:**
  - the hero kicker markup `<p class="eyebrow eyebrow--rule lp-eyebrow">Aktion: Aquafacial + Microneedling in Zürich</p>`. It renders as a sentence-case copper label.
  - the location kicker string "Studio & Anfahrt" (kept as the one remaining section kicker).
  - the H1 and its sizes;
  - `.lp-subtitle { order: 1; }` on stacked heroes;
  - the hairline bronze `.lp-checks` tick;
  - `--radius-input` on fields;
  - all pinned headings, images and alt texts.
- **Verification:**
  - `qa:aquafacial-combo-lp`, `qa:carbon-lp`, `qa:aquafacial-lp`, `qa:marketing`, `qa:docs`, `check` (0 errors) and `seo-plan-smoke` pass.
  - There is no horizontal overflow from 320 to 1440 px. The H1 stays at four lines at every width.
  - The sticky bar fits at 320 px; there it hides the struck regular price.
  - The price and both hero CTAs sit above the consent banner at 390 × 844.
  - The desktop length dropped from about 15,200 px to about 11,400 px, and mobile from about 21,000 px to about 14,500 px, with the reference's section rhythm.
- **Follow-up after the set comparison with `/lp/aquafacial/`:**
  - **Rhythm:** section padding `clamp(72px, 9vw, 136px)`, H2 line height 1.06 and letter spacing -0.015em; section-head gaps, hero padding and closing-band padding as on the reference.
  - **Hero (phones):** a full-width booking pill, with the WhatsApp link and the rating line centred beneath it.
  - **Closing band:** the reference layout (copy left; CTAs and address right). The title is limited to 16ch, `clamp(2rem, 9vw, 2.6rem)` on phones.
  - **Address line:** "Beauty Face Lift · Bahnhofstrasse 94 · 8001 Zürich". The phone number was dropped; it is not QA-pinned.
  - **Trust photo:** 4:5 (4:4.4 on phones).
  - **Sticky bar:**
    - It steps aside while the lead form is on screen.
    - Its height is reserved only through the layout's `--lp-sticky-offer-height` (legal-strip padding); the spacer div and the body padding are gone.
  - **Re-verified:**
    - At 390 px the bar is hidden at the top and while the form is on screen, and shown in between and at the page end.
    - The legal strip reserves 100 px (28 + 72) and the body adds no padding.
    - There is no horizontal overflow from 320 to 1440 px.
    - The H1 keeps four lines.
- **Open points for the client:**
  - **Infographic text:** the pinned infographic (`aquafacial-microneedling-infografik-zuerich.webp`) still reads "Hydrofacial + Microneedling" and "Stimuliert Kollagen" in the image itself. It needs a corrected export that says "Aquafacial" and uses cautious wording.
  - **Booking panel label:** the shared booking panel's WhatsApp button reads "Frage per WhatsApp", while this page uses "Per WhatsApp anfragen". The label lives in `BookingCta.astro` (shared).
  - **Offer end date:** "Aktion" has no end date on the page; the structured data says `priceValidUntil: 2026-12-31`.
  - **Review count:** please confirm the review count; "248+" stays true at 249.

## 1. Project Overview

- Landing page name: Aquafacial + Microneedling Zürich
- Final URL: `https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/`
- Brand / business: Beauty Face Lift Zürich
- Studio location: Bahnhofstrasse 94, 8001 Zürich
- Campaign goal: convert visitors into direct online bookings or qualified treatment inquiries for the Aquafacial + Microneedling combination treatment.
- Target audience: people in Zürich and the surrounding area who want fresher, smoother, more radiant looking skin and are interested in a premium cosmetic treatment with personal assessment.
- Main offer: 90-minute Aquafacial + Microneedling combination treatment for CHF 170 instead of CHF 250.
- Primary CTA: `Jetzt Termin buchen`
- Secondary CTA: `Per WhatsApp anfragen`
- Supporting CTA: `Hautanalyse & Termin anfragen`
- Traffic sources: primarily paid social and paid search, especially Meta Ads, Google Ads, TikTok Ads and retargeting. Organic traffic is secondary because `/lp/` routes are intentionally noindexed.
- Campaign status: live.

The page follows a single-offer strategy: one treatment combination, one Zurich-focused audience, one main action. The main action is booking the treatment through the prepared `/termin/` bridge, which passes the service, offer and price into the Treatwell booking flow.

## 2. Campaign Details

The campaign promotes a combined Aquafacial + Microneedling treatment at Beauty Face Lift Zürich. The offer is positioned as a premium, personal, skin-focused treatment for people who want visible freshness, hydration, glow and a more refined-looking skin texture without exaggerated promises.

The campaign is for visitors who:

- live in or near Zürich.
- are interested in cosmetic facial treatments.
- notice tired, dry, dull or uneven-looking skin.
- want more glow, moisture and a smoother-looking complexion.
- are curious about Microneedling but want personal guidance before committing.
- prefer an experienced studio rather than a generic beauty chain.

Problem / desire addressed:
The page addresses the gap between daily skincare and a professional treatment. It speaks to visitors whose skin still looks tired, dry, uneven or less fresh despite using at-home care.

Main emotional angle:
Feel professionally cared for, understood and confident that the treatment is adapted to the individual skin condition.

Main rational angle:
The offer bundles skin analysis, Aquafacial care, Microneedling, calming after-care and clear 24-48 hour guidance in one 90-minute appointment.

Offer positioning:

- Premium but accessible.
- Personal rather than standardized.
- Zurich-local and appointment-ready.
- Clear price anchor: CHF 170 instead of CHF 250.
- Realistic cosmetic outcomes rather than medical or guaranteed claims.

Pricing / promotion details:

- Promotion price: CHF 170.
- Regular price: CHF 250.
- Duration: 1 Std. 30 Min.
- Included: skin analysis, Aquafacial care, Microneedling, calming closing care and after-care instructions.

Urgency or scarcity mechanism:
The page uses a clear action offer, but does not use hard scarcity claims. Avoid countdowns, artificial urgency or unsupported limited-slot language unless the business confirms a real limitation.

Important wording rules:

- Use `Aquafacial` consistently.
- Use `Microneedling` consistently.
- Use `Aquafacial + Microneedling` for the combined offer.
- Do not use previous Hydro/Hydra treatment naming variants or old campaign slugs.
- Use cosmetic language such as `kann`, `optisch`, `wirken`, `gepflegt`, `frischer`, `Hautbild`, `Struktur`, `Feuchtigkeit`.
- Avoid medical, curative or guaranteed-result wording.

Claims to avoid:

- Guaranteed wrinkle removal.
- Guaranteed pore disappearance.
- No-downtime absolutes.
- Pain-free absolutes.
- Medical treatment or healing claims.
- Before/after claims that are not supported by approved proof.
- Any statement that implies the same result for every skin type.

## 3. Landing Page Strategy

The page is built as a long-form paid campaign landing page for a premium aesthetic treatment. It gives cold or warm ad traffic enough context to understand the treatment, trust the studio and take action without needing to browse the full website.

Main conversion strategy:

1. Lead with the outcome and offer above the fold.
2. Make booking the dominant CTA.
3. Keep WhatsApp as a lower-friction secondary path.
4. Use the form as a support path for uncertain visitors, not as the main conversion path.
5. Build trust through experience, rating, location, personal treatment and realistic expectation-setting.
6. Handle objections through treatment explanation, after-care notes, FAQ and personal assessment.

Why the page is structured this way:

- The hero gives immediate message match for ad traffic: Aquafacial + Microneedling in Zürich, CHF 170, direct booking.
- The desire section validates the visitor's skin concerns.
- The explanation sections clarify why the combination makes sense.
- The image sections reduce text heaviness and show the treatment environment.
- The trust section makes Teresa Stimac and the studio feel personal and credible.
- The offer section repeats price and included services after the visitor understands the treatment.
- The FAQ handles objections before final action.
- The location section reinforces local trust and practical convenience.
- The sticky mobile bar keeps booking available after the hero starts leaving the viewport.

How cold traffic is addressed:

- The page explains what each treatment step does.
- It avoids assuming visitors already know whether Aquafacial or Microneedling is right for them.
- It states that the treatment is personally adapted on site.
- It includes WhatsApp and form paths for questions before booking.

How trust is built:

- Rating proof "4,8 aus 248+ Bewertungen" under the hero CTAs.
- 20+ years experience.
- Personal treatment by Teresa Stimac.
- Central location at Bahnhofstrasse 94.
- Realistic language around results and possible redness.
- FAQ answers for suitability, downtime, discomfort, after-care and postponement.
- Legal links and privacy consent.

How objections are handled:

- Unsure which treatment fits: addressed in FAQ and lead form.
- Concern about intensity: Microneedling is described as controlled and individually dosed.
- Concern about results: framed as realistic cosmetic effects.
- Concern about recovery: 24-48 hour after-care guidance is explained.
- Concern about location: map, route link and public transport/car notes are included.
- Concern about price: offer card and price anchor are repeated.

The page should make visitors feel:

- professionally guided.
- calm rather than pressured.
- confident that the offer is clear.
- comfortable booking directly or asking via WhatsApp.

The page should make visitors understand:

- what Aquafacial contributes.
- what Microneedling contributes.
- what is included in the CHF 170 appointment.
- where the studio is.
- what the next step is.

The page should make visitors do:

- click `Jetzt Termin buchen` if ready.
- click `Per WhatsApp anfragen` if they have a quick question.
- use the form only if they want a more detailed treatment recommendation or appointment request.

## 4. Page Structure

Order since 2026-10-07: hero, offer, desire, steps, two-step focus, trust, expectations, process, lead form, FAQ, booking panel, location, final band, plus the mobile sticky bar.

### 1. Hero Section

- Kicker (QA-pinned): `Aktion: Aquafacial + Microneedling in Zürich`.
- H1 (QA-pinned): `Ganzheitliche Kombi-Behandlung für sichtbar strahlende, straffere und regenerierte Haut.`
- Subtitle: `Gründliche Aquafacial Pflege, intensive Feuchtigkeit und kontrolliertes Microneedling in einem Termin – ideal, wenn Ihre Haut müde, fahl oder unruhig wirkt.`
- Price line: `Kombi-Angebot · 1 Std. 30 Min.` · `CHF 170.–` · `statt CHF 250.–`.
- Bullets (desktop only, hidden ≤ 760px by QA): Hautanalyse, Aquafacial, Microneedling und Abschlusspflege · Für mehr Glow, optisch feinere Poren und glatter wirkende Haut · Persönlich durch Teresa Stimac, 20+ Jahre Erfahrung.
- CTAs: `Jetzt Termin buchen` (booking bridge, `lp_hero_booking`) and the text link `Per WhatsApp anfragen` (`aquafacial_hero`, WhatsAppButton `variant="link"`). On phones the pill runs full width and the link and rating line are centred beneath it.
- Proof under the CTAs: `★★★★★ 4,8 aus 248+ Bewertungen`.
- Visual: one treatment photo (Teresa at work) in the arch frame on desktop; a full-bleed 16:9 band above the copy on phones.
- Phones: photo band, kicker, H1, price, CTAs and proof come first; the subtitle follows (`.lp-subtitle { order: 1; }`).

### 2. Offer / What Is Included

- H2: `Das ist im Kombi-Angebot enthalten`.
- Lead: `1 Std. 30 Min. professionelle Pflege, Schritt für Schritt auf Ihre Haut abgestimmt – persönlich durchgeführt von Teresa Stimac.`
- Included items (tick discs, treatment order): Hautanalyse und persönliche Abstimmung · Gründliche Aquafacial Pflege · Intensive Feuchtigkeit für einen gepflegten Glow · Kosmetisches Microneedling mit professionellem Pen · Beruhigende Abschlusspflege · After-Care-Hinweise für die ersten 24–48 Stunden.
- Price card: the shared `OfferBox` default card, unstyled by the page, as on the carbon page. It shows CHF 170.– with "statt CHF 250.–", the offer line "Aquafacial + Microneedling Kombi-Angebot", "1 Std. 30 Min. · Hautanalyse inklusive" and the CTA `Kombi-Behandlung buchen` (`offer_box`).
- Under the card: `TrustStrip variant="promises"` with Persönliche Hautanalyse · Transparenter Aktionspreis · Zentrale Lage in Zürich · Realistische Beratung.

### 3. Problem / Desire

- H2 (QA-pinned): `Wenn Ihre Haut mehr braucht als Pflege zu Hause`.
- Four ruled columns: Frischerer Glow · Glatter wirkendes Hautbild · Optisch feinere Poren · Mehr Feuchtigkeit.

### 4. Why the Combination Works (three steps)

- H2 (QA-pinned): `Warum Aquafacial und Microneedling zusammen sinnvoll sein können`.
- Three numbered image cards, one per phase: Aquafacial bereitet vor (Aquafacial close-up) · Microneedling setzt Mikroimpulse (Microneedling close-up) · Abschlusspflege beruhigt (aftercare photo).
- On phones (≤ 600px) the cards become compact rows, photo left and copy right.

### 5. Two-Step Focus

- H2: `Zwei Behandlungsschritte, ein klares Hautziel`.
- The infographic (QA-pinned, uncropped) sits beside two ruled columns with pinned titles and four tick items each:
  - `Aquafacial: reinigen, hydratisieren, Glow aufbauen`;
  - `Microneedling: gezielte Mikroimpulse für feinere Hautstruktur`.

### 6. Trust

- H2 (QA-pinned): `Persönliche Behandlung statt Standardprogramm`.
- Hautanalyse photo (4:5), Teresa's quote (attribution in sentence case), one short paragraph.
- Proof row: 20+ Jahre Erfahrung · 4,8 Bewertung auf Treatwell · 248+ Bewertungen.

### 7. Expectations

- H2 (QA-pinned): `Realistische Ergebnisse statt übertriebener Versprechen`.
- Ruled rows: Direkt danach · 24–48 Stunden · Weitere Sitzungen. The post-treatment glow photo sits beside them.

### 8. How It Works

- H2: `So läuft Ihr Termin in Zürich ab`.
- Four numbered step cards (site `.steps`): Termin anfragen oder buchen · Hautanalyse vor Ort · Aquafacial + Microneedling · Abschlusspflege und After-Care.
- CTAs: `Jetzt Termin buchen` (`process_section_booking`) and `Hautanalyse & Termin anfragen` (`process_section_lead`).

### 9. Lead Form

- H2: `Unsicher, ob die Kombi-Behandlung zu Ihrer Haut passt?`
- Lead: `Senden Sie kurz Ihr Hautziel und Ihren Terminwunsch. Teresa Stimac prüft vor Ort Ihren Hautzustand und stimmt die Behandlung darauf ab.`
- Secondary actions: WhatsApp (`aquafacial_form`) and `Kombi-Behandlung buchen` (`lead_section_booking`).
- Personal treatment photo (hidden on phones). The form card `#anfrage-form` sits beside it; see section 9 of this document.

### 10. FAQ

- H2: `Häufige Fragen zur Kombi-Behandlung`.
- Eight questions, in the order visitors raise them:
  - Was ist im Kombi-Angebot enthalten?
  - Muss ich schon wissen, ob Aquafacial oder Microneedling besser für mich ist? (QA-pinned)
  - Ist Microneedling schmerzhaft?
  - Gibt es Ausfallzeit?
  - Was sollte ich nach der Behandlung beachten?
  - Wann sehe ich Ergebnisse?
  - Wie viele Sitzungen sind sinnvoll? (QA-pinned)
  - Wann sollte ich den Termin verschieben? (QA-pinned)

### 11. Booking Panel

- Shared `BookingCta` panel titled `Direkt einen freien Termin wählen`, with the text `Service und Aktionspreis sind in der Online-Buchung bereits vorbereitet.`
- CTAs: `Kombi-Behandlung buchen` (`booking_cta`) and the component's own "Frage per WhatsApp" (`booking_cta_whatsapp`).

### 12. Location / Anfahrt

- Kicker (QA-pinned string): `Studio & Anfahrt`.
- H2 (QA-pinned): `Bahnhofstrasse 94 · Zürich`.
- Ruled rows: Mit dem ÖV · Mit dem Auto · Öffnungszeiten (shared `OPENING_HOURS`).
- Route button: `Route in Google Maps öffnen` (`data-source="aquafacial_location"`).
- The Google Maps embed `#studio-map` sits beside the copy, rounded and lazy-loaded.

### 13. Final CTA

- H2: `Aquafacial + Microneedling für CHF 170.– statt CHF 250.–`.
- CTAs: `Jetzt Termin buchen` (`lp_final_booking`), `Per WhatsApp anfragen` (`aquafacial_final`) and `Hautanalyse & Termin anfragen` (`lp_final_lead`).
- Below the CTAs: `Beauty Face Lift · Bahnhofstrasse 94 · 8001 Zürich`.

## 5. Design Documentation

Overall design style:
"Atelier Glow" is the site-wide system ([DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)) and the approved `/lp/aquafacial/` page is the reference:
- **Colour:** cream, paper and shell surfaces, with a copper accent and cocoa text.
- **Type:** upright Instrument Serif headings (never italic) and an Instrument Sans body.
- **Shape and imagery:** rounded image frames, pill buttons, real photography and generous whitespace.
- **Tokens:** some selectors still use the legacy aliases (`--porcelain` → `--cream`, `--espresso` → `--cocoa`, `--bronze` → `--clay` …), which `main.css` maps to the current tokens.

Brand feeling:
Calm, personal, premium, trustworthy and professional. The design should feel like a high-quality Zurich studio, not a discount ad page.

Colour:
- Colours come only from tokens. There are no hex literals in page styles; tints use `color-mix()` with tokens.
- Cream page with shell (`.section--sand`) and paper (`.section--ivory`) bands, and a cocoa closing band (`.on-dark`).
- The form-level error summary uses `--error`, as on the contact page; invalid fields keep master's bronze states.

Typography:
- Instrument Serif 400 for H1/H2, prices, proof numbers and the quote. Instrument Sans for everything else.
- Labels are sentence case, `var(--fs-label)`, weight 500, in copper or muted. There are no uppercase or letter-spaced labels anywhere on the page.
- The hero H1 is `clamp(2.4rem, 3.9vw, 3.6rem)` on desktop and `clamp(1.75rem, 7.4vw, 2.1rem)` on phones (four lines at 390px). Both sizes are QA-pinned.
- Prices use lining numerals and the Swiss format "CHF 170.–"; the regular price reads "statt CHF 250.–".

Buttons:
- `.btn` copper pill for booking.
- WhatsApp:
  - in the hero, a `.btn-link` text link with an arrow disc;
  - elsewhere, the shared secondary pill.
- `.btn-link` with an arrow disc for the form anchor.
- On the cocoa band, booking is a cream pill and WhatsApp an outline pill.
- Labels: `buchen` for the Treatwell bridge, `anfragen`/`senden` for the request form.

Shapes and surfaces:
- **Hero photo:** arch frame on desktop.
- **Photos:** `.media` with `--r-lg`.
- **Cards:** the form card uses `--r-xl`; the OfferBox price card is the shared default card.
- **Map and infographic:** rounded.
- **Toggles and discs:** step numbers, tick discs and the sticky WhatsApp button are round (`--r-pill`).
- Radii only through tokens: QA forbids literal `border-radius: Npx|rem|50%` on this page.
- Hairlines and image cards, not boxes in boxes; no coloured left accent bars; no shadows.

Lists and icons:
- The site tick-list marker: a shell disc with a hairline copper tick. The tick is the QA-pinned `.lp-checks > li::before` with `border-left: 1px solid var(--bronze)`.
- Gold stars in the hero proof. No benefit icons.

Images:
- Real studio and treatment photography, with no text overlays and no logos.
- **Hero:** eager, preloaded with the same `srcset`/`sizes` as the rendered image.
- **Other images:** lazy-loaded.
- **Infographic:** shown uncropped (`object-fit: contain`).

Desktop layout notes:
- **Hero:** copy left (7fr), arch photo right (5fr).
- **Section heads:** H2 left, one short lead right.
- **Grid sections:** offer, trust, expectations, form and location are two-column grids. Step cards and focus columns sit three across.
- **FAQ:** the heading is sticky beside the accordion.

Mobile layout notes:
- **Hero order:** photo band, kicker, H1, price, CTAs, proof, then the subtitle; the bullets are hidden.
- **Columns:** sections stack into one column, and the step cards become photo-and-copy rows at 600px and below.
- **Sticky bar:**
  - shows the price, `Jetzt Termin buchen` and a round WhatsApp disc;
  - appears after the hero and hides while the lead form is on screen or the consent banner is open;
  - its height is reserved only through the layout's `--lp-sticky-offer-height`;
  - at 360px and below it drops the struck regular price so everything fits at 320px.

## 6. UI/UX Documentation

Navigation behavior:
The page uses a minimal logo-only navigation in the `LandingPage` layout. It avoids full site navigation to keep the paid campaign focused on one offer.

CTA placement:

- Hero: primary direct booking and secondary WhatsApp.
- Offer section (second section): OfferBox `Kombi-Behandlung buchen`.
- Process: booking and lead-form anchor.
- Lead section: WhatsApp and direct booking.
- Booking panel (after the FAQ): booking and WhatsApp.
- Final section: booking, WhatsApp and lead-form anchor.
- Mobile sticky bar: booking and WhatsApp after the hero starts leaving the viewport.

Sticky CTA behavior:
The mobile sticky CTA starts hidden with `aria-hidden="true"`. JavaScript checks `.lp-hero.getBoundingClientRect()` and toggles `body.lp-sticky-visible` only when the hero bottom is above the configured viewport threshold and the lead form is not on screen. This keeps the bar off the first-screen trust content and off the form fields and submit button. The bar height is reserved by the layout (`--lp-sticky-offer-height` adds padding to the legal strip); the page adds no spacer of its own.

Form placement:
The form is intentionally placed after explanation, proof and process sections. It is not the main hero conversion path.

Mobile-first considerations:

- Price and primary CTA in the first viewport (390 × 844), even with the consent banner open.
- Reduced first-screen text density.
- Sticky CTA appears later.
- Images are placed after relevant copy.
- Form is single-column.
- CTA labels remain short enough for mobile buttons.

Section order logic:
The page confirms the ad's offer first (hero, then what is included and the price card). It then moves through the problem, how the combination works, the two treatment steps, proof, realistic expectations, the appointment process, lead capture, FAQ, the booking panel, location and the final CTA.

Scroll flow:
The scroll flow moves from attention to understanding to trust to action. Visitors can act immediately in the hero, after understanding the treatment, after reading FAQs or at the final CTA.

Reduced friction points:

- Direct booking link preselects service and campaign offer.
- WhatsApp link includes prefilled treatment question.
- Lead form asks only relevant fields.
- Location map and route link remove arrival uncertainty.
- FAQ handles common doubts.

Accessibility considerations:

- H1 is unique and descriptive.
- Buttons and links use clear labels.
- Form inputs have labels.
- Required fields are marked.
- Privacy checkbox is explicit.
- Images include meaningful German alt text.
- Sticky CTA uses complementary role and aria-hidden state.

Readability considerations:

- Body text is concise and line lengths are constrained.
- Long explanations are broken into ruled rows and grids.
- FAQ hides detailed answers until needed.
- Mobile hides first-screen bullet list to reduce clutter.

Button and link behavior:

- Booking CTAs route to `/termin/?service=Aquafacial+%2B+Microneedling&offer=aquafacial-microneedling-aktion&price=170`.
- `/termin/` maps the service to Treatwell service detail id `TR4124140`.
- WhatsApp links open `wa.me/41792143462` with a prefilled message.
- Maps CTA opens Google Maps directions in a new tab.
- Legal links remain available in the landing page footer.

## 7. Copywriting Documentation

Main messaging angle:
Premium, personally adapted Zurich treatment for fresher, more radiant and smoother-looking skin through a structured Aquafacial + Microneedling combination.

Tone of voice:

- Premium but clear.
- Calm and trustworthy.
- Specific without sounding clinical.
- Conversion-focused without being pushy.
- Realistic and compliance-safe.

Hero copy:
The hero uses outcome-led language and a direct offer. It combines emotional desire (`strahlende`, `frischer`, `regenerierte Haut`) with rational clarity (`Kombi-Behandlung`, Zurich, CHF 170, 1 Std. 30 Min.). Visible copy always names the duration "1 Std. 30 Min.".

Offer copy:
Offer copy must always include the price anchor, duration and included steps. Keep the promotion transparent.

Benefit copy:
Benefits use realistic phrasing: `kann`, `wirken`, `optisch`, `gepflegt`, `Hautbild`, `Feuchtigkeit`.

Trust copy:
Trust copy emphasizes Teresa Stimac, 20+ years experience, review count, central Zurich location and realistic guidance.

CTA copy:

- Primary: `Jetzt Termin buchen`
- Secondary WhatsApp: `Per WhatsApp anfragen`
- Lead support: `Hautanalyse & Termin anfragen`
- Form submit: `Terminwunsch senden`
- Warm booking: `Kombi-Behandlung buchen`

FAQ copy:
FAQ answers should be short, practical and non-alarmist. They should acknowledge uncertainty, possible redness, individual reactions and after-care.

Form microcopy:
The form note reads `Keine Online-Zahlung. Das Studio meldet sich persönlich bei Ihnen.`; the section lead says the treatment is adapted on site.

Success message:
The form posts to `/api/contact`; backend success routing should use the current contact flow. If a future inline success message is introduced, recommended wording is: `Vielen Dank - Ihre Anfrage wurde gesendet. Wir melden uns persönlich bei Ihnen.`

Words or phrases to avoid:

- previous Hydro/Hydra treatment variants.
- guaranteed-result claims.
- medical treatment claims.
- absolute no-downtime wording.
- absolute pain-free wording.
- overly aggressive sales language.
- cheap discount language.

Words or phrases to use consistently:

- Aquafacial
- Microneedling
- Aquafacial + Microneedling
- Kombi-Behandlung
- Hautanalyse
- persönliche Abstimmung
- optisch feineres Hautbild
- frischerer Teint
- gepflegter Glow
- realistische Erwartungen
- Bahnhofstrasse 94
- Zürich

### Copy Table

| Page section | Current/final copy | Purpose | Notes / rationale |
| --- | --- | --- | --- |
| Hero kicker | `Aktion: Aquafacial + Microneedling in Zürich` | Immediate offer and local relevance | QA-pinned markup; renders as a sentence-case copper label. |
| Hero H1 | `Ganzheitliche Kombi-Behandlung für sichtbar strahlende, straffere und regenerierte Haut.` | Outcome-led above-the-fold message | QA-pinned. Strong but still cosmetic. |
| Hero subtitle | `Gründliche Aquafacial Pflege, intensive Feuchtigkeit und kontrolliertes Microneedling in einem Termin – ideal, wenn Ihre Haut müde, fahl oder unruhig wirkt.` | What the offer is and who it fits | One sentence. |
| Hero price | `Kombi-Angebot · 1 Std. 30 Min.` `CHF 170.–` `statt CHF 250.–` | Price anchor and value | Must stay consistent with the Treatwell bridge. |
| Hero CTAs | `Jetzt Termin buchen` / `Per WhatsApp anfragen` | Direct booking / low-friction question | Booking is the main action across the page. |
| Hero proof | `★★★★★ 4,8 aus 248+ Bewertungen` | Credibility at the CTA | Same wording as the treatment pages. |
| Offer headline | `Das ist im Kombi-Angebot enthalten` | Offer clarity right after the hero | Included items in treatment order, then the price card. |
| Desire headline | `Wenn Ihre Haut mehr braucht als Pflege zu Hause` | Problem/need framing | QA-pinned. |
| Steps headline | `Warum Aquafacial und Microneedling zusammen sinnvoll sein können` | Education | QA-pinned; three numbered photo cards. |
| Focus headline | `Zwei Behandlungsschritte, ein klares Hautziel` | What each step does | Infographic + two pinned column titles. |
| Trust headline | `Persönliche Behandlung statt Standardprogramm` | Differentiation | QA-pinned. |
| Expectation headline | `Realistische Ergebnisse statt übertriebener Versprechen` | Sets expectations | QA-pinned. |
| Process headline | `So läuft Ihr Termin in Zürich ab` | Practical expectation setting | Booking to after-care flow. |
| Lead headline | `Unsicher, ob die Kombi-Behandlung zu Ihrer Haut passt?` | Objection handling | Gives hesitant visitors a path. |
| Form CTA | `Terminwunsch senden` | Lead submission | More specific than a generic submit. |
| FAQ headline | `Häufige Fragen zur Kombi-Behandlung` | Objection handling | Eight questions. |
| Booking panel | `Direkt einen freien Termin wählen` | Warm-traffic booking | Shared `BookingCta`. |
| Location headline | `Bahnhofstrasse 94 · Zürich` | Arrival clarity | QA-pinned; kicker `Studio & Anfahrt` (pinned string). |
| Final headline | `Aquafacial + Microneedling für CHF 170.– statt CHF 250.–` | Closing action | Offer-led, like `/lp/aquafacial/`. |

## 8. Conversion Elements

| Element | What it does | Where it appears | Conversion role |
| --- | --- | --- | --- |
| Primary CTA | Sends ready users to booking bridge | Hero, process, final, sticky | Main conversion action. |
| Secondary WhatsApp CTA | Opens WhatsApp with prefilled treatment message | Hero, lead section, final, sticky | Captures visitors with quick questions. |
| Lead form | Captures treatment questions and appointment preferences | Lead section | Soft conversion for uncertain visitors. |
| Booking link | Passes service, offer and price to `/termin/` | Booking CTAs | Preserves campaign attribution and service intent. |
| Offer price card | Shows CHF 170 instead of CHF 250 next to the included services | Offer section (second) | Makes promotion concrete. |
| Price anchor | Shows regular price vs promo price | Hero, OfferBox, sticky, final | Communicates value. |
| Trust signals | "4,8 aus 248+ Bewertungen" under the hero CTAs; 20+ years, 4,8, 248+ in the trust section | Hero and trust section | Reduces trust friction. |
| Treatment images | Show real treatment-style visuals | Hero, step cards, trust, expectations, form | Adds premium proof and reduces text heaviness. |
| FAQ objections | Answers suitability, duration, price, redness, after-care | FAQ section | Reduces doubts before booking. |
| Location section | Shows address, map, route and opening hours | Near bottom | Removes logistical friction. |
| Final CTA | Repeats booking, WhatsApp and form options | Final dark section | Captures full-scroll visitors. |

Risk-reversal wording:
There is no guarantee or refund mechanism. The risk reducer is personal assessment, realistic expectation-setting and the option to ask via WhatsApp/form before booking.

Urgency / scarcity:
The page uses an `Aktionsangebot` and price anchor, but no artificial countdown or hard scarcity.

## 9. Lead Form Documentation

Form location:
`#anfrage-form` inside the lead section `#anfrage` ("Unsicher, ob die Kombi-Behandlung zu Ihrer Haut passt?").

Form purpose:
Capture qualified inquiries from visitors who are interested but unsure whether the combination suits their skin.

Form action:
`POST /api/contact`

Backend handling:
The Cloudflare Worker route `/api/contact` sends notification emails through Resend. Recipient resolution is `CONTACT_TO_EMAIL`, then `OWNER_EMAIL`, then fallback `info@beautyfacelift.ch`.

Hidden fields:

- `topic`: `Ich möchte einen Termin buchen`. It must be one of `CONTACT_TOPICS` in `shared/site.ts`, or the Worker rejects the form; `npm run qa:contact` checks this.
- `message`: `Aquafacial + Microneedling Terminwunsch`
- `source`: `aquafacial-microneedling-lp`
- `campaign`: `aquafacial_microneedling`. The Worker exempts it from Turnstile (`TURNSTILE_OPTIONAL_CAMPAIGNS`).

Required fields:

- `name`: Name
- `phone`: Telefon / WhatsApp
- `skinGoal`: Was möchten Sie verbessern?
- `preferredCallbackTime`: Wann passt Ihnen ein Termin?
- `privacyConsent`: Datenschutz consent checkbox

Optional fields:

- `email`: E-Mail
- `preferredContactMethod`: Kontaktweg, default `WhatsApp`
- `leadNote`: Kurze Nachricht, optional

Field labels and options:

- Name
- Telefon / WhatsApp
- E-Mail
- Kontaktweg: WhatsApp, Telefon, E-Mail
- Was möchten Sie verbessern?: Glow, Poren, Hautstruktur, Trockenheit, Frischer aussehen, Ich bin unsicher
- Wann passt Ihnen ein Termin?: Möglichst bald, Vormittag, Nachmittag, Abend
- Kurze Nachricht, optional

Placeholder text:
`z. B. empfindliche Haut, wichtige Termine, bisherige Erfahrungen`

CTA button text:
`Terminwunsch senden`

Privacy microcopy:
`Ich habe die Datenschutzerklärung gelesen und bin mit der Verarbeitung meiner Angaben zur Beantwortung meiner Anfrage einverstanden.`

Honeypot:
The hidden `company` field is used as spam protection.

Turnstile:
This LP has no Turnstile widget. Its `campaign` value `aquafacial_microneedling` is exempt in the Worker; spam protection is the honeypot plus the rate limit, as on `/lp/aquafacial/`.

Fixed on 2026-10-07. Until then this form could not deliver any lead on the live domain:
- the hidden topic "Ich möchte eine Behandlungsempfehlung" was not an allowed contact topic;
- the Worker required a Turnstile token the page never had.

`trackLead` still fired on submit, so Meta counted leads that never arrived.

Error behavior:
The form keeps `novalidate` (no native browser bubbles). On submit the page checks `form.checkValidity()`; if a required field is empty or the e-mail is malformed, submission is stopped, the fields get `aria-invalid="true"` and a bronze border, their labels turn bronze, a `role="alert"` summary (`Bitte prüfen Sie die markierten Felder.`) appears as the contact page's rounded, error-tinted panel and focus moves to the first invalid field. No lead is tracked for blocked submits. Backend contact errors still route to the existing contact error page copy. If the email service is unavailable, users are directed to call or email the studio.

Field styling:
Cream inputs inside a rounded paper form card. Inputs use the QA-pinned `--radius-input` token (now `--r-sm`, 12px). Labels are sentence case; the focus state is a copper border with a soft copper ring, as on the contact page.

Success behavior:
Backend contact success uses the existing contact flow. Recommended follow-up expectation is personal studio response, not instant automated consultation.

Tracking event:
On a valid submit, the LP calls `window.bflTracking?.trackLead` with email, phone, value `170`, currency `CHF` and source `aquafacial_microneedling_lp_form`, subject to marketing consent.

Since 2026-10-09:
- **Client checks:** the form applies the Worker's own email and phone rules (a dot in the email domain, 8–15 phone digits) before it submits. The Lead event therefore no longer fires for input the server would reject; it can still fire on rare server errors such as rate limits or email outages, because the form posts natively.
- **Attribution:** the form sends `offer`, `treatment`, `landing_page`, `page_path`, `page_url`, `referrer`, `utm_*`, `fbclid`, `gclid` and `msclkid`. They are filled from the URL or the `bfl_utm` session store, as on `/lp/aquafacial/`.
- **Hautziel:** the Worker reads `skinGoal`, so the skin goal appears in the email as "Hautziel".

## 10. SEO Documentation

SEO title:
`Aquafacial + Microneedling Zürich | CHF 170 statt CHF 250`

Meta description:
`90 Min. Aquafacial + Microneedling in Zürich: Hautanalyse, Glow, Feuchtigkeit und optisch feinere Hautstruktur. Persönlich bei Beauty Face Lift an der Bahnhofstrasse.`

H1:
`Ganzheitliche Kombi-Behandlung für sichtbar strahlende, straffere und regenerierte Haut.`

H2 structure:

- Das ist im Kombi-Angebot enthalten
- Wenn Ihre Haut mehr braucht als Pflege zu Hause
- Warum Aquafacial und Microneedling zusammen sinnvoll sein können
- Zwei Behandlungsschritte, ein klares Hautziel
- Persönliche Behandlung statt Standardprogramm
- Realistische Ergebnisse statt übertriebener Versprechen
- So läuft Ihr Termin in Zürich ab
- Unsicher, ob die Kombi-Behandlung zu Ihrer Haut passt?
- Häufige Fragen zur Kombi-Behandlung
- Direkt einen freien Termin wählen
- Bahnhofstrasse 94 · Zürich
- Aquafacial + Microneedling für CHF 170.– statt CHF 250.–

Target keyword:
`Aquafacial Microneedling Zürich`

Secondary keywords:

- Aquafacial Zürich
- Microneedling Zürich
- Aquafacial + Microneedling
- Gesichtsbehandlung Zürich
- Hautanalyse Zürich
- Glow Behandlung Zürich
- Bahnhofstrasse 94 Zürich

Local SEO signals:

- Studio name: Beauty Face Lift Zürich
- Address: Bahnhofstrasse 94, 8001 Zürich
- Phone: +41 79 214 34 62
- Google Maps embed and route link
- Opening hours from shared site data
- Zurich mentioned in title, metadata, headings and body copy

Canonical URL:
`https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/`

Index/noindex status:
`noindex, nofollow`. This is intentional because the page is a paid campaign LP under `/lp/`.

Sitemap status:
The paid LP is excluded from the sitemap by current `/lp/` policy. Related Aquafacial service and blog pages are included in the sitemap.

Internal links:

- Logo links to homepage.
- Privacy link inside form.
- Footer legal links: Impressum, Datenschutz, Kontakt.
- Booking bridge: `/termin/`.
- Optional lead anchors within the same LP.

Image alt text recommendations:
Current meaningful German alt texts are in place:

- `Aquafacial und Microneedling Behandlung bei Beauty Face Lift Zürich`
- `Aquafacial Behandlung zur Reinigung und Feuchtigkeitspflege`
- `Kosmetisches Microneedling mit professionellem Pen`
- `Infografik zur Wirkung von Aquafacial und Microneedling`
- `Beruhigende Abschlusspflege nach der Behandlung`
- `Persönliche Hautanalyse und Beratung in Zürich`
- `Frisch gepflegte Haut nach kosmetischer Gesichtsbehandlung`
- `Persönliche Behandlung im Beauty Face Lift Studio Zürich`

Schema markup:
The page includes Product and FAQPage JSON-LD. Product schema includes:

- Product name: Aquafacial + Microneedling Zürich
- Brand: Beauty Face Lift
- Price: CHF 170.00
- Offer URL: `/lp/aquafacial-microneedling/`
- Price valid until: `2026-12-31`

Schema notes:
Keep FAQ schema aligned with visible FAQ copy. Do not add unavailable ratings or medical outcome claims to structured data.

## 11. Tracking & Analytics Documentation

Tracking architecture:
The LP uses the shared landing layout and `src/lib/track.ts`. Marketing tracking is consent-controlled via `MarketingConsent`.

Google Tag Manager:
The layout supports `PUBLIC_GTM_ID`. GTM loads only after marketing consent.

GA4 events:
GA4 is expected to be handled through GTM if configured. Open question: confirm active GA4 measurement ID and event mapping in GTM.

Meta Pixel events:
Meta Pixel is supported through `PUBLIC_META_PIXEL_ID` and `window.fbq`, loaded after marketing consent.

Server-side Meta CAPI:
The tracking module posts CAPI events where configured.

Google Ads conversions:
Open question: confirm whether Google Ads conversion actions are configured inside GTM and whether `booking_button_click`, `treatwell_outbound_click` and `generate_lead` are mapped.

LinkedIn Insight Tag:
Not currently documented as active for this page. Add only if LinkedIn traffic becomes part of the campaign.

Form submit tracking:
Form submit calls `trackLead` with value `170`, currency `CHF` and source `aquafacial_microneedling_lp_form`, subject to marketing consent.

Button click tracking:
LP CTAs use `data-button-location`, including:

- `lp_hero_booking`
- `process_section_booking`
- `process_section_lead`
- `lead_section_booking`
- `lead_form_submit`
- `lp_final_booking`
- `lp_final_lead`
- `sticky_booking`

Phone click tracking:
Phone tracking is supported by shared tracking for `tel:` links. This LP primarily exposes phone in final address text, not as the dominant CTA.

WhatsApp click tracking:
WhatsApp links use reusable component or `data-track-contact="whatsapp"` with sources:

- `aquafacial_hero`
- `aquafacial_form`
- `aquafacial_final`
- `aquafacial_sticky`

Scroll depth tracking:
Shared tracking supports engagement events such as `scroll_50`, `scroll_90` and `time_on_page_30s`.

Thank-you page or success event:
The contact endpoint uses existing contact success handling. Booking happens through Treatwell after the `/termin/` bridge, so Treatwell outbound tracking should be monitored.

UTM parameters:
The landing layout persists UTM and ad click parameters in session storage:

- `utm_id`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `utm_source_platform`
- `gclid`
- `gbraid`
- `wbraid`
- `fbclid`
- `matchtype`
- `network`
- `device`

Conversion naming conventions:

- Landing page content name: `Aquafacial Microneedling Aktion`
- Treatment name: `Aquafacial + Microneedling`
- Service: `Aquafacial + Microneedling`
- Value: `170`
- Currency: `CHF`

Open tracking questions:

- Are `PUBLIC_META_PIXEL_ID` and `PUBLIC_GTM_ID` present in the production environment?
- Which GTM tags fire for `booking_button_click`, `treatwell_outbound_click`, `generate_lead`, `whatsapp_click`, `scroll_50` and `scroll_90`?
- Is Google Ads conversion tracking mapped to direct booking or only to form leads?
- Is Treatwell confirmation imported back into analytics, or is outbound click the final measurable onsite event?
- Should the lead form success route trigger a dedicated thank-you page event?

## 12. Campaign Message Match

Main ad promise:
Aquafacial + Microneedling in Zürich for fresher, more radiant and smoother-looking skin at CHF 170 instead of CHF 250.

Landing page headline match:
The H1 mirrors the premium transformation angle while keeping the treatment and local offer visible through the eyebrow and offer card.

Offer consistency:
All main offer surfaces use CHF 170, CHF 250, 90 minutes, Aquafacial + Microneedling and the same booking bridge parameters.

Visual consistency:
Ad visuals should use the same premium studio/treatment image direction as the LP: clean, bright, personal, no logo overlay, no text overlay inside images.

CTA consistency:
Ads should send high-intent users to `Jetzt Termin buchen` behavior. The landing page also supports WhatsApp for lower-friction questions.

Expected user intent:

- Meta/TikTok cold traffic: wants a visible beauty outcome and needs trust/education.
- Google Ads high-intent traffic: wants service, price, location and booking.
- Retargeting: may respond to the offer price and limited campaign framing.

Suggested ad hooks:

- `Aquafacial + Microneedling in Zürich`
- `90 Minuten Glow, Feuchtigkeit und kosmetische Hautverfeinerung`
- `Kombi-Behandlung an der Bahnhofstrasse 94`
- `CHF 170 statt CHF 250`
- `Persönlich abgestimmt bei Beauty Face Lift Zürich`
- `Für frischer und gepflegter wirkende Haut`

Suggested ad copy direction:

- Keep treatment name and offer visible in the first line.
- Mention Zurich/Bahnhofstrasse for local intent.
- Avoid medical-result wording.
- Avoid overly aggressive discount framing.
- Use a premium, calm call to action.

Retargeting angle:
Retarget visitors who viewed the page but did not click booking with a message around personal assessment, after-care and the prepared CHF 170 booking offer.

## 13. Compliance & Risk Notes

Claims that must be avoided:

- Medical treatment, healing or diagnosis claims.
- Guaranteed skin tightening or wrinkle removal.
- Guaranteed pore disappearance.
- Absolute no-downtime or pain-free claims.
- Claims that the same result appears for everyone.
- Unsupported before/after claims.

Legal or brand restrictions:

- The previous Hydro/Hydra treatment naming variants must not appear in page copy, metadata, structured data, file names, tracking labels, alt text, ad copy or URL slugs.
- The final campaign route is `/lp/aquafacial-microneedling/`.
- Old campaign routes should not be linked internally.

Medical or beauty claims that should be softened:

- Use `kann kosmetisch unterstützen` instead of direct biological certainty.
- Use `optisch feiner`, `glatter wirkend`, `frischer wirkend` instead of absolute transformation.
- Use `Rötungen oder Empfindlichkeit möglich` when discussing Microneedling after-effects.

Pricing or offer conditions:

- Keep CHF 170 and CHF 250 visible together.
- Keep 90 minutes visible.
- Keep included services visible.
- Confirm campaign end date or price validity before changing `priceValidUntil`.

Privacy / consent considerations:

- The form includes privacy consent.
- Marketing tracking is consent-controlled.
- UTM persistence should not store sensitive personal data.
- Contact email sending depends on Resend and environment variables.

Disclaimers that may be needed:

- Treatment suitability is assessed on site.
- Individual reactions and results vary.
- After-care instructions should be followed for 24-48 hours.
- Visitors with irritated skin, sunburn or acute inflammation should clarify before treatment.

## 14. QA Checklist

Use this checklist before campaign launch or after any LP change.

- [x] URL works: `/lp/aquafacial-microneedling/`
- [x] Desktop layout works
- [x] Mobile layout works
- [x] Primary CTA works
- [x] WhatsApp CTA works
- [x] Form posts to `/api/contact`
- [x] Booking link routes through `/termin/`
- [x] `/termin/` maps service to Treatwell service detail id `TR4124140`
- [x] Meta title and description are correct
- [x] H1 is correct
- [x] Canonical is correct
- [x] Images load correctly
- [x] Hero image is eager/priority loaded
- [x] Non-hero images lazy-load
- [x] No forbidden old treatment naming remains
- [x] No outdated old CTA text remains
- [x] No visible mobile hero bullet clutter
- [x] Mobile sticky bar starts hidden
- [x] Mobile sticky bar is gated by hero scroll position
- [x] Legal pages are linked
- [x] Cookie / marketing consent remains active
- [x] Custom LP QA script passes: `npm run qa:aquafacial-combo-lp`
- [x] Build passes: `npm run build`
- [x] Documentation guard passes: `npm run qa:docs`
- [ ] Confirm production Meta Pixel ID is set
- [ ] Confirm production GTM ID is set
- [ ] Confirm GTM conversion mappings
- [ ] Confirm Resend production email delivery for `/api/contact`
- [ ] Confirm ad platform URLs point to the final Aquafacial LP URL
- [ ] Confirm Treatwell landing opens the intended service detail page after browser redirect
- [ ] Monitor page speed and LCP after campaign traffic starts

Known QA limitations:

- `npm run lint` is not available in this repo.
- `npm run typecheck` is not available in this repo.
- `npm run astro -- check` passes with 0 errors since the 2026-10-06 code-health cleanup (previously failed on repo-wide type issues outside this LP).
- `npm run qa:worker` has a local `/termin/` 301 issue, but live booking bridge HTML has been verified.

## 15. Future Optimization Notes

A/B test ideas:

- Hero headline: outcome-led headline vs more direct offer headline.
- Hero media: current single treatment photo (Teresa at work) vs one consultation-led image.
- Price card: compact offer card vs more detailed included-items card above the fold.
- Primary CTA copy: `Jetzt Termin buchen` vs `Termin für CHF 170 buchen`.
- Secondary CTA order: WhatsApp in hero vs no secondary hero CTA for high-intent Google Ads.

Copy tests:

- More local framing: `an der Bahnhofstrasse 94` in hero subtitle.
- More treatment education: add a short `Für wen geeignet` sentence above CTA.
- More premium framing: emphasize personal treatment by Teresa earlier.
- More anti-aging framing while keeping claims soft.

CTA tests:

- Sticky bar with only booking vs booking + WhatsApp.
- Final CTA with two actions vs three actions.
- Lead form CTA `Terminwunsch senden` vs `Persönliche Einschätzung anfragen`.

Hero section tests:

- Move trust line above price card.
- Show price card closer to CTA on mobile.
- Test tighter hero height for paid search traffic.

Offer presentation tests:

- Add campaign availability copy if real.
- Add short `Was enthalten ist` list directly below price for mobile.
- Test removing warm `Kombi-Behandlung buchen` CTA in the mid-offer section if it creates too much CTA repetition.

Form tests:

- Shorter form with only name, phone, skin goal and privacy consent.
- Add inline success state.
- Route form success to a dedicated thank-you URL for clearer tracking.

Image tests:

- Consultation image in trust section vs treatment close-up.
- Post-treatment glow image near hero vs later expectation section.
- Test infographic scale on mobile if users scroll past educational sections quickly.

Retargeting improvements:

- Retarget non-click visitors with personal assessment messaging.
- Retarget WhatsApp clickers with direct booking reminder.
- Retarget form abandoners with lower-friction WhatsApp ad.

CRO improvements:

- Add approved testimonial snippets if available.
- Add clearer `online buchen` microcopy near booking CTAs.
- Add treatment suitability microcopy near CTA for cautious visitors.
- Track CTA click distribution by section to identify weak sections.

SEO improvements:

- Keep LP noindexed while it remains a paid campaign page.
- If the page becomes evergreen SEO content, remove `/lp/` noindex policy deliberately, strengthen internal links and update sitemap strategy.
- Continue using separate service pages for organic SEO.

## 16. Final Summary

This landing page is a live paid campaign page for the Aquafacial + Microneedling combination treatment at Beauty Face Lift Zürich. It is designed for people in Zürich and nearby areas who want fresher, more radiant and smoother-looking skin and want a premium, personally adapted treatment rather than a generic beauty offer.

The main campaign message is:
Aquafacial + Microneedling in Zürich, personally adapted at Beauty Face Lift, CHF 170 instead of CHF 250 for a 90-minute treatment with analysis, treatment, after-care and clear guidance.

The key conversion elements are:

- primary direct booking CTA.
- prepared booking bridge with service, offer and price.
- WhatsApp as a low-friction support path.
- secondary lead form for uncertain visitors.
- price anchor and included-services panel.
- trust signals: rating, review count, experience, Teresa Stimac and Bahnhofstrasse location.
- realistic FAQ and after-care copy.
- mobile sticky booking bar after hero scroll.

What makes the page strong:

- It keeps one offer and one main action.
- It explains the treatment combination clearly.
- It feels premium and local to Zürich.
- It avoids exaggerated claims.
- It uses strong imagery without making the page feel like a discount ad.
- It provides multiple conversion paths without making the form the main focus.

What still needs monitoring:

- ad platform destination URLs.
- conversion event mappings in GTM/Meta/Google Ads.
- Treatwell service detail behavior after redirect.
- form email delivery through Resend production settings.
- real campaign conversion rates by CTA location.
- mobile scroll depth and sticky CTA interaction.
- whether the noindex policy remains appropriate if the page becomes evergreen.
