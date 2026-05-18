# Beauty Face Lift Imagery Upgrade

Date: 2026-04-24
Post-launch note as of 2026-05-07: workers.dev references in this historical imagery note are no longer production URLs. Current production site: https://beautyfacelift-zuerich.ch/

Historical site: https://beautyfacelift.mediapaulo.workers.dev/
Historical design system: https://beautyfacelift.mediapaulo.workers.dev/admin/design-system/

## Objective

Upgrade the website imagery so Beauty Face Lift feels premium, editorial, modern, elegant, trustworthy, calm, warm, and aligned with a high-end facial aesthetics studio in Zurich.

## Source Of Truth

The design system defines the active visual identity:

- Warm paper-neutral background palette.
- Restrained dark-gold luxury accent.
- High whitespace, calm hierarchy, and editorial pacing.
- Premium but understated treatment imagery.
- Natural skin texture and believable treatment context.
- No blue hospital lighting, over-smoothed skin, glamour advertising, generic stock-photo mood, loud colors, or filler imagery.

## Audit Summary

### Homepage Hero CTA

The two primary homepage hero buttons had visually inconsistent widths because
their layout was still content-sized. The CTA group now uses a fixed responsive
column width and both links stretch to 100%, so "Jetzt Termin buchen" and
"Behandlungen entdecken" render with matching widths across desktop and mobile.

### Hero

The homepage hero needed a stronger brand-defining image. The previous imagery did not carry enough premium editorial trust or immediate emotional pull.

Change: replaced the central hero image with a warm editorial beauty portrait.

### Treatment Imagery

The treatment family needed more cohesive photographic direction. Microneedling and Fruchtsaeure Peeling especially needed treatment-relevant imagery that still felt elegant and non-clinical.

Changes:

- Microneedling treatment image replaced.
- Fruchtsaeure Peeling treatment image replaced.
- ColdPlasma treatment image replaced twice: first with a warmer editorial treatment image, then again on 2026-04-24 after the live URL `/_astro/coldplasma_treatment.ZyMYud8k_ZqWWDH.webp` was flagged for replacement.
- Hydrafacial primary treatment image was kept because it already fit the visual system better than a speculative replacement.

### About / Teresa

No legitimate founder portrait source was available. A fake founder portrait would reduce trust.

Change: replaced the founder-like image strategy with a non-identifying consultation/trust image. The imagery supports expertise without fabricating Teresa's identity.

### Supporting Sections

Only sections where imagery clearly improved trust, context, or conversion received images. Testimonials, FAQ, trust-strip, and several text-led sections were intentionally left typographic.

## Generated Assets

All final project-bound generated assets were copied into the repository and are not referenced from the Codex generated-image cache.

- `src/assets/marketing/hero_editorial_portrait.png`
- `src/assets/marketing/microneedling_treatment_editorial.png`
- `src/assets/marketing/peeling_treatment_editorial.png`
- `src/assets/marketing/coldplasma_treatment_editorial.png`
- `src/assets/marketing/consultation_trust.png`
- `src/assets/marketing/coldplasma_treatment.png` (legacy source replaced with the same new ColdPlasma image)
- `public/assets/hero_editorial_portrait.png`
- `public/assets/microneedling_treatment_editorial.png`
- `public/assets/peeling_treatment_editorial.png`
- `public/assets/coldplasma_treatment_editorial.png`
- `public/assets/consultation_trust.png`
- `public/assets/coldplasma_treatment.png` (legacy static copy replaced with the same new ColdPlasma image)

The public copies are used for OG/schema/static references. The `src/assets` copies are used by Astro's responsive image pipeline.

## Final ColdPlasma Replacement

The live image requested for replacement was:

`https://beautyfacelift.mediapaulo.workers.dev/_astro/coldplasma_treatment.ZyMYud8k_ZqWWDH.webp`

That URL is an Astro-generated hashed build artifact, not a stable source asset URL. The active source replacement is:

`src/assets/marketing/coldplasma_treatment_editorial.png`

After rebuild/deploy, Astro emits a new hashed WebP asset path for the replacement. The old hashed URL should not be treated as a permanent content URL.

## Integration

Primary integration points:

- `src/lib/site-images.ts`: central image registry updated to use the generated premium imagery.
- `src/layouts/Base.astro`: default OG image updated to the new hero editorial image.
- `src/pages/index.astro`: homepage hero, treatment cards, about/trust imagery, structured data image, and hero preload updated.
- `src/pages/behandlungen/index.astro`: treatment overview card imagery updated.
- `src/pages/behandlungen/microneedling-zuerich/index.astro`: hero, structured data, and responsive widths updated.
- `src/pages/behandlungen/fruchtsaeure-peeling-zuerich/index.astro`: hero, support image, structured data, and responsive widths updated.
- `src/pages/behandlungen/coldplasma-zuerich/index.astro`: hero, structured data, and responsive widths updated.
- `src/pages/behandlungen/hydrafacial-zuerich/index.astro`: kept primary Hydrafacial treatment image; replaced duplicate/supporting consultation image with the non-identifying trust image.
- `src/pages/ueber-uns/index.astro`: replaced fake/founder-like imagery with consultation/trust image and moved raw images into Astro Image where appropriate.
- `src/pages/admin/design-system.astro`: replaced placeholder imagery tiles with real visual examples that match the system.
- `src/styles/components.css`: added mobile hero eyebrow wrapping rules to prevent clipping on small screens.

## Performance Measures

- Astro `Image` is used for project imagery wherever practical.
- Responsive `widths` and `sizes` are set for hero, cards, and supporting images.
- WebP output is generated by Astro for optimized delivery.
- Non-critical images remain lazy-loaded.
- The homepage hero image is preloaded with `fetchpriority="high"` for LCP.
- Width lists are capped to avoid CSS upscaling beyond generated source dimensions.
- Explicit dimensions are provided through Astro image metadata to reduce layout shift.
- Quality is set to `high` where premium skin/detail rendering matters.

## Accessibility And SEO

- Alt text was updated to describe the actual image content without claiming fabricated identities.
- OG image and structured data image references now point to the new premium imagery.
- The About/Teresa section avoids implying the consultation image is a real founder portrait.

## Sections Intentionally Left Unchanged

- Hydrafacial primary image: already treatment-relevant and visually compatible.
- Studio/interior/product atmosphere images: retained where they supported a real studio feel.
- Testimonials and trust indicators: stronger as text/social proof than decorative image blocks.
- FAQ and many conversion sections: left typographic to preserve whitespace and hierarchy.

## Prompts Used

### Hero Editorial Portrait

Use case: photorealistic-natural. Asset type: homepage hero. Primary request: premium aspirational beauty/skincare image for a high-end Zurich facial aesthetics studio. Scene/backdrop: warm paper-neutral studio with refined Swiss-luxury atmosphere. Subject: adult woman in ivory spa robe with radiant natural skin, calm confident expression. Style/medium: premium editorial beauty photography. Composition/framing: portrait crop, elegant negative space, homepage hero ready. Lighting/mood: soft flattering warm light, calm, trustworthy, refined. Constraints: natural skin texture, realistic, polished but believable. Avoid: stock photo look, blue clinical light, plastic skin, glamour posing, oversmoothing, loud colors, text, watermark.

### Microneedling

Use case: photorealistic-natural. Asset type: treatment hero/card. Primary request: premium microneedling treatment image. Scene/backdrop: warm high-end aesthetics studio. Subject: practitioner performing microneedling on cheek in a believable, clean, calm treatment context. Style/medium: editorial treatment photography. Composition/framing: horizontal crop-safe image for hero/card use. Lighting/mood: soft warm light, trustworthy, medical-aesthetic but not sterile. Constraints: natural skin texture, professional device, no excessive redness. Avoid: blood, irritation, blue lighting, generic stock look, over-smoothed skin, text, watermark.

### Fruchtsaeure Peeling

Use case: photorealistic-natural. Asset type: treatment hero/card. Primary request: premium Fruchtsaeure Peeling treatment image. Scene/backdrop: warm neutral treatment room. Subject: practitioner applying a transparent peel with a soft brush to the face. Style/medium: realistic editorial beauty treatment photography. Composition/framing: crop-safe horizontal image. Lighting/mood: calm, refined, warm. Constraints: treatment-relevant, elegant, believable. Avoid: lemon still life, product flat lay, harsh redness, blue clinical lighting, fake results, text, watermark.

### ColdPlasma Initial Replacement

Use case: photorealistic-natural. Asset type: treatment hero/card. Primary request: warm ColdPlasma treatment image for a premium aesthetics studio. Scene/backdrop: warm dimmed treatment room. Subject: practitioner using ColdPlasma device near the face with subtle violet glow. Style/medium: editorial treatment photography. Composition/framing: horizontal crop-safe image. Lighting/mood: refined, quiet, trustworthy. Constraints: subtle localized plasma light only. Avoid: sci-fi effects, hospital blue, harsh glow, overproduction, plastic skin, text, watermark.

### Consultation / Trust

Use case: photorealistic-natural. Asset type: about/trust section. Primary request: non-identifying consultation image that supports expertise without inventing a real founder portrait. Scene/backdrop: premium studio consultation setting. Subject: hands/partial shoulders only, practitioner holding mirror or skin-analysis card. Style/medium: editorial beauty consultation photography. Composition/framing: portrait crop, calm negative space. Lighting/mood: warm, personal, trustworthy. Constraints: no recognizable face, no fake Teresa portrait. Avoid: identity fabrication, generic stock mood, clinical blue light, text, watermark.

### Final ColdPlasma Replacement On 2026-04-24

Use case: photorealistic-natural
Asset type: website treatment hero and treatment card for a premium facial aesthetics studio in Zurich
Primary request: Create a new ColdPlasma facial treatment image that replaces an existing dark, generic-looking treatment shot with a more premium, editorial, trustworthy, warm Swiss-luxury aesthetic.
Scene/backdrop: high-end beauty and facial aesthetics studio, warm paper-neutral treatment room, softly lit, minimal refined interior, no hospital-blue clinical atmosphere.
Subject: a calm adult woman receiving a ColdPlasma facial treatment from a professional practitioner; practitioner hand holding a sleek plasma device near the cheek or upper face; subtle controlled violet plasma glow only at the treatment tip; natural skin texture and believable treatment context.
Style/medium: photorealistic premium editorial beauty photography, polished but realistic, photography-first, no fake UI, no illustration.
Composition/framing: horizontal 3:2 image, crop-safe for wide page hero and 4:5 treatment card; face angled elegantly, treatment device visible, enough negative space and warm background depth for overlay readability.
Lighting/mood: soft flattering warm light, calm, refined, trustworthy, premium but understated.
Color palette: warm paper neutrals, beige, ivory, soft taupe, restrained dark-gold undertones; violet glow must be subtle and localized.
Materials/textures: natural skin texture, clean robe or treatment linens, premium matte device, no plastic skin.
Constraints: high-resolution, crisp, realistic, elegant, non-sterile, medically aesthetic but not cold.
Avoid: stock photo look, blue clinical lighting, sci-fi plasma effects, harsh neon glow, over-smoothed or plastic skin, blood, irritation, unrealistic results, heavy glamour posing, loud colors, visible logos, text, watermark, fake founder identity.

## Model Availability Note

The Codex built-in `image_gen` tool was used. This environment does not expose an explicit image model selector or model ID readout for that built-in tool. Therefore the work used the newest/default OpenAI image generation path available through Codex, but the exact backend model name cannot be certified from this interface.

## QA

Completed:

- `npm run build` passed.
- 28 static pages built.
- Astro generated optimized WebP variants for responsive delivery.
- Desktop and mobile screenshots were inspected during implementation.
- Mobile hero eyebrow clipping found during QA was fixed with an intentional mobile line break and wrapping rules.
- Temporary QA screenshots were removed before publishing.

## Follow-Up Recommendations

- Commission a real founder/Teresa portrait shoot. This would outperform any generic trust image and improve authenticity.
- If budget allows, create a full real studio shoot with the same art direction so AI/generated treatment imagery can eventually be replaced by proprietary photography.
- Use stable public asset URLs for external references; avoid relying on `_astro` hashed build artifact URLs because they change on rebuild.
