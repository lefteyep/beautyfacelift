# Video ad with Teresa as an AI avatar: storyline and prompting guide

Campaign: Carbon-Peeling + Microneedling, **CHF 175 statt CHF 250**, Sie sparen CHF 75.–, 90 Min., valid until 30 November 2026 ([META-CAMPAIGN-CARBON-MICRONEEDLING.md](../../../docs/current/META-CAMPAIGN-CARBON-MICRONEEDLING.md)). Placement: Meta (Instagram and Facebook, Reels/Stories first, Feed second). Written 2026-11-04. Nothing has been generated or uploaded yet.

This guide is built on three Marxx guides ([avoid AI-looking ads](https://marxx.ai/guides/how-to-avoid-ai-looking-ads), [UGC script template](https://marxx.ai/templates/ugc-script-template), [hooks for skincare ads](https://marxx.ai/templates/hooks-for-skincare-ads)). They are adapted to this offer, to Meta's beauty-ad rules and to the copy rules this project already uses. Every fact Teresa says comes from the campaign doc, the ad page or Treatwell. Nothing new is claimed.

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
- Treatwell shows CHF 175 for "Carbon Laser Peeling + Microneedling" (launch gate 2 of the campaign).
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

### 2.1 Script, about 28 s (≈ 63 words)

Sie form, Swiss spelling. Teresa may say it in her own words (also in dialect) as long as the meaning and the cautious wording stay. The captions stay in Standard German.

| Beat | Time | Teresa says | Meaning (EN) | Source |
|---|---|---|---|---|
| 1 Hook | 0–3 s | one of H1–H3 (section 3) | | |
| 2 Frage | 3–8 s | «Zuerst schaue ich mir Ihre Haut genau an – und stimme die Behandlung darauf ab.» | First I look closely at your skin and adjust the treatment to it. | skin analysis before; Microneedling depth set to skin type |
| 3 Behandlung | 8–18 s | «Erst Reinigung und Peelings, dann Carbon-Peeling und Microneedling, zum Schluss Maske und LED-Licht.» | First cleansing and peelings, then Carbon peeling and Microneedling, finally mask and LED light. | Teresa's step list; the page's three step titles |
| 4 Beweis | 18–24 s | «Ich bin seit über 20 Jahren im Beruf – und behandle Sie persönlich.» | I've been in this profession for over 20 years, and I treat you personally. | your statement 2026-10-31; "Persönlich behandelt von Teresa Stimac" |
| 5 CTA | 24–30 s | «Carbon-Peeling und Microneedling, 90 Minuten – jetzt für 175 statt 250 Franken. Termin direkt online buchen.» | … 90 minutes, now 175 instead of 250 francs. Book online. | offer; ad text closing line |

Not in the script on purpose: the date (the existing videos carry none, so the video stays correct if the end date moves; the date sits in the primary text), "Laser", and any effect word ("klärt", Poren, Kollagen and so on).

### 2.2 Shot list (9:16, hook H1 shown)

A-roll = Teresa talking (generated). B-roll = the approved clips from `../ads/2026-11-carbon-video-clips/` (outside the repo) or page images.

| # | Time | Picture | Sound | On screen (typed in the editor) |
|---|---|---|---|---|
| 1 | 0.0–2.8 | B-roll **clip 1**: Teresa brushes the black lotion on (start mid-stroke) | hook line (her voice) | hook text from 0.3 s |
| 2 | 2.8–8.0 | A-roll **angle A** | beat 2 | captions · «Mit Hautanalyse» |
| 3 | 8.0–10.5 | B-roll **clip 3** (still life, table) | «Erst Reinigung und Peelings,» | «Reinigung und Peelings» |
| 4 | 10.5–13.5 | page image `methode-1.webp` with a slow 3 % push-in | «dann Carbon-Peeling» | «Carbon-Peeling» |
| 5 | 13.5–16.0 | B-roll **clip 2** (Microneedling pen) | «und Microneedling,» | «Microneedling» |
| 6 | 16.0–18.0 | A-roll **angle B** | «zum Schluss Maske und LED-Licht.» | «Maske und LED-Licht» |
| 7 | 18.0–22.0 | A-roll **angle A** | beat 4 | captions |
| 8 | 22.0–24.5 | review card on a blurred still of clip 3 | room tone | «Fühlte mich gut aufgehoben und kann Beauty Face Lift mit gutem Gewissen weiter empfehlen.» – Svenja, Microneedling, Treatwell, März 2025 · «4,8 aus 260+ Bewertungen auf Treatwell» |
| 9 | 24.5–30.0 | A-roll **angle B**; last 1.5 s still life with price band | beat 5 | «Aktion · nur für kurze Zeit» · «Carbon-Peeling + Microneedling» · «CHF 175 statt ~~CHF 250~~ · Sie sparen CHF 75.–» · «Beauty Face Lift · Bahnhofstrasse 94, Zürich» |

- The review is verbatim from `src/pages/lp/carbon-microneedling/_reviews.ts` (first entry). It is a real Microneedling review, labelled as such, so it does not pretend to be about this offer.
- Price block: exactly the overlay of the existing `carbon-ad-*.mp4` files, with the 250 struck by the thin red diagonal of the page.
- No drawn "book" button. Meta places its own **Jetzt buchen** button under the video.

### 2.3 15-second cut (make it for the winning hook)

| Time | Picture | Teresa says |
|---|---|---|
| 0–3 s | hook shot | hook line |
| 3–10 s | shots 3–6 (b-roll + angle B) | «Erst Reinigung und Peelings, dann Carbon-Peeling und Microneedling, zum Schluss Maske und LED-Licht.» |
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

### Step 2 – Start images for the talking shots (two angles)

Use the consented workflow from M7 (`gpt-image-2.5-flare`, OpenAI Playground). Upload **only** photos on which Teresa is alone (photos 2 and 3 in the client folder), never photos with real clients. Generate 2–3 candidates per angle and pick the one where Teresa says "that's me". Prompts P1 and P2 are in section 5.

### Step 3 – Talking-head clips

**Main tool: Higgsfield Intone** (`intone`, "talking-head, lip-sync"):

- character image = angle A or angle B;
- audio = one recording per beat (Intone takes 2–30 s of voice);
- location image: leave it empty, because the start image already shows the room;
- 9:16, 1080p, bitrate high;
- prompt P3.

Make one clip per beat, not one 30-s take. You can then pick the best take per beat, and every clip stays short.

**Fallback, if Intone looks floaty:** make a silent clip with **Seedance 2.5** (`seedance_2_5`, mode `omni_reference`, start image = angle A/B, 5–8 s, 1080p, 9:16, audio off, prompt P4). Then run it through **Sync Lipsync 3** (`sync_so`, input video + her audio, sync mode `cut_off`).

### Step 4 – B-roll

- Reuse clip 1 (Carbon lotion with Teresa), clip 2 (Microneedling pen) and clip 3 (still life) from `../ads/2026-11-carbon-video-clips/`. They are 3:4, so crop them to 9:16 and check that the faces, brush and pen stay in frame. Use `methode-1.webp` as a still with a slow push-in.
- **New device clips only from real photos.** If you want LED-Licht or Diamantabrasion on screen, ask Teresa for two phone photos of each real device. Generate with prompt P5. Without real photos, the step is only named on screen.
- Earlier clips cost 64 credits each (Seedance 2.5, 4 s, 1080p); Higgsfield shows the price before each run.

### Step 5 – Edit (CapCut, Premiere or DaVinci)

- **Rhythm:** cut on sentence ends and keep each shot at about 4 s at most. Alternate angles A and B. Let her voice start just before the picture changes (J-cut).
- **Captions:** every spoken word, typed by you, at most two lines of about 32 characters, Instrument Sans in the page colours. Use Swiss spelling and check for "ß". Turn **Meta's automatic captions off**, so you don't get two sets.
- **Text position, 9:16:** nothing important in the top 14 % or the bottom 20 % (the same as `carbon-ad-916.mp4`). Her eyes sit about a third from the top; captions go over her chest.
- **Look:** one light, even film grain over the whole timeline, so the generated and the other clips match. No beauty filter, no sharpening.
- **Sound:** her voice at about −14 LUFS, room tone under the cuts so the silence never drops out completely. Music is optional and very quiet (Meta Sound Collection), or none at all; her voice is the point.
- **Export:** MP4 H.264, 1080 × 1920 (Reels/Stories) and 1080 × 1350 (Feed, the same layout as `carbon-ad-45.mp4`), 25 or 30 fps.

### Step 6 – Your check (section 6), then Teresa's approval of the final cut

---

## 5. Prompts (copy-ready)

### Realism block (the same as round 2, put it at the start of P1, P2 and P5)

```text
Unretouched real photograph taken by a working photographer during an actual appointment, Fujifilm X-T5 with a 35 mm f/1.4 lens, available window light mixed with a warm ceiling lamp, true-to-life colours, slightly imperfect framing, natural lens vignetting, fine sensor noise. Real skin: uneven tone, visible pores, fine vellus hair, a few freckles and small moles, slight natural shine on the nose, flyaway hairs. A lived-in small studio with ordinary details. Not a stock photo, not a render, no CGI look, no airbrushing, no beauty filter, no HDR, no oversharpening, no overly perfect styling.
```

### P1 · Start image angle A (front, 9:16) – `gpt-image-2.5-flare`, 1088 × 1920 or the nearest 9:16 size, quality `max`

```text
[Realism block] Use the attached photos only as identity reference for the woman: the same face shape, hair, hairline and lipstick as in the references; keep her clearly recognisable and her real age, do not beautify, slim or rejuvenate her. She is the practitioner in her small cosmetic studio, wearing a plain white practitioner coat without name tag or logo. She stands beside a treatment bed with a cream towel; a window on the left with soft daylight, a cream wall and a dark wooden side cabinet with a few plain unlabelled bottles are softly out of focus behind her. Vertical 9:16 frame as if filmed with a phone on a small tripod at eye level, about 70 cm away: head and shoulders down to mid-chest, her eyes about one third from the top of the frame, both hands out of frame. She looks straight into the lens with a calm, friendly, attentive expression, as if she is about to explain something to a client; lips gently closed, relaxed jaw. Light from the left with a soft shadow on the right side of her face. Avoid: text, letters, numbers, logos, name tags, retouched or poreless skin, glamour lighting, ring-light reflections in the eyes, perfect symmetry, stock-photo smile, studio backdrop, clinical setting. One photo.
```

### P2 · Start image angle B (three-quarter, closer)

Use the same prompt as P1, but replace the sentence starting «Vertical 9:16 frame …» with:

```text
Vertical 9:16 frame, phone on a small tripod slightly to her left, a little closer than a normal conversation: head and upper shoulders, her body turned about 30 degrees to the window, her face turned back towards the lens, eyes about one third from the top, both hands out of frame; the treatment bed and the window are visible in the soft background on the left.
```

### P3 · Intone performance prompt (for every talking clip)

```text
She speaks calmly and warmly straight into the camera, like explaining the treatment to a client at the treatment bed. Natural, unhurried delivery that follows the voice recording exactly: small head movements, an occasional slow nod on key words, natural blinking every few seconds, slight eyebrow movement, short pauses where the voice pauses. Shoulders stay relaxed and both hands stay out of frame. The camera stands still on a tripod: no zoom, no camera move, only the faintest handheld micro-drift. The daylight from the window on the left stays constant. No exaggerated mouth shapes, no flickering teeth, no head bobbing, no looking away, no morphing of the face, hair or background, no change of clothing.
```

### P4 · Fallback silent clip for lip-sync – Seedance 2.5, `omni_reference`, audio off

```text
Use the attached image as the exact first frame and identity reference. The woman talks to the camera in a calm, normal conversation, as if explaining a treatment to a client, mouth moving naturally with speech, small head movements, natural blinking, short pauses. Both hands stay out of frame. Static tripod camera, no zoom, no camera move, constant soft daylight from the left. Keep her face, age, hair and clothing exactly as in the image. No text, no logos, no exaggerated expressions, no morphing.
```

### P5 · New device clip (only with real device photos) – Seedance 2.5, `omni_reference`, 4 s, 1080p, 9:16, audio off

```text
[Realism block] Use the first attached photo only as reference for the fictional client and the studio, and the second attached photo (the real device) only as reference for the exact shape, colour and material of the device; do not change, add or remove any part, no lettering on it. [Describe the moment in one sentence, for example: Two gloved hands in white nitrile gloves guide the device slowly over the client's cheek.] One simple, slow action for 4 seconds. Static camera or a very slow push-in, no cuts, no fast movements. Only gloved hands and forearms of the practitioner, her face out of frame; exactly two hands with five fingers each. Avoid: text, letters, logos, lasers, light beams, visible needles, blood, redness, results, before/after, extra fingers, morphing objects, clinical setting.
```

### Repair lines (add to the prompt, new run)

| Problem | Line to add |
|---|---|
| She looks younger or "prettier" | «Keep her exact real age and features from the reference photos; no smoothing, no slimming.» |
| Waxy skin | «Real unretouched skin with visible pores and fine lines, matte, no beauty filter.» |
| Mouth or teeth flicker | «Small natural mouth movements; teeth only briefly visible; no flicker.» |
| Head floats or wobbles | «Head movement minimal and grounded; shoulders steady.» |
| Text or letters appear | «Absolutely no text, letters, numbers or symbols anywhere.» |
| Hands appear | «Both hands stay below the bottom edge of the frame.» |

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

- **Never in the repository:** Teresa's reference photos, her voice recordings, the voice element, raw clips or job answers. Keep them next to the earlier clips, outside the repo, for example `../ads/2026-11-carbon-avatar/` (`voice/`, `startbilder/`, `clips/`, `export/`).
- **The final videos** go straight to Meta. They only belong in `public/` if the website ever needs them, and the website does not need them.
- **For the record (here, in a short note):** the date of Teresa's consent and which voice route she chose, the chosen start images (file names), the Higgsfield job ids, and the AI-disclosure decision.
