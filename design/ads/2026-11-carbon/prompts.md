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

## Runde 3 · ChatGPT, fünf neue Motive (geplant 2026-11-05, noch nichts erzeugt)
Für ChatGPT (Bildgenerierung im Chat), je Motiv ein neuer Chat, Referenzen in der genannten Reihenfolge, Ausgabe Hochformat 2:3, drei Versionen, die beste wählen. Kein Text im Bild; das Textband (Headline, zweite Zeile, «CHF 175 statt CHF 250 · Sie sparen CHF 75.–», «Nur bis 30. November 2026 · Bahnhofstrasse 94, Zürich») kommt wie bei den bisherigen Anzeigen aus dem Render-Script. Teresa erscheint in M8, M11 und M12, erzeugt aus ihren eingewilligten Fotos (nur Fotos, auf denen sie allein ist); sie gibt die Bilder vor der Verwendung frei. Schritt-für-Schritt-Anleitung, Meta-Headlines und Reparaturzeilen im Tab «Image ads» des Docs [Carbon Avatar Video Guide](https://claude.ai/artifact/SM5NNZGqhqV5SEVJAQeLkp).

### M8 · Hautanalyse («Zum ersten Mal Microneedling?»)

Referenzen: 1 Teresa-Foto 2 · 2 Teresa-Foto 3 · 3 `raw/teresa_20261031_1.png`

```text
Unretouched real photograph, full-frame camera with a 35 mm lens, available window light mixed with a warm ceiling lamp, true-to-life colours, slightly imperfect framing, natural lens vignetting, fine sensor noise. Real skin on both women: visible pores, fine lines, natural shine, flyaway hairs; keep the practitioner's skin exactly as in images 1 and 2 and do not add or remove freckles, moles or lines. Not a stock photo, not a render, no CGI look, no airbrushing, no beauty filter, no HDR, no oversharpening.

Images 1 and 2 show the practitioner's identity: the same face shape, eyes, nose, lips, hairline and real age; keep her clearly recognisable, do not beautify, slim or rejuvenate her. Image 3 gives her wardrobe, hair and make-up (white short-sleeved tunic with a round neckline, small drop earrings, red lipstick, long wavy blond hair), the fictional client and the studio.

Scene: the skin analysis before the treatment. The client, a fictional woman around 40 with shoulder-length dark-blond hair under a cream towel headband, sits upright on the treatment bed, relaxed, with a calm closed-mouth smile; clean skin without make-up. The practitioner sits beside her, leaning in a little, and looks closely and attentively at the client's cheek in the window light; one gloved hand rests lightly near the client's jaw. Neither looks into the camera. No devices, no magnifying lamp.

Studio: a window on the left with soft daylight, cream walls, a dark wooden cabinet with a few plain unlabelled bottles softly out of focus. Eye level, 35 mm, shallow depth of field.

Format: tall portrait 2:3, both faces in the middle of the frame, with calm space above and below so it can be cropped to 4:5 and 9:16.

Avoid: any text, letters, numbers, logos, labels or name tags; before/after; glowing or poreless skin; redness; glamour lighting; smiles into the camera; extra or fused fingers; perfect symmetry. One photo.
```

Textband: «Zum ersten Mal Microneedling?» · «Teresa prüft zuerst Ihre Haut und erklärt jeden Schritt.»

### M9 · Zwei in einer Sitzung («Zwei Behandlungen, eine Sitzung»)

Referenzen: 1 `raw/maske-v2_20261031_1.png` · 2 `raw/pen-v2_20261031_2.png`

```text
Unretouched real photograph taken by a working photographer during an actual appointment, Fujifilm X-T5 with a 35 mm f/1.4 lens, available window light mixed with a warm ceiling lamp, true-to-life colours, slightly imperfect framing, natural lens vignetting, fine sensor noise. Real skin: uneven tone, visible pores, fine vellus hair, a few freckles and small moles, slight natural shine on the nose, flyaway hairs. A lived-in small studio with ordinary details. Not a stock photo, not a render, no CGI look, no airbrushing, no beauty filter, no HDR, no oversharpening, no overly perfect styling.

Use image 1 only as reference for the fictional client, the studio and the light, and image 2 only for the exact look of the microneedling pen: brushed silver-grey metal, a fine knurled ring, a small transparent cartridge at the tip, no lettering.

Scene: the Carbon step, with the next step already waiting. The client reclines on the treatment bed with her eyes closed and a cream towel headband; a thin, matte, charcoal-black carbon lotion covers about half of her face in visible, slightly uneven brush strokes. Two hands in white nitrile gloves: one holds a flat brush with black lotion on it, the other rests lightly near her temple. On a small brushed-brass tray beside her head lies the microneedling pen, ready for the next step, in focus. The practitioner is only hands and a plain off-white sleeve edge.

Camera slightly above the bed, from the side, 35 mm, shallow depth of field. Tall portrait 2:3, her face and the pen both in the middle of the frame, with calm space above and below.

Avoid: any text, letters, numbers, logos or lettering on the pen; visible needles; lasers or light beams; redness; before/after; extra or fused fingers; a clinical setting; a glossy catalogue look. Do not depict any real person; the practitioner is unidentifiable. One photo.
```

Textband: «Zwei Behandlungen, eine Sitzung» · «Carbon-Peeling + Microneedling in 90 Minuten.»

### M10 · Ruhe («90 Minuten für Ihre Haut»)

Referenzen: 1 `raw/maske-v2_20261031_1.png`

```text
Unretouched real photograph taken by a working photographer during an actual appointment, Fujifilm X-T5 with a 35 mm f/1.4 lens, available window light mixed with a warm ceiling lamp, true-to-life colours, slightly imperfect framing, natural lens vignetting, fine sensor noise. Real skin: uneven tone, visible pores, fine vellus hair, a few freckles and small moles, slight natural shine on the nose, flyaway hairs. A lived-in small studio with ordinary details. Not a stock photo, not a render, no CGI look, no airbrushing, no beauty filter, no HDR, no oversharpening, no overly perfect styling.

Use the attached image only as reference for the fictional client, the studio and the light.

Scene: a quiet moment during a 90-minute appointment. The client lies on the treatment bed under a soft cream blanket, eyes closed, completely relaxed, a cream towel headband; her face is clean, with no mask and no lotion, ordinary skin with visible pores and fine lines. One hand of the practitioner in a white nitrile glove rests lightly on her shoulder; the practitioner is out of frame except for the hand and a plain off-white sleeve edge. Late-afternoon daylight from a window on the left, a candle softly out of focus on the dark wooden cabinet.

Camera at bed height from the head end, 50 mm, shallow depth of field. Tall portrait 2:3, her face in the middle third of the frame, with calm space above and below.

Avoid: any text, letters, numbers or logos; devices; glowing or poreless skin; a 'result' look; redness; smiles into the camera; extra or fused fingers; a clinical setting. Do not depict any real person. One photo.
```

Textband: «90 Minuten für Ihre Haut» · «Reinigung, Peelings, Carbon-Peeling, Microneedling, Maske und LED-Licht.»

### M11 · Teresa-Porträt («Persönlich von Teresa Stimac»)

Referenzen: 1 Teresa-Foto 2 · 2 Teresa-Foto 3 · 3 `raw/teresa_20261031_1.png` · 4 (optional) Teresa-Sheet aus dem Video-Guide

```text
Unretouched real photograph, full-frame camera with a 35 mm lens, available window light mixed with a warm ceiling lamp, true-to-life colours, slightly imperfect framing, natural lens vignetting, fine sensor noise. Her real skin exactly as in images 1 and 2: visible pores, fine lines, natural shine on the nose, flyaway hairs; do not add or remove freckles, moles or lines. Not a stock photo, not a render, no CGI look, no airbrushing, no beauty filter, no HDR, no oversharpening.

Images 1 and 2 are her identity: the same face shape, eyes, nose, lips, hairline and real age; keep her clearly recognisable, do not beautify, slim or rejuvenate her. Image 3 gives her wardrobe, hair and make-up (white short-sleeved tunic with a round neckline, small drop earrings, red lipstick, long wavy blond hair) and the studio. If a fourth image is attached, it shows the same woman from three angles; use it for her identity too.

Scene: she stands beside the treatment bed in her studio and looks into the lens with a warm, calm, closed-mouth smile, as if welcoming a client. Head and shoulders down to mid-chest, both hands out of frame. Behind her, softly out of focus: the treatment bed with a folded cream towel, the dark wooden cabinet, a candle. Window on the left, a soft shadow on the right side of her face.

Camera on a tripod at her eye level about one metre away, 35 mm, shallow depth of field. Tall portrait 2:3, her face in the upper middle of the frame, with calm space below.

Avoid: any text, letters, numbers, logos or name tags; glamour lighting; ring-light reflections in the eyes; a wide or teeth-showing smile; perfect symmetry; a different outfit; a studio backdrop. One photo.
```

Textband: «Persönlich von Teresa Stimac» · «Dipl. Visagistin & Kosmetikerin, seit über 20 Jahren im Beruf.»

### M12 · Danach («Auch danach gut beraten»)

Referenzen: 1 Teresa-Foto 2 · 2 Teresa-Foto 3 · 3 `raw/teresa_20261031_1.png`

```text
Unretouched real photograph, full-frame camera with a 35 mm lens, available window light mixed with a warm ceiling lamp, true-to-life colours, slightly imperfect framing, natural lens vignetting, fine sensor noise. Real skin on both women: visible pores, fine lines, natural shine, flyaway hairs; keep the practitioner's skin exactly as in images 1 and 2 and do not add or remove freckles, moles or lines. Not a stock photo, not a render, no CGI look, no airbrushing, no beauty filter, no HDR, no oversharpening.

Images 1 and 2 show the practitioner's identity: the same face shape, eyes, nose, lips, hairline and real age; keep her clearly recognisable, do not beautify, slim or rejuvenate her. Image 3 gives her wardrobe, hair and make-up (white short-sleeved tunic with a round neckline, small drop earrings, red lipstick, long wavy blond hair), the fictional client and the studio.

Scene: the end of the appointment. The client, a fictional woman around 40 with shoulder-length dark-blond hair worn loose, sits upright on the edge of the treatment bed in a plain cream robe and listens. The practitioner stands beside her, holds a small plain white tube without any label in one bare hand and explains something calmly with a friendly look; the two women look at each other, not into the camera. The client's skin is ordinary, with visible pores and fine lines, no make-up, not glowing, not red.

Studio: a window on the left with soft daylight, cream walls, the dark wooden cabinet softly out of focus. Eye level, 35 mm, shallow depth of field.

Format: tall portrait 2:3, both faces and the tube in the middle of the frame, with calm space above and below.

Avoid: any text, letters, numbers, labels or logos, also on the tube; before/after; glowing or 'perfect' skin; redness; glamour lighting; smiles into the camera; extra or fused fingers; perfect symmetry. One photo.
```

Textband: «Auch danach gut beraten» · «Klare Hinweise für die Tage danach: Sonnenschutz, Feuchtigkeit, kurze Pause von Hitze und Sport.»

## Runde 4 · gestaltete Anzeigen mit Text im Bild (2026-11-05)
Neuer Stil auf Wunsch des Users (Vorbilder: 3D-Preiszahlen, kräftige Farben, Glas und Gold, Teresa als Freisteller, echte Behandlungsfotos in Rahmen, Pills, Button), ersetzt das Textband von Runde 3. Erzeugt mit `gpt-image-2.6-flare` über `/v1/images/edits`, `high`, 1088 × 1360, je zwei Kandidaten; der Text steht im Bild und wurde in voller Grösse Wort für Wort geprüft. Referenzen in der Reihenfolge der Liste (`teresa_portrait.jpg` = ihr eingewilligtes echtes Porträt).

### carbon-gold

Referenzen: teresa_portrait.jpg · maske-v2_20261031_1.png

```text
Design a premium, click-strong Instagram feed ad (portrait 4:5) for a beauty studio in Zurich, art-directed like a top luxury-cosmetics campaign.

Style: deep matte carbon-black background with slow, glossy liquid-carbon swirls and fine gold dust; warm gold rim light. Hero 3D element: a huge polished 3D gold number "175", slightly tilted, with soft reflections, standing on a dark glass plate that mirrors it.

People and photos: on the left, the woman from image 1 as a clean cutout, waist up, exactly as in the photo: same face, same real age, same warm smile, red lipstick, long blond hair, white short-sleeved tunic; remove the name tag and the photo's background. Bottom right, a round window with a thin gold rim showing a realistic photo of the treatment from image 2: a woman reclining with closed eyes, half her face covered in matte black carbon lotion, a gloved hand with a brush.

Render ONLY the text listed below, each word spelled exactly as written (German, Swiss spelling), with clean, sharp, correctly kerned letters; no other words, no lorem ipsum, no logos, no watermarks. Text:
- top, elegant high-contrast serif, ivory: "Carbon-Peeling + Microneedling"
- small before the gold number: "CHF"; small after it: ".–"
- under the number: "statt CHF 250.–" with "CHF 250.–" struck through by a thin red line
- a small gold-outlined label: "Aktion · nur für kurze Zeit"
- two small labels with thin gold line icons: "90 Minuten" and "2 Behandlungen, 1 Sitzung"
- a gold button with dark text: "Jetzt Termin buchen"
- bottom line, small ivory: "Persönlich von Teresa Stimac · Bahnhofstrasse 94, Zürich"

Hierarchy: the gold number first, the headline second, the button third; generous spacing, nothing crowded.

Avoid: lasers or light beams, needles, before/after, glitter overload, cheap clip-art.
```

### duo-split

Referenzen: maske-v2_20261031_1.png · pen-v2_20261031_2.png

```text
Design a bold, modern Instagram feed ad (portrait 4:5) with a dynamic diagonal split, art-directed like a high-end skincare launch.

Layout: the canvas is split by a diagonal from top right to bottom left. Upper-left half: deep charcoal black with a soft carbon texture. Lower-right half: luminous pearl-blush with soft pink and peach light. On the split line floats a large glossy 3D "+" in brushed rose-gold, lit from both sides.

Photos: in the black half, a rounded-rectangle photo of the treatment from image 1 (a woman reclining with closed eyes, half her face in matte black carbon lotion, a gloved hand with a brush). In the blush half, a rounded-rectangle photo in the style of image 2: a gloved hand holding a brushed silver-grey microneedling pen with a transparent cartridge resting on a cheek, no needles visible. Both photos realistic, natural skin, soft shadows, slightly overlapping the split line.

Render ONLY the text listed below, each word spelled exactly as written (German, Swiss spelling), with clean, sharp, correctly kerned letters; no other words, no lorem ipsum, no logos, no watermarks. Text:
- big bold headline, top left, white: "2 Behandlungen." and on the next line "1 Sitzung."
- a small pill label on the black photo: "Carbon-Peeling"; a small pill label on the blush photo: "Microneedling"
- a round, tilted 3D price sticker in rose-gold: "CHF 175" large, and below it smaller "statt CHF 250" with "CHF 250" struck through
- bottom, small: "90 Min. · Bahnhofstrasse 94, Zürich"
- a black button with white text: "Jetzt Termin buchen"

Typography: heavy geometric sans-serif headline, tight leading, strong contrast.

Avoid: lasers, light beams, visible needles, blood, redness, before/after.
```

### glass-30

Referenzen: pen-v2_20261031_2.png

```text
Design a fresh, eye-catching Instagram feed ad (portrait 4:5) in a soft 3D glass style, like a premium beauty-tech campaign.

Background: smooth gradient from blush pink to soft lilac with a hint of mint; floating translucent 3D glass spheres and droplets with real refraction and soft caustic light.

Hero 3D element: a huge number "30 %" made of clear frosted glass with tiny bubbles inside, pink and lilac reflections, a slight tilt, a soft coloured shadow.

Photo: a large circular glass bubble in the lower part of the ad holds a realistic close-up photo in the style of image 1: a gloved hand holding a brushed silver-grey microneedling pen with a transparent cartridge resting on a woman's cheek; natural skin with pores; no needles visible.

Render ONLY the text listed below, each word spelled exactly as written (German, Swiss spelling), with clean, sharp, correctly kerned letters; no other words, no lorem ipsum, no logos, no watermarks. Text:
- above the number, bold dark plum sans-serif: "Sie sparen"
- under the number: "CHF 175 statt CHF 250" with "CHF 250" struck through
- headline, elegant serif, dark plum: "Carbon-Peeling + Microneedling"
- a small frosted-glass pill: "90 Min. · Bahnhofstrasse 94, Zürich"
- a small line: "Nur bis 30. November 2026"
- a glossy plum button with white text: "Jetzt Termin buchen"

Avoid: lasers, visible needles, blood, redness, before/after, clutter.
```

### cover

Referenzen: teresa_portrait.jpg

```text
Design an Instagram feed ad (portrait 4:5) styled as a confident fashion-magazine cover.

Photo: the woman from image 1 as the full-bleed cover portrait, from the chest up, looking into the camera with her warm smile, exactly as in the photo: same face, same real age, red lipstick, long blond hair, white short-sleeved tunic; remove the name tag; replace the background with a warm, softly lit cream studio wall with a gentle shadow. Real skin, no retouching.

Masthead: huge, elegant high-contrast serif across the top: "BEAUTY FACE LIFT", fully readable; her head sits below the masthead and nothing covers any letter.

Colours: deep lipstick red (matching her lips), black and ivory.

Render ONLY the text listed below, each word spelled exactly as written (German, Swiss spelling), with clean, sharp, correctly kerned letters; no other words, no lorem ipsum, no logos, no watermarks. Text (cover lines):
- masthead: "BEAUTY FACE LIFT"
- left column, bold condensed sans, red and black: "Carbon-Peeling + Microneedling", then smaller "Zwei Behandlungen in einer Sitzung"
- right side: "Persönlich von Teresa Stimac"
- a round red 3D sticker, slightly embossed: "CHF 175" big, "statt CHF 250" small with "CHF 250" struck through
- bottom left, small: "4,8 ★ aus 260+ Bewertungen auf Treatwell"
- bottom strip: "Zürich · Bahnhofstrasse 94"
- a small black button: "Jetzt Termin buchen"

Avoid: barcodes, issue numbers, prices other than the ones given, glamour retouching.
```

### neon-studio

Referenzen: teresa_20261031_1.png · teresa_portrait.jpg

```text
Design a dramatic, high-energy Instagram feed ad (portrait 4:5) with cinematic lighting, like a bold sports-brand poster but for a beauty studio.

Scene: the treatment room from image 1 at dusk, darker and moody, with warm copper-orange neon light lines running along the ceiling and walls (architectural LED strips) and warm window light. In the scene, the moment from image 1: the practitioner applies matte black carbon lotion with a brush to the face of a reclining client with closed eyes. The practitioner is the same woman as in image 2: same face, same real age, red lipstick, long blond hair, white short-sleeved tunic, no name tag. Realistic photo, real skin.

Hero 3D element: a giant extruded 3D number "175" in glossy copper-orange, standing in the room beside the bed, lit by the neon, reflected on the floor.

Render ONLY the text listed below, each word spelled exactly as written (German, Swiss spelling), with clean, sharp, correctly kerned letters; no other words, no lorem ipsum, no logos, no watermarks. Text:
- top, bold white condensed sans with a slight orange glow: "Carbon-Peeling + Microneedling"
- small "CHF" before the 3D number and ".–" after it
- under the number, on a dark tag: "statt CHF 250.–" with "CHF 250.–" struck through
- an orange tag: "Nur bis 30. November"
- bottom: "90 Minuten · Bahnhofstrasse 94, Zürich"
- an orange button with black text: "Jetzt Termin buchen"

Avoid: lasers or light beams aimed at the face, needles, sweat, gym equipment, before/after.
```

