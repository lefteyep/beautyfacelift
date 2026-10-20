// GET /admin/leads/:id/ — contact buttons, "Jetzt kontaktiert", the edit forms (status, appointment,
// revenue, notes, exclusion), the enquiry data and the timeline. Plain POST forms, no JavaScript.
import { LEAD_STATUS_LABELS, LEAD_STATUSES, type LeadEventType, type LeadStatus } from '../../../shared/leads';
import type { AccessIdentity } from '../access';
import type { LeadEventRow, LeadRow } from '../db';
import { excludeChip, html, layout, sourceChip, statusChip, type SafeHtml } from '../html';
import { formatZurich, zurichInputValues } from '../time';
import { contactLinks, treatmentLabel, type ContactLink } from './shared';

/** Statuses that need a short reason in the status form. */
export const STATUSES_NEEDING_NOTE: readonly LeadStatus[] = ['no_show', 'abgesagt', 'nicht_erreicht'];

export type DetailForm = 'contacted' | 'status' | 'appointment' | 'revenue' | 'notes' | 'exclude';

export type DetailError = { form: DetailForm; message: string; values: Record<string, string> };

export type DetailViewInput = {
  identity: AccessIdentity;
  lead: LeadRow;
  events: LeadEventRow[];
  /** Hidden `_csrf` value; null when LEADS_SIGNING_SECRET is missing (changes are refused). */
  csrf: string | null;
  flash: string | null;
  error?: DetailError | null;
};

const ACTOR_LABELS: Record<string, string> = { teresa: 'Teresa', agentur: 'Agentur', system: 'System', email: 'E-Mail' };

const EVENT_LABELS: Record<LeadEventType, string> = {
  created: 'Anfrage eingegangen',
  contacted: 'Kontaktiert',
  status: 'Status geändert',
  appointment: 'Termin eingetragen',
  revenue: 'Umsatz eingetragen',
  notes: 'Notizen geändert',
  exclude: 'Ausschluss geändert',
  mail_sent: 'E-Mail gesendet',
  mail_failed: 'E-Mail fehlgeschlagen',
  nudge_sent: 'Erinnerung gesendet',
  automation_claimed: 'Automatik gestartet',
};

const statusLabel = (status: string | null) => (status ? LEAD_STATUS_LABELS[status as LeadStatus] ?? status : '');

function parseMeta(meta: string | null): Record<string, unknown> {
  if (!meta) return {};
  try {
    const parsed: unknown = JSON.parse(meta);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function eventDetail(event: LeadEventRow): string {
  const meta = parseMeta(event.meta);
  if (event.type === 'appointment' && typeof meta.appointment_at === 'string') return formatZurich(meta.appointment_at, { withTime: true });
  if (event.type === 'revenue') {
    const revenue = typeof meta.revenue_chf === 'number' ? `CHF ${meta.revenue_chf}` : 'Kein Umsatz';
    const followUp = meta.follow_up_booked === 'ja' ? 'ja' : meta.follow_up_booked === 'nein' ? 'nein' : 'unbekannt';
    return `${revenue} · Folgetermin: ${followUp}`;
  }
  if (event.type === 'exclude') return meta.exclude === 'test' ? 'Test' : meta.exclude === 'spam' ? 'Spam' : 'Kein Ausschluss';
  return '';
}

function timeline(events: LeadEventRow[]): SafeHtml {
  if (events.length === 0) return html`<p class="muted">Noch keine Einträge.</p>`;
  const items = events.map((event) => {
    const change = event.from_status && event.to_status && event.from_status !== event.to_status
      ? `${statusLabel(event.from_status)} → ${statusLabel(event.to_status)}`
      : '';
    const detail = [change, eventDetail(event)].filter(Boolean).join(' · ');
    return html`<li>
<span class="when">${formatZurich(event.at, { withTime: true })} · ${ACTOR_LABELS[event.actor] ?? event.actor}</span>
<span class="what">${EVENT_LABELS[event.type] ?? event.type}${detail ? html` · ${detail}` : html``}</span>
${event.note ? html`<span class="note">${event.note}</span>` : html``}
</li>`;
  });
  return html`<ol class="timeline">${items}</ol>`;
}

function enquiry(lead: LeadRow): SafeHtml {
  const rows: [string, string | null, boolean?][] = [
    ['E-Mail', lead.email],
    ['Telefon', lead.phone],
    ['Bevorzugter Kontaktweg', lead.preferred_contact_method],
    ['Erreichbarkeit', lead.preferred_callback_time],
    ['Terminwunsch', lead.preferred_date],
    ['Thema', lead.topic],
    ['Behandlung', lead.treatment],
    ['Hautziel', lead.skin_goal],
    ['Nachricht', lead.message, true],
    ['Kampagne', lead.campaign],
    ['Angebot', lead.offer],
    ['Landing Page', lead.landing_page],
    ['Seiten-URL', lead.page_url],
    ['Referrer', lead.referrer],
    ['UTM Source', lead.utm_source],
    ['UTM Medium', lead.utm_medium],
    ['UTM Campaign', lead.utm_campaign],
    ['UTM Content', lead.utm_content],
    ['UTM Term', lead.utm_term],
    ['fbclid', lead.fbclid],
    ['gclid', lead.gclid],
    ['msclkid', lead.msclkid],
  ];
  const items = rows
    .filter(([, value]) => value !== null && value !== '')
    .map(([label, value, pre]) => html`<div><dt>${label}</dt><dd${pre ? html` class="pre"` : html``}>${value}</dd></div>`);
  const consent = lead.marketing_consent === 1
    ? `ja${lead.marketing_consent_at ? ` (${formatZurich(lead.marketing_consent_at, { withTime: true })})` : ''}`
    : 'nein';
  return html`<dl class="data">${items}<div><dt>Marketing-Einwilligung</dt><dd>${consent}</dd></div></dl>`;
}

type FormContext = { leadPath: string; csrf: string | null; error: DetailError | null | undefined };

function formOpen(context: FormContext, action: DetailForm): SafeHtml {
  return html`<form method="post" action="${context.leadPath}${action}/">
<input type="hidden" name="_csrf" value="${context.csrf ?? ''}">`;
}

function formError(context: FormContext, form: DetailForm): SafeHtml {
  return context.error?.form === form ? html`<p class="form-error" role="alert">${context.error.message}</p>` : html``;
}

/** Submitted value after a failed save, else the stored one. */
function value(context: FormContext, form: DetailForm, field: string, stored: string): string {
  return context.error?.form === form ? context.error.values[field] ?? '' : stored;
}

const invalid = (context: FormContext, form: DetailForm) => (context.error?.form === form ? html` aria-invalid="true"` : html``);

function radioOptions(name: string, options: [string, string][], checked: string, invalidAttr: SafeHtml): SafeHtml {
  return html`<div class="options"${invalidAttr}>${options.map(([optionValue, label]) => html`<label><input type="radio" name="${name}" value="${optionValue}"${optionValue === checked ? html` checked` : html``}><span>${label}</span></label>`)}</div>`;
}

/** Contact buttons (secondary) and the "Jetzt kontaktiert" form (primary), stacked full-width on mobile. */
function contactSection(lead: LeadRow, context: FormContext, links: ContactLink[]): SafeHtml {
  const attempts = lead.contact_attempts === 1 ? '1 Versuch' : `${lead.contact_attempts} Versuche`;
  return html`<section class="contact" aria-labelledby="h-contact">
<h2 class="visually-hidden" id="h-contact">Kontakt</h2>
<div class="actions">
${links.map((link) => html`<a class="btn btn-secondary" href="${link.href}">${link.label}</a>`)}
${formOpen(context, 'contacted')}
<button class="btn" type="submit">Jetzt kontaktiert</button>
</form>
</div>
${lead.first_contact_at ? html`<p class="muted contact-state">Erstkontakt ${formatZurich(lead.first_contact_at, { withTime: true })} · ${attempts}</p>` : html``}
</section>`;
}

function statusSection(lead: LeadRow, context: FormContext): SafeHtml {
  const checked = value(context, 'status', 'status', lead.status);
  const needsNote = STATUSES_NEEDING_NOTE.map((status) => `«${LEAD_STATUS_LABELS[status]}»`).join(', ').replace(/, ([^,]*)$/, ' und $1');
  return html`<section aria-labelledby="h-status">
<h2 id="h-status">Status</h2>
${formError(context, 'status')}
${formOpen(context, 'status')}
<fieldset class="field">
<legend class="visually-hidden">Status</legend>
${radioOptions('status', LEAD_STATUSES.map((status) => [status, LEAD_STATUS_LABELS[status]]), checked, html``)}
</fieldset>
<div class="field">
<label for="status-note">Notiz</label>
<textarea id="status-note" name="note" maxlength="1000" aria-describedby="status-note-hint"${invalid(context, 'status')}>${value(context, 'status', 'note', '')}</textarea>
<span class="hint" id="status-note-hint">Bei ${needsNote}: Bitte kurz begründen.</span>
</div>
<button class="btn" type="submit">Status speichern</button>
</form>
</section>`;
}

function appointmentSection(lead: LeadRow, context: FormContext): SafeHtml {
  const current = lead.appointment_at ? zurichInputValues(lead.appointment_at) : null;
  const date = value(context, 'appointment', 'date', current?.date ?? '');
  const time = value(context, 'appointment', 'time', current?.time ?? '');
  const setStatusChecked = context.error?.form === 'appointment'
    ? context.error.values.set_status === 'gebucht'
    : lead.status === 'neu' || lead.status === 'kontaktiert';
  return html`<section aria-labelledby="h-appointment">
<h2 id="h-appointment">Termin</h2>
<p class="muted note-line">${lead.appointment_at ? `Aktueller Termin: ${formatZurich(lead.appointment_at, { withTime: true })}` : 'Noch kein Termin eingetragen.'}</p>
${formError(context, 'appointment')}
${formOpen(context, 'appointment')}
<div class="field-row">
<div class="field">
<label for="appointment-date">Datum <span class="req" aria-hidden="true">*</span></label>
<input id="appointment-date" type="date" name="date" value="${date}" required${invalid(context, 'appointment')}>
</div>
<div class="field">
<label for="appointment-time">Uhrzeit <span class="req" aria-hidden="true">*</span></label>
<input id="appointment-time" type="time" name="time" value="${time}" step="300" required${invalid(context, 'appointment')}>
</div>
</div>
<label class="check"><input type="checkbox" name="set_status" value="gebucht"${setStatusChecked ? html` checked` : html``}> Status auf Gebucht setzen</label>
<button class="btn" type="submit">Termin eintragen</button>
</form>
</section>`;
}

function revenueSection(lead: LeadRow, context: FormContext): SafeHtml {
  const storedFollowUp = lead.follow_up_booked === 1 ? 'ja' : lead.follow_up_booked === 0 ? 'nein' : 'unbekannt';
  const revenue = value(context, 'revenue', 'revenue_chf', lead.revenue_first_visit_chf === null ? '' : String(lead.revenue_first_visit_chf));
  const followUp = value(context, 'revenue', 'follow_up_booked', storedFollowUp);
  return html`<section aria-labelledby="h-revenue">
<h2 id="h-revenue">Umsatz</h2>
${formError(context, 'revenue')}
${formOpen(context, 'revenue')}
<div class="field">
<label for="revenue-chf">Umsatz erster Besuch (CHF)</label>
<input id="revenue-chf" type="number" name="revenue_chf" value="${revenue}" min="0" max="100000" step="1" inputmode="numeric"${invalid(context, 'revenue')}>
</div>
<fieldset class="field">
<legend>Folgetermin gebucht?</legend>
${radioOptions('follow_up_booked', [['ja', 'Ja'], ['nein', 'Nein'], ['unbekannt', 'Unbekannt']], followUp, html``)}
</fieldset>
<button class="btn" type="submit">Umsatz speichern</button>
</form>
</section>`;
}

function notesSection(lead: LeadRow, context: FormContext): SafeHtml {
  return html`<section aria-labelledby="h-notes">
<h2 id="h-notes">Notizen</h2>
${formError(context, 'notes')}
${formOpen(context, 'notes')}
<div class="field">
<label for="lead-notes">Interne Notizen</label>
<textarea id="lead-notes" name="notes" maxlength="4000"${invalid(context, 'notes')}>${value(context, 'notes', 'notes', lead.notes)}</textarea>
</div>
<button class="btn" type="submit">Notizen speichern</button>
</form>
</section>`;
}

function excludeSection(lead: LeadRow, context: FormContext): SafeHtml {
  const checked = value(context, 'exclude', 'exclude', lead.exclude ?? 'none');
  return html`<section class="section-muted" aria-labelledby="h-exclude">
<h2 id="h-exclude">Ausschliessen</h2>
<p class="muted note-line">Ausgeschlossene Anfragen erscheinen nur unter «Alle» und zählen nicht in der Wochenübersicht.</p>
${formError(context, 'exclude')}
${formOpen(context, 'exclude')}
<fieldset class="field">
<legend class="visually-hidden">Ausschluss</legend>
${radioOptions('exclude', [['none', 'Nicht ausschliessen'], ['test', 'Test'], ['spam', 'Spam']], checked, invalid(context, 'exclude'))}
</fieldset>
<button class="btn btn-secondary" type="submit">Ausschluss speichern</button>
</form>
</section>`;
}

export function renderDetail({ identity, lead, events, csrf, flash, error }: DetailViewInput): string {
  const leadPath = `/admin/leads/${encodeURIComponent(lead.id)}/`;
  const context: FormContext = { leadPath, csrf, error };
  const links = contactLinks(lead.name, treatmentLabel(lead), lead.phone_normalized, lead.email);

  const headExtra = html`<div class="chips">${sourceChip(lead.source)}${statusChip(lead.status)}${excludeChip(lead.exclude)}${
    lead.returning_of_lead_id ? html`<a class="chip" href="/admin/leads/${encodeURIComponent(lead.returning_of_lead_id)}/">Wiederkehrend</a>` : html``
  }</div>
<p class="muted">Eingegangen ${formatZurich(lead.created_at, { withTime: true })} · <a href="/admin/leads/">Alle Anfragen</a></p>`;

  const body = html`${csrf ? html`` : html`<p class="form-error" role="alert">Die Konfiguration ist unvollständig: Änderungen werden nicht gespeichert.</p>`}
${contactSection(lead, context, links)}
<div class="card">
${statusSection(lead, context)}
${appointmentSection(lead, context)}
${revenueSection(lead, context)}
${notesSection(lead, context)}
</div>
<div class="card">
<section aria-labelledby="h-enquiry">
<h2 id="h-enquiry">Anfrage</h2>
${enquiry(lead)}
</section>
<section aria-labelledby="h-timeline">
<h2 id="h-timeline">Verlauf</h2>
${timeline(events)}
</section>
${excludeSection(lead, context)}
</div>`;

  return layout({ title: 'Anfrage', h1: lead.name, body, identity, flash, headExtra });
}
