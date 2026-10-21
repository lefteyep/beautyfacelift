// Separate operator procedure, intentionally absent from the normal staff navigation.
import type { Env } from '../env';
import { normalizeEmail } from '../../shared/leads';
import type { AccessIdentity } from './access';
import { csrfToken, verifyCsrf } from './csrf';
import { html, layout, htmlResponse, invalidRequestPage, configMissingPage, type SafeHtml } from './html';
import { planLeadErasure, executeLeadErasure, LeadErasureError, type LeadErasurePlan } from './erasure';

const PATH = '/admin/leads/data/erase/';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const FIELDS = ['_csrf', 'action', 'lead_ids', 'case_ref', 'confirmation', 'typed_confirmation'];
type Values = { lead_ids: string; case_ref: string };
const MESSAGES: Record<string, string> = {
  'invalid-selection': 'Bitte wählen Sie höchstens zehn unterschiedliche gültige Anfrage-IDs.',
  'missing-leads': 'Mindestens eine Anfrage-ID fehlt. Bitte zuerst den aktuellen Bestand abgleichen.',
  'unsupported-schema': 'Das Datenbankschema wurde verändert. Das Verfahren muss zuerst geprüft werden.',
  'bounds-exceeded': 'Der Bestand überschreitet die geprüften Verfahrensgrenzen. Bitte das Verfahren erweitern und erneut prüfen.',
  blocked: 'Unklare Kontakt- oder Textkopien verhindern die Löschung. Bitte die Vorschau und den privaten Vorgang prüfen.',
  'stale-plan': 'Der Datenstand hat sich seit der Vorschau geändert. Es wurde nichts gelöscht; bitte eine neue Vorschau prüfen.',
  'transaction-failed': 'Die Transaktion wurde nicht bestätigt. Bitte zuerst den Bestand prüfen und eine neue Vorschau erstellen.',
  'storage-unavailable': 'Die Datenbank ist derzeit nicht verfügbar. Bitte später neu prüfen.',
};

function page(identity: AccessIdentity, body: SafeHtml, status = 200): Response {
  return htmlResponse(layout({ identity, title: 'Datenverfahren', h1: 'Anfragen gezielt löschen', body }), status);
}

async function render(identity: AccessIdentity, env: Env, values: Values, plan?: LeadErasurePlan, error?: string, status = 200): Promise<Response> {
  const csrf = env.LEADS_SIGNING_SECRET ? await csrfToken(env.LEADS_SIGNING_SECRET, identity) : '';
  return page(identity, html`<p>Dieses Verfahren löscht nur die ausdrücklich ausgewählten Datenbankeinträge und geprüften Verweise. E-Mail-Kopien, Protokolle und Sicherungen gehören zum separaten Datenvorgang.</p>
<p>Vorher Berechtigung und Auswahl prüfen, den privaten Vorgang dokumentieren und die freigegebene Sicherungs-/Wiederherstellungsvorsorge bestätigen. Hier werden keine Personen anhand ihrer Kontaktdaten automatisch ausgewählt.</p>
<p><a href="/admin/leads/">Zurück zu den Anfragen</a></p>
${error ? html`<p class="form-error" role="alert">${error}</p>` : html``}
<div class="card"><form method="post" action="${PATH}"><input type="hidden" name="_csrf" value="${csrf}">
<div class="field"><label for="erase-ids">Anfrage-IDs</label><textarea id="erase-ids" name="lead_ids" required maxlength="500">${values.lead_ids}</textarea><span class="hint">Eine vollständige ID pro Zeile, höchstens zehn.</span></div>
<div class="field"><label for="erase-case">Privates Vorgangszeichen</label><input id="erase-case" name="case_ref" required maxlength="80" value="${values.case_ref}" autocomplete="off"><span class="hint">Nur ein Vorgangscode, keine Namen oder Kontaktdaten, zum Beispiel BFL-CASE-001.</span></div>
<button class="btn" name="action" value="plan" type="submit">Vorschau prüfen</button></form></div>
${plan ? html`<div class="card"><h2>Geprüfte Auswahl</h2>
<ul>${plan.leadIds.map(id => html`<li>${id}</li>`)}</ul>
<p>${plan.leadsDeleted} Anfragen, ${plan.eventsDeleted} zugehörige Ereignisse, ${plan.relationshipsCleared.length} Verknüpfungen und ${plan.metadataEventsRedacted.length} Metadaten-Verweise.</p>
${plan.blockers.length ? html`<p class="form-error" role="alert">Unklare Kopien oder Kontaktzuordnungen: nicht löschen, zuerst den Vorgang klären.</p><ul>${plan.blockers.map(blocker => html`<li>${blocker.table} · ${blocker.rowId} · ${blocker.columns.join(', ')}</li>`)}</ul>` : html`
<form method="post" action="${PATH}"><input type="hidden" name="_csrf" value="${csrf}"><input type="hidden" name="action" value="erase">
<input type="hidden" name="lead_ids" value="${values.lead_ids}"><input type="hidden" name="case_ref" value="${values.case_ref}"><input type="hidden" name="confirmation" value="${plan.confirmation}">
<div class="field"><label for="erase-confirm">Zum Bestätigen LOESCHEN eingeben</label><input id="erase-confirm" name="typed_confirmation" required autocomplete="off"></div>
<p>Bei einer Änderung des Datenstands muss die Vorschau erneut geprüft werden. Eine Datenbanklöschung beseitigt keine Kopien in anderen Systemen.</p>
<button class="btn" type="submit">Ausgewählte Datenbankeinträge löschen</button></form>`}</div>` : html``}`, status);
}

export async function erasureRoute(request: Request, env: Env, db: D1Database, identity: AccessIdentity): Promise<Response> {
  if (env.LEADS_DATA_OPERATIONS !== 'on') return page(identity, html`<p>Die Datenverfahren sind noch nicht freigegeben.</p>`, 503);
  const operators = (env.LEADS_DATA_OPERATORS ?? '').split(',').map(normalizeEmail).filter(Boolean);
  if (identity.actor !== 'agentur' || !operators.includes(normalizeEmail(identity.email))) return invalidRequestPage(identity, PATH);
  if (!env.LEADS_SIGNING_SECRET) return configMissingPage(identity, PATH);
  if (request.method === 'GET' || request.method === 'HEAD') return render(identity, env, { lead_ids: '', case_ref: '' });
  let form: FormData;
  try { form = await request.formData(); } catch { return invalidRequestPage(identity, PATH); }
  const csrf = await verifyCsrf(request, env, identity, form);
  if (csrf === 'unconfigured') return configMissingPage(identity, PATH);
  if (csrf !== 'ok' || FIELDS.some(key => form.getAll(key).length > 1)) return invalidRequestPage(identity, PATH);
  const field = (key: string) => typeof form.get(key) === 'string' ? String(form.get(key)).trim() : '';
  const values = { lead_ids: field('lead_ids'), case_ref: field('case_ref') };
  const ids = values.lead_ids.toLowerCase().split(/[\s,]+/).filter(Boolean);
  if (values.lead_ids.length > 500 || ids.length < 1 || ids.length > 10 || new Set(ids).size !== ids.length || ids.some(id => !UUID.test(id))) {
    return render(identity, env, values, undefined, MESSAGES['invalid-selection'], 400);
  }
  if (!/^[A-Za-z][A-Za-z0-9_-]{2,79}$/.test(values.case_ref)) return render(identity, env, values, undefined, 'Bitte geben Sie ein privates Vorgangszeichen ohne Namen oder Kontaktdaten an.', 400);
  const action = field('action');
  try {
    if (action === 'plan') return render(identity, env, values, await planLeadErasure(db, ids));
    if (action !== 'erase' || field('typed_confirmation') !== 'LOESCHEN' || !field('confirmation') || field('confirmation').length > 128) {
      return render(identity, env, values, undefined, 'Bitte zuerst die Vorschau prüfen und die Löschung ausdrücklich bestätigen.', 400);
    }
    const caseHash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(values.case_ref)))].map(byte => byte.toString(16).padStart(2, '0')).join('');
    const result = await executeLeadErasure(db, { leadIds: ids, apply: true, confirmation: field('confirmation') });
    if (result.mode !== 'applied') throw new Error('Operation was not applied');
    console.info('Lead data operation:', JSON.stringify({ event: 'lead_erasure_completed', case_ref_hash: caseHash, leads: result.leadsDeleted, events: result.eventsDeleted }));
    return page(identity, html`<p role="status">Die ausgewählten Datenbankeinträge wurden gelöscht: ${result.leadsDeleted} Anfragen und ${result.eventsDeleted} zugehörige Ereignisse.</p><p>Bitte den privaten Vorgang mit E-Mail-Kopien, Protokollen und Sicherungen abschliessen. Diese Bestätigung umfasst nur die Datenbank.</p><a href="/admin/leads/">Zurück zu den Anfragen</a>`);
  } catch (error) {
    if (error instanceof LeadErasureError) return render(identity, env, values, undefined, MESSAGES[error.code] ?? 'Das Datenverfahren konnte nicht abgeschlossen werden.', ['stale-plan', 'blocked', 'missing-leads'].includes(error.code) ? 409 : 503);
    console.error('Lead data operation failed:', 'operation-failed');
    return render(identity, env, values, undefined, 'Das Datenverfahren konnte nicht bestätigt werden. Bitte den aktuellen Bestand prüfen.', 500);
  }
}
