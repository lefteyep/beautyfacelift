# Teresa presence revision

Consent-confirmed identity edits for four existing image slots, plus Teresa's authentic original portrait rendered beside her quote on the Kombi landing page. Both original Teresa photographs remain unchanged. The close-up steps, candid client photograph, result composites and campaign assets are retained.

- [Exact selected prompts](PROMPTS.md)
- [All 14 candidates, reference inputs and full prompts](generation-log.json)
- [Selected exports, dimensions, byte counts and hashes](exports.json)
- [Before/after page screenshots and browser reports](screenshots/)

`series-reference.png` is an unchanged copy of the selected hero, `slot-06-candidate-01.png`. It supplies scene and identity continuity to later edits, together with the two real identity references. The images remain generated appointment illustrations; the authentic portrait provides a direct real photograph of Teresa.

Reproduce the four pinned replacements with `node design/images/lp-shoot-2026-10/teresa-revision/export.mjs` from the repository root after `npm ci`. The three WebPs use quality 82 with embedded sRGB; the public share preview keeps genuine PNG encoding at its pinned `.png` URL. Protected file hashes are recorded in [the original manifest](../protected-assets-sha256.json).
