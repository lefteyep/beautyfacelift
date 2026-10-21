// Every /admin/* request: Access guard first, then the lead cockpit under /admin/leads/ or the legacy
// static /admin/ pages (served from the assets, now behind the same guard).
//
//   GET  /admin/leads/                  list (?status, ?q, ?campaign, ?page)
//   GET/POST /admin/leads/new/          manual enquiry / owner-email recovery (no external calls)
//   GET  /admin/leads/:id/              detail + timeline (?ok= flash)
//   POST /admin/leads/:id/contacted/    "Jetzt kontaktiert"
//   POST /admin/leads/:id/status/       status (+ note; required for no_show, abgesagt, nicht_erreicht)
//   POST /admin/leads/:id/appointment/  date + time (Zurich) → appointment_at; optional set_status=gebucht
//   POST /admin/leads/:id/revenue/      revenue_chf, follow_up_booked
//   POST /admin/leads/:id/notes/        notes
//   POST /admin/leads/:id/exclude/      test | spam | none
//
// Every POST handler calls verifyCsrf itself, then validates, writes through db.ts and answers 303.
import type { Env } from '../env';
import { isLeadStatus, LEAD_STATUS_LABELS, type LeadStatus } from '../../shared/leads';
import { verifyAccess, type AccessIdentity } from './access';
import { csrfToken, verifyCsrf, type CsrfResult } from './csrf';
import { getLead, listEvents, listLeads, markContacted, updateLead, type LeadPatch, type LeadRow } from './db';
import {
  configMissingPage,
  databaseMissingPage,
  htmlResponse,
  invalidRequestPage,
  methodNotAllowedPage,
  notFoundPage,
  serverErrorPage,
  unauthorizedPage,
} from './html';
import { zurichToUtc } from './time';
import { createManualLead, MANUAL_FIELDS, validateManual, type ManualValues } from './manual';
import { renderDetail, STATUSES_NEEDING_NOTE, type DetailError, type DetailForm } from './views/detail';
import { LIST_FILTERS, renderList, statusesFor, type ListFilter, type ListQuery } from './views/list';
import { renderManual } from './views/manual';

const LEADS_PREFIX = '/admin/leads/';
const PAGE_SIZE = 50;
const LEAD_PATH_PATTERN = /^([A-Za-z0-9_-]{1,80})\/(?:(contacted|status|appointment|revenue|notes|exclude)\/)?$/;
const NOTE_MAX = 1000;
const NOTES_MAX = 4000;
const REVENUE_MAX = 100000;

/** `?ok=` keys after a successful POST and their flash text. */
const FLASH_TEXT: Record<string, string> = {
  kontaktiert: 'Als kontaktiert gespeichert.',
  status: 'Status gespeichert.',
  termin: 'Termin gespeichert.',
  umsatz: 'Umsatz gespeichert.',
  notiz: 'Notizen gespeichert.',
  ausschluss: 'Ausschluss gespeichert.',
  erfasst: 'Anfrage manuell erfasst. Es wurde keine E-Mail versendet.',
  vorhanden: 'Diese Anfrage-ID ist bereits vorhanden. Der bestehende Eintrag wurde geöffnet und nicht verändert.',
};

type StaticAssetFetcher = (request: Request, env: Env) => Promise<Response>;

type ActionContext = {
  request: Request;
  env: Env;
  db: D1Database;
  identity: AccessIdentity;
  id: string;
  now: Date;
};

const leadPath = (id: string) => `${LEADS_PREFIX}${encodeURIComponent(id)}/`;

function redirectOk(id: string, key: keyof typeof FLASH_TEXT): Response {
  return new Response(null, { status: 303, headers: { Location: `${leadPath(id)}?ok=${key}` } });
}

async function readForm(request: Request): Promise<FormData> {
  try {
    return await request.formData();
  } catch {
    return new FormData(); // no form body: fails the CSRF check like any forged post
  }
}

const field = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === 'string' ? value : '';
};

/** 403 for a failed check, 503 when LEADS_SIGNING_SECRET is missing, null when the POST may proceed. */
function csrfDenied(result: CsrfResult, context: ActionContext): Response | null {
  if (result === 'ok') return null;
  if (result === 'unconfigured') return configMissingPage(context.identity, leadPath(context.id));
  return invalidRequestPage(context.identity, leadPath(context.id));
}

async function detailToken(env: Env, identity: AccessIdentity): Promise<string | null> {
  return env.LEADS_SIGNING_SECRET ? csrfToken(env.LEADS_SIGNING_SECRET, identity) : null;
}

async function detailResponse(context: ActionContext, lead: LeadRow, { flash = null, error = null, status = 200 }: { flash?: string | null; error?: DetailError | null; status?: number } = {}): Promise<Response> {
  const events = await listEvents(context.db, lead.id);
  const csrf = await detailToken(context.env, context.identity);
  return htmlResponse(renderDetail({ identity: context.identity, lead, events, csrf, flash, error }), status);
}

/** Invalid input: the detail page again with status 400 and the message at the form. */
function invalidInput(context: ActionContext, lead: LeadRow, form: DetailForm, message: string, values: Record<string, string>): Promise<Response> {
  return detailResponse(context, lead, { error: { form, message, values }, status: 400 });
}

// ---- POST actions -------------------------------------------------------------------------------

async function postContacted(context: ActionContext): Promise<Response> {
  const form = await readForm(context.request);
  const denied = csrfDenied(await verifyCsrf(context.request, context.env, context.identity, form), context);
  if (denied) return denied;
  const lead = await getLead(context.db, context.id);
  if (!lead) return notFoundPage(context.identity);

  const at = context.now.toISOString();
  const becomesContacted = lead.status === 'neu';
  await markContacted(context.db, lead.id, at, {
    at,
    type: 'contacted',
    actor: context.identity.actor,
    from_status: becomesContacted ? 'neu' : null,
    to_status: becomesContacted ? 'kontaktiert' : null,
    meta: JSON.stringify({ attempt: lead.contact_attempts + 1 }),
  });
  return redirectOk(lead.id, 'kontaktiert');
}

async function postStatus(context: ActionContext): Promise<Response> {
  const form = await readForm(context.request);
  const denied = csrfDenied(await verifyCsrf(context.request, context.env, context.identity, form), context);
  if (denied) return denied;
  const lead = await getLead(context.db, context.id);
  if (!lead) return notFoundPage(context.identity);

  const status = field(form, 'status');
  const note = field(form, 'note').replace(/\r\n/g, '\n').trim();
  const values = { status, note };
  if (!isLeadStatus(status)) return invalidInput(context, lead, 'status', 'Bitte wählen Sie einen Status.', values);
  if (note.length > NOTE_MAX) return invalidInput(context, lead, 'status', `Bitte kürzen Sie die Notiz auf höchstens ${NOTE_MAX} Zeichen.`, values);
  if (STATUSES_NEEDING_NOTE.includes(status) && !note) {
    return invalidInput(context, lead, 'status', `Bitte begründen Sie den Status «${LEAD_STATUS_LABELS[status]}» kurz in der Notiz.`, values);
  }

  const at = context.now.toISOString();
  const patch: LeadPatch = status === lead.status ? {} : { status, status_changed_at: at };
  await updateLead(context.db, lead.id, patch, at, {
    at,
    type: 'status',
    actor: context.identity.actor,
    from_status: lead.status,
    to_status: status,
    note: note || null,
  });
  return redirectOk(lead.id, 'status');
}

async function postAppointment(context: ActionContext): Promise<Response> {
  const form = await readForm(context.request);
  const denied = csrfDenied(await verifyCsrf(context.request, context.env, context.identity, form), context);
  if (denied) return denied;
  const lead = await getLead(context.db, context.id);
  if (!lead) return notFoundPage(context.identity);

  const date = field(form, 'date').trim();
  const time = field(form, 'time').trim();
  const setStatus = field(form, 'set_status');
  const values = { date, time, set_status: setStatus };
  if (!date || !time) return invalidInput(context, lead, 'appointment', 'Bitte geben Sie Datum und Uhrzeit ein.', values);
  const appointmentAt = zurichToUtc(date, time);
  if (!appointmentAt) return invalidInput(context, lead, 'appointment', 'Bitte prüfen Sie Datum und Uhrzeit.', values);

  const at = context.now.toISOString();
  const nextStatus: LeadStatus = setStatus === 'gebucht' ? 'gebucht' : lead.status;
  const statusChanges = nextStatus !== lead.status;
  const patch: LeadPatch = { appointment_at: appointmentAt, ...(statusChanges ? { status: nextStatus, status_changed_at: at } : {}) };
  await updateLead(context.db, lead.id, patch, at, {
    at,
    type: 'appointment',
    actor: context.identity.actor,
    from_status: statusChanges ? lead.status : null,
    to_status: statusChanges ? nextStatus : null,
    meta: JSON.stringify({ appointment_at: appointmentAt }),
  });
  return redirectOk(lead.id, 'termin');
}

const FOLLOW_UP_VALUES: Record<string, 1 | 0 | null> = { ja: 1, nein: 0, unbekannt: null };

async function postRevenue(context: ActionContext): Promise<Response> {
  const form = await readForm(context.request);
  const denied = csrfDenied(await verifyCsrf(context.request, context.env, context.identity, form), context);
  if (denied) return denied;
  const lead = await getLead(context.db, context.id);
  if (!lead) return notFoundPage(context.identity);

  const revenueText = field(form, 'revenue_chf').trim();
  const followUp = field(form, 'follow_up_booked');
  const values = { revenue_chf: revenueText, follow_up_booked: followUp };
  let revenue: number | null = null;
  if (revenueText !== '') {
    revenue = /^\d{1,6}$/.test(revenueText) ? Number(revenueText) : Number.NaN;
    if (!(revenue >= 0 && revenue <= REVENUE_MAX)) {
      return invalidInput(context, lead, 'revenue', "Bitte geben Sie den Umsatz in ganzen Franken zwischen 0 und 100'000 ein.", values);
    }
  }
  if (!Object.hasOwn(FOLLOW_UP_VALUES, followUp)) return invalidInput(context, lead, 'revenue', 'Bitte wählen Sie, ob ein Folgetermin gebucht ist.', values);

  const at = context.now.toISOString();
  await updateLead(context.db, lead.id, { revenue_first_visit_chf: revenue, follow_up_booked: FOLLOW_UP_VALUES[followUp] }, at, {
    at,
    type: 'revenue',
    actor: context.identity.actor,
    meta: JSON.stringify({ revenue_chf: revenue, follow_up_booked: followUp }),
  });
  return redirectOk(lead.id, 'umsatz');
}

async function postNotes(context: ActionContext): Promise<Response> {
  const form = await readForm(context.request);
  const denied = csrfDenied(await verifyCsrf(context.request, context.env, context.identity, form), context);
  if (denied) return denied;
  const lead = await getLead(context.db, context.id);
  if (!lead) return notFoundPage(context.identity);

  const notes = field(form, 'notes').replace(/\r\n/g, '\n').trim();
  if (notes.length > NOTES_MAX) {
    return invalidInput(context, lead, 'notes', `Bitte kürzen Sie die Notizen auf höchstens ${NOTES_MAX} Zeichen.`, { notes });
  }

  const at = context.now.toISOString();
  // The notes text itself stays in the lead row; the event only records that it changed.
  await updateLead(context.db, lead.id, { notes }, at, {
    at,
    type: 'notes',
    actor: context.identity.actor,
    meta: JSON.stringify({ length: notes.length }),
  });
  return redirectOk(lead.id, 'notiz');
}

const EXCLUDE_VALUES: Record<string, 'test' | 'spam' | null> = { test: 'test', spam: 'spam', none: null };

async function postExclude(context: ActionContext): Promise<Response> {
  const form = await readForm(context.request);
  const denied = csrfDenied(await verifyCsrf(context.request, context.env, context.identity, form), context);
  if (denied) return denied;
  const lead = await getLead(context.db, context.id);
  if (!lead) return notFoundPage(context.identity);

  const choice = field(form, 'exclude');
  if (!Object.hasOwn(EXCLUDE_VALUES, choice)) return invalidInput(context, lead, 'exclude', 'Bitte wählen Sie eine Option.', { exclude: choice });

  const at = context.now.toISOString();
  await updateLead(context.db, lead.id, { exclude: EXCLUDE_VALUES[choice] }, at, {
    at,
    type: 'exclude',
    actor: context.identity.actor,
    meta: JSON.stringify({ exclude: choice }),
  });
  return redirectOk(lead.id, 'ausschluss');
}

const POST_ACTIONS: Record<string, (context: ActionContext) => Promise<Response>> = {
  contacted: postContacted,
  status: postStatus,
  appointment: postAppointment,
  revenue: postRevenue,
  notes: postNotes,
  exclude: postExclude,
};

// ---- GET pages ----------------------------------------------------------------------------------

/**
 * Digits of a phone-like search in normalised form ("079 12" → "417912"), so a search matches
 * phone_normalized whatever format was typed. Null for other searches or fewer than 3 digits.
 */
function searchDigits(q: string): string | null {
  if (!/^[\d\s+()./-]+$/.test(q)) return null;
  let digits = q.replace(/\D/g, '');
  if (digits.length < 3) return null;
  if (!q.startsWith('+')) {
    if (digits.startsWith('00')) digits = digits.slice(2);
    else if (digits.startsWith('0')) digits = `41${digits.slice(1)}`;
  }
  return digits;
}

function parseListQuery(url: URL): ListQuery {
  const status = url.searchParams.get('status') ?? '';
  const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
  return {
    status: (LIST_FILTERS as readonly string[]).includes(status) ? (status as ListFilter) : 'offen',
    q: (url.searchParams.get('q') ?? '').trim().slice(0, 100),
    campaign: (url.searchParams.get('campaign') ?? '').trim().slice(0, 100),
    page: Number.isFinite(page) ? Math.min(Math.max(page, 1), 1000) : 1,
  };
}

async function getList(db: D1Database, identity: AccessIdentity, url: URL, now: Date): Promise<Response> {
  const query = parseListQuery(url);
  const rows = await listLeads(db, {
    statuses: statusesFor(query.status),
    includeExcluded: query.status === 'alle',
    q: query.q,
    qDigits: query.q ? searchDigits(query.q) : null,
    campaign: query.campaign,
    limit: PAGE_SIZE + 1,
    offset: (query.page - 1) * PAGE_SIZE,
  });
  return htmlResponse(renderList({ identity, query, leads: rows.slice(0, PAGE_SIZE), hasNext: rows.length > PAGE_SIZE, now }), 200);
}

function captureEnabled(env: Env): boolean {
  return 'LEADS_CAPTURE' in env && env.LEADS_CAPTURE === 'on';
}

async function manualResponse(env: Env, identity: AccessIdentity, values: ManualValues, error: string | null = null, status = 200): Promise<Response> {
  return htmlResponse(renderManual({ identity, csrf: await detailToken(env, identity), enabled: captureEnabled(env), values, error }), status);
}

async function manualPage(request: Request, env: Env, db: D1Database, identity: AccessIdentity, now: Date): Promise<Response> {
  if (request.method === 'GET' || request.method === 'HEAD') {
    const values = Object.fromEntries(MANUAL_FIELDS.map((key) => [key, '']));
    return manualResponse(env, identity, { ...values, entry_id: crypto.randomUUID(), channel: 'phone' });
  }
  if (request.method !== 'POST') return methodNotAllowedPage(identity, 'GET, HEAD, POST');
  const form = await readForm(request);
  const csrf = await verifyCsrf(request, env, identity, form);
  if (csrf === 'unconfigured') return configMissingPage(identity, `${LEADS_PREFIX}new/`);
  if (csrf !== 'ok') return invalidRequestPage(identity, `${LEADS_PREFIX}new/`);
  if (!captureEnabled(env)) return configMissingPage(identity, `${LEADS_PREFIX}new/`);
  const values = Object.fromEntries(MANUAL_FIELDS.map((key) => [key, field(form, key)]));
  if (MANUAL_FIELDS.some((key) => form.getAll(key).length > 1 || form.getAll(key).some((value) => typeof value !== 'string'))) {
    return manualResponse(env, identity, values, 'Bitte senden Sie jedes Eingabefeld genau einmal.', 400);
  }
  const validation = validateManual(values, now);
  if (!validation.ok) return manualResponse(env, identity, values, validation.message, 400);
  const result = await createManualLead(db, validation.input, identity.actor, now);
  return redirectOk(validation.input.id, result === 'created' ? 'erfasst' : 'vorhanden');
}

async function getDetail(context: ActionContext, url: URL): Promise<Response> {
  const lead = await getLead(context.db, context.id);
  if (!lead) return notFoundPage(context.identity);
  const ok = url.searchParams.get('ok') ?? '';
  return detailResponse(context, lead, { flash: Object.hasOwn(FLASH_TEXT, ok) ? FLASH_TEXT[ok] : null });
}

// ---- entry --------------------------------------------------------------------------------------

async function handleCockpit(request: Request, env: Env, identity: AccessIdentity, url: URL): Promise<Response> {
  const db = env.LEADS_DB;
  if (!db) return databaseMissingPage(identity);
  const now = new Date();
  const rest = url.pathname.slice(LEADS_PREFIX.length);
  const read = request.method === 'GET' || request.method === 'HEAD';

  if (rest === '') {
    return read ? getList(db, identity, url, now) : methodNotAllowedPage(identity, 'GET, HEAD');
  }
  if (rest === 'new/') return manualPage(request, env, db, identity, now);
  const match = LEAD_PATH_PATTERN.exec(rest);
  if (!match) return notFoundPage(identity);
  const [, id, action] = match;
  const context: ActionContext = { request, env, db, identity, id, now };
  if (!action) return read ? getDetail(context, url) : methodNotAllowedPage(identity, 'GET, HEAD');
  if (request.method !== 'POST') return methodNotAllowedPage(identity, 'POST');
  return POST_ACTIONS[action](context);
}

/**
 * The /admin/* entry point (worker/index.ts): 401 without a verified Access identity, then the
 * cockpit for /admin/leads/*, else the static legacy pages via `staticAsset`.
 */
export async function handleAdmin(request: Request, env: Env, staticAsset: StaticAssetFetcher): Promise<Response> {
  const response = await routeAdmin(request, env, staticAsset);
  // HEAD: same status and headers on every answer (incl. 401/405), never a body.
  return request.method === 'HEAD' ? new Response(null, { status: response.status, headers: response.headers }) : response;
}

async function routeAdmin(request: Request, env: Env, staticAsset: StaticAssetFetcher): Promise<Response> {
  const identity = await verifyAccess(request, env);
  if (!identity) return unauthorizedPage();
  if (!['GET', 'HEAD', 'POST'].includes(request.method)) return methodNotAllowedPage(identity, 'GET, HEAD, POST');

  const url = new URL(request.url);
  if (!url.pathname.startsWith(LEADS_PREFIX)) return staticAsset(request, env);

  try {
    return await handleCockpit(request, env, identity, url);
  } catch (error) {
    console.error('Lead cockpit failed:', error instanceof Error ? error.message : 'unknown error');
    return serverErrorPage(identity);
  }
}
