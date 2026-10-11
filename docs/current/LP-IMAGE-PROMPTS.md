# 2026-10 Aquafacial landing-page image prompts

## Current revision: varied Teresa series

11 October 2026: the user supplied five additional consented Teresa photographs in `3.zip` and requested all eight shots with varied viewpoints, poses and expressions. All eight replacement paths now use the [varied series](../../design/images/lp-shoot-2026-10/teresa-varied-series/README.md). The [eight exact final prompts](../../design/images/lp-shoot-2026-10/teresa-varied-series/PROMPTS.md), [complete generation log](../../design/images/lp-shoot-2026-10/teresa-varied-series/generation-log.json), [reference hashes](../../design/images/lp-shoot-2026-10/teresa-varied-series/reference-manifest.json), 29 unchanged native PNG candidates and crop screenshots are retained alongside them. The built-in generator's backend version is undisclosed.

The selected scenes vary between a side-view share preview, wider hero, seated hand-mirror preparation, opposite-side device details, overhead gel application, seated appointment ending and tablet consultation. Teresa remains recognizable wherever her face appears; the fictional client, uniform/gloves, studio and window light stay consistent. The Kombi trust section also keeps her authentic portrait. The desktop hero focus returns to 70%/50%; phone hero focus remains 60%/40%, and preparation uses 30% vertical phone focus to include the mirror and gloved hand. Export paths and exact dimensions are unchanged. Every WebP uses quality 82 and embedded sRGB, is below 120,000 bytes, and the hero is below 160,000 bytes. The share URL remains a true PNG.

The two original Teresa photos, all real result composites, campaign posters/videos and unused infographic remain byte-for-byte unchanged. These generated images illustrate appointment context and do not supply evidence of treatment outcomes. The sections below preserve the earlier prompt history; the varied series supersedes all eight earlier generated replacements.

## Previous revision: Teresa's visible identity

11 October 2026: after reviewing the first series, the user explicitly requested Teresa's recognizable presence. The current revision uses the two consented real Teresa photos as identity references for slots 4, 6, 7 and 13. Their [exact selected prompts and selection notes](../../design/images/lp-shoot-2026-10/teresa-revision/PROMPTS.md), [complete generation log](../../design/images/lp-shoot-2026-10/teresa-revision/generation-log.json), native PNGs and new review screenshots are retained in the revision directory. The built-in generator's backend version remains undisclosed.

The Kombi page also renders Teresa's unchanged authentic portrait beside her quote. The hero desktop focus is now 85% horizontally and the preparation phone focus is 15% vertically, keeping Teresa and the client visible together. The protected originals, real result images and campaign assets remain byte-for-byte unchanged. Slots 8, 9, 10 and 12 retain their first-series files.

## Initial series: PR #47

The generation status, hands-only framing and prompts below document the initial delivery. The current identity-referenced prompts linked above supersede the initial prompts for slots 4, 6, 7 and 13.

Status: completed imagery generation and export, 11 October 2026. The user authorized the built-in image generator after the requested Images API route was unavailable (no environment API key and no API host access). The built-in tool does not expose its backend model identifier or a resolution selector, so this work does not claim a particular model version. Every call requested its largest supported output; all returned native PNGs are preserved.

Prepared on `codex/lp-imagery`, based on the fetched `master` (`019ee66`). Read alongside [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md), [AQUAFACIAL-LANDING-PAGE-UPDATE.md, section 9](AQUAFACIAL-LANDING-PAGE-UPDATE.md#9-2026-10-10-lead-first-rebuild-plan-approved-by-the-user), and the [last section of AQUAFACIAL-LANDING-PAGE-LEAD-GEN.md](AQUAFACIAL-LANDING-PAGE-LEAD-GEN.md#2026-10-10-conversion-and-design-pass-plan-approved-by-the-user). Current replacement images and the two protected real photos were inspected for framing only; none are generation references.

## Scope and protected assets

There are eight commissioned replacements: slots 4, 6, 7, 8, 9, 10, 12 and 13. Each has a complete, standalone final prompt below. These are illustrative generated scenes, not documentary evidence of the actual studio, a real client, Teresa's identity, or treatment efficacy.

Keep these assets byte-for-byte unchanged:

- Slot 1: `src/assets/lp/aquafacial/aquafacial-behandlung-zuerich.webp`, 1350 × 1688. Real Teresa photo; desktop 4:5 arch and phone lower-focused 2:1 band (65% vertical focus, with the real source unchanged).
- Slot 2: `src/assets/marketing/teresa_portrait.jpg`, 1121 × 1403. Real Teresa portrait; top-aligned 4:5 trust photo.
- Slot 3: all three JPEGs in `src/assets/lp/aquafacial/results/`. Real result composites; never generate replacements, comparisons or retouched outcomes.
- Slot 5: `public/assets/lp-aquafacial/hero-poster-*.webp` and all campaign videos in that directory.
- Slot 11: `src/assets/lp/aquafacial/aquafacial-microneedling-infografik-zuerich.webp`. Optional, not commissioned and not rendered. Do not generate or wire up an infographic without a separate request.
- All other assets outside the eight exact replacement paths, including `src/assets/marketing/aquafacial_treatment.png`.

Consent update, 11 October 2026: the user explicitly confirmed that Teresa has agreed to her real photos being used for image-to-image generation. The two protected real photos may therefore be supplied as references for image-to-image editing if useful; their source files must remain untouched. Do not invent her likeness from a text prompt or use current generic practitioner images as identity references. The final prompts below deliberately retain the hands-only or back-of-shoulder framing, so Teresa's identity references are optional and are not needed for this shot plan. No real Teresa photo was submitted; only generated series references were used.

## Generation and selection

1. Generated 26 candidates with the built-in `image_gen` tool: three for each commissioned slot, plus a fourth for slots 7 and 9. The actual backend model is not exposed. Use the exact selected prompts below; every candidate's full prompt and reference filenames are also recorded in [generation-log.json](../../design/images/lp-shoot-2026-10/generation-log.json).
2. Selected slot 6 candidate 3 as the fictional-client and room reference. All subsequent shots use that generated image; the fourth candidates for slots 7 and 9 use slot 7 candidate 3, which derives from the same series. No real-person photograph was submitted. Compared client features, freckles, room, linens, sleeves and gloves across the set.
3. Rejected the initial oversized, overly wet hero framing, the tighter preparation portraits, and the first three pen shots that looked too similar to the Aquafacial wand. The final wider preparation portrait keeps the face inside the phone crop. The fourth pen shot uses a slim matte warm-grey pen with a writing grip and no visible needles.
4. Inspected the selected photographs and rendered crops for anatomy, connected tubing, device contact, natural pores, background objects, readable text, logos and practitioner identification. The end-of-appointment photograph retains normal texture and is a candid appointment scene, never an efficacy demonstration. OCR produced six isolated-character false positives; each was visually resolved as glove folds, plant stems, cloth or wall edges.
5. Retained every full-resolution original as `slot-NN-candidate-NN.png` in [design/images/lp-shoot-2026-10/](../../design/images/lp-shoot-2026-10/). `series-reference.png` is an unchanged copy of slot 6 candidate 3. Native dimensions, selected candidates, output hashes and byte counts are in [exports.json](../../design/images/lp-shoot-2026-10/exports.json).
6. Exported the seven pinned WebP files at quality 82 with an embedded sRGB profile, exact requested dimensions and encoder effort 6. Slots use the photo preset, except slot 9 uses the default preset to meet the byte limit without lowering quality or dimensions. All are below 120,000 bytes; the hero is 77,282 bytes, below its 160,000-byte limit. The largest other WebP is 118,160 bytes. Reproduce with `node design/images/lp-shoot-2026-10/export.mjs` from the repository root.
7. Preserved slot 4's `.png` public URL and saved a true, optimized sRGB PNG at 1200 × 630. The encoding agrees with its extension and served content type. This PNG is 895,708 bytes; the 120 KB constraint applies to the WebP exports. No image reference or offer-date changes were made.

The studio is an imagined Atelier Glow setting, not a reconstruction from real room photographs. Keep the treatment name Aquafacial in metadata, filenames and any later documentation. No words, lettering, logos or numbers belong inside these photographs.

## Slot 4 — Page A share preview

Replace: `public/assets/aquafacial_treatment.png`
Export: 1200 × 630, approximately 1.91:1; true PNG at the pinned public path.
Framing: side view of the bed; left third calm cream negative space; treatment contact in the right half. No page markup, offer-date or image-reference changes are needed.

Selected original: `slot-04-candidate-02.png`; native PNG 1733 × 907.

```text
Create a single believable editorial photograph for an Aquafacial appointment, in a wide 1.91:1 composition. If a generated series reference is supplied, preserve its fictional client, room, light and practitioner hands; never use a real practitioner photograph as an identity reference. The client is the same fictional woman around 42, with shoulder-length chestnut hair secured under a cream towel headband, hazel eyes closed, light olive skin, a softly oval face, subtle freckles and normal fine lines. Show the white treatment bed from the side, the client reclined beneath cream linen, relaxed without posing. Place her entire face and the treatment contact in the right half, approximately x=60–82%, y=30–65%; leave the entire left third quiet cream wall and softly lit linen for platform overlays, but generate no overlay or lettering.

Only the practitioner's forearms and two anatomically correct warm-white nitrile-gloved hands are visible, with plain off-white short sleeves and no jewellery. One hand holds an unbranded Aquafacial handpiece: a slim white wand, a small transparent spiral tip resting naturally on the cheek, and a thin clear tube visibly connected to the wand and continuing naturally towards the edge of frame. The second hand gently supports the cheek. No other device needs to be visible.

Set the scene in the same imagined small premium cosmetic studio inspired by Bahnhofstrasse 94, Zürich: warm cream walls #FAF6F1, blush and sand textiles #EAD9CC and #F3EAE1, white bed with cream linen, one restrained brushed brass detail #8F5A2E, dark espresso accents #2A1E18, a few unlabelled product bottles softly out of focus, and one window on the left. Use soft directional daylight from that window, gentle warm colour grading, a 40 mm lens look, eye-level side view, shallow depth of field and slight natural grain. Calm, quiet Swiss beauty-house editorial atmosphere. Preserve visible pores and skin texture; only a fine incidental film of moisture at contact, no visible claim of skin improvement.

Avoid perfect symmetry, extra fingers, fused fingers, malformed hands, floating or disconnected tubes, melted textures, distorted background objects, all text, lettering, numbers, captions, prices, labels, watermarks, brand names and device logos, lens flares, heavy retouching, over-white teeth, stock-photo smiles into the camera, neon, clinical blue, marble kitsch, excessive flowers, glowing or poreless plastic skin, dramatic redness, a medical setting, needles piercing skin, visible needles, blood, before/after layouts and claimed treatment-result imagery. Do not show or invent Teresa Stimac's face; the practitioner must be unidentifiable.
Use the supplied generated reference only to preserve the same fictional client's facial features, skin texture, freckles, hair, cream headband, studio window, espresso fluted cabinet, brass details, linen and the practitioner sleeves and white gloves. Recompose the scene for this slot rather than copying the hero framing. Natural matte skin, moisture only at wand contact. Leave the left third clean cream space. Largest available landscape resolution, 1200x630 or larger at 1.91:1, opaque PNG. Single photo, no montage. Candidate 2 of 3; use a subtly different natural camera angle while meeting the coordinates.
```

## Slot 6 — Page B hero and series reference

Replace: `src/assets/lp/aquafacial/hero-aquafacial-microneedling-zuerich.webp`
Export: 1672 × 941, 16:9; WebP quality 82, sRGB, under 160 KB.
Framing: complete client face within x=55–80%, y=25–60%. Desktop 4:5 arch uses `object-position: 70% 50%`; phone 16:9 band uses `60% 40%`.

Selected original: `slot-06-candidate-03.png`; native PNG 1672 × 941.

```text
Create a single believable editorial photograph of an Aquafacial appointment, a landscape 16:9 composition designed to remain legible inside a narrow 4:5 arch. Establish one fictional client and one imagined studio for a coherent series. The client is a woman around 42 with shoulder-length chestnut hair secured under a cream towel headband, hazel eyes closed, light olive skin, a softly oval face, subtle freckles, natural pores and normal fine lines. She lies calmly on a white treatment bed under cream linen, without posing. Her entire face, including forehead, nose, cheek and chin, must fit within x=55–80% of the full image width and y=25–60% of its height, centred approximately at x=68%, y=42%. Keep the face below the arch's rounded top and away from its side edges. Place the handpiece contact and both supporting fingers beside the cheek within x=55–78%, y=35–58%, so they survive the desktop crop focused at 70% from the left and 50% from the top and the phone band focused at 60%/40%. Keep generous cream room space on the left.

Show only the practitioner's plain off-white sleeve, forearms and two anatomically correct warm-white nitrile-gloved hands; the practitioner is cropped below the shoulders with no face or identifying features visible. One hand holds an unbranded Aquafacial handpiece: a slim white wand with a small transparent spiral tip resting gently on the cheek and a thin clear tube visibly connected to the wand, following a continuous plausible route towards the lower edge. The other hand lightly steadies the temple. This is a quiet treatment moment, not an efficacy demonstration.

Set the scene in an imagined small premium cosmetic studio inspired by Bahnhofstrasse 94, Zürich: warm cream walls #FAF6F1, blush and sand textiles #EAD9CC and #F3EAE1, white treatment bed with cream linen, restrained brushed brass or copper details #8F5A2E, dark espresso accents #2A1E18, a few unlabelled product bottles out of focus and one window on the left. Soft directional window daylight from the left, a gentle warm colour grade, 40 mm lens look, camera at eye level or slightly above the bed, shallow depth of field and slight natural grain. Calm Swiss beauty-house editorial atmosphere with believable room scale and natural asymmetry.

Avoid perfect symmetry, extra fingers, fused fingers, malformed hands, floating or disconnected tubes, melted textures, distorted background objects, all text, lettering, numbers, captions, prices, labels, watermarks, brand names and device logos, lens flares, heavy retouching, over-white teeth, stock-photo smiles into the camera, neon, clinical blue, marble kitsch, excessive flowers, glowing or poreless plastic skin, dramatic redness, a medical setting, needles piercing skin, visible needles, blood, before/after layouts and claimed treatment-result imagery. Do not show or invent Teresa Stimac's face; the practitioner must be unidentifiable.
Generate a single distinct candidate at maximum supported landscape resolution, 1672 by 941 pixels if available, opaque PNG. Pull the camera back enough that the FULL face from hairline through chin is contained between x=55–80% and y=25–60%, rather than making a large facial close-up. The client face should occupy no more than 35% of the image height. Natural matte skin everywhere except a tiny moisture film directly at the wand contact; do not cover the face or neck in shiny gel. Keep the wand and connected tube visible. Use an uncluttered cream room; no large floral arrangement. Candidate 3 of 3. One photo only, no collage.
```

## Slot 7 — Personal appointment preparation

Replace: `src/assets/lp/aquafacial/personal-treatment-zuerich.webp`
Export: 1122 × 1402, 4:5; WebP quality 82, sRGB, under 120 KB.
Framing: portrait on desktop; centre-cropped 4:3 on phones. Keep the whole face and towel-adjusting hands in the central vertical band, y=25–70%.

Selected original: `slot-07-candidate-04.png`; native PNG 1122 × 1402.

```text
Using only the selected generated series image as a reference, create one believable editorial photograph at the beginning of the same appointment. Preserve the identical fictional woman around 42, shoulder-length chestnut hair, hazel eyes, light olive skin, softly oval face, subtle freckles and normal fine lines. She sits up naturally on the white treatment bed, wearing a cream towel headband and a plain cream robe. She looks slightly down towards the practitioner's hands, never at the camera. Capture an unposed, quiet moment as the practitioner adjusts the cream towel around her shoulders. Use a 4:5 portrait composition. Place the complete face approximately at x=50%, y=38%, and both hands and the towel adjustment approximately at x=45–65%, y=55–65%. Keep every important feature within y=25–70% so a centred 4:3 phone crop retains the face and hands; do not place the action at the lower edge.

The practitioner is represented only by the same forearms, plain off-white sleeves and anatomically correct warm-white nitrile-gloved hands as the series reference; no practitioner head, face, distinctive jewellery or reflection. Treatment devices stay outside this preparation shot. Device continuity for the series is an unbranded Aquafacial slim white wand with a small transparent spiral tip and thin connected clear tube, and an unbranded slim matte microneedling pen held like a thick marker with no visible needles; do not place either on the client's skin in this scene.

Use exactly the same imagined small premium cosmetic studio inspired by Bahnhofstrasse 94, Zürich: cream walls #FAF6F1, blush and sand textiles #EAD9CC and #F3EAE1, white bed and cream linen, restrained brushed brass or copper details #8F5A2E, dark espresso accents #2A1E18, a few unlabelled product bottles out of focus, one window on the left. Preserve the reference room geometry. Soft directional daylight from the left, gentle warm grading, a 50 mm lens look, eye-level camera, shallow depth of field and slight natural grain. Natural skin texture and pores, ordinary complexion, calm Swiss beauty-house editorial feel.

Avoid perfect symmetry, extra fingers, fused fingers, malformed hands, floating or disconnected tubes, melted textures, distorted background objects, all text, lettering, numbers, captions, prices, labels, watermarks, brand names and device logos, lens flares, heavy retouching, over-white teeth, stock-photo smiles into the camera, neon, clinical blue, marble kitsch, excessive flowers, glowing or poreless plastic skin, dramatic redness, a medical setting, needles piercing skin, visible needles, blood, before/after layouts and claimed treatment-result imagery. Do not show or invent Teresa Stimac's face; the practitioner must be unidentifiable.
Composition correction: use a WIDER mid-shot, not a headshot. Show the seated client smaller in the frame, with ample room above her head. The entire head and headband must be within y=22–52%; the actual face from hairline to chin must be within y=28–50%. Hands adjusting her robe/towel stay around y=55–65%. Leave cream wall/window and soft room space in the top fifth, so the phone's central 4:3 crop cannot cut her forehead. Same fictional client, headband, robe, freckles and practitioner gloves as the reference. Highest available 4:5 portrait resolution, 1122x1402 or larger, opaque PNG. One photo, fourth candidate.
```

## Slot 8 — Aquafacial step detail

Replace: `src/assets/lp/aquafacial/aquafacial-close-up-zuerich.webp`
Export: 1122 × 1402, 4:5; WebP quality 82, sRGB, under 120 KB.
Framing: upper-centre treatment contact; existing focus `50% 30%`.

Selected original: `slot-08-candidate-03.png`; native PNG 1122 × 1402.

```text
Using only the selected generated series image as a reference, create a single believable close-up editorial photograph of the same fictional woman around 42 during her Aquafacial appointment. Preserve her shoulder-length chestnut hair beneath the same cream towel headband, hazel eyes closed, light olive skin, softly oval face, subtle freckles and normal fine lines. Show part of the relaxed face, including closed eye, cheekbone and a little jaw, in a 4:5 portrait composition. Put the cheekbone contact point at approximately x=50%, y=30%, with the contact tip, holding fingers and support fingers fully inside the central frame. The image is displayed with focus 50% from the left and 30% from the top. A fine, physically plausible film of moisture may catch the window light at the contact point; the surrounding skin must retain visible pores and texture.

The same practitioner is shown only as plain off-white sleeve edges and anatomically correct warm-white nitrile-gloved hands. One hand holds an unbranded Aquafacial handpiece, a slim white wand with a small transparent spiral tip resting naturally along the cheekbone, never a bulky metallic nozzle. A thin clear tube is visibly connected to the wand and curves continuously towards the edge of frame without crossing through fingers or floating. The other hand lightly supports the face. No practitioner face or reflection, and no microneedling pen in this shot.

Preserve the same imagined small premium studio inspired by Bahnhofstrasse 94, Zürich: cream walls #FAF6F1, blush and sand textiles #EAD9CC and #F3EAE1, white treatment bed with cream linen, one restrained brushed brass or copper detail #8F5A2E, dark espresso accents #2A1E18 and a few unlabelled product bottles softly blurred. The same single window on the left gives soft directional daylight. Use a 50 mm close-focus lens look, camera slightly above cheek level, shallow depth of field with the tip and skin contact sharp, gentle warm colour grade and slight natural grain. Quiet Swiss beauty-house editorial photography, no claim of improved skin.

Avoid perfect symmetry, extra fingers, fused fingers, malformed hands, floating or disconnected tubes, melted textures, distorted background objects, all text, lettering, numbers, captions, prices, labels, watermarks, brand names and device logos, lens flares, heavy retouching, over-white teeth, stock-photo smiles into the camera, neon, clinical blue, marble kitsch, excessive flowers, glowing or poreless plastic skin, dramatic redness, a medical setting, needles piercing skin, visible needles, blood, before/after layouts and claimed treatment-result imagery. Do not show or invent Teresa Stimac's face; the practitioner must be unidentifiable.
Use the generated reference to preserve the identical client's facial proportions, freckles and skin texture, cream headband, room palette, left-window light, practitioner sleeve and warm-white gloves. Recompose as the cheekbone detail requested above. Wand is slim white with a SMALL clear spiral tip and connected thin clear tubing, sharp at the contact. Skin mostly matte with only a fine localized moisture film. Highest available portrait resolution, 1122x1402 or larger at 4:5, opaque PNG. One photo, no montage. Candidate 3 of 3, subtly varying the close-up angle without changing the client.
```

## Slot 9 — Microneedling step detail

Replace: `src/assets/lp/aquafacial/microneedling-close-up-zuerich.webp`
Export: 1122 × 1402, 4:5; WebP quality 82, sRGB, under 120 KB. This intentionally replaces the current 1400 × 933 landscape source with a portrait source.
Framing: contact around `55% 35%`; existing layout already uses 4:5, so no markup change is required.

Selected original: `slot-09-candidate-04.png`; native PNG 1122 × 1402.

```text
Using only the selected generated series image as a reference, create one believable editorial close-up of a quiet cosmetic microneedling appointment with the identical fictional woman around 42. Preserve her shoulder-length chestnut hair under the cream towel headband, hazel eyes closed, light olive skin, softly oval face, subtle freckles, pores and normal fine lines. Show a partial face with the cheek and upper jaw clearly visible in a 4:5 portrait composition. Place the pen contact around x=55%, y=35%, and keep the entire pen tip, visible grip and support fingertips inside the frame around that point. The page focuses this image at 55% from the left and 35% from the top. Her expression is calm; skin has ordinary texture and at most a faint natural flush, with no staged sign of a treatment outcome.

Show the same practitioner's anatomically correct warm-white nitrile-gloved hand holding a slim, unbranded matte warm-grey microneedling pen like a thick marker, at a believable angle to the cheek near the jawline. Its small smooth cartridge tip rests on the skin; no needles are visible and nothing is shown piercing skin. A second gloved hand gently steadies the cheek without unnatural stretching. The practitioner appears only as hands, forearms and a plain off-white sleeve edge; no head, face or identifying reflection. Do not substitute a bulky black nozzle or an Aquafacial wand for the pen. The series Aquafacial device, a slim white wand with transparent spiral tip and thin clear tube, is out of frame here.

Keep the reference's imagined small premium cosmetic studio inspired by Bahnhofstrasse 94, Zürich: warm cream walls #FAF6F1, blush and sand textiles #EAD9CC and #F3EAE1, white bed with cream linen, restrained brushed brass or copper #8F5A2E, dark espresso accents #2A1E18, a few unlabelled product bottles blurred and one window on the left. Soft directional daylight from that window, gentle warm colour grade, a 50 mm close-focus lens look, slightly elevated camera, shallow depth of field with pen contact and nearby pores sharp, slight natural grain. Calm Swiss beauty-house editorial atmosphere, not a medical room.

Avoid perfect symmetry, extra fingers, fused fingers, malformed hands, floating or disconnected tubes, melted textures, distorted background objects, all text, lettering, numbers, captions, prices, labels, watermarks, brand names and device logos, lens flares, heavy retouching, over-white teeth, stock-photo smiles into the camera, neon, clinical blue, marble kitsch, excessive flowers, glowing or poreless plastic skin, dramatic redness, a medical setting, needles piercing skin, visible needles, blood, before/after layouts and claimed treatment-result imagery. Do not show or invent Teresa Stimac's face; the practitioner must be unidentifiable.
Strong device correction: use a slim matte warm-grey cosmetic microneedling pen about 15 mm in diameter with a small smooth cartridge cap 5 mm wide and only a few millimetres long. No large transparent cylinder, no clear spiral nozzle, no tube. Show a natural three-finger writing grip: thumb and index pinch the pen, middle finger supports it, other fingers curl naturally. Pen axis angles about 45 degrees from top right towards bottom left, tip resting gently at upper cheek around x=55%, y=35%. Client now reclines on the cream bed, eyes closed. Preserve exact client features and natural skin from the portrait reference; retain the same cream headband, room and daylight. No visible needle, no piercing, no redness. Highest supported portrait resolution, 1122x1402 or larger, opaque PNG. Single photograph, fourth candidate.
```

## Slot 10 — Soothing aftercare

Replace: `src/assets/lp/aquafacial/abschlusspflege-aftercare-zuerich.webp`
Export: 1448 × 1086, 4:3; WebP quality 82, sRGB, under 120 KB.
Framing: displayed in 4:5 at `50% 40%`; retain face, hands, jar and spatula inside the central 60% of the landscape source width.

Selected original: `slot-10-candidate-02.png`; native PNG 1448 × 1086.

```text
Using only the selected generated series image as a reference, create one believable editorial photograph of soothing cosmetic aftercare with the same fictional woman around 42. Preserve the shoulder-length chestnut hair beneath the cream towel headband, closed hazel eyes, light olive skin, softly oval face, subtle freckles, visible pores and normal fine lines. She reclines calmly on the same white treatment bed under cream linen. The same practitioner's anatomically correct warm-white nitrile-gloved fingertips gently spread a thin translucent soothing gel over her cheek. Gel looks cool and realistic, not luminous or thick. Make a 4:3 landscape image designed for a 4:5 crop focused at x=50%, y=40%. Place the complete face around x=40–65%, y=20–55%, both applying hands in x=35–70%, y=35–65%, and a small plain unlabelled cream jar with a brass spatula lying on a linen tray in the central foreground around x=45–60%, y=75–85%. Keep all essentials within x=25–75% so the narrower portrait crop preserves them.

Show the practitioner only as the same forearms, plain off-white sleeves and gloved hands, no head, face or reflection. The jar and resting brass spatula are the only visible tools; do not show a treatment device contacting the face. Device continuity outside this shot is the unbranded Aquafacial slim white wand with small transparent spiral tip and thin connected clear tube, and the unbranded slim matte microneedling pen held like a marker with no visible needles.

Preserve the identical imagined small premium studio inspired by Bahnhofstrasse 94, Zürich: cream walls #FAF6F1, blush and sand textiles #EAD9CC and #F3EAE1, white bed with cream linen, restrained brushed brass or copper details #8F5A2E, dark espresso accents #2A1E18, a few unlabelled product bottles softly out of focus and one window on the left. Soft directional window daylight from the left, a 40 mm lens look, camera slightly above the bed, gentle warm grading, shallow depth of field and slight natural grain. Keep the contact and face legible, with believable foreground objects. Quiet Swiss beauty-house editorial mood, no visible claim of skin improvement.

Avoid perfect symmetry, extra fingers, fused fingers, malformed hands, floating or disconnected tubes, melted textures, distorted background objects, all text, lettering, numbers, captions, prices, labels, watermarks, brand names and device logos, lens flares, heavy retouching, over-white teeth, stock-photo smiles into the camera, neon, clinical blue, marble kitsch, excessive flowers, glowing or poreless plastic skin, dramatic redness, a medical setting, needles piercing skin, visible needles, blood, before/after layouts and claimed treatment-result imagery. Do not show or invent Teresa Stimac's face; the practitioner must be unidentifiable.
Preserve the reference's exact client features, freckles, cream headband and linens, espresso cabinet, one left window, off-white sleeves and white gloves. No wand or pen in the shot. Gel is only a thin translucent layer beneath gently applying fingertips, no glossy whole-face coating. Face and both hands centred, plain cream jar and a realistic brass spatula resting on a linen tray at centre foreground, all within x=25–75%. Highest available landscape resolution, 1448x1086 or larger at 4:3, opaque PNG. One photo, no montage. Candidate 2 of 3, subtly varying the natural applying gesture.
```

## Slot 12 — Candid end-of-appointment moment

Replace: `src/assets/lp/aquafacial/post-treatment-glow-zuerich.webp`
Export: 1448 × 1086, 4:3; WebP quality 82, sRGB, under 120 KB.
Framing: centred 4:5 crop on desktop, 4:3 on phones. This is appointment context, not a generated skin result or proof of efficacy.

Selected original: `slot-12-candidate-01.png`; native PNG 1448 × 1086.

```text
Using only the selected generated series image as a reference, create one believable candid editorial photograph at the end of the same cosmetic appointment. Preserve the identical fictional woman around 42, shoulder-length chestnut hair now loose with the towel headband removed, hazel eyes, light olive skin, softly oval face, subtle freckles, visible pores and normal fine lines. She sits up on the white treatment bed in the same plain cream robe, looking softly down and towards the window rather than into the camera, with a small relaxed closed-mouth half-smile. She wears no make-up. Her complexion remains ordinary, with the same natural pores, freckles and lines as the reference and at most a faint incidental cheek flush. Do not make her skin smoother, younger, brighter or clearer than in the reference. This is an appointment lifestyle moment, not a treatment-result image or a claim of efficacy.

Use a 4:3 landscape composition, placing the whole face approximately within x=40–60%, y=20–50% and the shoulders within x=30–70%, y=45–75%. Keep the client's face comfortably inside the centred 4:5 desktop crop, with room above the hair; the full 4:3 image is used on phones. The practitioner and devices are out of frame. For continuity only, the practitioner has plain off-white sleeves and warm-white nitrile-gloved hands; the series devices are an unbranded Aquafacial slim white wand with a small transparent spiral tip and thin connected clear tube, and an unbranded slim matte microneedling pen held like a thick marker with no visible needles. Do not add these devices to this candid portrait.

Preserve exactly the same imagined small premium cosmetic studio inspired by Bahnhofstrasse 94, Zürich: warm cream walls #FAF6F1, blush and sand textiles #EAD9CC and #F3EAE1, white bed with cream linen, restrained brushed brass or copper #8F5A2E, dark espresso accents #2A1E18, a few unlabelled product bottles softly blurred and one window on the left. Soft directional daylight from the left, gentle warm colour grading, a 50 mm lens look, eye-level camera, shallow depth of field and slight natural grain. Quiet Swiss beauty-house editorial mood with natural, unretouched skin.

Avoid perfect symmetry, extra fingers, fused fingers, malformed hands, floating or disconnected tubes, melted textures, distorted background objects, all text, lettering, numbers, captions, prices, labels, watermarks, brand names and device logos, lens flares, heavy retouching, over-white teeth, stock-photo smiles into the camera, neon, clinical blue, marble kitsch, excessive flowers, glowing or poreless plastic skin, dramatic redness, a medical setting, needles piercing skin, visible needles, blood, before/after layouts and claimed treatment-result imagery. Do not show or invent Teresa Stimac's face; the practitioner must be unidentifiable.
Preserve the exact fictional client identity and visible freckles, pores and lines from the generated reference; do not beautify or improve her complexion. She is now sitting up, cream headband removed, chestnut shoulder-length hair loose, plain cream robe. Closed-mouth small half-smile, looking down towards the window on the left, never at the lens. No practitioner or devices. Preserve the same window, espresso fluted cabinet, cream linen, brass details and subdued warm daylight. Entire face and hair comfortably within x=30–70% and y=15–60%, so the central 4:5 crop keeps them. Highest available landscape resolution, 1448x1086 or larger at 4:3, opaque PNG. Single candid lifestyle photo, no montage, no efficacy demonstration. Candidate 1 of 3, slightly varying the seated posture.
```

## Slot 13 — Consultation by the window

Replace: `src/assets/lp/aquafacial/hautanalyse-beratung-zuerich.webp`
Export: 1448 × 1086, 4:3; WebP quality 82, sRGB, under 120 KB.
Framing: central consultation action; desktop centre crop to 4:5, phone 4:3. Practitioner viewed from behind, with no face visible even in mirrors.

Selected original: `slot-13-candidate-03.png`; native PNG 1448 × 1086.

```text
Using only the selected generated series image as a reference, create one believable editorial photograph of a quiet personal consultation in the same imagined cosmetic studio. Preserve the identical fictional woman around 42, shoulder-length chestnut hair loose, hazel eyes, light olive skin, softly oval face, subtle freckles and normal fine lines. She wears the same plain cream robe and sits at a small sand-toned table near the single window. She looks naturally towards a small plain hand mirror and the practitioner's pointing hand as they talk; no sales pose or gaze into the camera. Make a 4:3 landscape composition with the complete client face around x=45–60%, y=20–50%, the mirror and hands around x=40–65%, y=50–70%, and a soft out-of-focus practitioner shoulder around x=65–75%. Keep the conversation, face and mirror inside the central x=25–75% so a centred desktop 4:5 crop preserves the scene; phones use the full 4:3 frame.

The practitioner is seen strictly from behind, cropped to shoulder, back and forearms in a plain off-white uniform; her head and face are outside the frame. Her hands wear the same warm-white nitrile gloves and have natural anatomy. Angle the unbranded hand mirror so it reflects a soft cream wall, never a face or camera. Include a few plain unlabelled product bottles on the table, no readable packaging. Treatment devices remain out of frame. Device continuity elsewhere is an unbranded Aquafacial slim white wand with a small transparent spiral tip and thin connected clear tube, and an unbranded slim matte microneedling pen held like a thick marker with no visible needles. This is personal consultation context, not an invented practitioner portrait or outcome testimonial.

Keep the identical imagined small premium studio inspired by Bahnhofstrasse 94, Zürich: cream walls #FAF6F1, blush and sand textiles #EAD9CC and #F3EAE1, the white bed with cream linen softly blurred behind the table, restrained brushed brass or copper details #8F5A2E, dark espresso accents #2A1E18 and the same single window on the left. Soft directional daylight from that window, gentle warm colour grade, a 40 mm lens look, eye-level camera, shallow depth of field with the client and conversational hands legible, slight natural grain. Quiet Swiss beauty-house editorial atmosphere; skin remains textured and ordinary.

Avoid perfect symmetry, extra fingers, fused fingers, malformed hands, floating or disconnected tubes, melted textures, distorted background objects, all text, lettering, numbers, captions, prices, labels, watermarks, brand names and device logos, lens flares, heavy retouching, over-white teeth, stock-photo smiles into the camera, neon, clinical blue, marble kitsch, excessive flowers, glowing or poreless plastic skin, dramatic redness, a medical setting, needles piercing skin, visible needles, blood, before/after layouts and claimed treatment-result imagery. Do not show or invent Teresa Stimac's face; the practitioner must be unidentifiable.
Preserve the exact fictional client's freckles, pores, facial features, chestnut shoulder-length hair, cream robe and calm expression from the series reference. Recompose to the small consultation table by the SAME left window, with the espresso fluted cabinet and restrained brass detail behind. Practitioner is only an off-white shoulder/back at the right edge and forearms with warm-white gloves; her whole head is outside the frame and no mirror reflects a face. Client and practitioner converse while looking down at an unbranded hand mirror tilted to reflect only cream wall. Important face and mirror action within x=30–70% for the narrow crop; few unlabelled bottles. No treatment device, no camera pose. Highest supported landscape resolution, 1448x1086 or larger at 4:3, opaque PNG. One photo, no montage. Candidate 3 of 3, subtly varying the conversation gesture.
```

## Verification and responsive crops

Verified `npm ci`, both Aquafacial QA scripts, `qa:marketing`, `npm run check` and `npm run build`. Type checking reports 0 errors and 13 existing hints. The build produces 36 pages. Exact dimensions, formats, embedded profiles, export hashes and byte limits were checked separately. [The protected-asset manifest](../../design/images/lp-shoot-2026-10/protected-assets-sha256.json) confirms the two real photos, all three result JPEGs, both campaign posters, all three campaign videos and the unused infographic are byte-for-byte unchanged.

Started `npm run dev` and captured both pages at 390 × 900 and 1440 × 900 before and after replacement. Full-page screenshots, isolated hero/step crops and browser reports are in [screenshots/](../../design/images/lp-shoot-2026-10/screenshots/). No missing images, horizontal overflow or browser errors were observed. Marketing consent was denied and external requests blocked during capture.

The generated Page B face remains fully inside the 4:5 desktop arch and 16:9 phone band. The Aquafacial tip, pen tip and aftercare action remain visible in the step crops; the foreground jar and spatula survive the aftercare portrait crop. The share image was inspected separately because it is metadata rather than an on-page photograph.

One small page-code change was necessary to satisfy the full-face crop check for the protected Page A photo: its existing pre-cropped centre band cut off the client's chin. The phone rendition now retains the intact portrait, and the same 2:1 frame uses `object-position: 50% 65%`. Both forehead and chin remain visible. The original real image, desktop arch, page copy and offer details are unchanged. No Page B markup changes were required.

The short [2026-10 Imagery update](AQUAFACIAL-LANDING-PAGE-UPDATE.md#2026-10-imagery) lists the changed files and preserved assets. Work remains on `codex/lp-imagery` for a draft PR against `master`; no merge or deployment is part of this task.
