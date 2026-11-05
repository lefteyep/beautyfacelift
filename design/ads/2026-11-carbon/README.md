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
| M7 | Teresa trägt die Carbon-Lotion mit dem Pinsel auf, fiktive Kundin | 4:5, 9:16 | Seiten-Hero mit Teresa, Anzeige 4 |
| M8 | Hautanalyse: Teresa schaut sich die Haut der Kundin an | 4:5, 9:16 | Runde 3, «Zum ersten Mal Microneedling?» |
| M9 | Carbon-Lotion, daneben der Microneedling-Pen auf dem Tablett | 4:5, 9:16 | Runde 3, «Zwei Behandlungen, eine Sitzung» |
| M10 | Ruhiger Moment unter der Decke, Hand auf der Schulter | 4:5, 9:16 | Runde 3, «90 Minuten für Ihre Haut» |
| M11 | Teresa am Behandlungsbett, Blick in die Kamera | 4:5, 9:16 | Runde 3, «Persönlich von Teresa Stimac» |
| M12 | Teresa erklärt die Pflege danach, neutrale Tube | 4:5, 9:16 | Runde 3, «Auch danach gut beraten» |

Prompts: [prompts.md](prompts.md). Video mit Teresa als sprechendem KI-Avatar (geplant, noch nichts erzeugt): Schritt-für-Schritt-Anleitung zum Nachklicken in Higgsfield im Doc [Carbon Avatar Video Guide](https://claude.ai/artifact/SM5NNZGqhqV5SEVJAQeLkp), Hintergründe in [AVATAR-VIDEO-GUIDE.md](AVATAR-VIDEO-GUIDE.md), Best Practices aus drei Tutorial-Videos in [AI-VIDEO-BEST-PRACTICES.md](AI-VIDEO-BEST-PRACTICES.md), Textebenen in `video-overlays/` (aus `render_video_overlays.py`), Rohschnitt aus `render_animatic.py`. Alle Bilder sind generiert (es gibt keine echten Fotos); Teresa erscheint nur im Motiv M7 (siehe unten), erzeugt aus ihren eingewilligten Referenzfotos; sonst nur Hände; das Modell erzeugt keinen Text, alles Geschriebene kommt aus `render_ads.py`.

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
| 8 | 2026-10-31 | M7 Teresa (Referenzen: Teresa-Fotos 2 und 3, `maske-v2_20261031_1.png`) | 1088 × 1360 | max | 2 | 0,40 |
| 9 | 2026-11-05 | M8–M12, `gpt-image-2.6-flare` über die API (Wunsch des Users), Referenzen siehe Runde 3 | 1088 × 1360 | high | 12 (davon 2 Fehlversuch: Prompt beim Upload abgeschnitten) | ≈ 56 700 Tokens laut API; Betrag in der OpenAI-Usage-Ansicht |

Summe der Schätzungen: ≈ 2,25 USD (Läufe 1–7 ≈ 1,85; Lauf 8 Teresa ≈ 0,40, eigene Obergrenze 2 USD) (Obergrenze 5 USD). Der tatsächliche Betrag steht im Abschnitt «Kosten laut OpenAI».

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
| `teresa_45.jpg`, `teresa_916.jpg` | 1080 × 1350, 1080 × 1920 | M7-1 | wie «maske» |

- Keine 1:1-Fassung von «teresa»: das quadratische Bildfeld schneidet entweder ihr Gesicht oder den Pinsel an der Wange ab.
- Keine 1:1-Text-Karte: der Fragenblock passt nicht lesbar in 1080 × 1080.
- «Über 20 Jahre Erfahrung»: Aussage des Users 2026-10-31. Die Bewertungszahl von Treatwell steht bewusst nicht im Bild, weil sie am Umsetzungstag nicht abgelesen wurde.

Seitenbilder (WebP, Qualität 82, eingebettetes sRGB-Profil, ohne Text; `hero-teresa.webp` 110 KB, alle anderen unter 100 KB), erzeugt mit `export_page_images.py` für `/lp/carbon-microneedling/` (Hero-Bogen und Schrittkarten sind dort 4:5):

| Datei | Grösse | Quelle | Vorschlag für die Seite |
|---|---|---|---|
| `src/assets/lp/carbon/hero.webp` | 1088 × 1360 | M1 v2-1 | IMAGE SWAP 1 (Hero) |
| `src/assets/lp/carbon/methode-1.webp` | 1088 × 1360 | M1 v2-2 | IMAGE SWAP 3 (Carbon-Lotion) |
| `src/assets/lp/carbon/methode-2.webp` | 1088 × 1360 | M2 v2-2 | IMAGE SWAP 4 (Microneedling) |
| `src/assets/lp/carbon/methode-3.webp` | 870 × 1088 | M3 v2-1 (mittig auf 4:5 beschnitten) | IMAGE SWAP 5 (Nachsorge) oder 6 (Studio) |
| `src/assets/lp/carbon/hero-teresa.webp` | 1088 × 1360 | M7-1 (Teresa) | IMAGE SWAP 1 (Hero mit Teresa), Alternative zu `hero.webp` |

Für IMAGE SWAP 2 (Hautanalyse) und 6 (Studio ohne Person) gibt es kein eigenes neues Motiv; dafür wäre ein weiterer Lauf nötig.

## M7 · Teresa (Nachtrag 2026-10-31)

Der User wollte Teresa auf der Landingpage und hat den Lauf im Chat freigegeben. Ihre Einwilligung in generierte Bilder nach ihren Fotos ist seit dem 11.10.2026 im Projekt dokumentiert ([teresa-varied-series](../../images/lp-shoot-2026-10/teresa-varied-series/README.md)). Hochgeladen wurden nur Fotos, auf denen Teresa allein ist (`teresa fotos/2.png.webp` und `3.png` im Kundenordner, nicht im Repository; SHA-256 in `reference-manifest.json` der Serie), dazu das eigene Bild `maske-v2_20261031_1.png` für Kundin und Studio. Fotos mit echten Kundinnen (1, 4, 5) wurden nicht hochgeladen.

- Kandidaten: `raw/teresa_20261031_1.png` (gewählt vom User), `raw/teresa_20261031_2.png`.
- Geprüft: Teresa erkennbar (Gesichtsform, Haar, Lippenstift wie Referenz), Kittel ohne Namensschild, natürliche Haut, keine Laser, keine Nadeln, kein Text, kein Vorher/Nachher.

## Neu erzeugen

```bash
py -I design/ads/2026-11-carbon/render_ads.py <fonts-dir> design/ads/2026-11-carbon
py -I design/ads/2026-11-carbon/export_page_images.py
```

Textebenen und Rohschnitt für das Avatar-Video (aus dem Repository-Root):

```bash
py -I design/ads/2026-11-carbon/render_video_overlays.py <fonts-dir> design/ads/2026-11-carbon/video-overlays
py -I design/ads/2026-11-carbon/render_animatic.py design/ads/2026-11-carbon/video-overlays/916 <out-dir> <fonts-dir>
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

Zweite Ablesung am 2026-10-31 um etwa 15:05 Uhr (gleiche Ansicht): **2,06 USD** bei 7 Anfragen (image output 1,967, image input 0,062, text input 0,03). Das sind die Läufe 1–7; Lauf 8 (Teresa, Schätzung ≈ 0,40 USD) war noch nicht verbucht. Erwartetes Total ≈ 2,45 USD.

Erste Ablesung:

Abgelesen auf `https://platform.openai.com/usage` (Spend categories, letzte 7 Tage, Nutzer Paulo Ferreira) am 2026-10-31 um etwa 13:40 Uhr: **0,99 USD** (gpt-image-2_5-flare image output 0,975 USD, text input 0,019 USD; image input noch 0 USD). Das deckt erkennbar nur Runde 1 (11 Bilder in xhigh); Runde 2 (5 Bilder in max mit Referenzbildern, Schätzung ≈ 0,94 USD) war zu diesem Zeitpunkt noch nicht verbucht. Erwartetes Total ≈ 1,9 USD; den Endstand bitte nach einigen Stunden auf derselben Seite ablesen.

## Runde 3 · fünf neue Motive mit gpt-image-2.6-flare (2026-11-05)

Auf Wunsch des Users von Claude erzeugt: OpenAI-API (`/v1/images/edits`), Modell `gpt-image-2.6-flare`, Qualität `high` (die höchste Stufe des Modells), 1088 × 1360, je Motiv zwei Kandidaten, abgerechnet über den API-Key des Users. Prompts: [prompts.md](prompts.md), Abschnitt «Runde 3» (für die API ist das Format «Portrait 4:5» statt «2:3», und die Teresa-Referenzen sind ihr echtes Porträt `src/assets/marketing/teresa_portrait.jpg` als Identität plus `raw/teresa_20261031_1.png` für Kittel, Ohrringe, Lippenstift, Kundin und Studio). Log: `raw/generation-log-20261105.jsonl`.

- Gewählt (jeweils Kandidat 1): `raw/hautanalyse_20261105_1.png`, `raw/zwei-in-einer_20261105_1.png` (Pen neben dem Gesicht; bei Kandidat 2 läge er im Textband), `raw/ruhe_20261105_1.png`, `raw/teresa-portrait_20261105_1.png`, `raw/danach_20261105_1.png`. Kandidaten 2 bleiben als Alternative.
- Geprüft: Hände (fünf Finger, Handschuhe), kein Text auf Tube, Pen, Flaschen; keine Nadeln, kein Laser, keine Rötung, kein Vorher/Nachher; Teresa erkennbar, Kittel, Ohrringe, Lippenstift wie M7.
- Finale Anzeigen mit `render_ads_r3.py` (Textband wie die bisherigen Anzeigen, «CHF 250» mit der roten Diagonale der Seite, Enddatum nur in `END`): `hautanalyse_45.jpg`, `zwei-in-einer_45.jpg`, `ruhe_45.jpg`, `teresa-portrait_45.jpg`, `danach_45.jpg` und je `_916.jpg`. Nicht nach `public/` kopiert (die Website braucht sie nicht).
- **Offen:** Teresa gibt M8, M11 und M12 frei, bevor sie laufen; Hochladen auf Meta (Anleitung im Tab «Image ads» des Docs [Carbon Avatar Video Guide](https://claude.ai/artifact/SM5NNZGqhqV5SEVJAQeLkp)); falls die Anzeigen nach dem 10. November starten und das Enddatum sich ändert: `END` anpassen und neu rendern.

```bash
py -I design/ads/2026-11-carbon/render_ads_r3.py <fonts-dir> design/ads/2026-11-carbon
```

## Runde 4 · gestaltete Anzeigen, Text im Bild (2026-11-05)

Der User hat den Stil von Runde 3 (Foto + Textband) abgelehnt: «completely new style … click-strong … 3D elements, dynamic colors». Runde 3 bleibt als Archiv im Ordner, wird aber nicht verwendet. Fünf Art-Directions, je zwei Kandidaten, Prompts in [prompts.md](prompts.md), Abschnitt «Runde 4», Log `raw/generation-log-20261105-r4.jsonl` (≈ 44 000 Tokens).

| Datei (4:5 und 9:16) | Stil | Kandidat | Teresa |
|---|---|---|---|
| `carbon-gold_45.jpg` / `_916.jpg` | Carbon-Schwarz, 3D-Gold «175», Teresa freigestellt, Behandlungsfoto im Goldrahmen | 2 | ja |
| `duo-split_45.jpg` / `_916.jpg` | Diagonale Schwarz/Perlrosa, 3D-«+», zwei Behandlungsfotos, Preis-Sticker | 2 | nein |
| `glass-30_45.jpg` / `_916.jpg` | Pastell-Glas, 3D-«30 %», Pen-Foto in Glasblase | 1 | nein |
| `cover_45.jpg` / `_916.jpg` | Magazin-Cover mit Teresa, Lippenstiftrot | 1 | ja |
| `neon-studio_45.jpg` / `_916.jpg` | Studio mit Kupfer-Neon, riesige 3D-«175» im Raum | 2 | ja |

- Geprüft (volle Grösse): jedes Wort, Preis «CHF 175» und «statt CHF 250» durchgestrichen, «Sie sparen 30 %» (75 von 250), «4,8 ★ aus 260+ Bewertungen auf Treatwell», Adresse, «Nur bis 30. November» (nur in glass-30 und neon-studio); keine Nadeln, kein Laser, kein Vorher/Nachher, keine erfundenen Geräte.
- **Bekannter Mangel:** auf `cover` verdeckt Teresas Haar das «F» von «BEAUTY FACE LIFT». Die Korrektur (Prompt angepasst) scheiterte, weil das OpenAI-Guthaben aufgebraucht war.
- 9:16 ist vorläufig: die 4:5-Anzeige zentriert auf 82 % (Text zwischen 14 % und 80 % der Höhe) auf einem Farbfeld aus ihr selbst. Echte 9:16-Layouts brauchen neues Guthaben.
- **Offen:** OpenAI-Guthaben aufladen (Entscheid des Users) für Cover-Korrektur und echte 9:16; Teresa gibt carbon-gold, cover und neon-studio frei; Hochladen auf Meta. Datum im Bild: glass-30 und neon-studio müssen neu erzeugt werden, falls das Enddatum sich ändert.

## Runde 5 · fünf weitere Stile, Cover korrigiert, native 9:16 (2026-11-05)

Neues OpenAI-Guthaben (User). Prompts in [prompts.md](prompts.md), Abschnitt «Runde 5»; Log weiter in `raw/generation-log-20261105-r4.jsonl`.

| Datei (4:5 und 9:16) | Stil | Kandidat 4:5 | Teresa |
|---|---|---|---|
| `swiss-poster_*` | Swiss Style: Raster, Signalrot/Schwarz/Weiss, riesige «175», Behandlungsfoto | 1 | nein |
| `collage_*` | Papier-Collage mit Sofortbildern, Klebeband, Handschrift | 1 | ja (Sofortbild aus ihrem echten Porträt) |
| `clay-steps_*` | 3D-Clay-Pfad mit den 7 Schritten, Preisblase | 1 | nein |
| `carbon-brush_*` | Minimal-Luxus: ein schwarzer Carbon-Pinselstrich auf Elfenbein | 1 | nein |
| `pop-art_*` | Pop-Art-Comic, «BEIDES! CHF 175» | 1 | nein (Comic-Kundin, fiktiv) |

- **Cover korrigiert:** `cover_45.jpg` jetzt aus `raw/cover-v2-45_20261105_2.png`, «BEAUTY FACE LIFT» voll lesbar. Der erste Cover-Lauf bleibt in `raw/cover-45_20261105_*.png`.
- **Native 9:16 für alle zehn Anzeigen** (`*_916.jpg`, aus `raw/*-916_20261105_1.png`): ersetzen die vorläufigen Zentrier-Versionen. Fünf (carbon-gold, duo-split, cover, neon-studio, clay-steps) wurden mit strengeren Schutzzonen neu erzeugt, weil Text im unteren 20-%-Bereich lag; die erste Fassung liegt als `raw/*-916_20261105_0.png`. clay-steps 9:16 hat die Adresszeile weggelassen (steht im Anzeigentext).
- Geprüft: jedes Wort in voller Grösse (7 Schrittnamen, Handschrift, Sprechblasen, Bewertung, Adresse, Preise und Durchstreichungen).
- **Offen:** Teresa gibt carbon-gold, cover, neon-studio und collage frei; Auswahl und Hochladen auf Meta.

