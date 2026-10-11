# Varied Teresa reference series

Final selection for draft PR #48 on `codex/lp-teresa-imagery`, 11 October 2026. The user confirmed Teresa's consent and supplied five additional real references in `3.zip`. All eight commissioned replacement files were regenerated with varied camera positions, actions and expressions. Teresa is recognizable in the wider treatment, preparation, aftercare and consultation scenes; close-ups concentrate on her hands and the devices. The same fictional client and warm cream/sand studio appear throughout.

[Selected series review](selected-series-review.png) shows all eight exports. Labels are outside the photographs and appear only on this review sheet, never on the landing pages.

| Slot | Selected native PNG | Export | Bytes | View/action |
| --- | --- | --- | ---: | --- |
| 4 | [candidate 1](slot-04-candidate-01.png) | `public/assets/aquafacial_treatment.png`, 1200 × 630 | 919,849 | Side view, cheek treatment, calm left space |
| 6 | [candidate 4](slot-06-candidate-04.png) | `hero-aquafacial-microneedling-zuerich.webp`, 1672 × 941 | 68,224 | Wide treatment hero, complete faces in arch |
| 7 | [candidate 3](slot-07-candidate-03.png) | `personal-treatment-zuerich.webp`, 1122 × 1402 | 98,826 | Seated hand-mirror preparation |
| 8 | [candidate 1](slot-08-candidate-01.png) | `aquafacial-close-up-zuerich.webp`, 1122 × 1402 | 95,238 | Temple/cheekbone detail, clear connected tube |
| 9 | [candidate 4](slot-09-candidate-04.png) | `microneedling-close-up-zuerich.webp`, 1122 × 1402 | 92,660 | Opposite cheek detail, matte pen/writing grip |
| 10 | [candidate 3](slot-10-candidate-03.png) | `abschlusspflege-aftercare-zuerich.webp`, 1448 × 1086 | 93,482 | Slight overhead gel application, jar/spatula |
| 12 | [candidate 2](slot-12-candidate-02.png) | `post-treatment-glow-zuerich.webp`, 1448 × 1086 | 100,540 | Seated appointment ending, ordinary skin texture |
| 13 | [candidate 3](slot-13-candidate-03.png) | `hautanalyse-beratung-zuerich.webp`, 1448 × 1086 | 105,930 | Table conversation, blank tablet/open-hand gesture |

The seven WebPs remain under 120,000 bytes; the hero is also under its 160,000-byte limit. All exports retain exact dimensions, paths and embedded sRGB. WebP quality is 82 with the photo preset. Slot 4 remains a true optimized PNG so the pinned `.png` URL agrees with its extension and served format. No offer-date or image-reference changes were needed.

The [eight exact selected prompts](PROMPTS.md) are linked from [LP-IMAGE-PROMPTS.md](../../../../docs/current/LP-IMAGE-PROMPTS.md). [generation-log.json](generation-log.json) retains every actual prompt, source path and reference input, including rejected candidates. [reference-manifest.json](reference-manifest.json) identifies the five uploaded real photographs by filename and SHA-256; uploaded originals remain in the workspace attachment directory. [exports.json](exports.json) records export settings, dimensions, profiles, bytes and hashes. All 29 native generated PNGs are unchanged copies of the returned originals. The built-in generator does not disclose its backend model identifier or offer a resolution selector; each prompt requested the largest supported output.

Reproduce the selected exports from the repository root:

```sh
node design/images/lp-shoot-2026-10/teresa-varied-series/export.mjs
```

## Validation

Passed `npm ci`, `npm run qa:aquafacial-lp`, `npm run qa:aquafacial-combo-lp`, `npm run qa:marketing`, `npm run qa:docs`, `npm run check` and `npm run build`. Type check reports 0 errors, 0 warnings and 13 existing hints; build produces 36 pages.

Captured both pages at 390 and 1440 px with loaded images and no browser errors or horizontal overflow. [after-browser-review.json](screenshots/after-browser-review.json) records rendered sizes, source sizes and focal positions. Visually checked both hero arches/bands, preparation, three steps, appointment ending and consultation. The Kombi desktop hero uses 70%/50%, phone hero 60%/40%, and preparation phone crop 50%/30% to keep both faces, mirror and gloved hand visible. Devices and skin contact remain visible in the step crops; aftercare retains the jar and brass spatula. Page A continues to display Teresa's unchanged real hero photograph and authentic portrait; its generated update is the share preview.

Selected photos were inspected for Teresa's likeness, client/room continuity, hands, device anatomy, connected tubing, skin texture and accidental text/logos. [ocr-review.json](ocr-review.json) records supplementary OCR: all 19 detections were visually resolved as normal image details such as hair, glove folds, bottles, mirror/window edges, linen and brass objects. No readable text or device logos appear in the generated photos. The client departure scene keeps ordinary texture and does not illustrate an improvement or efficacy comparison.

All 11 hashes in the original [protected manifest](../protected-assets-sha256.json) match: both real Teresa source photos, three real result JPEGs, both campaign posters, all campaign videos and unused infographic. Teresa's authentic portrait remains visible beside her Kombi quote. No optional infographic, result composite, merge or deployment was added.

## Review screenshots

`before-*` captures the earlier draft head `3440e3a`; `after-*` captures this final series. `compare-master-*` uses the existing screenshots from the earlier revision's master baseline `bbf39f7`, so the PR's comparisons show its actual base and final behavior. Comparison labels remain outside the page/photo pixels.

- [Kombi desktop, before/after master](screenshots/compare-master-aquafacial-microneedling-1440.png)
- [Kombi phone, before/after master](screenshots/compare-master-aquafacial-microneedling-390.png)
- [Kombi desktop hero crop](screenshots/compare-master-aquafacial-microneedling-1440-hero.png)
- [Kombi phone hero band](screenshots/compare-master-aquafacial-microneedling-390-hero.png)
- [Aquafacial desktop, before/after master](screenshots/compare-master-aquafacial-1440.png)
- [Aquafacial phone, before/after master](screenshots/compare-master-aquafacial-390.png)
- [Aquafacial share preview, before/after master](compare-master-share-preview.png)

Full-resolution page captures, isolated crops and comparisons against the previous draft remain in [screenshots/](screenshots/).
