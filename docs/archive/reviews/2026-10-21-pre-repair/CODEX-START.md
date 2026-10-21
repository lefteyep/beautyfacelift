# Weiterarbeit mit OpenAI Codex — Einrichtung und Start-Prompt

Diese Seite ist für den Wechsel von Claude Code zu OpenAI Codex (ChatGPT) gedacht. Sie beschreibt, was Codex sehen muss, wie das Repository angebunden wird, und enthält den Prompt, mit dem die erste Codex-Aufgabe startet.

## Was Codex automatisch sieht

- **`AGENTS.md`** im Repo-Root: Codex liest diese Datei bei jedem Start. Sie enthält die Sicherheitsregeln, die Befehle, die Release-Gates, die Design- und Textregeln und die Stolperfallen (früher stand das in der nicht eingecheckten `CLAUDE.md`).
- **`docs/current/HANDOVER-2026-10-21.md`**: Projekt, Systeme und IDs, Stand, nächste Schritte.
- **`docs/current/STATUS.md`**, **`docs/current/TODO.md`**: Release-Stand und offene Arbeit.
- **`docs/current/LEAD-COCKPIT-PLAN.md`**: der genehmigte Plan für das Lead-Cockpit (Phase 1 ist in den PRs #55–#57 umgesetzt, noch nicht gemerged).

Was Codex **nicht** hat: die Chat-Historie, die Claude-Memory, Zugriff auf Dashboards (Cloudflare, Meta, Resend, Treatwell, Search Console) und die Browser-Sessions. Alles, was dort nötig ist, schreibt Codex als Schritt-für-Schritt-Anleitung, und du führst es aus.

## Anbindung

**Variante A — Codex in ChatGPT (Cloud):**
1. ChatGPT → Codex → GitHub verbinden → Repository `lefteyep/beautyfacelift` freigeben.
2. Umgebung anlegen: Node 22, Setup-Befehl `npm ci`, Internetzugang für `npm` erlauben. Keine Secrets eintragen; für den Build sind die `PUBLIC_*`-Variablen optional (ohne sie baut die Seite ohne Pixel/GTM, die Gates laufen trotzdem).
3. Jede Aufgabe als eigener Task; Codex öffnet einen Branch und einen Pull Request. **Mergen tust du** (ein Merge auf `master` deployt live).

**Variante B — Codex CLI lokal:** im Ordner `astro-v2` starten (`codex`), es liest `AGENTS.md`. Für parallele Aufgaben Worktrees unter `../astro-v2-worktrees/` anlegen, wie in `AGENTS.md` beschrieben.

## Start-Prompt (zum Einfügen in die erste Codex-Nachricht)

```text
You are taking over the Beauty Face Lift website and marketing project from a previous agent. Before doing anything, read in this order: AGENTS.md (repo root), docs/current/HANDOVER-2026-10-21.md, docs/current/STATUS.md, docs/current/TODO.md, docs/current/LEAD-COCKPIT-PLAN.md. Then summarise in ten lines what the project is, what is live, what is open, and which rules you will follow — and wait for my go before changing anything.

Working agreement:
- Work on a codex/<task> branch from origin/master; one pull request per batch; never push to or merge into master yourself — a push to master deploys to production. I merge after reviewing.
- Before opening a PR run every gate listed in AGENTS.md ("Commands" and "Release workflow"); report their results verbatim, including failures.
- Never submit the live contact or lead forms and never POST to the live /api/contact or /api/track; prove behaviour with the harness scripts under scripts/harness and the QA scripts.
- Client and agency rules in HANDOVER section 2 are non-negotiable (no "Hydrafacial", Swiss "ss", no Google sign-in or Google services, no Vercel, no invented prices or claims, Teresa learns nothing about the lead cockpit until go-live).
- Anything that needs a dashboard (Cloudflare, Meta, Resend, Treatwell, Search Console, GA4) you cannot do: write me the exact steps and what values to bring back.
- When you finish a task, hand over like this: what is finished (with PR link), what remains, decisions you took, any failed check.

First task candidates (I will pick one):
1. Lead-Cockpit Phase 1 release: review PRs #55, #56, #57 against docs/current/LEAD-COCKPIT-PLAN.md, list exactly what I must do in the dashboards before each merge, and prepare the go-live PR described in the plan.
2. Replace Cloudflare Access with an in-Worker magic-link login (e-mail code via Resend, signed cookie) if I decide against activating Zero Trust — keep the rest of PR #56 unchanged.
3. Lead-Cockpit Phase 2, PR D (Treatwell inbound mail capture) per the plan.
```

## Kurz-Prompt für spätere Aufgaben

```text
Continue the Beauty Face Lift project. Read AGENTS.md and docs/current/HANDOVER-2026-10-21.md first (STATUS.md and TODO.md for the current state). Task: <...>. Same working agreement as always: codex/ branch, all gates, PR, no merge, no live form posts, dashboard steps written for me.
```

## Was du selbst mitbringen solltest

- GitHub-Zugriff für Codex auf `lefteyep/beautyfacelift`.
- Die Entscheidungen, die nur du treffen kannst (siehe HANDOVER §4/§5): Zero Trust aktivieren oder Magic-Link-Login; Angebots-Enddatum 14. November halten oder verschieben; Treatwell-Service CHF 170 anlegen; alte Website abschalten.
- Zugang zu den Dashboards, wenn Codex Schritte dafür liefert. Werte, die Codex braucht, sind nie Secrets: z. B. die Access-AUD, die D1-ID (steht schon in den Docs), Laufzeiten oder IDs aus Meta/GA4.
