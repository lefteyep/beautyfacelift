# AI image prompts — Meta ads, Aquafacial + Microneedling (October 2026)

Written 2026-10-13 for the campaign in [docs/current/META-CAMPAIGN-AQUAFACIAL-MICRONEEDLING.md](../../../docs/current/META-CAMPAIGN-AQUAFACIAL-MICRONEEDLING.md). They produce **new photos for new ad variants**. The three ads already built use real photos and stay as they are.

The prompts are written for OpenAI's image model in ChatGPT. OpenAI's documentation lists `gpt-image-2` (April 2026) as its newest model; no "2.5" appears there. If you have a newer one, the prompts work the same way. Only the size options may differ.

They follow the same style as the landing page's generated photos ([teresa-varied-series/PROMPTS.md](../../images/lp-shoot-2026-10/teresa-varied-series/PROMPTS.md)), so the ads and the page look like one studio.

## 1. How to use them

1. **One new ChatGPT chat per prompt.** A fresh chat stops details from one scene leaking into the next.
2. **Attach the reference photos first, then paste the prompt.** Each prompt says which photos it needs:

   | Code | File (download from GitHub: open the link, then "Download raw file") | What it gives the model |
   |---|---|---|
   | **T1** | [src/assets/marketing/teresa_portrait.jpg](../../../src/assets/marketing/teresa_portrait.jpg) | Teresa's face and figure (real photo) |
   | **T2** | [ai-references/teresa-treatment-crop.jpg](ai-references/teresa-treatment-crop.jpg) | Teresa at work. This is the real treatment photo cropped so that **no real client** is in it. |
   | **C** | [slot-12-candidate-01.png](../../images/lp-shoot-2026-10/teresa-varied-series/slot-12-candidate-01.png) | The fictional client from the landing page, so she is the same woman in every ad (generated, not a real person) |

   - If you still have the five real photos of Teresa from `3.zip`, you can add one or two of them as well. More real angles keep her likeness more stable.
   - Never upload photos of real clients.
3. **Generate 3 attempts per prompt** and keep the best. Use the repair lines in section 4 for small faults, rather than starting again.
4. **Size:** ask for the format named in the prompt.
   - Over the API, `gpt-image-2` accepts exact sizes: **1600×2000** for 4:5 and **1440×2560** for 9:16.
   - If ChatGPT only offers "portrait" (2:3), take that. I crop it, which is why every prompt leaves space around the people.
5. **No text in the image.** Price, end date and address are added afterwards by me, with the same fonts as the website (`render_ads.py`). Image models misspell prices and dates. A wrong price or a missing end date would break the Swiss price-display rules (PBV) and Meta's rules.
6. **Download the PNG originals** and send them to me here, as attachments or one zip. Name them after the prompt, e.g. `P1-a.png`, `P1-b.png`.
7. **9:16 versions:** once a 4:5 image is good, send the "9:16 follow-up" message in **the same chat**, so the people, room and light stay identical.

**If ChatGPT refuses to use Teresa's face:** explain that she is the studio owner and has consented. If it still refuses, use the prompts that need no face (P2, P4, P5, P6 room version, P8). The real portrait still carries her in the existing ad.

## 2. Which prompt is for which ad

The angles A1–A5 are from section 5.2 of the plan.

| Prompt | Scene | Angle | Needs | Text band I add afterwards (facts from the site only) |
|---|---|---|---|---|
| **P1** | Teresa during the Aquafacial, two people | A1 Glow | T1, T2, C | "Aquafacial + Microneedling" · "CHF 170 statt CHF 250 · 1 Std. 30 Min." · "Angebot bis 14. November · Bahnhofstrasse 94, Zürich" |
| **P2** | Aquafacial close-up, hands only | A1 Glow | C | same as P1 |
| **P3** | Teresa explains the Microneedling pen before the treatment | A2 Erstes Microneedling | T1, T2, C | "Zum ersten Mal Microneedling?" · "Persönliche Hautanalyse vorab" · price and end-date line |
| **P4** | Microneedling pen on the cheek, hands only | A2 | C | same as P3 |
| **P5** | Calming aftercare, hands only | A1 / A2 | C | "Mit beruhigender Abschlusspflege" · price and end-date line |
| **P6** | Studio at dusk, after work | A3 Nach der Arbeit | none (room) or C | "Wenige Gehminuten vom HB" · "Mo–Fr bis 20 Uhr, Sa bis 16 Uhr" · price and end-date line |
| **P7** | Teresa portrait in the studio (optional) | A4 Trust | T1, T2 | "Persönlich von Teresa Stimac" · "20+ Jahre Erfahrung · 4,8 aus 248+ Bewertungen" · price and end-date line |
| **P8** | Empty background (linen, brass tray, window light) | A5 end-date card, A2 question card | none | price card, or the three questions of the existing A2 card |

**Order of priority:** P1, P3 and P6 first. They are three different angles, which gives Meta the most variety. Then P2/P4/P5 as alternatives, and P7/P8 only if needed.

## 3. The prompts

Each block can be copied and pasted as it is; the shared rules are already inside every block.

### P1 — Aquafacial with Teresa (A1, 4:5) · attach T1, T2, C

```text
Photorealistic editorial photograph, vertical 4:5 portrait (1600×2000 or the closest portrait size).

SCENE: An Aquafacial treatment in progress, seen from the side of the treatment bed at the eye level of the reclined client, 40 mm lens look. The client lies relaxed with closed eyes, cream towel headband, cream robe, head on a cream pillow. Teresa stands on the far side of the bed in a three-quarter profile, leaning slightly towards the client, looking down at her own hand with calm concentration, mouth closed, not looking at the camera. Her gloved right hand guides ONE Aquafacial handpiece over the client's cheekbone; her other gloved hand rests lightly at the client's temple. Calm empty cream wall above Teresa's head. Window light from the left.

COMPOSITION: Teresa's whole head, the client's whole face, the handpiece and both hands all sit in the upper 70% of the frame, roughly in the middle. Keep the bottom 28% calm and simple (soft out-of-focus linen and robe) with nothing important in it — a text band will be added there later. Leave a little space above Teresa's hair.

TERESA (real person, consented): The attached real photographs show Teresa Stimac, the owner of the studio, who has agreed to this image. She must be clearly recognisable as the same person: same facial proportions, her actual age, eye shape, nose, lips, long side-parted blonde hair with darker roots, make-up and small earrings as in the photos. Never a generic substitute blonde, not younger, not slimmer, no beautifying. Plain white short-sleeved cosmetic tunic with NO name badge and no lettering. Warm-white nitrile gloves. Use the photos for her identity only, not for their pose, background, shelves, flowers or name badge.

CLIENT (fictional): The attached generated photo of a woman in a cream robe is a fictional client; keep her identical: about 42, shoulder-length chestnut hair, light olive skin, oval face, subtle freckles, ordinary fine lines, visible pores and natural skin texture. Her skin stays ordinary — never smoother, brighter or "improved". Do not blend her face with Teresa's.

DEVICE: One slim white unbranded Aquafacial handpiece with one small transparent spiral tip, and one thin clear tube attached at its back, running continuously and naturally out of the frame. Only this one device in the picture.

STUDIO: A small, calm, premium cosmetic studio in Zürich. Cream walls (#FAF6F1), blush and sand textiles (#EAD9CC, #F3EAE1), white treatment bed with cream linen, small brushed-brass details (#8F5A2E), a few dark espresso cabinet accents (#2A1E18), one window on the left with soft daylight, a few completely unlabelled bottles far in the soft background. Shallow depth of field, gentle warm colour grade, fine natural photographic grain, real skin texture on both women.

DO NOT INCLUDE: any text, letters, numbers, prices, logos, watermarks, name badges, signs or device branding; extra, missing or fused fingers, duplicate hands or devices; floating or disconnected tubes; plastic poreless skin, heavy retouching, over-white teeth, a posed smile into the camera; redness, swelling, needles or blood; a medical or clinical look, blue clinical light, neon, marble kitsch, lots of flowers; before/after layouts, split screens or anything that shows a treatment result.
```

Variations for attempts 2 and 3, added as one last line:

- `Variation: camera at the foot of the bed, diagonal view, Teresa a little smaller in the frame.`
- `Variation: Teresa gives the client a slight, warm closed-mouth smile while she works.`

**9:16 follow-up (same chat):**

```text
Now make exactly the same scene as a vertical 9:16 image (1440×2560 or the closest tall size). Keep both women, their faces, clothes, the handpiece, the room and the light identical. Place both faces, the hands and the handpiece between 15% and 55% of the image height. Keep the top 14% calm (cream wall) and everything below 58% calm and simple (out-of-focus bed linen and robe) — text and app buttons go there. Still no text, logos or badges anywhere.
```

### P2 — Aquafacial close-up, hands only (A1, 4:5) · attach C

```text
Photorealistic editorial close-up photograph, vertical 4:5 portrait (1600×2000 or the closest portrait size).

SCENE: 50 mm close-up from beside the client's temple towards her cheekbone. Part of the client's face fills the upper frame: one closed eye, cheek, a strand of chestnut hair, cream towel headband. A practitioner's warm-white gloved hand and forearm guide ONE slim white Aquafacial handpiece; its small transparent spiral tip rests on the upper cheekbone, with a fine film of moisture on the skin (not glossy). Two relaxed fingertips of the other gloved hand steady the temple. The practitioner's face is outside the frame.

COMPOSITION: Tip and skin contact at about 50% across and 35% down. Everything important sits in the upper 70%. The bottom 28% is calm, softly blurred cream linen and robe — a text band will be added there later.

CLIENT (fictional): The attached generated photo shows the fictional client; keep her identical: about 42, chestnut hair, light olive skin, subtle freckles, ordinary fine lines, visible pores, natural skin texture. Her skin stays ordinary, never smoother or "improved".

DEVICE: One slim white unbranded handpiece, one small transparent spiral tip, one thin clear tube attached at the back and running continuously out of the frame. Nothing else.

LOOK: Calm premium cosmetic studio, cream and sand linen in soft background blur, soft daylight from the left, gentle warm colour grade, fine natural grain.

DO NOT INCLUDE: text, letters, numbers, logos, watermarks or device branding; extra or fused fingers, a third hand, duplicate devices, floating or disconnected tubes; plastic poreless skin; redness, needles or blood; clinical blue light; before/after or any result image.
```

**9:16 follow-up:** send the P1 follow-up. Replace its first sentence with: `Now make exactly the same close-up as a vertical 9:16 image, with the tip and skin contact at about 35% of the height.`

### P3 — First Microneedling: Teresa explains the pen (A2, 4:5) · attach T1, T2, C

```text
Photorealistic editorial photograph, vertical 4:5 portrait (1600×2000 or the closest portrait size).

SCENE: The calm start of a first Microneedling appointment, before any treatment. The client sits upright on the edge of the treatment bed in her cream robe, without a headband, hands relaxed in her lap, listening attentively. Teresa sits beside her at the same eye height, turned towards her in three-quarter view, explaining calmly. In one gloved hand, at chest height between them, Teresa holds ONE slim matte warm-grey Microneedling pen, showing it to the client; her other hand makes a small, open, reassuring gesture. The pen does not touch skin. Both look at the pen or at each other — nobody looks into the camera. Eye-level camera, 45 mm lens look.

COMPOSITION: Both faces and the pen in the upper 70% of the frame. The bottom 28% is calm and simple (soft robe and linen out of focus) — a text band will be added there later. Calm cream wall above both heads.

TERESA (real person, consented): The attached real photographs show Teresa Stimac, the owner of the studio, who has agreed to this image. She must be clearly recognisable as the same person: same facial proportions, her actual age, eye shape, nose, lips, long side-parted blonde hair with darker roots, make-up and small earrings as in the photos. Never a generic substitute blonde, not younger, not slimmer, no beautifying. Plain white short-sleeved cosmetic tunic with NO name badge and no lettering. Warm-white nitrile gloves. Use the photos for her identity only, not for their pose, background, shelves, flowers or name badge.

CLIENT (fictional): The attached generated photo shows the fictional client; keep her identical: about 42, shoulder-length chestnut hair, light olive skin, oval face, subtle freckles, ordinary fine lines, visible pores and natural skin texture. Relaxed, curious, a little thoughtful — not anxious, not posing. Do not blend her face with Teresa's.

DEVICE: One slim matte warm-grey pen, the size of a thick marker, with a small smooth cartridge cap at the tip. No needles visible, no cables, no branding. No other device in the picture.

STUDIO: A small, calm, premium cosmetic studio in Zürich. Cream walls (#FAF6F1), blush and sand textiles (#EAD9CC, #F3EAE1), white treatment bed with cream linen, small brushed-brass details (#8F5A2E), a few dark espresso cabinet accents (#2A1E18), one window on the left with soft daylight, a few completely unlabelled bottles far in the soft background. Shallow depth of field, gentle warm colour grade, fine natural photographic grain, real skin texture.

DO NOT INCLUDE: any text, letters, numbers, prices, logos, watermarks, name badges, signs or device branding; extra, missing or fused fingers, duplicate hands or devices; plastic poreless skin, heavy retouching, a posed smile into the camera; visible needles, redness or blood; a medical or clinical look, blue clinical light, neon; before/after layouts or anything that shows a treatment result.
```

Variations:

- `Variation: instead of the pen, Teresa holds a small plain hand mirror (it reflects only the cream wall) and gently points to the client's cheek area while explaining; no device in the picture.`
- `Variation: Teresa gives a slight reassuring closed-mouth smile; the client nods.`

**9:16 follow-up:** send the P1 follow-up unchanged.

### P4 — Microneedling detail, hands only (A2, 4:5) · attach C

```text
Photorealistic editorial close-up photograph, vertical 4:5 portrait (1600×2000 or the closest portrait size).

SCENE: 50 mm detail of a calm cosmetic Microneedling step. Only the client's lower cheek and jaw, one closed eye, some chestnut hair on a cream pillow, and a practitioner's warm-white gloved hand are visible. The hand holds ONE slim matte warm-grey Microneedling pen like a thick marker in a natural writing grip; its small smooth cartridge tip rests gently on the cheek just above the jaw. At most a faint natural flush on the skin. The practitioner's face and body are outside the frame.

COMPOSITION: Tip and skin contact at about 55% across and 35% down; the whole pen visible. Everything important in the upper 70%; the bottom 28% is calm, softly blurred cream linen — a text band will be added there later.

CLIENT (fictional): The attached generated photo shows the fictional client; keep her identical: about 42, chestnut hair, light olive skin, subtle freckles, ordinary fine lines, visible pores, natural skin texture. Relaxed, eyes closed.

LOOK: Calm premium cosmetic studio, cream and sand linen in soft background blur, soft daylight from the left, gentle warm colour grade, fine natural grain. Non-clinical, quiet.

DO NOT INCLUDE: visible needles, puncture marks, blood, swelling or strong redness; text, letters, numbers, logos or device branding; extra or fused fingers, a second pen, any Aquafacial handpiece or tube; plastic poreless skin; clinical blue light; before/after or any result image.
```

**9:16 follow-up:** the P2 version of the follow-up.

### P5 — Calming aftercare, hands only (A1/A2, 4:5) · attach C

```text
Photorealistic editorial photograph, vertical 4:5 portrait (1600×2000 or the closest portrait size).

SCENE: The calm end of the appointment, seen slightly from above at a diagonal, 40 mm lens look. The client lies relaxed with closed eyes, cream towel headband. Two warm-white gloved hands gently smooth a thin, translucent calming gel onto her cheek and temple with the fingertips. The practitioner's face is outside the frame or only a soft edge of her white tunic shows. A small unlabelled cream jar with its lid off and one small brass spatula rest on a cream linen tray nearby. No devices.

COMPOSITION: Client's face and both hands in the upper 65% of the frame. The jar and tray may sit just above the lower edge, but the bottom 28% is otherwise calm, out-of-focus linen — a text band will be added there later.

CLIENT (fictional): The attached generated photo shows the fictional client; keep her identical: about 42, chestnut hair, light olive skin, subtle freckles, ordinary fine lines, visible pores and natural skin texture. Her skin looks the same ordinary skin as before the treatment — no glow effect, no "after" look.

LOOK: Calm premium cosmetic studio, cream walls (#FAF6F1), sand and blush linen (#EAD9CC, #F3EAE1), small brass details (#8F5A2E), soft daylight from the left, gentle warm colour grade, fine natural grain.

DO NOT INCLUDE: text, letters, numbers, labels on the jar, logos or branding; extra or fused fingers, a third hand; plastic poreless or shiny skin; redness, needles or blood; clinical blue light; before/after or any result image.
```

**9:16 follow-up:** send the P1 follow-up unchanged.

### P6 — After work: the studio at dusk (A3, 4:5) · attach C only for variation 2

Main version: the room only, no people.

```text
Photorealistic editorial interior photograph, vertical 4:5 portrait (1600×2000 or the closest portrait size).

SCENE: A small, calm, premium cosmetic treatment room in Zürich in the early evening, ready for an after-work appointment. Through the window on the left: deep blue dusk and soft, completely out-of-focus warm city lights — no recognisable buildings, no landmarks, no signs, no shop names. Inside: warm, low lamp light. A white treatment bed with cream linen; a neatly folded cream robe and a cream towel headband lie at the foot of the bed. A small brushed-brass tray with one unlabelled jar on a side table. Nobody in the room. 35 mm lens look at standing eye height, from the door towards the window.

COMPOSITION: The bed, the folded robe and the window in the upper 70% of the frame. The bottom 28% is calm (soft floor and the lower bed linen out of focus) — a text band will be added there later.

STUDIO: Cream walls (#FAF6F1), blush and sand textiles (#EAD9CC, #F3EAE1), small brushed-brass details (#8F5A2E), a few dark espresso cabinet accents (#2A1E18), a few completely unlabelled bottles far in the soft background. Gentle warm colour grade, fine natural grain, shallow depth of field. Quiet, welcoming, not luxurious-kitsch.

DO NOT INCLUDE: any text, letters, numbers, signs, logos, clocks showing a time, brand names; a recognisable street, landmark or the outside of a building; medical equipment, blue clinical light, neon, marble kitsch, lots of flowers or candles.
```

- `Variation 2 (attach C): the fictional client from the attached photo has just arrived — she stands near the door in a camel wool coat with a work bag on her shoulder, smiling softly, looking towards the prepared bed, not at the camera. Keep her identical to the photo, with natural skin texture.`

**9:16 follow-up:** send the P1 follow-up. Replace the second and third sentences with: `Keep the room, the window and the light identical. Place the window and bed between 15% and 55% of the height, extend the floor and bed below.`

> Do **not** generate the street, the Bahnhofstrasse or the building entrance. A made-up storefront would misrepresent the real location. For the street shot, use a real phone video (plan 5.5, shot S6).

### P7 — Teresa in the studio (A4, optional, 4:5) · attach T1, T2

The real portrait (T1) stays first choice for the trust ad. Use this only if you want a second, different frame of her.

```text
Photorealistic editorial portrait photograph, vertical 4:5 portrait (1600×2000 or the closest portrait size).

SCENE: Teresa stands in her calm treatment room beside the window, turned slightly towards it, waist-up, 50 mm lens look. She has just finished preparing the room and looks towards the camera with a calm, warm, natural closed-mouth smile — friendly, professional, not posed or glamorous. Hands relaxed, no gloves, no device.

COMPOSITION: Her head and shoulders in the upper 65% of the frame, with some calm space above her hair. The bottom 28% is calm (her tunic and the soft room out of focus) — a text band will be added there later.

TERESA (real person, consented): The attached real photographs show Teresa Stimac, the owner of the studio, who has agreed to this image. She must be clearly recognisable as the same person: same facial proportions, her actual age, eye shape, nose, lips, long side-parted blonde hair with darker roots, make-up and small earrings as in the photos. Never a generic substitute blonde, not younger, not slimmer, no smoothing or beautifying of her skin. Plain white short-sleeved cosmetic tunic with NO name badge and no lettering. Use the photos for her identity only, not for their background, shelves, flowers or name badge.

STUDIO: Cream walls (#FAF6F1), blush and sand textiles (#EAD9CC, #F3EAE1), white treatment bed with cream linen softly out of focus behind her, small brushed-brass details (#8F5A2E), a few dark espresso accents (#2A1E18), soft daylight from the window on the left. Gentle warm colour grade, fine natural grain, real skin texture.

DO NOT INCLUDE: any text, letters, numbers, logos, name badges or signs; extra or fused fingers; plastic poreless skin, heavy retouching, over-white teeth, a big stock-photo smile; product shelves with labels; neon, marble kitsch, lots of flowers.
```

**9:16 follow-up:** send the P1 follow-up unchanged.

### P8 — Background for text cards (A5 end-date card, A2 question card) · no attachments

```text
Photorealistic still-life photograph, vertical 4:5 (1600×2000 or the closest portrait size).

SCENE: A quiet corner of a calm, premium cosmetic studio. At the bottom edge of the frame, a neatly folded cream linen towel and a small brushed-brass tray with one unlabelled cream jar sit on a white surface. Soft daylight from a window on the left casts a gentle, long, diffuse shadow across a plain cream wall (#FAF6F1). Sand and blush tones (#EAD9CC, #F3EAE1) in the textiles, small brass details (#8F5A2E).

COMPOSITION: The upper 70% of the frame is almost empty, softly lit cream wall with a smooth light gradient — a large, calm area where text will be placed later. Objects only in the lowest 25%, slightly to the right, softly out of focus.

LOOK: Gentle warm colour grade, fine natural grain, minimal and quiet, no people.

DO NOT INCLUDE: text, letters, numbers, labels, logos, signs; people or hands; flowers, candles, marble; clinical or medical objects.
```

**9:16 follow-up:** `Now make the same image as a vertical 9:16 (1440×2560 or the closest tall size). Keep the light and objects identical. Put the objects between 58% and 78% of the height. The top 14% and bottom 20% stay plain wall/surface, and the middle stays calm empty wall.`

## 4. Repair lines (paste into the same chat)

Change one thing at a time; each line already tells the model to keep the rest.

| Fault | Message |
|---|---|
| Teresa doesn't look like herself | `Change only Teresa's face and hair to match the attached real photographs more closely: her real facial proportions, age, eye shape, nose, lips and side-parted blonde hair with darker roots. Keep the pose, clothes, room, light, camera angle and the client exactly the same.` |
| Hands or fingers wrong | `Change only the hands: five natural fingers on each hand, anatomically correct, relaxed grip, warm-white nitrile gloves. Keep everything else exactly the same.` |
| Tube broken or floating | `Change only the tube: one continuous thin clear tube attached to the back of the handpiece and running naturally out of the frame. Keep everything else exactly the same.` |
| Name badge or lettering on the tunic | `Remove the name badge and any lettering from the tunic; plain white fabric. Keep everything else exactly the same.` |
| Text, logos or labels appeared | `Remove every letter, number, label and logo from the image, including on bottles and devices. Keep everything else exactly the same.` |
| Skin too smooth, "plastic" | `Change only the skin: restore natural texture with visible pores, fine lines and subtle freckles, no smoothing. Keep the faces, light and everything else the same.` |
| Too much redness, or needles visible | `Change only the skin and the pen tip: no visible needles, no marks, at most a faint natural flush. Keep everything else exactly the same.` |
| Too clinical, too cool | `Change only the colour and light: warmer, softer daylight from the left, cream and sand tones, no blue or clinical light. Keep everything else the same.` |
| Something important in the bottom area | `Recompose slightly: move the people and the device up so that the bottom 28% contains only calm, out-of-focus linen. Keep everything else the same.` |

## 5. Before you send me an image

Go through these points for every image. If one fails, repair it (section 4) or drop the image.

- [ ] **Teresa:** she clearly looks like Teresa, at her real age, with no name badge. If it isn't recognisably her, don't use it — a "similar-looking" practitioner would mislead.
- [ ] **Hands:** 5 fingers each, no third hand, gloves when touching skin or a device.
- [ ] **Device:** exactly one; the Aquafacial tube is connected; the pen shows no needles.
- [ ] **Text:** no letters, numbers or logos anywhere. Zoom in on bottles, the tunic and the devices.
- [ ] **Skin:** natural texture, no strong redness, no blood. The client does not look "better" than in the reference.
- [ ] **No result message:** no before/after, no "problem skin" close-up.
- [ ] **Room:** calm, cream and warm; no street signs and no recognisable buildings.
- [ ] **Bottom area:** calm enough for the text band.

## 6. What happens after you send them

1. I check every image against section 5 (and zoom in for hidden text).
2. I crop to 1080×1350 (4:5) and 1080×1920 (9:16) and add the text band with the website fonts. Price, duration, end date and address are the only text, exactly as on the landing page. Then I commit the images here.
3. **AI label (your decision, open point 4).**
   - These images show a photorealistic treatment scene, a fictional client and a generated likeness of Teresa.
   - My recommendation is to switch Meta's AI disclosure on for these ads.
   - OpenAI marks its images with content credentials, but re-saving them with the text band removes those marks. Meta would then not detect them on its own, so the label only appears if we set it.
   - The landing page already uses generated scenes in the same style, so the ads stay consistent with the page.
4. I build the new creatives and ads **paused**, in one batch for your approval. Ideally I do this after Instagram is linked (open point 2), so they also run on Instagram. Each new ad replaces the weakest one on day 11 or day 23 (plan 5.6). Nothing goes live without your "go".

Optional: a finished still can also be the first frame of a 2–4-second silent clip. The rules in plan 5.5 apply: no speech, no lip-sync, no results.
