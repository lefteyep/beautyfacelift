# Round 6 · ten new ad formats from Pinterest research (generated 2026-11-05)

> **Round 6 has been generated (2026-11-05). For any further run of these prompts: no session acts on this plan by itself.** Generating costs money (paid OpenAI API) and uploads Teresa's real portrait and generated images of her to OpenAI. Before anything is generated: (1) the user gives an explicit go in chat for this round, its cost ceiling and the motifs, (2) the orchestrator board (`docs/orchestrator/STATUS.md` in the main copy) has an entry with the worker, worktree and branch, (3) the user provides the key at runtime in the terminal; it is never stored. Results are not pushed to the source branch of #73; they go to a new `codex/*` branch in its own worktree, and every image that shows Teresa stays outside the repository in `../ads/2026-11-carbon-runden-3-6/` until her written OK.

Status 2026-11-05, local session: **done.** Research with Claude in Chrome (logged in), the ten prompts in [motifs_r6.py](motifs_r6.py) revised after it (section «Research in the local session» below), twenty feed candidates generated and checked word by word, one picked per format, ten Stories (nine regenerated with strict safe zones by [regen_story_r6.py](regen_story_r6.py)), finals `<name>_45.jpg` and `<name>_916.jpg` built by [finalize_r6.py](finalize_r6.py), round recorded in [README.md](README.md) («Runde 6»). No file of this round is in the repository (user decision 2026-11-05): finals without Teresa in `../ads/2026-11-carbon-runden-3-6/final/` and the user's ads folder `../ads/carbon_microneedling/`, finals with Teresa in `../ads/2026-11-carbon-runden-3-6/final-teresa/`, raw candidates and contact sheets in `../ads/2026-11-carbon-runden-3-6/raw/`. Open: Teresa approves `reviews`, `chat-faq` and `storyboard`; selection and upload to Meta.

Earlier status (cloud session): research started, ten concepts written as prompts, nothing generated. The cloud session could not reach the user's logged-in Chrome (Claude in Chrome is not connected there), so the work continued in a session on the user's computer.

## What exists already

- Ten finished ads, rounds 4 and 5, Feed 4:5 and native Story 9:16: `carbon-gold`, `duo-split`, `glass-30`, `cover`, `neon-studio`, `swiss-poster`, `collage`, `clay-steps`, `carbon-brush`, `pop-art` (`*_45.jpg`, `*_916.jpg`). See [README.md](README.md), «Runde 4» and «Runde 5».
- Prompts: [motifs_r4.py](motifs_r4.py), [motifs_r5.py](motifs_r5.py), [motifs_r6.py](motifs_r6.py). Generator: [gen_ads.py](gen_ads.py) (OpenAI `gpt-image-2.6-flare`, `high`, 1088 × 1360 with two candidates; Story 1088 × 1936 from the chosen candidate).
- Source: draft PR https://github.com/lefteyep/beautyfacelift/pull/73 (branch `claude/charming-meitner-694rqy`), split into a video PR and this image-rounds PR. The raw candidates and the finals that show Teresa (`carbon-gold`, `cover`, `neon-studio`, `collage`) are kept outside the repository in `../ads/2026-11-carbon-runden-3-6/`.

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

## Research in the local session (2026-11-05, logged in to Pinterest)

Queries: the ideas page past the login wall (mostly Meta-ads agency pins, nothing new for beauty), «skincare ad design», «beauty salon instagram ad», «facial treatment social media post», «aesthetic clinic ad», «spa promotion poster», «3d cosmetic ad», «microneedling» («microneedling ad» returns no pins), «kosmetikstudio instagram post». Nothing downloaded or stored; the notes below describe recurring patterns, not single pins.

| Pattern in beauty and clinic ads | What it tells us | Change to the prompts |
|---|---|---|
| One warm, monochrome palette per brand (wine, dusty rose, bronze and sand, sage); the ads that look premium never use primary colours | cobalt, sky blue, teal and sunshine yellow read as tech or agency ads, not as a studio | all ten ads now sit on the website palette (cream, shell, blush, copper-clay, cocoa, gold): `reviews` cream with a cocoa arch instead of cobalt, `ab-choice` cream instead of sky blue, `puzzle-3d` blush studio instead of cobalt, `orbit` deep sage instead of teal, copper or cocoa buttons instead of yellow and navy |
| A large elegant serif headline over small, clean sans labels (clinic sets, spa posters, Douglas, Lavera) | the headline carries the ad; the type mix looks designed | every ad: serif display headline, sans for everything else, no italics (site rule), no outlined or neon lettering |
| Numbered step panels with huge thin numerals behind the photo edge (clinic carousel 1 to 4, one step per panel) | scannable storytelling without text blocks | `storyboard`: large outlined serif numerals instead of small circles, all four photos in one warm grade |
| The practitioner looks at the client's skin, hand on the face, client at ease | trust without before/after | kept: `storyboard` photo 1 from the `hautanalyse` reference |
| A big editorial statement instead of a problem list («Anti Ageing ist OUT! Das kommt jetzt.») | one line stops the scroll | `problem-loesung` gets the serif headline «Getrennt oder zusammen?» above the two columns |
| The website's own motif (arches, cards) repeated in the ads of the strongest brand sets | ads and landing page look like one brand | a cocoa arch behind Teresa in `reviews`, a blush arch behind the pen in `hand-hero` |
| 3D cosmetics ads: pastel studio, floating spheres and bubbles, one hero object | 3D works in beauty when the palette is soft | `puzzle-3d`: blush studio with floating matte spheres in cream and copper |
| Creator-style photo with a subtitle caption (sponsored pins from cewe and Vattenfall) | native, not an ad | `pov-caption` unchanged, sticker now cream and cocoa |

Also seen and left out: booking-confirmation screens (Treatwell's own sponsored pin shows a calendar entry; for a studio it would look like a function the ad does not have), «before / after» face halves on clinic pins (banned), percentage badges and price tags in other currencies, Canva template packs.

## Steps (done 2026-11-05; a further run only after the go described at the top)

1. The orchestrator creates a worktree under `../astro-v2-worktrees/` on a new `codex/*` branch from `origin/master` and records it on the board.
2. Copy the reference images that are not in the repository from `../ads/2026-11-carbon-runden-3-6/raw/` into `raw/` (`storyboard` needs `hautanalyse_20261105_1.png` and `ruhe_20261105_1.png`; Git ignores them there).
3. The user sets `OPENAI_API_KEY` for the terminal (never in a file), then
   `py -I design/ads/2026-11-carbon/gen_ads.py feed motifs_r6`
4. Check every candidate at full size: every word against the prompt's text list, prices and strikes, hands, no needles, no laser, no invented devices; pick one per format.
5. Story versions: `py -I design/ads/2026-11-carbon/gen_ads.py story motifs_r6 problem-loesung=1 toggles=2 …`, check the safe zones (no text in the top 14 % or the bottom 20 %), redo any that break them.
6. Finals: resize to 1080 × 1350 and 1080 × 1920 as `<name>_45.jpg` / `<name>_916.jpg` (as in rounds 4 and 5) and record the round in README.md. No ad files go to GitHub (user decision 2026-11-05): finals without Teresa go to the user's ads folder `../ads/carbon_microneedling/`, finals with Teresa (`reviews`, `chat-faq`, `storyboard`) and all raw candidates to `../ads/2026-11-carbon-runden-3-6/`; only prompts, scripts, logs and the README go on the branch. Push the branch and open a PR; no merge without the user's approval.

## Rules for every ad

- Facts only from the campaign record: Carbon-Peeling + Microneedling, two treatments in one session, 90 Min., CHF 175 statt CHF 250, Sie sparen CHF 75.– (30 %), the seven steps (Reinigung, Fruchtsäure-Peeling, Diamantabrasion, Carbon-Peeling, Microneedling, Maske, LED-Licht), skin analysis before, depth to the skin type, Teresa Stimac, dipl. Visagistin & Kosmetikerin, over 20 years in the profession, 4,8 aus 260+ Bewertungen auf Treatwell, Bahnhofstrasse 94 Zürich, end date 30. November 2026 (best kept out of the picture, because it may move).
- Never: «Laser», «Hydra», effect or result claims, before/after, skin problems as hooks, invented reviews or numbers, invented devices (only the pen look from `raw/pen-v2_20261031_2.png`), Swiss cross or flags.
- Reviews only verbatim from `src/pages/lp/carbon-microneedling/_reviews.ts`.
- Teresa only from her consented real portrait `src/assets/marketing/teresa_portrait.jpg` or the approved generated images; she approves every ad that shows her (`reviews`, `chat-faq`, `storyboard`, plus `carbon-gold`, `cover`, `neon-studio`, `collage` from earlier rounds).
- Swiss spelling (ss), Sie form.
