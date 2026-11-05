# Round 6 · ten new ad formats from Pinterest research (handover to a local session)

Status 2026-11-05: research started in the cloud session, ten concepts written as prompts in [motifs_r6.py](motifs_r6.py), **nothing generated yet**. The cloud session could not reach the user's logged-in Chrome (Claude in Chrome is not connected there), so the work continues in a session on the user's computer.

## What exists already

- Ten finished ads, rounds 4 and 5, Feed 4:5 and native Story 9:16: `carbon-gold`, `duo-split`, `glass-30`, `cover`, `neon-studio`, `swiss-poster`, `collage`, `clay-steps`, `carbon-brush`, `pop-art` (`*_45.jpg`, `*_916.jpg`). See [README.md](README.md), «Runde 4» and «Runde 5».
- Prompts: [motifs_r4.py](motifs_r4.py), [motifs_r5.py](motifs_r5.py), [motifs_r6.py](motifs_r6.py). Generator: [gen_ads.py](gen_ads.py) (OpenAI `gpt-image-2.6-flare`, `high`, 1088 × 1360 with two candidates; Story 1088 × 1936 from the chosen candidate).
- Draft PR: https://github.com/lefteyep/beautyfacelift/pull/73, branch `claude/charming-meitner-694rqy`.

## Research so far

Source: the public part of https://de.pinterest.com/ideas/meta-ads-creative/927599866252/ (27 pins before Pinterest's login wall). Pin images are not stored here (third-party content).

| Pattern seen | Why it works in the feed | Used in |
|---|---|---|
| Problem vs. solution split, red crosses vs. product | instant contrast, reads in one second | `problem-loesung` |
| Checklist as phone toggles (red off → green on) | familiar UI, scannable | `toggles` |
| Product in hand with floating 5-star review cards | social proof around the hero | `reviews` (real Treatwell reviews only) |
| Chat or AI-chat screen with a question and answer | native, feels like content, not an ad | `chat-faq` (as FAQ, no ChatGPT or WhatsApp look) |
| «Would you rather? A / B» | invites a decision, stops the scroll | `ab-choice` |
| Meme or reaction photo with big caption | native, creator-like | `pov-caption` (own photo, no film stills) |
| Hand holding the product, ingredient pills around it | premium, explains features | `hand-hero` |
| Surreal 3D metaphor (turtle on a skateboard, fishing rod) | curiosity | `puzzle-3d` («Passt zusammen.») |
| Icons orbiting a centre product («1 drink replaces 16») | «everything in one» in one picture | `orbit` («1 Termin. 7 Schritte.») |
| Grid of several creatives or steps | storytelling in one frame | `storyboard` («Ihre 90 Minuten») |

Left out on purpose: an incoming-call screen with an «Accept» slider and fake like counts (Meta's rule against non-existent functionality); ChatGPT look-alikes (an AI that seems to recommend the studio); film stills and celebrities (rights); skin problems as hooks (Meta personal attributes, project copy rules).

## Next steps in the local session

1. `git pull` and switch to branch `claude/charming-meitner-694rqy`.
2. **Research with Claude in Chrome** (the user is logged in to Pinterest): the ideas page above, then searches such as «skincare ad design», «beauty salon instagram ad», «facial treatment social media post», «aesthetic clinic ad», «spa promotion poster», «3d cosmetic ad», «microneedling ad». Note the patterns that recur in beauty and service ads and what makes the best ones click-strong. Do not download or commit other people's pins.
3. Refine [motifs_r6.py](motifs_r6.py) if the research shows better formats; keep the rules below.
4. Generate: set `OPENAI_API_KEY` for the terminal (never in a file), then
   `python design/ads/2026-11-carbon/gen_ads.py feed motifs_r6`
5. Check every candidate at full size: every word against the prompt's text list, prices and strikes, hands, no needles, no laser, no invented devices; pick one per format.
6. Story versions: `python design/ads/2026-11-carbon/gen_ads.py story motifs_r6 problem-loesung=1 toggles=2 …`, check the safe zones (no text in the top 14 % or the bottom 20 %), redo any that break them.
7. Finals: resize to 1080 × 1350 and 1080 × 1920 as `<name>_45.jpg` / `<name>_916.jpg` (as in rounds 4 and 5), record the round in README.md, commit and push to the branch.

## Rules for every ad

- Facts only from the campaign record: Carbon-Peeling + Microneedling, two treatments in one session, 90 Min., CHF 175 statt CHF 250, Sie sparen CHF 75.– (30 %), the seven steps (Reinigung, Fruchtsäure-Peeling, Diamantabrasion, Carbon-Peeling, Microneedling, Maske, LED-Licht), skin analysis before, depth to the skin type, Teresa Stimac, dipl. Visagistin & Kosmetikerin, over 20 years in the profession, 4,8 aus 260+ Bewertungen auf Treatwell, Bahnhofstrasse 94 Zürich, end date 30. November 2026 (best kept out of the picture, because it may move).
- Never: «Laser», «Hydra», effect or result claims, before/after, skin problems as hooks, invented reviews or numbers, invented devices (only the pen look from `raw/pen-v2_20261031_2.png`), Swiss cross or flags.
- Reviews only verbatim from `src/pages/lp/carbon-microneedling/_reviews.ts`.
- Teresa only from her consented real portrait `src/assets/marketing/teresa_portrait.jpg` or the approved generated images; she approves every ad that shows her (`reviews`, `chat-faq`, `storyboard`, plus `carbon-gold`, `cover`, `neon-studio`, `collage` from earlier rounds).
- Swiss spelling (ss), Sie form.
