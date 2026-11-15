# Round 7 · five new styles from Pinterest, three ads each (15 ads, generated 2026-11-05)

> **Round 7 has been generated (2026-11-05); its code is in PR #76. For any further run of these prompts: no session acts on this plan by itself.** Generating costs money (paid OpenAI API) and uploads Teresa's real portrait and generated images of her to OpenAI. Before anything is generated: (1) the user gives an explicit go in chat for this round, its cost ceiling and the motifs, (2) the orchestrator board (`docs/orchestrator/STATUS.md` in the main copy) has an entry with the worker, worktree and branch, (3) the user provides the key at runtime in the terminal; it is never stored. Results are not pushed to the source branch of #73; they go to a new `codex/*` branch in its own worktree, and every image that shows Teresa stays outside the repository in `../ads/2026-11-carbon-runden-3-6/` until her written OK.

Status 2026-11-05, evening: **round 7 has been generated** on the user's go. The code (prompts, scripts, log) is in PR #76 (branch `codex/carbon-ad-round-7`); no ad file is on GitHub. The finals without Teresa are in the user's ads folder `../ads/carbon_microneedling/`, the four finals with Teresa and all raw files in `../ads/2026-11-carbon-runden-3-6/`. Before that: research done in the user's logged-in Chrome, fifteen prompts written in [motifs_r7.py](motifs_r7.py). This computer holds no OpenAI key (the Codex CLI is logged in through ChatGPT, not with an API key, and no `OPENAI_API_KEY` is set), so the generation waits for the key.

Round 6 ([ROUND6-PLAN.md](ROUND6-PLAN.md), ten formats from the public Pinterest ideas page) was generated separately on 2026-11-05; its finals are kept locally. It is not part of this round.

## Research (2026-11-05, de.pinterest.com, logged in)

Searches: «beauty clinic instagram ad design facial», «carbon peeling microneedling ad instagram», «skincare ad creative design», «aesthetic clinic instagram post design offer», «beauty salon promotion social media post discount», «bento grid instagram post design beauty», «skincare clinic ad face annotation lines infographic», «sticker style instagram ad design cosmetics», «big typography photo inside letters poster beauty ad», «color block skincare product ad bold headline». Pin images are not stored here (third-party content); only the patterns are.

| Pattern that recurs | Why it stops the scroll | Round-7 style |
|---|---|---|
| A photo knocked out inside giant letters or digits (poster-style words, single-letter portraits) | one huge shape, the image inside it; reads as a poster, not an ad | `knockout` |
| A face or treatment photo with thin pointer lines and small labels, the clinical-editorial look of aesthetic clinics | looks informative and precise; the eye follows the lines | `facemap` |
| One flat saturated colour, one huge hero product with a hard shadow, chunky grotesk type (skincare launches) | maximum contrast in the feed, product and price in one glance | `colorblock` |
| Modular tile grids («social media design» kits, bento page layouts), one fact per tile | scannable; price, duration, proof and photo without reading a paragraph | `bento` |
| Die-cut stickers, round price badges and starbursts peeled over a photo (promo posts, seals, «%» stickers) | native, playful, the price is the biggest sticker | `sticker` |

Seen and left out: dark navy or plum luxury with gold (close to `carbon-gold` and `neon-studio`); editorial arch kits in burgundy and sand (calm, close to round 3, which the user rejected); before/after (banned); price menus and step lists (covered by `clay-steps` and the round-6 `toggles`); seasonal and countdown posts (the end date may move); chat and AI look-alikes (excluded in round 6); stock model sets smiling into the camera.

## The five styles and how they differ from rounds 4 to 6

| Style | Device | Differs from |
|---|---|---|
| `knockout` | the treatment photo (or Teresa) lives inside a giant number, word or letter; ivory or charcoal field, hairline frame | `swiss-poster` (solid red digits), `carbon-brush` (ink stroke), `cover` (magazine) |
| `facemap` | hairline pointers from neutral dots to step labels; pale grey-blue or sand; no red marks, no problem zones | `clay-steps` (3D path), round-6 `toggles` and `orbit` (lists and icons) |
| `colorblock` | one flat colour (terracotta, sage, lilac), one huge photoreal hero object or cut-out, hard offset shadow, heavy grotesk | `glass-30` (pastel glass), `pop-art` (comic), `carbon-gold` (black and gold) |
| `bento` | rounded tiles with equal gaps, one fact per tile, photos as tiles | `collage` (paper and tape), round-6 `storyboard` (photo grid), `duo-split` |
| `sticker` | glossy die-cut vinyl stickers with white borders over a full-bleed photo | `collage` (polaroids, handwriting), round-6 `pov-caption` (subtitle caption) |

## The fifteen ads

Each style tests three messages: the offer, the course of the treatment, and trust. Within a style only the message changes; across the set only the style changes.

| Name | Style · message | Shown | References | Teresa |
|---|---|---|---|---|
| `knockout-175` | knockout · offer | «175» filled with the Carbon photo | `maske-v2` | no |
| `knockout-carbon` | knockout · course | «CARBON» filled with the photo, pen card | `maske-v2`, `pen-v2` | no |
| `knockout-teresa` | knockout · trust | letter «B» filled with Teresa | `teresa_portrait.jpg`, `maske-v2` | yes |
| `facemap-schritte` | facemap · course | portrait with four step labels | `ruhe` | no |
| `facemap-hautanalyse` | facemap · trust | Teresa looks at the client's skin, three labels | `hautanalyse` (generated from her portrait) | yes |
| `facemap-flatlay` | facemap · offer | treatment table, three object labels | `stillleben-v2` | no |
| `colorblock-pen` | colorblock · course | terracotta, the pen huge | `pen-v2` | no |
| `colorblock-bowl` | colorblock · offer | sage, the carbon bowl and brush | `stillleben-v2` | no |
| `colorblock-teresa` | colorblock · trust | lilac, Teresa cut-out | `teresa_portrait.jpg` | yes |
| `bento-angebot` | bento · offer | photo, price, 90 Min., pen, button tiles | `maske-v2`, `pen-v2` | no |
| `bento-reviews` | bento · trust | rating tile, two verbatim reviews, photos, price | `pen-v2`, `maske-v2` | no |
| `bento-teresa` | bento · trust | Teresa photo tile, title, experience, price | `teresa_portrait.jpg`, `maske-v2` | yes |
| `sticker-angebot` | sticker · offer | price sticker, 90 Min., «2 in 1», arrow | `maske-v2` | no |
| `sticker-ablauf` | sticker · course | seven numbered step stickers | `pen-v2` | no |
| `sticker-reviews` | sticker · trust | two review bubbles, rating, price | `ruhe` | no |

Reviews used, verbatim and complete from `src/pages/lp/carbon-microneedling/_reviews.ts`: Patricia «Sehr professionell, freundlich, sauber.», Denise «Sehr kompetente Beratung und Behandlung!», Yilmaz «Es war eine gute Entscheidung dorthin zu gehen.». Rahel's first review is longer than one line and is not used.

## Generate (only after the go described at the top)

1. Work in the worktree and branch the orchestrator records for this round, not on the branch of #73.
2. Copy the reference images that are not in the repository from `../ads/2026-11-carbon-runden-3-6/raw/` into `raw/`: `hautanalyse_20261105_1.png` (for `facemap-hautanalyse`) and `ruhe_20261105_1.png` (for `facemap-schritte`, `sticker-reviews`). Git ignores them there.
3. The user sets the key for the terminal only, never in a file: in PowerShell `$env:OPENAI_API_KEY = '…'`, in Git Bash `export OPENAI_API_KEY=…`.
4. Feed, two candidates per ad (30 images): `py -I design/ads/2026-11-carbon/gen_ads.py feed motifs_r7` (from the repository root; `gen_ads.py` uses `gpt-image-2.6-flare`, quality `high`, 1088 × 1360). Log: `raw/generation-log-<date>.jsonl`.
5. Contact sheet of every candidate: `py -I design/ads/2026-11-carbon/finalize_r7.py sheet` → `raw/contact-r7-<date>.jpg`; then check every candidate at full size (see «Checks») and pick one per ad.
6. Stories, one per chosen candidate (15 images): `py -I design/ads/2026-11-carbon/gen_ads.py story motifs_r7 knockout-175=1 knockout-carbon=2 …`; check the safe zones (no text in the top 14 % or the bottom 20 %) and redo any that break them.
7. Finals: `py -I design/ads/2026-11-carbon/finalize_r7.py final knockout-175=1 …` → `<name>_45.jpg` (1080 × 1350) and `<name>_916.jpg` (1080 × 1920); record the picks and the cost in README.md («Runde 7»). The four Teresa finals (`knockout-teresa`, `facemap-hautanalyse`, `colorblock-teresa`, `bento-teresa`), the contact sheet and all raw candidates go to `../ads/2026-11-carbon-runden-3-6/`, not into git. Push the branch and open a PR; no merge without the user's approval.

Cost: rounds 4 and 5 used 26 calls for about 83 000 input and 56 000 output tokens. Round 7 is 30 calls (45 images), so roughly 1.7 times that; read the amount on platform.openai.com/usage afterwards (earlier estimate for this model class: about 0.1 USD per image, so about 4 to 6 USD).

## Checks before an ad is final

- Every word in the image against the prompt's text list; «CHF 175» and «statt CHF 250» with the strike; the seven steps in order; the quotes word for word; no date; no other words.
- Hands (five fingers, white gloves), the pen exactly like `raw/pen-v2_20261031_2.png` (no invented buttons or lights), no needles, no laser, no light beams, no redness, no before/after, no red marks on the face.
- Teresa recognisable as in her portrait on `knockout-teresa`, `facemap-hautanalyse`, `colorblock-teresa` and `bento-teresa`; she approves every ad that shows her before it runs.
- Stories: text and button between 14 % and 80 % of the height.

## Ad copy (ready to paste; Sie form, Swiss spelling; headline at most 40, description at most 30 characters)

Counted per visible character; Meta's preview is final. One text per style, matching its message; any of the three images of a style can run with it.

| Style · message | Field | Text | Chars |
|---|---|---|---|
| knockout · offer | Primary text | Carbon-Peeling + Microneedling in einer Sitzung von 90 Minuten: Aktion CHF 175 statt CHF 250, Sie sparen CHF 75.–, gültig bis 30. November 2026. Persönlich von Teresa Stimac an der Bahnhofstrasse 94, Zürich. Jetzt online buchen. | 228 |
| knockout · offer | Headline | Carbon-Peeling + Microneedling CHF 175 | 38 |
| knockout · offer | Description | 90 Min. · Bahnhofstrasse 94 | 27 |
| facemap · course | Primary text | So läuft die Behandlung ab: Reinigung, Fruchtsäure-Peeling, Diamantabrasion, Carbon-Peeling, Microneedling, Maske und LED-Licht – alles in einer Sitzung von 90 Minuten, mit Hautanalyse vorher. Aktion CHF 175 statt CHF 250, gültig bis 30. November 2026. Bahnhofstrasse 94, Zürich. | 279 |
| facemap · course | Headline | 7 Schritte in einer Sitzung | 27 |
| facemap · course | Description | Mit Hautanalyse · CHF 175 | 25 |
| colorblock · course | Primary text | Zwei Behandlungen, eine Sitzung: Carbon-Peeling + Microneedling für CHF 175 statt CHF 250, gültig bis 30. November 2026. 90 Minuten bei Teresa Stimac an der Bahnhofstrasse 94, Zürich. Jetzt Termin online buchen. | 211 |
| colorblock · course | Headline | Zwei Behandlungen. Eine Sitzung. | 32 |
| colorblock · course | Description | CHF 175 statt CHF 250 | 21 |
| bento · trust (reviews) | Primary text | 4,8 aus 260+ Bewertungen auf Treatwell. Carbon-Peeling + Microneedling in einer Sitzung von 90 Minuten, persönlich von Teresa Stimac. Aktion CHF 175 statt CHF 250, gültig bis 30. November 2026. Bahnhofstrasse 94, Zürich. | 220 |
| bento · trust (reviews) | Headline | Echte Kundenerfahrungen · CHF 175 | 33 |
| bento · trust (reviews) | Description | 4,8 aus 260+ Bewertungen | 24 |
| sticker · trust (Teresa) | Primary text | Persönlich behandelt von Teresa Stimac, dipl. Visagistin & Kosmetikerin, seit über 20 Jahren im Beruf. Carbon-Peeling + Microneedling, 90 Minuten, Aktion CHF 175 statt CHF 250, gültig bis 30. November 2026. Bahnhofstrasse 94, Zürich. Jetzt Termin buchen. | 254 |
| sticker · trust (Teresa) | Headline | Persönlich von Teresa Stimac | 28 |
| sticker · trust (Teresa) | Description | Bahnhofstrasse 94 · CHF 175 | 27 |

Before you run them: keep the Treatwell page as the record for «4,8 aus 260+ Bewertungen» (read on 2026-10-31) and the user's note of 2026-10-31 for «über 20 Jahren»; the end date in the primary text follows the page (`OFFER_VALID_UNTIL`), so change both together. Meta's health-and-wellness rules apply to cosmetic procedures (18+); the copy states no result and no personal attribute.

## Rules for every ad

- Facts only from the campaign record: Carbon-Peeling + Microneedling, two treatments in one session, 90 Min., CHF 175 statt CHF 250, Sie sparen CHF 75.– (30 %), the seven steps (Reinigung, Fruchtsäure-Peeling, Diamantabrasion, Carbon-Peeling, Microneedling, Maske, LED-Licht), skin analysis before, depth to the skin type, Teresa Stimac, dipl. Visagistin & Kosmetikerin, over 20 years in the profession, 4,8 aus 260+ Bewertungen auf Treatwell, Bahnhofstrasse 94 Zürich. The end date (30. November 2026) stays out of the image.
- Never: «Laser», «Hydra», effect or result claims, before/after, skin problems as hooks, invented reviews or numbers, invented devices, Swiss cross or flags.
- Teresa only from her consented real portrait or the approved generated images; she approves every ad that shows her.
- Swiss spelling (ss), Sie form.
