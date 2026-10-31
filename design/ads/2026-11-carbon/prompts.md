# Bild-Prompts — Carbon-Peeling + Microneedling (November 2026)

Kopierfertige Prompts für den OpenAI-Playground (`https://platform.openai.com/playground/images`), Modell `gpt-image-2.5-flare`, Grösse «Benutzerdefiniert», Ausgabe PNG. Quelle: Plan `docs/orchestrator/handover/CARBON-CAMPAIGN-PLAN-2026-10-31.md`, Abschnitt 4.4 (main copy, git-excluded). Auswahl, Kosten und Dateinamen stehen im [README](README.md).

## Regeln für jeden Prompt

- Fiktive Kundin, **kein Gesicht einer realen Person**. Teresa Stimac wird **nie** generiert; die Behandlerin erscheint nur als Hände in warm-weissen Nitrilhandschuhen mit heller Ärmelkante.
- **Kein Text im Bild:** keine Buchstaben, Zahlen, Logos, Etiketten. Angebot, Preis, «statt»-Preis und Enddatum kommen ausschliesslich aus `render_ads.py`.
- Kein Vorher/Nachher, kein Ergebnis, keine Nadeln, kein Laserstrahl, keine Klinik, keine sichtbaren Unreinheiten.
- Studio «Atelier Glow», inspiriert von Bahnhofstrasse 94: Wände `#FAF6F1`, Textilien `#EAD9CC` und `#F3EAE1`, ein Messingdetail `#8F5A2E`, Espresso-Akzente `#2A1E18`, Fenster links mit weichem Tageslicht.
- Fotorealismus: «candid documentary photograph», 50 mm, f/2.8, ISO 400, leichtes Korn, keine perfekte Symmetrie.
- Das untere Viertel bleibt ruhig für das Textband.
- Grössen: 4:5 = **1088 × 1360**, 1:1 = **1088 × 1088** (Vielfache von 16; das Render-Script skaliert auf 1080).
- Qualität: `xhigh` für Kandidaten, `max` nur für das gewählte Hero-Motiv.

## M1 · Carbon-Maske (Hauptmotiv, Seiten-Hero) — 1088 × 1360

```text
Candid documentary photograph, shot on a full-frame camera with a 50 mm lens at f/2.8, ISO 400, natural window light only, slight film grain, no studio flash. A quiet cosmetic appointment in a small premium studio inspired by Bahnhofstrasse 94, Zürich. A fictional woman around 40 with shoulder-length dark-blond hair under a cream towel headband reclines on a white treatment bed, eyes closed, light skin with visible pores and normal fine lines, no blemishes. A thin, matte, charcoal-black carbon lotion covers roughly half of her face, applied with soft brush strokes; the edge is clean and natural, no dripping, no shine. The practitioner appears only as two anatomically correct hands in warm-white nitrile gloves and a plain off-white sleeve edge, one hand holding a slim unbranded flat brush with black lotion on the bristles, the other resting lightly near the temple. Studio: cream walls #FAF6F1, blush and sand textiles #EAD9CC and #F3EAE1, one restrained brushed brass detail #8F5A2E, dark espresso accents #2A1E18, a few unlabelled bottles softly out of focus, a window on the left with soft directional daylight, a little everyday imperfection (a folded towel slightly askew). Eye-level side view, shallow depth of field, gentle warm grading. Portrait 4:5 frame, face in the upper 60 %, the lower 25 % calm and uncluttered for a later typographic band. Avoid: text, lettering, numbers, logos, brand names, device logos, before/after layouts, claimed skin results, glowing or poreless plastic skin, redness, needles, lasers, light beams, medical setting, clinical blue, neon, marble kitsch, excessive flowers, extra or fused fingers, malformed hands, melted textures, lens flares, heavy retouching, stock-photo smiles into the camera, perfect symmetry. Do not depict any real person; the practitioner must be unidentifiable. One photo, no montage.
```

Variante 1:1 (1088 × 1088), falls ein quadratisches Hauptmotiv gebraucht wird: gleicher Prompt, den Satz «Portrait 4:5 frame, …» ersetzen durch «Square frame, face in the upper two thirds, lower quarter calm for a typographic band.»

## M2 · Microneedling-Pen (Detail) — 1088 × 1360

```text
Candid documentary close-up, 50 mm macro-style lens at f/2.8, ISO 400, natural window light, slight grain. A quiet cosmetic microneedling moment with a fictional woman around 40, dark-blond hair under a cream towel headband, eyes closed, light skin with visible pores and normal fine lines, no blemishes; cheek and upper jaw visible in a 4:5 portrait composition. One practitioner hand in a warm-white nitrile glove holds a slim unbranded matte warm-grey cosmetic microneedling pen about 15 mm in diameter like a thick marker, the small smooth cartridge cap resting gently on the upper cheek; no needles visible, nothing pierces the skin, no redness. A second gloved hand steadies the cheek without stretching it. The practitioner is only hands, forearms and a plain off-white sleeve edge. Studio inspired by Bahnhofstrasse 94, Zürich: cream walls #FAF6F1, blush and sand textiles #EAD9CC and #F3EAE1, one brushed brass detail #8F5A2E, espresso accents #2A1E18, one window on the left with soft daylight. Camera slightly above cheek level, shallow depth of field with the pen tip sharp, gentle warm grading. Lower 25 % of the frame calm for a later typographic band. Avoid: text, numbers, logos, brand names, before/after, claimed results, poreless plastic skin, redness, visible needles, blood, lasers, medical setting, clinical blue, neon, extra or fused fingers, malformed hands, melted textures, lens flares, heavy retouching. Do not depict any real person. One photo, no montage.
```

## M3 · Stillleben Behandlungstisch (ohne Personen) — 1088 × 1088

```text
Candid still-life photograph, 50 mm lens at f/2.8, natural window light from the left, slight grain, no studio flash. A linen-covered side table in a small premium cosmetic studio inspired by Bahnhofstrasse 94, Zürich. Objects: a small unlabelled matte-black ceramic bowl with a thin layer of charcoal-black carbon lotion, a slim unbranded flat brush resting on its rim, a slim unbranded matte warm-grey cosmetic pen lying beside it with its cap on, a folded cream towel, one unlabelled frosted-glass bottle, a small brushed brass tray #8F5A2E, one object slightly out of line as in real use. Background: cream wall #FAF6F1, blush textile #EAD9CC, a soft espresso #2A1E18 shadow line, a window on the left. Camera slightly above the table, shallow depth of field, gentle warm grading. Square frame; objects occupy the upper 65 % of the frame; the lower 30 % is calm linen for a later typographic band. Avoid: text, lettering, numbers, labels, logos, brand names, needles, syringes, medical or clinical items, lasers, neon, marble kitsch, abundant flowers, melted or distorted objects, lens flares. One photo, no montage.
```

Variante 4:5 (1088 × 1360): «Square frame;» ersetzen durch «Portrait 4:5 frame;».

## M4 · Ruhiger Moment nach der Behandlung (keine Ergebnisbehauptung) — 1088 × 1360

```text
Candid documentary photograph, 40 mm lens at f/2.8, ISO 400, natural window light, slight grain. The end of a cosmetic appointment in a small premium studio inspired by Bahnhofstrasse 94, Zürich. A fictional woman around 40, dark-blond hair loose, sits up on the white treatment bed in a plain cream robe, looking softly towards the window on the left, a small relaxed closed-mouth half-smile, no make-up, ordinary skin with visible pores, freckles and normal fine lines, at most a faint natural flush. Do not make her skin smoother, brighter or younger than natural; this is an appointment moment, not a result image. No practitioner, no devices. Studio palette: cream #FAF6F1, blush and sand #EAD9CC and #F3EAE1, one brass detail #8F5A2E, espresso accents #2A1E18. Eye level, shallow depth of field, gentle warm grading, slight everyday imperfection in the room. Portrait 4:5; face in the upper half, lower 25 % calm for a typographic band. Avoid: text, numbers, logos, before/after, claimed results, glowing poreless skin, stock-photo smile into the camera, neon, clinical blue, marble kitsch, excessive flowers, malformed hands, lens flares, heavy retouching, perfect symmetry. Do not depict any real person. One photo.
```

## M5 · Text-Karte (kein KI-Bild)

Nur `render_ads.py`: cream-Hintergrund, Serif-Headline «Carbon-Peeling + Microneedling», Fragen mit Antworten ausschliesslich aus der Behandlungsbeschreibung des Users, Band in cocoa mit Preis und Enddatum.

## M6 · Vertrauen ohne Porträt

Foto M3 oder M4, Band «Persönlich von Teresa Stimac», «Über 20 Jahre Erfahrung · 4,8 aus 248+ Bewertungen», Preis- und Datumszeile. Teresas Gesicht wird nicht generiert.

## Reparaturzeilen (an den Prompt anhängen, neuer Lauf)

- Text oder Zeichen im Bild: «Absolutely no text, letters, numbers or symbols anywhere, including on bottles and devices.»
- Nadeln oder Laser-Eindruck: «The pen tip is a smooth closed cap; no needles, no light, no beam.»
- Plastikhaut: «Real unretouched skin with visible pores and fine lines, matte, no beauty filter.»
- Hände: «Exactly two hands with five fingers each, natural proportions.»

## Runde 2 (v2): natürlicher, kein KI-Look — 2026-10-31

Rückmeldung des Users zu Runde 1: «es muss photorealistischer und natürlicher sein, es darf nicht nach KI-Bildern aussehen»; der Microneedling-Pen soll grau-metallisch sein, nicht mattgrau. Änderungen: Reportage-Look statt Katalog-Look, keine Farbcodes mehr im Prompt (sie erzeugten den glatten Beige-Look), echte Hautdetails, gemischtes Licht, etwas Unordnung. Referenzen: `raw/maske_20261031_1.png` (Szene und fiktive Kundin aus Runde 1) für M1 und M2; für M2 zusätzlich ein Ausschnitt eines vom User gelieferten Referenzfotos, der **nur das Gerät** zeigt (kein Gesicht; das Original liegt lokal in `referenzen/` und wird nicht committet). Qualität `max`.

Gemeinsamer Realismus-Block (steht am Anfang jedes v2-Prompts):

```text
Unretouched real photograph taken by a working photographer during an actual appointment, Fujifilm X-T5 with a 35 mm f/1.4 lens, available window light mixed with a warm ceiling lamp, true-to-life colours, slightly imperfect framing, natural lens vignetting, fine sensor noise. Real skin: uneven tone, visible pores, fine vellus hair, a few freckles and small moles, slight natural shine on the nose, flyaway hairs. A lived-in small studio with ordinary details. Not a stock photo, not a render, no CGI look, no airbrushing, no beauty filter, no HDR, no oversharpening, no overly perfect styling.
```

### M1 v2 · Carbon-Maske — 1088 × 1360, Referenz M1-1

```text
[Realismus-Block] Use the attached photo only as reference for the scene, the fictional client and the composition, but make it look like a genuine unposed photograph. A fictional woman around 40, shoulder-length dark-blond hair under a slightly crumpled cream towel headband, reclines on a treatment bed, eyes closed, relaxed face. A thin matte charcoal-black carbon lotion covers about half of her face, applied in visible uneven brush strokes, slightly thinner at the edges, no shine. Two gloved practitioner hands in white nitrile gloves with natural creases, a plain off-white sleeve edge; one hand holds a flat cosmetic brush with black lotion on it, the other rests near the temple. Background softly out of focus: a window on the left, a cream wall, a dark wooden side cabinet with a few plain unlabelled bottles, a folded towel. Side view at bed height, shallow depth of field. Portrait 4:5, face in the upper 60 %, lower 25 % calm (blanket and towel) for a later text band. Avoid: text, letters, numbers, logos, labels, before/after, result claims, poreless plastic skin, redness, needles, lasers, light beams, clinical setting, extra or fused fingers, malformed hands, perfect symmetry, glossy catalogue look. Do not depict any real person; the practitioner is unidentifiable. One photo.
```

### M2 v2 · Microneedling-Pen grau-metallisch — 1088 × 1360, Referenzen M1-1 und Geräteausschnitt

```text
[Realismus-Block] Use the first attached photo only as reference for the fictional client and the studio, and the second attached photo only as reference for the device shape and material. A fictional woman around 40, dark-blond hair under a cream towel headband, reclines with eyes closed; her cheek and jaw are visible, clean skin without any mask. One practitioner hand in a white nitrile glove holds a professional microneedling pen like a thick pen: a cylindrical body of brushed silver-grey metal with a fine knurled metal ring near the tip and a small transparent plastic cartridge at the tip, no brand, no logo, no lettering. The transparent cartridge rests lightly on the upper cheek; no needles visible, nothing pierces the skin, no redness, no blood. The other gloved hand steadies the cheek gently. Soft daylight from a window on the left, cream wall and a towel in the soft background. Camera slightly above cheek level, shallow depth of field, the metal tip sharp with realistic reflections. Portrait 4:5, lower 25 % calm (towel, blanket) for a later text band. Avoid: text, letters, numbers, logos, brand names, before/after, result claims, poreless plastic skin, matte plastic device, visible needles, blood, lasers, clinical setting, extra or fused fingers, malformed hands, glossy catalogue look. Do not depict any real person; the practitioner is unidentifiable. One photo.
```

### M3 v2 · Stillleben — 1088 × 1088, ohne Referenz

```text
[Realismus-Block, ohne den Hautsatz] A side table covered with slightly wrinkled natural linen next to a treatment bed. On it: a small matte black ceramic bowl with a thin uneven layer of charcoal-black carbon lotion and a few smudges on the rim, a flat cosmetic brush leaning on the bowl, a professional microneedling pen of brushed silver-grey metal with a transparent cap lying beside it, a folded cream towel, one plain frosted-glass bottle without a label, a small brushed brass tray. Soft daylight from a window on the left, a cream wall, a blush curtain edge. Camera slightly above the table, shallow depth of field. Square frame; objects in the upper 65 %, lower 30 % calm linen for a later text band. Avoid: text, letters, numbers, labels, logos, needles, syringes, clinical items, lasers, perfectly arranged catalogue styling, CGI look. One photo.
```

## M7 · Teresa trägt die Carbon-Lotion auf — 1088 × 1360, max

Referenzen in dieser Reihenfolge: Teresa-Foto 2, Teresa-Foto 3 (nur Teresa, eingewilligt), `raw/maske-v2_20261031_1.png` (fiktive Kundin, Studio).

```text
Unretouched real photograph taken by a working photographer during an actual appointment, Fujifilm X-T5 with a 35 mm f/1.4 lens, available window light mixed with a warm ceiling lamp, true-to-life colours, slightly imperfect framing, natural lens vignetting, fine sensor noise. Real skin on both women: uneven tone, visible pores, fine lines, a few freckles, slight natural shine, flyaway hairs. Not a stock photo, not a render, no CGI look, no airbrushing, no beauty filter, no HDR, no overly perfect styling. The first two attached photos show the studio owner and practitioner, who has consented: keep her clearly recognisable as herself (face shape, eyes, smile lines, shoulder-length blond hair, age) and dress her in the same plain white short-sleeved tunic, with white nitrile gloves. The third attached photo is only the reference for the fictional client, the bed, the cream and sand studio and the window light. Scene: the practitioner sits beside the head end of the treatment bed, slightly leaning in, looking down at her work with calm concentration, mouth closed, not looking at the camera. With a flat cosmetic brush she applies a thin matte charcoal-black carbon lotion to the cheek of the reclining fictional client, who wears a cream towel headband, eyes closed; about half of the client's face is already covered in visible uneven brush strokes. Her other gloved hand rests lightly at the client's temple. Both faces fully visible in the upper 70 % of a portrait 4:5 frame, the practitioner's head in the upper half; lower 25 % calm (blanket and towel). Window on the left, cream wall, a dark wooden side cabinet softly out of focus. Avoid: text, letters, numbers, logos, name badges, labels, before/after, result claims, poreless plastic skin, needles, lasers, light beams, devices, clinical setting, extra or fused fingers, malformed hands, glossy catalogue look. One photo, no montage.
```
