# Meta-Anzeigen — Carbon-Peeling + Microneedling, CHF 175 statt CHF 250 (November 2026)

Paket 2 des Plans `docs/orchestrator/handover/CARBON-CAMPAIGN-PLAN-2026-10-31.md` (Abschnitt 4; main copy, git-excluded). Angebot mit Teresa vereinbart am 2026-10-31: 90 Min., **CHF 175 statt CHF 250**, Ersparnis CHF 75, **gültig bis 30. November 2026**.

## Motive

| Code | Motiv | Formate | Verwendung |
|---|---|---|---|
| M1 | Carbon-Maske, Hände mit Pinsel, fiktive Kundin | 4:5 | Anzeige 1, Seiten-Hero |
| M2 | Microneedling-Pen grau-metallisch, transparente Kartusche auf der Wange, keine Nadeln | 4:5 | Anzeige 2, Methodenbild |
| M3 | Stillleben Behandlungstisch, keine Personen | 1:1 | Anzeige 3 (Vertrauen), Methodenbild Nachsorge |
| M4 | Ruhiger Moment nach dem Termin, keine Ergebnisbehauptung | 4:5 | verworfen (Bildfehler: leeres Band unten) |
| M5 | Text-Karte ohne Foto | 4:5, 9:16 | Anzeige 2 alternativ |
| M6 | Vertrauen ohne Porträt (Foto M3 + Band) | 1:1, 4:5, 9:16 | Anzeige 3 |

Prompts: [prompts.md](prompts.md). Alle Bilder sind generiert (es gibt keine echten Fotos); Teresas Gesicht wird nie generiert; das Modell erzeugt keinen Text, alles Geschriebene kommt aus `render_ads.py`.

## Auswahlkriterien

1. Hände anatomisch korrekt (zwei Hände, fünf Finger), Handschuhe warm-weiss.
2. Geräteform: kein Nadel-, kein Laser-Eindruck, kein Lichtstrahl.
3. Haut natürlich (Poren, feine Linien), keine Plastikhaut, keine Unreinheiten, keine Rötung.
4. Fotorealismus: kein Render-Look, keine perfekte Symmetrie.
5. Kein Text, keine Zeichen, keine Logos im Bild.
6. Unteres Viertel ruhig für das Textband.

## Dateinamen

- Rohbilder (unveränderte Playground-Downloads): `raw/<motiv>_<yyyymmdd>_<n>.png`, z. B. `raw/maske_20261031_1.png`.
- Finale Anzeigen: `<motiv>_<format>.jpg` mit `11` = 1080 × 1080, `45` = 1080 × 1350, `916` = 1080 × 1920.
- Seitenbilder: `src/assets/lp/carbon/hero.webp`, `methode-1.webp` … (WebP, ohne Text).

## Kosten-Log

Modell `gpt-image-2.5-flare`, OpenAI-Playground, abgerechnet über das API-Guthaben des Users. Schätzung pro Bild laut OpenAI-Preisrechner: xhigh ≈ 0,085 USD, max ≈ 0,193 USD (1088 × 1360). Obergrenze Paket 2: 5 USD.

| Lauf | Datum | Motiv | Grösse | Qualität | Anzahl | Schätzung USD |
|---|---|---|---|---|---|---|
| 1 | 2026-10-31 | M1 Carbon-Maske | 1088 × 1360 | xhigh | 3 | 0,26 |
| 2 | 2026-10-31 | M2 Microneedling-Pen | 1088 × 1360 | xhigh | 3 | 0,26 |
| 3 | 2026-10-31 | M3 Stillleben | 1088 × 1088 | xhigh | 3 | 0,22 |
| 4 | 2026-10-31 | M4 Moment danach | 1088 × 1360 | xhigh | 2 | 0,17 |
| 5 | 2026-10-31 | M1 v2 Carbon-Maske (Referenz M1-1) | 1088 × 1360 | max | 2 | 0,39 |
| 6 | 2026-10-31 | M2 v2 Pen metallisch (Referenzen M1-1, Geräteausschnitt) | 1088 × 1360 | max | 2 | 0,39 |
| 7 | 2026-10-31 | M3 v2 Stillleben | 1088 × 1088 | max | 1 | 0,16 |

Summe der Schätzungen: ≈ 1,85 USD (Obergrenze 5 USD). Der tatsächliche Betrag steht im Abschnitt «Kosten laut OpenAI».

## Auswahl (User, 2026-10-31)

- **Runde 1** (xhigh, 11 Bilder): vom User als zu wenig natürlich beurteilt («es darf nicht nach KI-Bildern aussehen»), Pen sollte grau-metallisch statt mattgrau sein. M4 zusätzlich verworfen (leeres Band unten), `pen_20261031_2` verworfen (Pen berührt die Haut nicht). Alle Kandidaten bleiben in `raw/`.
- **Runde 2** (max, 5 Bilder, Prompts «v2» in [prompts.md](prompts.md)): gewählt
  - `raw/maske-v2_20261031_1.png` → Anzeige «maske», Seiten-Hero
  - `raw/maske-v2_20261031_2.png` → Seitenbild Schritt Carbon-Peeling
  - `raw/pen-v2_20261031_2.png` → Anzeige «pen», Seitenbild Schritt Microneedling
  - `raw/stillleben-v2_20261031_1.png` → Anzeige «vertrauen», Seitenbild Schritt Nachsorge
- Referenzen für Runde 2: `raw/maske_20261031_1.png` (eigene Generierung) und ein Ausschnitt **nur des Geräts** aus einem vom User gelieferten Referenzfoto. Die Referenzfotos (`referenzen/`) zeigen fremde Personen und stammen nicht aus dem Projekt; sie bleiben lokal und werden nicht committet.

## Finale Dateien

Anzeigen (JPG, Qualität 92), gerendert mit `render_ads.py`, kopiert nach `public/ads/2026-11-carbon/` (nach dem Deploy unter `https://beautyfacelift-zuerich.ch/ads/2026-11-carbon/<datei>`):

| Datei | Grösse | Bild | Textband |
|---|---|---|---|
| `maske_45.jpg`, `maske_11.jpg`, `maske_916.jpg` | 1080 × 1350, 1080 × 1080, 1080 × 1920 | M1 v2-1 | Carbon-Peeling + Microneedling · CHF 175 statt CHF 250 · Sie sparen CHF 75.– · Nur bis 30. November 2026 · Beauty Face Lift · Bahnhofstrasse 94, Zürich |
| `pen_45.jpg`, `pen_11.jpg`, `pen_916.jpg` | wie oben | M2 v2-2 | wie oben |
| `vertrauen_45.jpg`, `vertrauen_11.jpg`, `vertrauen_916.jpg` | wie oben | M3 v2-1 | Persönlich von Teresa Stimac · Über 20 Jahre Erfahrung · 90 Min. · Carbon-Peeling + Microneedling · CHF 175 statt CHF 250 · Nur bis 30. November 2026 |
| `karte_45.jpg`, `karte_916.jpg` | 1080 × 1350, 1080 × 1920 | kein Foto | drei Fragen mit Antworten aus der Behandlungsbeschreibung, Preis, Ersparnis, Enddatum |

- 9:16: kein Text in den oberen 14 % und unteren 20 % (Textband endet bei Pixel 1504 von 1920).
- Keine 1:1-Text-Karte: der Fragenblock passt nicht lesbar in 1080 × 1080.
- «Über 20 Jahre Erfahrung»: Aussage des Users 2026-10-31. Die Bewertungszahl von Treatwell steht bewusst nicht im Bild, weil sie am Umsetzungstag nicht abgelesen wurde.

Seitenbilder (WebP, Qualität 82, alle unter 100 KB, ohne Text), erzeugt mit `export_page_images.py` für `/lp/carbon-microneedling/` (Hero-Bogen und Schrittkarten sind dort 4:5):

| Datei | Grösse | Quelle | Vorschlag für die Seite |
|---|---|---|---|
| `src/assets/lp/carbon/hero.webp` | 1088 × 1360 | M1 v2-1 | IMAGE SWAP 1 (Hero) |
| `src/assets/lp/carbon/methode-1.webp` | 1088 × 1360 | M1 v2-2 | IMAGE SWAP 3 (Carbon-Lotion) |
| `src/assets/lp/carbon/methode-2.webp` | 1088 × 1360 | M2 v2-2 | IMAGE SWAP 4 (Microneedling) |
| `src/assets/lp/carbon/methode-3.webp` | 870 × 1088 | M3 v2-1 (mittig auf 4:5 beschnitten) | IMAGE SWAP 5 (Nachsorge) oder 6 (Studio) |

Für IMAGE SWAP 2 (Hautanalyse) und 6 (Studio ohne Person) gibt es kein eigenes neues Motiv; dafür wäre ein weiterer Lauf nötig.

## Neu erzeugen

```bash
py -I design/ads/2026-11-carbon/render_ads.py <fonts-dir> design/ads/2026-11-carbon
py -I design/ads/2026-11-carbon/export_page_images.py
```

`<fonts-dir>` enthält `InstrumentSerif-Regular.ttf` und `InstrumentSans-Var.ttf`, mit fontTools aus den `@fontsource`-WOFF2-Dateien (`instrument-serif-latin-400-normal.woff2`, `instrument-sans-latin-wght-normal.woff2`) umgewandelt. Danach die gewählten JPGs nach `public/ads/2026-11-carbon/` kopieren. Das Enddatum steht nur an einer Stelle: `END` im Script.

## Anzeigentexte

Alle drei: Sie-Ton, Schweizer Schreibweise, Button «Mehr dazu», Anzeigelink `beautyfacelift-zuerich.ch`, Ziel-URL laut Plan 5.1. Headline höchstens 40, Beschreibung höchstens 30 Zeichen. Geprüft gegen Plan 4.6: kein «Hydra», kein «Laser», keine Wirk- oder Ergebnisaussage (kein «klärt», kein «Kollagen», keine Aussage zur Rötung), keine erfundenen Zahlen; Preis, Ersparnis und Enddatum wie auf der Seite; jede Anzeige nennt Ort und unverbindliche Anfrage.

**Anzeige 1 · Angebot (`maske_*`)**

> Primärtext: Carbon-Peeling + Microneedling in einer Sitzung von 90 Minuten: Aktion CHF 175 statt CHF 250, Sie sparen CHF 75.–, gültig bis 30. November 2026. Persönlich von Teresa Stimac an der Bahnhofstrasse 94, Zürich. Unverbindlich anfragen, ohne Online-Zahlung.
>
> Headline: Carbon-Peeling + Microneedling CHF 175 (38 Zeichen)
>
> Beschreibung: 90 Min. · Bahnhofstrasse 94 (27 Zeichen)

**Anzeige 2 · Zum ersten Mal? (`pen_*` oder `karte_*`)**

> Primärtext: Zum ersten Mal Microneedling? Teresa Stimac prüft vor Ort mit einer Hautanalyse, ob Carbon-Peeling + Microneedling zu Ihrer Haut passt, und erklärt jeden Schritt. Aktion CHF 175 statt CHF 250 für 90 Minuten, gültig bis 30. November 2026. Bahnhofstrasse 94, Zürich. Unverbindlich anfragen.
>
> Headline: Passt Carbon-Peeling zu Ihrer Haut? (35 Zeichen)
>
> Beschreibung: Mit Hautanalyse · CHF 175 (25 Zeichen)

**Anzeige 3 · Persönlich (`vertrauen_*`)**

> Primärtext: Persönlich behandelt von Teresa Stimac, dipl. Visagistin & Kosmetikerin, seit über 20 Jahren im Beruf und selbstständig. Carbon-Peeling + Microneedling in einer Sitzung von 90 Minuten, mit Hautanalyse und Hinweisen für die Pflege danach. Aktion CHF 175 statt CHF 250, gültig bis 30. November 2026. Bahnhofstrasse 94, Zürich, Mo–Fr bis 20 Uhr, Sa bis 16 Uhr. Unverbindlich anfragen.
>
> Headline: Carbon-Peeling + Microneedling in Zürich (40 Zeichen)
>
> Beschreibung: Bahnhofstrasse 94 · CHF 175 (27 Zeichen)

Quellen: Preis, Ersparnis, Enddatum (Teresa/User 2026-10-31, Plan Abschnitt 2), 90 Min. (Treatwell), Titel «dipl. Visagistin & Kosmetikerin» (Treatwell-Profil, vom User freigegeben), «über 20 Jahre» (User 2026-10-31), Öffnungszeiten (`shared/site.ts`), Hautanalyse und Nachsorge (Behandlungsbeschreibung des Users).

## Kosten laut OpenAI

Abgelesen auf `https://platform.openai.com/usage` (Spend categories, letzte 7 Tage, Nutzer Paulo Ferreira) am 2026-10-31 um etwa 13:40 Uhr: **0,99 USD** (gpt-image-2_5-flare image output 0,975 USD, text input 0,019 USD; image input noch 0 USD). Das deckt erkennbar nur Runde 1 (11 Bilder in xhigh); Runde 2 (5 Bilder in max mit Referenzbildern, Schätzung ≈ 0,94 USD) war zu diesem Zeitpunkt noch nicht verbucht. Erwartetes Total ≈ 1,9 USD; den Endstand bitte nach einigen Stunden auf derselben Seite ablesen.
