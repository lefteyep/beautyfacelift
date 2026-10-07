# Image Brief

Current image assets are mostly stock/placeholder with heavy cross-page reuse. Same 3-4 files shown with mismatched alt text across all 4 treatment pages — works for launch but reads as clearly generic to anyone looking.

**Replace priority:**
1. **Teresa's portrait** — must be a real photo. AI-generated founders destroy E-E-A-T and are ethically questionable. Schedule a photoshoot or use an existing headshot.
2. **Studio interior shots** — also best as real photos (builds trust, Google Business Profile will want them too).
3. **Treatment cards + content images** — AI-generated is fine as a stopgap. Prompts below.

## Brand style (use for every prompt)

Suffix every generation prompt with this style block so results stay on-brand:

```
Style: editorial beauty photography, warm natural light, premium medical-spa aesthetic,
stone and bone color palette (#EDEBE6, #F7F6F2), subtle gold accents (#CFA65E),
clean minimal composition, soft focus backgrounds, high-end Zurich urban luxury feel,
professional, timeless, no text or logos in image, shot on Hasselblad 50mm f/1.4.
```

Recommended model: Flux Pro or Midjourney v6+. DALL-E 3 works but has trouble with the warm-natural-light look.

---

## Images needed

### Homepage hero (critical — top of site)

**`public/assets/hero_center.png`** — 1200×800
> Interior of a premium Zurich medical spa reception area, soft morning light through large windows, stone-colored walls, a single elegant treatment chair in the foreground draped in bone-white linen, small gold-rimmed mirror on a marble console, a single white peony in a minimal vase. No people. Editorial, aspirational, calm.

**`public/assets/hero_right.png`** — 600×800 (vertical)
> Close-up of a woman's hands receiving a gentle facial massage, soft gloved fingertips pressing into skin, partial face visible from the cheek down, serene expression, warm diffused light, cream-colored linens, shallow depth of field.

---

### Treatment cards (600×500 each — homepage + /behandlungen/ overview)

**`public/assets/aquafacial_treatment.png`**
> A Aquafacial treatment head (rounded metallic tip with clear vacuum tube) being gently held by a gloved hand against a woman's cheek, water droplets visible, soft glow on the skin, close-up, shallow DOF. Emphasize the distinctive vortex-tip device.

**`public/assets/microneedling_treatment.png`**
> A microneedling dermaroller or pen device on a white marble surface next to a small glass bottle of hyaluronic serum, overhead shot, single light source, minimal styling. Alternatively: close-up of a microneedling pen being guided across a forehead, soft red micro-dots just visible.

**`public/assets/peeling_treatment_new.png`**
> Overhead flat-lay of a glass bowl containing pale yellow AHA peel solution, a small brush applicator, citrus peels (lemon, orange zest) arranged minimally, marble surface, soft side light.

**`public/assets/coldplasma_treatment.png`**
> A cold plasma wand device emitting a faint blue-violet glow being held near a woman's forehead, dark neutral background, dramatic but soft lighting, the glow is the focal point, cinematic. Emphasize the plasma light.

---

### Treatment page heroes (large)

**`public/assets/spa_facial_treatment.png`** — used as hero on Aquafacial + ColdPlasma, content on Microneedling + Fruchtsäure (ideally split into 2-3 unique images)
> A woman lying on a treatment bed with her eyes closed, a white headband, receiving a facial treatment, gloved hand of the therapist visible applying serum, soft warm light from the side, cream linens, peaceful expression. Cropped tight on the face and hands.

**Consider splitting into:**
- `hero_aquafacial.png` (1200×800) — specific to Aquafacial with the vortex tool visible
- `hero_coldplasma.png` (1200×800) — with the plasma glow
- `content_microneedling.png` (800×960) — with the microneedling device
- `content_fruchtsaeure.png` (800×960) — with the peel bowl and applicator

### Studio interior (reused 8× currently — needs more variety)

**`public/assets/spa_interior.png`** — split into multiple real photos:
- `studio_reception.png` (800×960) — entrance / welcome area
- `studio_treatment_room_1.png` (800×960) — the treatment bed + equipment
- `studio_treatment_room_2.png` (800×960) — different angle, showing detail
- `studio_products_shelf.png` (800×960) — skincare products on display

AI prompt for each (in the absence of real photos):
> A single element of a minimalist Zurich medical spa interior, stone-colored walls, brushed brass fixtures, cream linens, a single peony or branch of eucalyptus, morning light, editorial interior photography. Shot on medium format film.

### Product / serum shots

**`public/assets/spa_products.png`** — used 4× (again, split into variants)
> Flat-lay overhead: three amber-glass dropper bottles with minimal cream-colored labels, arranged diagonally on a stone-textured surface, a single white peony petal for scent cue, warm overhead light, no text legible on labels.

---

### Founder portrait — DO NOT AI-GENERATE

**`public/assets/teresa_portrait.jpg`** — 540×650
Real photo required. Shoot brief:
- Vertical format, 540×650 minimum (shoot at 2×)
- Warm natural daylight, ideally near a north-facing window
- Wardrobe: neutral tone (cream, stone, soft taupe), minimal jewelry
- Expression: warm, approachable, confident — professional but not clinical
- Background: soft-focus spa interior OR clean stone wall
- Include both a crop-friendly headshot and a ¾-body shot for flexibility on other pages

Until a real photo exists, leave the current placeholder — do not replace with AI.

---

## Workflow when generating

1. Generate at 2× target dimensions for retina quality (e.g., 2400×1600 for hero_center).
2. Export as PNG for transparency-safe assets, JPG (quality 85) for photographic assets.
3. Run through an optimizer (squoosh.app, tinypng.com) before committing.
4. Target file sizes: heroes ≤200 KB, cards ≤80 KB, content images ≤120 KB.
5. Keep alt text in the Astro pages — it's SEO-optimized and accurate enough for any reasonable image variant.
6. Drop new files into `public/assets/` with the exact filenames above to avoid code changes.

## After new images land

Run `npm run build` locally first — Astro will throw clear errors if any image path 404s. Then push to master, CI deploys automatically.
