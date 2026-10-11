# October 2026 landing-page image series

Generated appointment illustrations for the two Aquafacial ad landing pages. The client is fictional; the practitioner remains unidentifiable. Teresa's real photos, result composites and campaign videos/posters are unchanged.

The user authorized the built-in image generator. Its backend model identifier and resolution controls are not exposed, so no specific model version is claimed. Every request asked for the largest supported output; all 26 native PNG candidates are retained without modification. `series-reference.png` duplicates the selected hero, `slot-06-candidate-03.png`.

- [Final prompts and responsive review](../../../docs/current/LP-IMAGE-PROMPTS.md)
- [Every candidate's exact prompt and reference files](generation-log.json)
- [Selected candidates, native dimensions, exported sizes and hashes](exports.json)
- [Protected source-file hashes](protected-assets-sha256.json)
- [Before/after screenshots and browser reports](screenshots/)

Run `node design/images/lp-shoot-2026-10/export.mjs` from the repo root after `npm ci` to reproduce the eight pinned replacement assets. WebP exports use quality 82 with embedded sRGB profiles; the public share image retains native PNG encoding at its `.png` URL. No skin retouching, smoothing or result comparison was applied.
