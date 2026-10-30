# Meta ads — Aquafacial + Microneedling, CHF 170 statt CHF 250 (launch set, October 2026)

Made on 2026-10-12 for the campaign in [docs/current/META-CAMPAIGN-AQUAFACIAL-MICRONEEDLING.md](../../../docs/current/META-CAMPAIGN-AQUAFACIAL-MICRONEEDLING.md).

## Images

| File | Size | Used in | Source photo |
|---|---|---|---|
| `glow_45.jpg` | 1080 × 1350 (4:5) | ad `glow_static45_v1`, feeds | real treatment photo `src/assets/lp/aquafacial/aquafacial-behandlung-zuerich.webp` |
| `glow_916.jpg` | 1080 × 1920 (9:16) | same ad, Stories and Reels | same |
| `first-needling_45.jpg` | 1080 × 1350 | ad `first-needling_static45_v1`, feeds | text card, no photo |
| `first-needling_916.jpg` | 1080 × 1920 | same ad, Stories and Reels | text card |
| `teresa_45.jpg` | 1080 × 1350 | ad `teresa_static45_v1`, feeds | Teresa's real portrait `src/assets/marketing/teresa_portrait.jpg` |
| `teresa_916.jpg` | 1080 × 1920 | same ad, Stories and Reels | same |

- **No generated media.** Both photos are the two real photographs the project keeps byte-for-byte; the text cards and bands are typography only. No before/after, no result images.
- **Brand:** Instrument Serif and Instrument Sans (the site's fonts), cream `#FAF6F1`, cocoa `#2A1E18`, copper `#8F5A2E` / `#D7AE84`.
- **9:16 safe zones:** no text in the top 14 % or the bottom 20 %.
- **Rebuild:** `python3 design/ads/2026-10-kombi/render_ads.py <fonts-dir> design/ads/2026-10-kombi`, where `<fonts-dir>` holds `InstrumentSerif-Regular.ttf` and `InstrumentSans-Var.ttf` converted from the `@fontsource` WOFF2 files with fontTools.
- The end date "30. November" is printed on every image (re-rendered on 2026-10-30 for the revised offer end 30 November 2026; before that "14. November"). If the offer end date changes, change `END` in the script and re-render.

## AI image prompts for further variants

[AI-IMAGE-PROMPTS.md](AI-IMAGE-PROMPTS.md) has eight copy-ready prompts for OpenAI's image model (ChatGPT), one per scene, mapped to the plan's angles A1–A5. They come with repair lines and a check before use. The images are generated without any text; price, duration, end date and address are added afterwards with `render_ads.py`. `ai-references/teresa-treatment-crop.jpg` is the real treatment photo cropped to Teresa only, so no real client is uploaded.

## Ad texts (Swiss German, "Sie")

All three: button "Mehr dazu" (`LEARN_MORE`), display link `beautyfacelift-zuerich.ch`, website URL

```text
https://beautyfacelift-zuerich.ch/lp/aquafacial-microneedling/?utm_source=meta&utm_medium=paid_social&utm_campaign=bfl_ch_meta_lead_aquafacial-microneedling_202610&utm_content=p_zh15km_adv__<ad name>&utm_term={{placement}}&utm_id={{campaign.id}}&utm_source_platform=meta
```

**`glow_static45_v1`**

> Aquafacial + Microneedling in einer Sitzung: 90 Minuten für frischeren Glow und glatter wirkende Haut.
> Kombi-Angebot CHF 170 statt CHF 250, gültig bis 30. November.
> Persönlich von Teresa Stimac, Bahnhofstrasse 94, Zürich. Unverbindlich anfragen – ohne Online-Zahlung.

Headline `Aquafacial + Microneedling für CHF 170` · Description `90 Min. · Bahnhofstrasse 94 · bis 30.11.`

**`first-needling_static45_v1`**

> Zum ersten Mal Microneedling? Die drei häufigsten Fragen, ehrlich beantwortet: Die Hautanalyse klärt vorher, ob die Kombination passt. Die Intensität wird individuell angepasst. Rötungen sind möglich und beruhigen sich meist innerhalb von 24–48 Stunden.
> Kombi mit Aquafacial: CHF 170 statt CHF 250, bis 30. November. Unverbindlich anfragen.

Headline `Erstes Microneedling? So läuft es ab` · Description `Mit Aquafacial · CHF 170 statt 250`

**`teresa_static45_v1`**

> Bei Beauty Face Lift behandelt Teresa Stimac persönlich – seit über 20 Jahren, 4,8 aus 248+ Bewertungen auf Treatwell.
> Aquafacial + Microneedling, 1 Std. 30 Min., CHF 170 statt CHF 250, bis 30. November. Bahnhofstrasse 94, wenige Gehminuten vom Hauptbahnhof.

Headline `Persönlich von Teresa Stimac, Zürich` · Description `Aquafacial + Microneedling · CHF 170`

Every fact comes from the site: price, duration, end date (PR #50), 20+ years, "4,8 aus 248+ Bewertungen auf Treatwell", "wenige Gehminuten vom Hauptbahnhof", FAQ wording on sensation and redness. No "garantiert", "schmerzfrei", "keine Ausfallzeit", no statement about the viewer's skin.

## Upload

The connector's local-file upload is not yet enabled for this ad account, and URL uploads need a public address. The same six files are therefore also in `public/ads/2026-10-kombi/` on the branch of PR #50; once that is merged and deployed they are at `https://beautyfacelift-zuerich.ch/ads/2026-10-kombi/<file>` and can be uploaded to Meta by URL.
