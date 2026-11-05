# Video ad with Teresa as an AI avatar: storyline and prompting guide

Campaign: Carbon-Peeling + Microneedling, **CHF 175 statt CHF 250**, Sie sparen CHF 75.–, 90 Min., valid until 30 November 2026 ([META-CAMPAIGN-CARBON-MICRONEEDLING.md](../../../docs/current/META-CAMPAIGN-CARBON-MICRONEEDLING.md)). Placement: Meta (Instagram and Facebook, Reels/Stories first, Feed second). Written 2026-11-04. Nothing has been generated or uploaded yet.

This guide is built on three Marxx guides ([avoid AI-looking ads](https://marxx.ai/guides/how-to-avoid-ai-looking-ads), [UGC script template](https://marxx.ai/templates/ugc-script-template), [hooks for skincare ads](https://marxx.ai/templates/hooks-for-skincare-ads)). They are adapted to this offer, to Meta's beauty-ad rules and to the copy rules this project already uses. Every fact Teresa says comes from the campaign doc, the ad page or Treatwell. Nothing new is claimed.

**To make the video by hand, follow the step-by-step doc [Carbon Avatar Video Guide](https://claude.ai/artifact/SM5NNZGqhqV5SEVJAQeLkp)** (private to the agency account; ten steps with every click, upload, setting and prompt, checklists, and the Meta upload). This file keeps the reasons behind each step.

Version 2 of the production steps and prompts (sections 4 and 5) applies the best practices from three further tutorial videos: [AI-VIDEO-BEST-PRACTICES.md](AI-VIDEO-BEST-PRACTICES.md).

---

## 0. Three gates before anything is generated

### Gate 1: Teresa agrees to a speaking avatar (new consent)

Teresa has already agreed to two uses: generated images made from her photos (11 October 2026) and the silent clip of her applying the Carbon lotion (hero video, PR #70). She has **not** yet agreed to three new uses:

- a generated video in which her face **speaks**;
- lip-sync to a voice;
- a copy of her voice, if you choose that route.

The earlier Aquafacial plan ruled these out on purpose ("no synthetic speech, lip-sync or any animation that makes her appear to say or do something she did not"). This guide lifts that rule **for this video only, and only once she agrees in writing**. She also approves the exact script and sees the final cut before it runs.

Text she can confirm by e-mail or WhatsApp. It is written in the first person, so it works whether you say "du" or "Sie" to her. It records what she agreed to; it is not legal advice.

> **Einverständnis Teresa Stimac – Video Carbon-Aktion (November 2026)**
>
> Ich bin einverstanden, dass
> 1. aus meinen dafür freigegebenen Fotos ein KI-Video entsteht, in dem ich zu sehen bin und spreche;
> 2. dafür meine Fotos und meine Sprachaufnahmen bei einem KI-Dienst (Higgsfield) hochgeladen werden;
> 3. die Stimme im Video **meine eigene Aufnahme** ist / **eine KI-Kopie meiner Stimme** ist (Zutreffendes stehen lassen);
> 4. ich im Video nur den Text sage, den ich vorher freigegeben habe (Anhang);
> 5. ich das fertige Video vor der Veröffentlichung sehe und ablehnen kann;
> 6. das Video als bezahlte Anzeige auf Instagram und Facebook für die Carbon-Aktion läuft und danach nicht mehr geschaltet wird; neue Texte oder andere Verwendungen nur mit meiner neuen Zustimmung;
> 7. Meta das Video als KI-Inhalt kennzeichnen kann.
>
> Ich kann diese Zustimmung jederzeit widerrufen; laufende Anzeigen werden dann gestoppt. Eine Stimm-Kopie wird nur für Beauty Face Lift verwendet und auf meinen Wunsch gelöscht.

### Gate 2: the AI label (your decision)

For the image ads you decided not to declare AI (decision Nr. 8, `OPT_OUT`). A talking Teresa is a different case. According to industry summaries of Meta's policy, disclosure is expected for photorealistic video showing a real person saying something she did not actually film. Meta may then show an "AI info" label next to "Sponsored" ([Cinerads overview 2026](https://www.cinerads.com/blog/ai-ad-disclosure-requirements), [Meta AI ad policy summary](https://www.cinerads.com/blog/ai-ugc-facebook-ad-policy)). Check the current wording in Ads Manager when you upload; I could not read Meta's own policy page.

**Recommendation: switch AI disclosure on for these video ads.** Marxx's rule fits: "Make ads you'd be comfortable seeing labelled." With Teresa's real voice and words she approved, the label is honest rather than embarrassing. A hidden fake would be the bigger risk for trust, and for the ad account.

### Gate 3: numbers checked on the day you edit

- The Treatwell rating on screen ("4,8 aus 260+ Bewertungen auf Treatwell"): read it on [Treatwell](https://www.treatwell.ch/ort/beauty-face-lift/) the day you export.
- Check on Treatwell that "Carbon Laser Peeling + Microneedling" shows CHF 175 as the time-limited Aktionspreis (launch gate 2 of the campaign, still open; the last recorded check, on 1 November, still showed CHF 250). Until it does, don't upload a video with the price block.
- Timing: the ad set is paused and its start date (3 November) has passed. The campaign doc says that if the ads start after 10 November, the end date is decided again. Getting consent, recording and editing realistically takes until about 10 November, so plan that decision in.

---

## 1. What the three guides say, and how this video uses it

| Marxx point | How this video applies it |
|---|---|
| Start from real photo, footage or voice | **Teresa's real voice** (a phone voice memo) is the backbone. Her face comes from her consented photos. The b-roll is the three clips you already approved. AI only animates her face. |
| Plastic skin | Reuse the "Realismus-Block" from [prompts.md](prompts.md) (it worked in round 2). Add one even film grain over the whole edit. |
| Odd hands | In the talking-head shots her hands stay out of frame. In the b-roll, use only the approved clips (gloved hands already checked). |
| Garbled text and logos | No text from any generator. Captions, price and address are typed in the editor, the same as the existing ad videos. |
| Off-looking product | No new device shots unless they start from real phone photos of Teresa's devices (LED, Diamantabrasion). Otherwise the steps are named on screen over the existing clips. |
| Perfect lighting | One light logic everywhere: window on the left, soft shadow on the right, a little warm lamp. The same as the page images. |
| Floaty motion | No shot longer than about 4 s. One talking-head clip per sentence. Cut between two camera angles. Tripod still, no gestures. |
| Flat voice | Her real voice (route A). If you use a clone (route B), her real voice still carries the hook and the price line. |
| Generic set | Her studio look from the landing page, so the ad and the page match. |
| Five beats, 20–30 s | Kept: Hook → Frage → Behandlung → Beweis → CTA. Marxx's "problem" beat becomes "the question before booking". Meta's beauty rules and this project's copy rules forbid pointing at skin flaws. |
| Three hooks, same body | Three test hooks share one body (section 3). The body is generated once. |
| Test a shorter cut | 15-s cut defined in section 2.3. |
| Test against a real version | The control is the existing silent video ad `maske_video45_v1`, because Teresa does not film herself on camera. |
| Don't script results | No result or effect claims at all. The ad describes what happens, who does it and what it costs. |

---

## 2. The storyline

**Idea:** «Teresa zeigt in 30 Sekunden, was in 90 Minuten passiert.» Teresa appears as herself, the practitioner. She talks to the camera as she would at the treatment bed, and the shots cut to the clips that already run on the landing page.

**Why this idea:**

- It answers the hesitation before booking (what happens, does it suit me, who treats me) without any effect claim.
- It matches the page: same studio, same Teresa as the hero, same price block.
- It never uses a fake customer. An AI "customer" telling her story would be an invented testimonial. Only Teresa speaks, and the proof comes from real Treatwell reviews.

### 2.1 Script, about 28 s (≈ 64 words)

Sie form, Swiss spelling. Teresa may say it in her own words (also in dialect) as long as the meaning and the cautious wording stay. The captions stay in Standard German.

| Beat | Time | Teresa says | Meaning (EN) | Source |
|---|---|---|---|---|
| 1 Hook | 0–3 s | one of H1–H3 (section 3) | | |
| 2 Frage | 3–8 s | «Zuerst schaue ich mir Ihre Haut genau an – und stimme die Behandlung darauf ab.» | First I look closely at your skin and adjust the treatment to it. | skin analysis before; Microneedling depth set to skin type |
| 3 Behandlung | 8–18 s | «Erst Reinigung, Fruchtsäure-Peeling und Diamantabrasion, dann Carbon-Peeling und Microneedling, zum Schluss Maske und LED-Licht.» | First cleansing, fruit-acid peeling and diamond abrasion, then Carbon peeling and Microneedling, finally mask and LED light. | Teresa's step list in her order (Reinigung → Fruchtsäure-Peeling → Diamantabrasion → Carbon-Peeling → Microneedling → Maske → LED-Licht), as on the page |
| 4 Beweis | 18–24 s | «Ich bin seit über 20 Jahren im Beruf – und behandle Sie persönlich.» | I've been in this profession for over 20 years, and I treat you personally. | your statement 2026-10-31; "Persönlich behandelt von Teresa Stimac" |
| 5 CTA | 24–30 s | «Carbon-Peeling und Microneedling, 90 Minuten – jetzt für 175 statt 250 Franken. Termin direkt online buchen.» | … 90 minutes, now 175 instead of 250 francs. Book online. | offer; ad text closing line |

Not in the script on purpose: the date (the existing videos carry none, so the video stays correct if the end date moves; the date sits in the primary text), "Laser", and any effect word ("klärt", Poren, Kollagen and so on).

### 2.2 Shot list (9:16, hook H1 shown)

A-roll = Teresa talking (generated). B-roll = the approved clips from `../ads/2026-11-carbon-video-clips/` (outside the repo) or page images.

| # | Time | Picture | Sound | On screen (typed in the editor) |
|---|---|---|---|---|
| 1 | 0.0–2.8 | B-roll **clip 1**: Teresa brushes the black lotion on (start mid-stroke) | hook line (her voice) | hook text from 0.3 s |
| 2 | 2.8–8.0 | A-roll **angle A** | beat 2 | captions · «Mit Hautanalyse» |
| 3 | 8.0–10.8 | B-roll **clip 3** (still life, table) | «Erst Reinigung, Fruchtsäure-Peeling und Diamantabrasion,» | «Reinigung, Fruchtsäure-Peeling und Diamantabrasion» |
| 4 | 10.8–13.5 | page image `methode-1.webp` with a slow 3 % push-in | «dann Carbon-Peeling» | «Carbon-Peeling» |
| 5 | 13.5–16.0 | B-roll **clip 2** (Microneedling pen) | «und Microneedling,» | «Microneedling» |
| 6 | 16.0–18.0 | A-roll **angle B** | «zum Schluss Maske und LED-Licht.» | «Maske und LED-Licht» |
| 7 | 18.0–22.0 | A-roll **angle A** | beat 4 | captions |
| 8 | 22.0–24.5 | review card on a blurred still of clip 3 | room tone | «Fühlte mich gut aufgehoben und kann Beauty Face Lift mit gutem Gewissen weiter empfehlen.» – Svenja, Gesichtsbehandlungen, Treatwell, März 2025 · «4,8 aus 260+ Bewertungen auf Treatwell» |
| 9 | 24.5–30.0 | A-roll **angle B**; last 1.5 s still life with price band | beat 5 | «Aktion · nur für kurze Zeit» · «Carbon-Peeling + Microneedling» · «CHF 175 statt ~~CHF 250~~ · Sie sparen CHF 75.–» · «Beauty Face Lift · Bahnhofstrasse 94, Zürich» |

- The review is verbatim from `src/pages/lp/carbon-microneedling/_reviews.ts` (first entry). It is a real review of a Microneedling appointment, shown with its Treatwell category «Gesichtsbehandlungen» exactly as in that file, so it does not pretend to be about this offer.
- Price block: exactly the overlay of the existing `carbon-ad-*.mp4` files, with the 250 struck by the thin red diagonal of the page.
- No drawn "book" button. Meta places its own **Jetzt buchen** button under the video.

### 2.3 15-second cut (make it for the winning hook)

| Time | Picture | Teresa says |
|---|---|---|
| 0–3 s | hook shot | hook line |
| 3–10 s | shots 3–6 (b-roll + angle B) | «Erst Reinigung, Fruchtsäure-Peeling und Diamantabrasion, dann Carbon-Peeling und Microneedling, zum Schluss Maske und LED-Licht.» |
| 10–15 s | angle B + price band | «Jetzt für 175 statt 250 Franken. Termin direkt online buchen.» |

---

## 3. Hooks

The rule from Marxx: name a situation and promise something small and believable. The text appears on screen at the same moment as the spoken line, because many people watch without sound.

### 3.1 The three test hooks (same body for all three)

| Code | Marxx category | Teresa says (0–3 s) | First picture | On screen |
|---|---|---|---|---|
| **H1** | Routine and time | «90 Minuten, zwei Behandlungen. So läuft's bei mir ab.» | clip 1, black lotion, mid-stroke | «Carbon-Peeling + Microneedling» |
| **H2** | Honest, first-timer (matches ad 2 and Svenja's review) | «Zum ersten Mal Microneedling? So läuft es bei mir ab.» | angle A, Teresa to camera | «Zum ersten Mal Microneedling?» |
| **H3** | Myth-busting turned choice | «Carbon-Peeling oder Microneedling? Sie bekommen beides.» | angle A, Teresa to camera | «Carbon-Peeling oder Microneedling?» → «Beides in einer Sitzung» |

### 3.2 Reserve hooks (each brings its own beat 2)

| Code | Teresa says | Beat 2 instead | Source |
|---|---|---|---|
| R1 | «Tut Microneedling weh? Meine ehrliche Antwort.» | «Viele empfinden es als leichtes Piksen oder Wärme. Die Intensität stimme ich auf Ihre Haut ab.» | FAQ «Ist die Behandlung schmerzhaft?» |
| R2 | «Für wen diese Behandlung nicht passt.» | «Nicht bei gereizter oder verletzter Haut und nicht in der Schwangerschaft. Deshalb schaue ich mir Ihre Haut vorher genau an.» | FAQ «Für wen … nicht geeignet?» (the full list stays on the page) |
| R3 | «Was in 90 Minuten bei mir passiert.» | unchanged | Treatwell duration |
| R4 (last week only) | «Diese Aktion läuft nur noch kurz.» | unchanged | only once the end date is final; it pairs with the reserve ad `enddatum_static45_v1` |

### 3.3 Hooks we deliberately do not use

| Marxx type | Example | Why not here |
|---|---|---|
| Skin-type call-out | «Grosse Poren?», «Unreine Haut?» | Meta forbids implying personal attributes and ads that make people feel bad about their appearance; "Akne" is on the project's banned list |
| Results and timelines | «Nach einer Sitzung …», «Tag 1, Tag 15 …» | no measured results; effect claims are banned in these ads |
| Fake honest creator | «Ich war skeptisch …» told by an AI customer | an invented testimonial; never generate a customer |
| Season | «Herbst ist Peeling-Zeit» | only if Teresa gives the reason in her own words; don't write it for her |
| Laser | «Laser-Peeling …» | Meta can read it as a medical service; the word stays out of every ad |

---

## 4. Production, step by step

Version 3 (2026-11-04). It applies [AI-VIDEO-BEST-PRACTICES.md](AI-VIDEO-BEST-PRACTICES.md), which is built on the full transcripts of all three tutorial videos:

- the assets come first, in the models the creators use;
- the stills are approved before any video is made;
- every talking clip has its own micro-action;
- prompts are structured, with locks at the end;
- every video is drafted in 480p first;
- Teresa's real voice is always the soundtrack;
- the edit runs at 24 fps.

### Step 1 – Voice

**Route A (recommended): Teresa records the lines herself.** It takes about 3 minutes on her phone:

- She records each beat and each hook as a **separate** voice memo, two takes each (H1–H3, beats 2–5, the 15-s CTA line).
- She uses a quiet room with soft furnishings (her studio is fine, a tiled bathroom is not). The phone sits about 20 cm from her mouth, in flight mode, with the screen facing up.
- She speaks at her normal tempo and pauses where the commas are. If a beat runs long, cut words; don't speak faster (Marxx).
- She sends the original files (iPhone Voice Memos `.m4a`, or WhatsApp as a "document", not as a voice message, which reduces quality).

**Route B: a voice copy.** Use it only if she ticks "KI-Kopie" in the consent. It is useful when you want new hooks later without a new recording, but every new line still needs her OK.

- Reference: 1–2 minutes of her talking freely and clean (no music, no echo). Create it in Higgsfield as a voice "element".
- Generate with **Eleven v4** (`elevenlabs_v4`, voice type `element`), each beat on its own. Start with stability around 0.45 and similarity around 0.8, then adjust by ear.
- For text-to-speech, write numbers and English words the way they are spoken: «hundertfünfundsiebzig statt zweihundertfünfzig Franken», «Maikro-Niedling» if the voice says it wrongly. Compare with how Teresa says these words herself.
- Her real recording still carries the hook and the price line.

### Step 2 – Assets: Teresa sheet, empty studio, two start frames

Use the models the three tutorial creators use; all of them are in the agency's Higgsfield account:

- **Seedream 5.0 Pro** for Teresa (real skin texture, no plastic look);
- **Soul Cinema** for the empty studio (made for room light, grain and depth, and the cheapest model; it takes one reference image);
- **3D Jutsu Angles** to turn angle A into angle B, so it stays the same face and the same room.

If Seedream drifts from her face, try **Nano Banana Pro**. Attach the references **in the numbered order** given, every time. Make four images per run, compare them side by side and keep the best one. Log every run in the cost log of [README.md](README.md).

| Asset | Model | Prompt | References (in this order) | Format |
|---|---|---|---|---|
| Teresa sheet: front, three-quarter, close-up | Seedream 5.0 Pro | S1 | 1 Teresa photo 2 · 2 Teresa photo 3 (both: she is alone) · 3 `src/assets/lp/carbon/hero-teresa.webp` (look of the approved clip) | 16:9, 2K |
| Empty studio plate | Soul Cinema | S2 | 1 `hero-teresa.webp` | 9:16, 2K |
| Start frame angle A | Seedream 5.0 Pro | S3 | 1 the chosen sheet · 2 the chosen studio plate | 9:16, 2K |
| Start frame angle B | 3D Jutsu Angles | S4 | 1 the chosen angle A | 9:16, 2K |

Save the chosen sheet and plate in Higgsfield as elements (for example `bfl-teresa` and `bfl-studio`), so every later prompt refers to the same images. **Then send the sheet and both start frames to Teresa for approval.** Make no talking clip until she says yes; stills cost little, videos cost a lot.

### Step 3 – Talking-head clips

**Main tool: Higgsfield Intone** (`intone`):

- character image = start frame A or B (table below);
- location image = the studio plate;
- audio = the matching voice file;
- 9:16, 1080p, bitrate high;
- prompt S5, with the clip's micro-action pasted into the line «Micro-action».

Make one clip per sentence. Each clip gets one small micro-action, because without one the model leaves her frozen (JOEY), and anything bigger looks staged (Sanji).

| Clip | Voice file | Start frame | Used for | Micro-action (paste into S5 or S6) |
|---|---|---|---|---|
| T1 | 02 «Zum ersten Mal …» | A | hook H2 | eyebrows lift slightly on the question; a small reassuring nod on «So läuft es bei mir ab» |
| T2 | 03 «Carbon-Peeling oder …» | A | hook H3 | a slight head tilt on «oder»; a small closed-mouth smile on «beides» |
| T3 | 04 «Zuerst schaue ich …» | A | shot 2 | a short glance down towards the treatment bed on «Haut genau an», back to the lens before «und stimme» |
| T4 | 05 «Erst Reinigung …» | B | shot 6 (only the last 2 s) | steady look into the lens; a small nod at each comma |
| T5 | 06 «Ich bin seit …» | A | shot 7 | a slow nod on «20 Jahren»; a warm closed-mouth smile on «persönlich» |
| T6 | 07 «Carbon-Peeling und …» | B | shot 9 | steady eye contact; a small nod on «175»; a light smile on «online buchen» |
| T7 | 08 «Jetzt für 175 …» | B | 15-s cut | a small nod on «175»; a light smile on «online buchen» |

Voice file 01 (hook H1) needs no clip; it runs over clip 1.

**Second option, worth one test:** **Seedance 2.5** with her voice as an audio reference (prompt S6):

- mode `omni_reference`;
- start image = start frame A or B;
- audio reference = her voice file;
- 9:16, generate audio off;
- **Draft on** (480p, about a quarter of the price), then finalise the take you keep in 1080p within seven days.

If the lips don't follow her voice, run the silent clip through **Sync Lipsync 3** (`sync_so`, sync mode `cut_off`) with the voice file.

**Check each clip second by second against the line, and zoom in on mouth, teeth, earrings and hair.** If two takes fail the same way, change the prompt instead of running it a third time.

### Step 4 – B-roll

- **Reuse** clip 1 (Carbon lotion with Teresa), clip 2 (Microneedling pen) and clip 3 (still life) from `../ads/2026-11-carbon-video-clips/`, and the page still `methode-1.webp`.
- **Getting the 3:4 clips to 9:16:** a centred crop works for clips 1 and 3; for clip 2, crop to the right so the pen stays in frame. If a crop cuts off a face, the brush or the pen, use Higgsfield **Reframe** instead.
- **New device clips only from real photos.** If you want LED-Licht or Diamantabrasion on screen, ask Teresa for two phone photos of each real device. Generate with S7 (Seedance 2.5, draft first). Without real photos, the step is only named on screen.

### Step 5 – Edit (CapCut, Premiere or DaVinci)

**Ready-made material**, rendered with `render_video_overlays.py` and kept locally, not in the repository, in `../ads/2026-11-carbon-video-overlays/` (`45/`, `916/`):

- transparent text layers, full frame, for 9:16 and 4:5. Each format has a scrim, the hooks, the step labels, two captions, the review card and the price block. They are rendered with `render_video_overlays.py` in the style of `carbon-ad-*.mp4`.
- a rough cut, made with `render_animatic.py`: 30 s and 15 s, 9:16, silent, marked «ENTWURF». It uses the real b-roll and the final text layers, and shows marked stand-ins where T1–T7 go. Use it as the timing template, and never upload it.

**Rhythm:** cut on sentence ends and keep each shot at about 4 s at most. Alternate angles A and B. Cut on a movement, such as a nod or a blink, never on a frozen face. Let her voice start just before the picture changes (J-cut).

**Captions:**

- The talking shots use the caption layers, or text you type if she rephrased.
- The b-roll shots use the step labels.
- Shot 9 uses the price block.
- Turn **Meta's automatic captions off**.

**Look:** one light, even film grain over the whole timeline. No beauty filter, no sharpening.

**Sound:** **her original voice memo is always the voice track**. Mute the clips' generated audio, because it can bring in unwanted music. Her voice sits at about −14 LUFS, with room tone under the cuts. Music is optional and very quiet, or none at all.

**Export:**

- MP4 H.264, **24 fps** (the approved clips and the Seedance clips run at 24 fps; a 25 or 30 fps timeline makes them judder);
- 1080 × 1920 for Reels and Stories;
- 1080 × 1350 for Feed. The 4:5 layers have the same layout as `carbon-ad-45.mp4`.

### Step 6 – Your check (section 6), then Teresa's approval of the final cut

---

## 5. Prompts (copy-ready, version 2)

The same prompts are on the private copy-paste page [Carbon Avatar Prompt Kit](https://claude.ai/artifact/4ZHcr4Wz1vnNqUPMdM1vdN), with the shared blocks already filled in.

### Teresa realism block (S1, S3, S4)

It never invents skin features on a real person, and it uses the same camera as every talking shot.

```text
Unretouched real photograph, full-frame camera with a 35 mm lens, available window light mixed with a warm ceiling lamp, true-to-life colours, slightly imperfect framing, natural lens vignetting, fine sensor noise. Her real skin exactly as in the references: visible pores, fine lines, natural shine on the nose, flyaway hairs; do not add or remove freckles, moles or lines. Not a stock photo, not a render, no CGI look, no airbrushing, no beauty filter, no HDR, no oversharpening.
```

### S1 · Teresa sheet – Seedream 5.0 Pro, 16:9, 2K, four images

```text
[Teresa realism block] Reference sheet of one woman, the practitioner. Images 1 and 2 are her identity: the same face shape, eyes, nose, lips, hairline and real age; keep her clearly recognisable, do not beautify, slim or rejuvenate her. Image 3 gives only her wardrobe, hair styling and make-up: a white short-sleeved practitioner tunic with a round neckline, small drop earrings, red lipstick, long wavy blond hair worn open. Three views of the same person side by side, the same size and the same light: left, front view, head and shoulders, looking into the lens; middle, three-quarter view, turned 30 degrees, head and shoulders; right, close-up of her face, front. All three views are the same person in the same clothes. Plain warm light-grey wall behind her, soft daylight from a window on the left and a warm ceiling lamp, a soft shadow on the right side of her face; no flash, no ring light, no studio backdrop. Calm, friendly, neutral expression, lips gently closed, both hands out of frame. Avoid: text, letters, numbers, labels, logos, name tags, retouched or poreless skin, glamour lighting, perfect symmetry, stock-photo smile.
```

### S2 · Empty studio plate – Soul Cinema, 9:16, 2K, one reference

```text
Unretouched real photograph of an empty small cosmetic studio, full-frame camera with a 35 mm lens at f/2.8, available window light mixed with a warm ceiling lamp, true-to-life colours, fine sensor noise. Use the attached image only for the room's geography, materials and lighting, not for framing: the same treatment bed with a cream towel, the same cream walls, the same dark wooden cabinet with a few plain unlabelled bottles and a candle, the same window on the left with soft daylight. Nobody in the room: no people, no hands, no client. Wide three-quarter view from standing eye height, the treatment bed in the middle ground, the window on the left, depth behind. A little everyday imperfection, such as a folded towel slightly askew. Avoid: people, text, letters, logos, labels, devices, needles, lasers, clinical setting, neon, marble, flowers everywhere, perfect symmetry, CGI look.
```

### S3 · Start frame angle A – Seedream 5.0 Pro, 9:16, 2K, four images

```text
[Teresa realism block] Image 1 is the woman: her identity, real age, wardrobe, hair and make-up exactly as on the sheet (white short-sleeved tunic with a round neckline, small drop earrings, red lipstick, long wavy blond hair). Image 2 is the room: use it for geography, materials and lighting, not for framing. She stands beside the treatment bed and looks straight into the lens, calm and friendly, as if she is about to explain the treatment to a client; lips gently closed, relaxed jaw. Medium close-up, vertical 9:16, 35 mm, camera on a tripod at her eye level about one metre away: head and shoulders down to mid-chest, her eyes about one third from the top of the frame, both hands out of frame. The window is on the left of the frame, a soft shadow on the right side of her face, the room softly out of focus behind her. Avoid: text, letters, logos, name tags, glamour lighting, ring-light reflections in the eyes, stock-photo smile, perfect symmetry, a different outfit.
```

### S4 · Start frame angle B – 3D Jutsu Angles, from the chosen angle A

```text
The same photograph from a second camera position: the camera moves about 30 degrees to her left and a little closer, at the same eye height. The same woman, face, real age, tunic, earrings, hair and make-up, the same room and the same window light from the left. She still looks into the lens with the same calm expression; both hands stay out of frame. Nothing else changes; no text.
```

Fallback, if Angles changes her face: use S3, but replace the sentence that starts «Medium close-up, vertical 9:16 …» with:

```text
Medium close-up, vertical 9:16, 35 mm, camera on a tripod slightly to her left and a little closer: head and upper shoulders, her body turned about 30 degrees towards the window, her face turned back to the lens, her eyes about one third from the top of the frame, both hands out of frame; the treatment bed and the window soft in the background on the left.
```

### S5 · Intone (every talking clip)

```text
Scene: the practitioner explains the treatment to the camera in her studio.
References: character = the attached start frame; location = the attached studio plate (geography, materials and lighting only).
Format: one continuous take, no cuts.
Camera: medium close-up, 35 mm, locked-off tripod at eye level; no zoom, no push-in, no camera move.
Performance: she speaks calmly and warmly into the lens and follows the voice recording exactly; natural blinking every few seconds, short pauses where the voice pauses; no hand gestures, no wide smile, no looking away.
Micro-action: [paste the clip's micro-action from the table].
Physics: she breathes naturally before the first word, a few loose strands of hair move slightly when she nods, the tunic creases softly with her shoulders.
Light: soft daylight from the window on the left falls on her face and the room alike, constant; warm ceiling lamp.
Audio: only her voice recording; no music, no score, no added sounds, no subtitles.
Locks: same face, real age, hair and make-up as the start frame · same white tunic and earrings · both hands out of frame · the camera does not move · the window stays on the left · her mouth follows her voice.
```

### S6 · Seedance 2.5 with her voice (test) – `omni_reference`, draft, 9:16, audio generation off

Replace `[N]` with the length of the voice file in seconds, rounded up.

```text
Scene: the practitioner says one sentence to the camera in her studio, then stops speaking.
References: image 1 is the exact first frame and gives her identity, wardrobe and the room; audio 1 is her voice: her lips follow audio 1 exactly, no other speech.
First frame: exactly image 1.
Format: one continuous take, no cuts, [N] seconds.
Camera: medium close-up, 35 mm, locked-off tripod at eye level; no zoom, no push-in, no camera move.
Action: at 0.0 s she starts speaking with audio 1; she pauses where the voice pauses; after the last word she holds a calm look into the lens.
Performance: calm and warm; natural blinking; no hand gestures, no wide smile.
Micro-action: [paste the clip's micro-action from the table].
Physics: she breathes naturally before the first word, a few loose strands of hair move slightly when she nods, the tunic creases softly with her shoulders.
Light and colour: soft daylight from the left falls on her face and the room alike, warm ceiling lamp, true-to-life colours, fine grain, 24 fps with natural motion blur.
Audio: audio 1 only; no music, no score, no added sounds, no other voices.
Locks: same face and real age as image 1 · same white tunic, earrings and lipstick · both hands out of frame · camera still · window on the left · no text, no logos, no subtitles.
```

### S7 · Device clip (only with a real device photo) – Seedance 2.5, `omni_reference`, 4 s, draft, 9:16, audio off

Replace the two [brackets].

```text
Scene: close-up of one treatment step in the studio, gloved hands only.
References: image 1 gives the fictional client and the room (identity, geography, light); image 2 is the real device: copy its exact shape, colour and material, add nothing, no lettering.
Location: the client reclines on the treatment bed with a cream towel headband, the window on the left.
First frame: [the device already in the gloved hand, just above the cheek].
Format: one continuous take, 4 seconds, no cuts.
Camera: close-up, 50 mm, tripod slightly above cheek level, a very slow push-in, shallow depth of field.
Action: 0–4 s [the device moves slowly across the cheek].
Performance: the client is relaxed, eyes closed, no change of expression.
Light and colour: soft daylight from the left, warm and natural, fine grain.
Audio: none.
Locks: exactly two gloved hands with five fingers each · the practitioner's face out of frame · the device exactly as image 2 · no text, logos, needles, light beams, blood, redness or results.
```

### Repair lines (add to the prompt, new run)

| Problem | Line to add |
|---|---|
| She looks younger or "prettier" | «Keep her exact real age and features from the references; no smoothing, no slimming.» |
| Waxy skin | «Real unretouched skin with visible pores and fine lines, matte, no beauty filter.» |
| Mouth or teeth flicker | «Small natural mouth movements; teeth only briefly visible; no flicker.» |
| Head floats or wobbles | «Head movement minimal and grounded; shoulders steady.» |
| Text or letters appear | «Absolutely no text, letters, numbers or symbols anywhere.» |
| Hands appear | «Both hands stay below the bottom edge of the frame.» |
| The camera copies the reference angle | «Use image 2 for geography, materials and lighting only, not for framing.» |
| She stands frozen | Add or sharpen the micro-action; JOEY: without one the model leaves people still. |
| A take ignores parts of the prompt | Shorten the prompt: remove everything that isn't a lock or the action (JOEY). |
| Music appears in the generated audio | Mute it; her voice memo is the soundtrack anyway. |

---

## 6. Check before Teresa sees it

**The eight AI tells (Marxx):**

- [ ] **Skin:** pores and fine lines visible; same grain on every shot.
- [ ] **Hands:** none in the talking shots; five fingers and gloves in the b-roll.
- [ ] **Text:** nothing written by a generator; captions and price typed and spelled correctly (Swiss spelling, no «ß»).
- [ ] **Devices:** only approved clips, or clips made from real device photos.
- [ ] **Light:** window on the left in every shot; no ring light in her eyes.
- [ ] **Motion:** no shot longer than about 4 s, no floating head, no morphing background.
- [ ] **Voice:** her real voice (or the approved copy) with natural pauses; lips close on «m», «b» and «p».
- [ ] **Setting:** the same studio look as the page hero.
- [ ] **Identity:** Teresa would say "that's me", the same age, not beautified.

**Rules for this campaign:**

- [ ] Only the approved script; no «Laser», «Hydra», «garantiert», «schmerzfrei», «keine Ausfallzeit», «Falten», «Narben», «Akne», «Kollagen», «medizinisch», «jünger», «klärt».
- [ ] No result, no before/after, no customer avatar.
- [ ] Price block exactly «CHF 175 statt ~~CHF 250~~ · Sie sparen CHF 75.–», no date in the video.
- [ ] Treatwell rating read on the day of export.
- [ ] AI-disclosure decision made (gate 2).
- [ ] Teresa approved the sheet and both start frames before any talking clip was made.
- [ ] Teresa has seen the final cut and said yes (gate 1).

---

## 7. Running it on Meta

- **Where:** as new ads in the existing paused ad set `p_zh15km_adv-carbon` (`120254554001060195`). Don't create a new ad set, because the lifetime budget is CHF 400. One ad per hook, each with 9:16 for Reels/Stories and 4:5 for Feed. Names: `avatar-h1_video_v1`, `avatar-h2_video_v1`, `avatar-h3_video_v1`.
- **Same as the other ads:** link URL with the UTMs from the build sheet (`utm_content` fills itself from the ad name), button **Jetzt buchen**, primary text from [README.md](README.md) («Anzeigentexte»; the end date sits there, not in the video).
- **How many ads at once (recommendation):** CHF 400 does not carry seven ads. Run H1–H3, plus `maske_video45_v1` as the control (the silent video without Teresa speaking), plus `maske_static45_v1`. Keep `erstes-mal_static45_v1` and `persoenlich_static45_v1` paused in reserve.
- **What to compare** after about 1,000 impressions per ad:
  - **Hook rate** = 3-second video plays ÷ impressions (does the first moment stop the scroll);
  - **ThruPlays** ÷ impressions (do people stay);
  - **link CTR**;
  - cost per `Schedule`, as a tie-breaker only, because this budget brings too few bookings to decide on.

  Compare each ad with the control, not with numbers from other markets. Marxx's example rates come from product ads in India.
- **Then:** pause a hook that is clearly behind after about 1,500 impressions. Make the 15-s cut of the winner (section 2.3) and run it next to the 28-s version. If the control beats all three avatar ads, stop the avatar ads; the guide's own lesson is that real footage often wins.

---

## 8. Where the files go

The GitHub repository has been **public** since 2026-10-30.

- **Never in the repository:** Teresa's reference photos (other than the portrait listed below), her voice recordings, the voice element, raw clips or job answers. Keep them next to the earlier clips, outside the repo, for example `../ads/2026-11-carbon-avatar/` (`voice/`, `startbilder/`, `clips/`, `export/`).
- **The final videos** go straight to Meta. They only belong in `public/` if the website ever needs them, and the website does not need them.
- **In the repository:** `render_video_overlays.py` and `render_animatic.py`. The text layers they render are kept locally in `../ads/2026-11-carbon-video-overlays/` (no person in them; user decision 2026-11-06: no ad creative files on GitHub), and the rough cut is rebuilt from the scripts. Neither is committed.
- **Teresa material that is in the repository** (all approved or consented): her real portrait `src/assets/marketing/teresa_portrait.jpg`, the consented generated hero image `src/assets/lp/carbon/hero-teresa.webp` and the hero video and posters in `public/assets/lp-carbon/` made from it, and the approved October ads with her (motif M7: `teresa_45.jpg`, `teresa_916.jpg`, `raw/teresa_20261031_*.png` in this folder).
- **Unapproved likeness material stays outside the repository:** the image-ad candidates and finals from rounds 3 onwards that show Teresa are kept in `../ads/2026-11-carbon-runden-3-6/` (next to `astro-v2`, see its README). They move into the repository only after Teresa's written OK. The same applies to anything made with this guide.
- **For the record (here, in a short note):** the date of Teresa's consent and which voice route she chose, the chosen start images (file names), the Higgsfield job ids, and the AI-disclosure decision.
