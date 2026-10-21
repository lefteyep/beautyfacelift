# Weiterarbeit mit OpenAI Codex — Einrichtung und Start-Prompt

Diese Seite ist für den Wechsel von Claude Code zu OpenAI Codex (ChatGPT) gedacht. Sie beschreibt, was Codex sehen muss, wie das Repository angebunden wird, und enthält den Prompt, mit dem die erste Codex-Aufgabe startet.

## Was Codex automatisch sieht

- **`AGENTS.md`** im Repo-Root: Codex liest diese Datei bei jedem Start. Sie enthält die Sicherheitsregeln, die Befehle, die Release-Gates, die Design- und Textregeln und die Stolperfallen (früher stand das in der nicht eingecheckten `CLAUDE.md`).
- **`docs/current/HANDOVER-2026-10-21.md`**: Projekt, Systeme und IDs, Stand, nächste Schritte.
- **`docs/current/STATUS.md`**, **`docs/current/TODO.md`**: Release-Stand und offene Arbeit.
- **`docs/current/REPAIR-2026-10-21.md`**: Reparaturen R1–R11, offene Prüfung und die Voraussetzungen vor einem D1-Rollout.
- **`docs/current/LEAD-COCKPIT-PLAN.md`**: aktueller Umfang nach dem Review; der ursprüngliche Plan vom 20. Oktober liegt im Archiv. Die PRs #55–#57 sind noch nicht gemerged oder freigegeben.

Was Codex **nicht** hat: die Chat-Historie, die Claude-Memory, Zugriff auf Dashboards (Cloudflare, Meta, Resend, Treatwell, Search Console) und die Browser-Sessions. Alles, was dort nötig ist, schreibt Codex als Schritt-für-Schritt-Anleitung, und du führst es aus.

## Anbindung

**Variante A — Codex in ChatGPT (Cloud):**
1. ChatGPT → Codex → GitHub verbinden → Repository `lefteyep/beautyfacelift` freigeben.
2. Umgebung anlegen: Node 22 (für die Cockpit-Harnesses mindestens 22.13), Setup-Befehl `npm ci`, Internetzugang für `npm` erlauben. Keine Secrets eintragen; für den Build sind die `PUBLIC_*`-Variablen optional (ohne sie baut die Seite ohne Pixel/GTM, die Gates laufen trotzdem).
3. Jede Aufgabe als eigener Task; Codex öffnet einen Branch und einen Pull Request. **Mergen tust du** (ein Merge auf `master` deployt live).

**Variante B — Codex CLI lokal:** im Ordner `astro-v2` starten (`codex`), es liest `AGENTS.md`. Für parallele Aufgaben Worktrees unter `../astro-v2-worktrees/` anlegen, wie in `AGENTS.md` beschrieben.

## Start-Prompt (zum Einfügen in die erste Codex-Nachricht)

```text
You are taking over the Beauty Face Lift website and marketing project from a previous agent. Before doing anything, read in this order: AGENTS.md (repo root), docs/current/HANDOVER-2026-10-21.md, docs/current/STATUS.md, docs/current/TODO.md, docs/current/LEAD-COCKPIT-PLAN.md. Also read docs/current/REPAIR-2026-10-21.md. First establish the live revision, worktree ownership and current repair status. Continue routine work already authorized in the conversation; do not infer release or feature approval from an old plan. Authentication choice/setup and Phase 2 remain deferred. Report blockers and verification honestly.

Working agreement:
- Work on a codex/<task> branch from origin/master; one pull request per batch; never push to or merge into master yourself — a push to master deploys to production. I merge after reviewing.
- Before opening a PR run every gate listed in AGENTS.md ("Commands" and "Release workflow"); report their results verbatim, including failures.
- Never submit the live contact or lead forms and never POST to the live /api/contact or /api/track; prove behaviour with the harness scripts under scripts/harness and the QA scripts.
- Client and agency rules in HANDOVER section 2 are non-negotiable (no "Hydrafacial", Swiss "ss", no Google sign-in or Google services, no Vercel, no invented prices or claims, Teresa learns nothing about the lead cockpit until go-live).
- Anything that needs a dashboard (Cloudflare, Meta, Resend, Treatwell, Search Console, GA4) you cannot do: write me the exact steps and what values to bring back.
- When you finish a task, hand over like this: what is finished (with PR link), what remains, decisions you took, any failed check.

Current milestone:
- Review repairs R1–R11 are in progress. Work only on the authorized repair scope, verify the combined result, and keep its checklist pending until the results are recorded.
- Move disclosure, retention/deletion procedure, D1 failure alerting and lead reconciliation ahead of first D1 persistence. Owner email can succeed while D1 storage fails. Policy decisions and retention implementation need a separate scoped task.
- The next scope review is the smallest useful enquiry capture/list/contact/status/manual-outcome workflow. Do not add new automation or choose/activate a login provider.
- Keep customer mail off, reminders agency-only and Teresa unexposed. The campaign remains paused and still waits for Phase 1. Preserve standard Lead optimisation, report-only custom conversion, old-site redirect and Treatwell/date gates.

```

## Kurz-Prompt für spätere Aufgaben

```text
Continue the Beauty Face Lift project. Read AGENTS.md and docs/current/HANDOVER-2026-10-21.md first (STATUS.md and TODO.md for the current state). Task: <...>. Same working agreement as always: codex/ branch, all gates, PR, no merge, no live form posts, dashboard steps written for me.
```

## Was du selbst mitbringen solltest

- GitHub-Zugriff für Codex auf `lefteyep/beautyfacelift`.
- Offene Entscheidungen nach dem Reparatur- und Workflow-Review: Login-Anbieter, Datenaufbewahrung/Löschverfahren und Rollout. Noch ist weder Cloudflare Access noch ein eigener E-Mail-Code-Login ausgewählt. Kein Zero-Trust-Checkout und keine Phase-2-Entwicklung in dieser Reparatur.
- Externe Kampagnenvoraussetzungen: Treatwell-Service CHF 170, alte Website abschalten/301 weiterleiten (E-Mail erhalten), neues Start-/Enddatum passend zu Seite und Anzeigen. Die bisherige Cockpit-vor-Kampagne-Regel bleibt bestehen.
- Zugang zu den Dashboards für separat freigegebene Schritte. Öffentliche IDs oder Konfigurationswerte können zurückgemeldet werden; Secret-Werte werden weder in den Chat noch ins Repository kopiert. Geheime Schlüssel werden erst bei einem freigegebenen Setup sicher im Dashboard/Secret-Store gesetzt.
