# Live checks (Playwright, read-only against production)

These scripts open real pages on `https://beautyfacelift-zuerich.ch` in a headless Chromium and **abort every measurement request** they are not meant to test (Google/GTM/GA4, Meta, `/api/*`), so a run counts nothing in GA4 or Meta unless the script says otherwise. They were used for the October 2026 tracking work and are retained as dated tooling. Inspect current behavior and approvals before running any script; they are not all current release checks.

| Script | What it proves | Sends anything? |
|---|---|---|
| `repair-browser-check.py [worktree] --chromium /path/to/chromium` | Current local desktop/mobile rendering, menu focus/Escape, consent, repeat-click cookies, and JSON/inline form acceptance/rejection. Writes screenshots and results to `.tmp-qa/browser-repairs/` or `--output`. | Local build only; all external requests are blocked, and contact/tracking requests are intercepted. |
| `combo-lead-test.mjs <baseUrl>` | **Historical/outdated:** assumes a 303 navigation/thank-you flow. The current combo form posts JSON and shows inline success after 201 or inline error after rejection (e.g. 400). Do not treat this script as current browser evidence; update it in a scoped test task before reuse. | Intended local/stubbed only; do not point it at production. |
| `capi-live-test.mjs [--submit]` | On the live combo page with ad parameters and Meta's `test_event_code`: browser + server events, and with `--submit` **one labelled test enquiry** ("TEST Agentur bitte ignorieren"). | Without `--submit`: Meta browser/server events marked as test. With `--submit`: a real enquiry e-mail to the studio — only with the user's OK. |

The current Python repair check requires Python 3.10+, the Python `playwright` package and a local Chromium (or a Playwright-installed browser when `--chromium` is omitted). Run `npm run build` first, then `python scripts/live-tests/repair-browser-check.py --chromium /path/to/chromium`. It exits unsuccessfully on a failed check; no production URL argument is accepted.

Historical JavaScript requirements: `npm i -D playwright-core@1.58.2` (not a repo dependency) and a matching Chromium. Those scripts expect `%LOCALAPPDATA%\ms-playwright\chromium-1228\chrome-win64\chrome.exe`. Inspect them before reuse.

Related Worker harnesses (no browser, no network; `npx tsx scripts/harness/<file> <repo path>`): `capi-harness.mts` (`/api/track` accepts ad-visit event data, rejects unknown keys and raw PII), `cr3-harness.mts` (enquiry e-mail subject and rows per form), `oldsite-harness.mts` (old-site 301 map), `worker-local-server.mts` (serves the real Worker on localhost with all outbound fetches blocked, for `scripts/security-smoke.mjs --base-url http://localhost:4351`).

The current repair check exercises the actual JSON/inline flow with `/api/contact` stubbed. It does not prove production account configuration or real inbox/analytics delivery. Record the tested revision and results in the repair PR. The pre-repair README is preserved in the documentation archive.
