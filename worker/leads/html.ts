// HTML building blocks of the lead cockpit: escaping, the page layout with its inline CSS, and the
// small status pages (401, 403, 404, 405, 503). Server-rendered, no JavaScript.
// Look: the Atelier Glow tokens of src/styles/main.css, re-declared with identical values because the
// Worker cannot link the site CSS; reference page: htmlErrorResponse in worker/routes/contact.ts.
import { LEAD_STATUS_LABELS, type LeadSource, type LeadStatus } from '../../shared/leads';
import type { AccessIdentity } from './access';

/** Same table as escapeHtml in worker/routes/contact.ts; null and undefined become ''. */
export function esc(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Markup that is already escaped. Only `html` and `raw` create it. */
export class SafeHtml {
  constructor(readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

/** Marks a constant markup string as safe. Never pass request or database values. */
export function raw(markup: string): SafeHtml {
  return new SafeHtml(markup);
}

export type HtmlValue = SafeHtml | string | number | null | undefined | false | readonly HtmlValue[];

function render(value: HtmlValue): string {
  if (value === null || value === undefined || value === false) return '';
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return esc(value);
}

/**
 * Template tag: every interpolated value goes through esc() unless it is SafeHtml (the output of
 * another `html` template). Arrays are joined; null, undefined and false render nothing.
 */
export function html(strings: TemplateStringsArray, ...values: HtmlValue[]): SafeHtml {
  let out = strings[0];
  values.forEach((value, index) => {
    out += render(value) + strings[index + 1];
  });
  return new SafeHtml(out);
}

export const SOURCE_LABELS: Readonly<Record<LeadSource, string>> = {
  'kontakt-page': 'Kontakt',
  'aquafacial-lp': 'Aquafacial',
  'aquafacial-microneedling-lp': 'Kombi',
  'carbon-microneedling-lp': 'Carbon',
  manual: 'Manuell',
};

export function sourceChip(source: string): SafeHtml {
  const label = SOURCE_LABELS[source as LeadSource] ?? source;
  return html`<span class="chip">${label}</span>`;
}

export function statusChip(status: LeadStatus): SafeHtml {
  return html`<span class="chip chip-status-${status}">${LEAD_STATUS_LABELS[status] ?? status}</span>`;
}

export function excludeChip(exclude: 'test' | 'spam' | null): SafeHtml {
  if (!exclude) return html``;
  return html`<span class="chip chip-muted">${exclude === 'test' ? 'Test' : 'Spam'}</span>`;
}

export const LOGOUT_PATH = '/cdn-cgi/access/logout';

// Mobile-first: base styles for small screens, one step at 720px. Token values = src/styles/main.css :root,
// plus --error (#9B2C1F, the /kontakt/ error colour). No italics anywhere (client rule).
const CSS = `
@font-face { font-family: 'Instrument Serif'; font-style: normal; font-weight: 400; font-display: swap; src: url('/fonts/instrument-serif-400.woff2') format('woff2'); }
@font-face { font-family: 'Instrument Sans Variable'; font-style: normal; font-weight: 100 900; font-display: swap; src: url('/fonts/instrument-sans-variable.woff2') format('woff2-variations'), url('/fonts/instrument-sans-variable.woff2') format('woff2'); }
:root {
  --cream: #FAF6F1; --paper: #FFFCF9; --shell: #F3EAE1; --blush: #EAD9CC;
  --clay: #8F5A2E; --clay-dark: #6F4421; --clay-light: #D7AE84;
  --cocoa: #2A1E18; --text: #4A3B33; --muted: #76655A; --on-dark: #E9DCCF; --error: #9B2C1F;
  --line: rgba(43, 31, 25, 0.10); --line-strong: rgba(43, 31, 25, 0.18);
  --f-sans: 'Instrument Sans Variable', 'Helvetica Neue', Arial, sans-serif;
  --f-serif: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  --fs-h3: clamp(1.3rem, 1.7vw, 1.6rem); --fs-small: 0.9375rem; --fs-label: 0.8125rem;
  --r-xs: 8px; --r-sm: 12px; --r: 20px; --r-pill: 999px;
}
*, *::before, *::after { box-sizing: border-box; }
html { font-synthesis-style: none; -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--cream); color: var(--text); font-family: var(--f-sans); font-size: 1rem; line-height: 1.6; }
/* max-width 720px as the reference page; the list page uses 960px for its rows (a cockpit choice, not a site convention). */
main { max-width: 720px; margin: 0 auto; padding: 24px 16px 64px; }
main.wide { max-width: 960px; }
a { color: var(--cocoa); }
a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--clay); outline-offset: 3px; }
.btn:focus-visible, .chip-link:focus-visible { border-radius: var(--r-pill); }
h1, h2, p, dl, dd, ol, ul { margin: 0; }
h1 { font-family: var(--f-serif); font-weight: 400; color: var(--cocoa); line-height: 1.08; font-size: clamp(1.9rem, 4.5vw, 2.5rem); overflow-wrap: anywhere; }
.page-401 h1 { font-size: clamp(2rem, 5vw, 3rem); }
h2 { font-family: var(--f-sans); font-weight: 600; color: var(--cocoa); font-size: var(--fs-h3); line-height: 1.22; margin-bottom: 16px; }
p { max-width: 60ch; }
.top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 16px; padding-bottom: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--line); }
.wordmark { font-family: var(--f-serif); font-size: 1.375rem; color: var(--cocoa); text-decoration: none; }
.who { font-size: var(--fs-small); color: var(--muted); }
.who a { color: var(--muted); }
.page-head { display: grid; gap: 12px; margin-bottom: 24px; }
.muted { color: var(--muted); font-size: var(--fs-small); }
.card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r); padding: 24px 20px; }
.card + .card { margin-top: 16px; }
.card > section + section { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--line); }
.section-muted h2, .section-muted p { color: var(--muted); }
.flash { background: var(--shell); color: var(--cocoa); border-radius: var(--r); padding: 16px 20px; margin-bottom: 24px; max-width: none; }
.form-error { background: rgba(155, 44, 31, 0.08); color: var(--error); border-radius: var(--r); padding: 20px 22px; margin-bottom: 16px; font-weight: 500; max-width: none; }
.btn { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 24px; border: 1px solid var(--clay); border-radius: var(--r-pill); background: var(--clay); color: #fff; font: inherit; font-weight: 600; text-decoration: none; cursor: pointer; }
.btn:hover { background: var(--clay-dark); border-color: var(--clay-dark); }
.btn-secondary { background: transparent; color: var(--cocoa); border-color: var(--line-strong); }
.btn-secondary:hover { background: var(--shell); border-color: var(--line-strong); }
.btn-small { padding: 0 18px; font-size: var(--fs-small); }
.actions { display: flex; flex-direction: column; gap: 12px; }
.actions .btn { width: 100%; }
.actions-inline { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.chip { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: var(--r-pill); background: var(--shell); color: var(--cocoa); font-size: var(--fs-label); font-weight: 500; line-height: 1.4; white-space: nowrap; }
/* Status tones. neu: clay-dark on blush (clay on blush is 4.2:1, below 4.5:1 for small text). */
.chip-status-neu { background: var(--blush); color: var(--clay-dark); }
.chip-status-gebucht, .chip-status-erschienen { background: var(--clay-light); color: var(--cocoa); }
.chip-status-no_show, .chip-status-abgesagt, .chip-status-nicht_erreicht, .chip-muted { background: transparent; color: var(--muted); box-shadow: inset 0 0 0 1px var(--line-strong); }
a.chip { text-decoration: underline; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.chip-link { display: inline-flex; align-items: center; min-height: 42px; padding: 0 14px; border-radius: var(--r-pill); background: var(--shell); color: var(--cocoa); font-size: var(--fs-label); font-weight: 500; text-decoration: none; }
.chip-link[aria-current="page"] { background: var(--cocoa); color: var(--on-dark); }
.field { display: flex; flex-direction: column; gap: 8px; min-width: 0; margin: 0 0 16px; padding: 0; border: 0; }
.field label, .field legend { padding: 0; font-size: 0.9rem; font-weight: 500; line-height: 1.4; color: var(--cocoa); }
.field legend { margin-bottom: 8px; }
.field input:not([type="radio"]):not([type="checkbox"]), .field select, .field textarea { width: 100%; min-height: 54px; margin: 0; padding: 14px 18px; border: 1px solid var(--line-strong); border-radius: var(--r-sm); background: var(--cream); color: var(--cocoa); font: inherit; font-size: 1rem; line-height: 1.5; }
.field textarea { min-height: 120px; resize: vertical; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--clay); background: #fff; box-shadow: 0 0 0 4px rgba(143, 90, 46, 0.12); }
.field input:focus-visible, .field textarea:focus-visible { outline: none; }
.field [aria-invalid="true"] { border-color: var(--error); background: #fff; }
.hint { font-size: var(--fs-small); color: var(--muted); }
.field-row { display: grid; gap: 0 16px; }
.options { display: flex; flex-wrap: wrap; gap: 8px; }
.options label { position: relative; cursor: pointer; }
.options input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.options span { display: inline-flex; align-items: center; min-height: 42px; padding: 10px 18px; border: 1px solid var(--line-strong); border-radius: var(--r-pill); background: var(--cream); color: var(--cocoa); font-size: 0.92rem; font-weight: 500; line-height: 1.3; }
.options input:checked + span { background: var(--cocoa); border-color: var(--cocoa); color: var(--cream); }
.options input:focus-visible + span { outline: 2px solid var(--clay); outline-offset: 3px; }
.options[aria-invalid="true"] span { border-color: var(--error); }
.check { display: flex; gap: 12px; align-items: center; margin: 0 0 16px; color: var(--cocoa); font-size: 0.9rem; font-weight: 500; }
.check input { width: 22px; height: 22px; margin: 0; accent-color: var(--clay); }
.search { display: grid; gap: 8px; margin-bottom: 24px; }
.search label { font-size: 0.9rem; font-weight: 500; color: var(--cocoa); }
.search-row { display: flex; gap: 8px; }
.search-row input { flex: 1; min-width: 0; min-height: 54px; padding: 14px 18px; border: 1px solid var(--line-strong); border-radius: var(--r-sm); background: var(--cream); color: var(--cocoa); font: inherit; font-size: 1rem; }
.search-row input:focus { border-color: var(--clay); background: #fff; box-shadow: 0 0 0 4px rgba(143, 90, 46, 0.12); outline: none; }
.kpis { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-bottom: 24px; border-top: 1px solid var(--line); }
.kpis div { padding: 12px 0; border-bottom: 1px solid var(--line); }
/* Mobile: five cells in two columns; the fifth (Termin-Quote) spans the row so its hairline runs full width. */
.kpis div:nth-child(5) { grid-column: 1 / -1; }
.kpis dt { font-size: var(--fs-label); color: var(--muted); }
.kpis dd { font-family: var(--f-serif); font-size: 2rem; line-height: 1.1; color: var(--cocoa); }
.rows { list-style: none; padding: 0; border-bottom: 1px solid var(--line); }
.rows > li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px 16px; padding: 14px 0; border-top: 1px solid var(--line); }
.row-main { display: grid; gap: 4px; min-width: 0; }
.row-name { font-family: var(--f-serif); font-size: 1.25rem; line-height: 1.2; color: var(--cocoa); overflow-wrap: anywhere; }
.row-meta { font-size: var(--fs-small); color: var(--muted); }
.row-side { display: flex; flex-wrap: wrap; justify-content: flex-end; align-content: start; gap: 8px; }
.row-actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 8px; }
.filter-note { margin-bottom: 16px; }
.empty { padding: 24px 0; color: var(--muted); border-top: 1px solid var(--line); }
.pager { display: flex; justify-content: space-between; gap: 12px; margin-top: 24px; }
.data { border-top: 1px solid var(--line); }
.data div { display: grid; gap: 2px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.data dt { font-size: var(--fs-label); color: var(--muted); }
.data dd { color: var(--cocoa); overflow-wrap: anywhere; }
.data dd.pre { white-space: pre-wrap; }
.timeline { list-style: none; padding: 0; border-top: 1px solid var(--line); }
.timeline li { display: grid; gap: 2px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.timeline .when { font-size: var(--fs-small); color: var(--muted); }
.timeline .what { color: var(--cocoa); }
.timeline .note { white-space: pre-wrap; overflow-wrap: anywhere; }
.contact { margin-bottom: 24px; }
.contact-state { margin-top: 12px; }
.actions form { margin: 0; }
.note-line { margin-bottom: 16px; }
.req { color: var(--clay); }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (min-width: 720px) {
  main { padding: 40px 24px 80px; }
  .card { padding: 32px; }
  .kpis { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .kpis div { padding: 12px 16px 12px 0; }
  .kpis div:nth-child(5) { grid-column: auto; }
  .actions { flex-direction: row; flex-wrap: wrap; }
  .actions .btn { width: auto; }
  .field-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .data div { grid-template-columns: 200px minmax(0, 1fr); gap: 16px; }
  .rows > li { grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; }
  .row-actions { grid-column: auto; }
}
`;

export type LayoutOptions = {
  /** Page name; the document title becomes "{title} · Lead-Cockpit · Beauty Face Lift". */
  title: string;
  h1: string;
  body: SafeHtml;
  identity: AccessIdentity | null;
  flash?: string | null;
  /** Extra header content under the h1 (chips, dates). */
  headExtra?: SafeHtml;
  wide?: boolean;
  pageClass?: string;
};

export function layout({ title, h1, body, identity, flash, headExtra, wide, pageClass }: LayoutOptions): string {
  const who = identity
    ? identity.dev
      ? html`<p class="who">Angemeldet als ${identity.email} · Entwicklungsmodus</p>`
      : html`<p class="who">Angemeldet als ${identity.email} · <a href="${LOGOUT_PATH}">Abmelden</a></p>`
    : html``;
  const page = html`<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${title} · Lead-Cockpit · Beauty Face Lift</title>
<style>${raw(CSS)}</style>
</head>
<body class="${pageClass ?? ''}">
<main class="${wide ? 'wide' : ''}">
<header class="top">
<a class="wordmark" href="/admin/leads/">Beauty Face Lift</a>
${who}
</header>
<div class="page-head">
<h1>${h1}</h1>
${headExtra ?? html``}
</div>
${flash ? html`<p class="flash" role="status">${flash}</p>` : html``}
${body}
</main>
</body>
</html>`;
  return page.value;
}

export function htmlResponse(markup: string, status: number): Response {
  return new Response(markup, {
    status,
    headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-store' },
  });
}

export function pageResponse(options: LayoutOptions, status = 200): Response {
  return htmlResponse(layout(options), status);
}

type MessageAction = { href: string; label: string; secondary?: boolean };

/** A small card page: h1, one sentence, buttons. Used for the 401/403/404/405/503 answers. */
export function messagePage(
  { title, h1, message, actions, identity, status, pageClass }:
  { title: string; h1: string; message: string; actions: MessageAction[]; identity: AccessIdentity | null; status: number; pageClass?: string },
): Response {
  const buttons = actions.map((action) => html`<a class="btn${action.secondary ? ' btn-secondary' : ''}" href="${action.href}">${action.label}</a>`);
  const body = html`<div class="card"><p>${message}</p><div class="actions-inline">${buttons}</div></div>`;
  return pageResponse({ title, h1, body, identity, pageClass }, status);
}

/** 401: the answer to every /admin/* request without a valid Access identity. No redirect, no JS. */
export function unauthorizedPage(): Response {
  return messagePage({
    title: 'Nicht angemeldet',
    h1: 'Nicht angemeldet.',
    message: 'Bitte melden Sie sich mit der freigegebenen E-Mail-Adresse an.',
    actions: [
      { href: '/admin/leads/', label: 'Erneut anmelden' },
      { href: LOGOUT_PATH, label: 'Abmelden', secondary: true },
    ],
    identity: null,
    status: 401,
    pageClass: 'page-401',
  });
}

const LIST_ACTION: MessageAction = { href: '/admin/leads/', label: 'Alle Anfragen' };

export function notFoundPage(identity: AccessIdentity | null): Response {
  return messagePage({ title: 'Nicht gefunden', h1: 'Nicht gefunden.', message: 'Diese Seite oder Anfrage gibt es nicht.', actions: [LIST_ACTION], identity, status: 404 });
}

export function methodNotAllowedPage(identity: AccessIdentity | null, allow: string): Response {
  const response = messagePage({ title: 'Nicht möglich', h1: 'Nicht möglich.', message: 'Diese Aktion ist hier nicht möglich.', actions: [LIST_ACTION], identity, status: 405 });
  response.headers.set('Allow', allow);
  return response;
}

export function serverErrorPage(identity: AccessIdentity | null): Response {
  return messagePage({
    title: 'Fehler',
    h1: 'Etwas ist schiefgelaufen.',
    message: 'Bitte laden Sie die Seite neu und versuchen Sie es noch einmal.',
    actions: [LIST_ACTION],
    identity,
    status: 500,
  });
}

export function databaseMissingPage(identity: AccessIdentity | null): Response {
  return messagePage({ title: 'Datenbank nicht verbunden', h1: 'Datenbank nicht verbunden.', message: 'Die Anfragen können gerade nicht geladen werden.', actions: [LIST_ACTION], identity, status: 503 });
}

export function configMissingPage(identity: AccessIdentity | null, leadPath: string): Response {
  return messagePage({
    title: 'Konfiguration unvollständig',
    h1: 'Konfiguration unvollständig.',
    message: 'Das Lead-Cockpit ist noch nicht fertig eingerichtet. Die Änderung wurde nicht gespeichert.',
    actions: [{ href: leadPath, label: 'Zurück zur Anfrage' }],
    identity,
    status: 503,
  });
}

export function invalidRequestPage(identity: AccessIdentity | null, leadPath: string): Response {
  return messagePage({
    title: 'Ungültige Anfrage',
    h1: 'Ungültige Anfrage.',
    message: 'Die Änderung wurde nicht gespeichert. Bitte öffnen Sie die Anfrage neu und versuchen Sie es noch einmal.',
    actions: [{ href: leadPath, label: 'Zurück zur Anfrage' }],
    identity,
    status: 403,
  });
}
