# Exosome Therapie Page

Date: 2026-05-06

## URL

- Local route: `/behandlungen/exosome-therapie-zuerich/`
- Canonical: `https://beautyfacelift.ch/behandlungen/exosome-therapie-zuerich/`

## Scope

Added a new German treatment page for Exosome Therapie at Beauty Face Lift Zurich. The page is built as a native Astro treatment page and follows the existing Beauty Face Lift layout, treatment navigation, CTA structure, schema patterns, and editorial tone.

## Content Strategy

- Primary keyword: `Exosome Therapie`
- Local keyword focus: `Exosome Therapie Zuerich`, `Exosome Gesichtsbehandlung Zuerich`
- Secondary terms: `Exosome Behandlung`, `Exosomen Haut`, `Exosomen Serum`, `Exosomen Kosmetik`, `Microneedling mit Exosomen`, `regenerative Hautpflege`, `Hautregeneration Gesicht`
- Search intent: users comparing a new regenerative cosmetic facial treatment, looking for realistic benefits, safety, combinations with microneedling, and local booking in Zurich.

## Medical and Compliance Positioning

The page avoids disease-treatment, stem-cell, permanent rejuvenation, and guaranteed-result claims. It distinguishes between natural extracellular vesicles and cosmetic biomimetic or exosome-like serum technology. Benefits are framed as cosmetic skin-quality support, with clear notes that evidence is promising but still developing and that individual results can vary.

## SEO and AIO/GEO Elements

- SEO title: `Exosome Therapie Zuerich | Beauty Face Lift`
- Meta description length: 137 characters
- Definition block near the top for AI extraction
- Direct question-answer headings and FAQ content
- FAQPage JSON-LD
- BreadcrumbList JSON-LD
- Service JSON-LD without misleading medical procedure claims
- Internal links to Hydrafacial, Microneedling, ColdPlasma, treatment overview, FAQ, and booking
- Added to `llms.txt` and `llms-full.txt` for AI crawler context

## Implementation Touchpoints

- New page: `src/pages/behandlungen/exosome-therapie-zuerich/index.astro`
- Navigation: `shared/site.ts`
- Homepage treatment entry and schema: `src/pages/index.astro`
- Treatment overview entry: `src/pages/behandlungen/index.astro`
- FAQ references: `src/pages/haeufige-fragen/index.astro`
- Comparison page references: `src/pages/behandlungen/vergleich/index.astro`
- AI crawler files: `public/llms.txt`, `public/llms-full.txt`

## Verification

- `npm run build`
- Local HTTP 200 check on `/behandlungen/exosome-therapie-zuerich/`
- Generated HTML meta title and description length check
- JSON-LD parse check for FAQPage and BreadcrumbList
- Sitemap check for the new canonical route
- Desktop and mobile headless Chrome visual checks
