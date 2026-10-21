import type { AccessIdentity } from '../access';
import { html, layout } from '../html';
import type { ManualValues } from '../manual';

export function renderManual({ identity, csrf, enabled, values, error = null }: {
  identity: AccessIdentity; csrf: string | null; enabled: boolean; values: ManualValues; error?: string | null;
}): string {
  const radio = (value: string, label: string) => html`<label><input type="radio" name="channel" value="${value}"${values.channel === value ? html` checked` : html``}><span>${label}</span></label>`;
  const body = html`<p class="muted note-line">Telefon- und WhatsApp-Anfragen erfassen oder fehlende Website-Anfragen aus der Benachrichtigungs-E-Mail wiederherstellen. Es wird keine E-Mail versendet.</p>
<p class="note-line"><a href="/admin/leads/">Zurück zu den Anfragen</a></p>
${csrf ? html`` : html`<p class="form-error" role="alert">Die Konfiguration ist unvollständig: Änderungen werden nicht gespeichert.</p>`}
${enabled ? html`` : html`<p class="form-error" role="alert">Die Erfassung ist noch nicht freigegeben. Es werden keine neuen Anfragen gespeichert.</p>`}
<div class="card">
${error ? html`<p class="form-error" role="alert">${error}</p>` : html``}
<form method="post" action="/admin/leads/new/">
<input type="hidden" name="_csrf" value="${csrf ?? ''}">
<input type="hidden" name="entry_id" value="${values.entry_id}">
<fieldset class="field"><legend>Art der Erfassung</legend><div class="options">${radio('phone', 'Telefon')}${radio('whatsapp', 'WhatsApp')}${radio('recovery', 'Website-Anfrage wiederherstellen')}</div></fieldset>
<div class="field"><label for="manual-name">Name *</label><input id="manual-name" name="name" value="${values.name}" maxlength="120" required autocomplete="off"></div>
<div class="field"><label for="manual-phone">Telefon</label><input id="manual-phone" name="phone" type="tel" value="${values.phone}" maxlength="80" autocomplete="off"><span class="hint">Für Telefon und WhatsApp erforderlich.</span></div>
<div class="field"><label for="manual-email">E-Mail</label><input id="manual-email" name="email" type="email" value="${values.email}" maxlength="254" autocomplete="off"></div>
<div class="field"><label for="manual-treatment">Behandlung / Thema</label><input id="manual-treatment" name="treatment" value="${values.treatment}" maxlength="200"></div>
<div class="field"><label for="manual-message">Nachricht</label><textarea id="manual-message" name="message" maxlength="4000">${values.message}</textarea></div>
<div class="field"><label for="manual-notes">Interne Notiz</label><textarea id="manual-notes" name="notes" maxlength="4000">${values.notes}</textarea><span class="hint">Bei Wiederherstellung: Grund und Abgleich mit der Benachrichtigungs-E-Mail festhalten. Nur nötige Angaben erfassen.</span></div>
<fieldset class="field"><legend>Nur für die Wiederherstellung</legend>
<p class="muted note-line">Zuerst nach Name, E-Mail oder Telefon suchen. Bei vorhandener Anfrage diese weiterbearbeiten.</p>
<div class="field"><label for="manual-reference">Ursprüngliche Anfrage-ID</label><input id="manual-reference" name="original_reference" value="${values.original_reference}" maxlength="36" autocomplete="off"><span class="hint">Aus der Benachrichtigungs-E-Mail kopieren. Eine vorhandene ID wird nicht überschrieben.</span></div>
<div class="field"><label for="manual-received">Ursprünglicher Eingangszeitpunkt</label><input id="manual-received" name="original_received_at" value="${values.original_received_at}" maxlength="35" autocomplete="off" placeholder="2026-10-21T08:30:00.000Z"><span class="hint">Die vollständige Zeitangabe mit Zeitzone aus der E-Mail kopieren.</span></div>
<div class="field"><label for="manual-source">Ursprüngliche Website-Quelle</label><select id="manual-source" name="original_source">${[['', 'Bitte wählen'], ['kontakt-page', 'Kontaktseite'], ['aquafacial-lp', 'Aquafacial-Landingpage'], ['aquafacial-microneedling-lp', 'Kombi-Landingpage']].map(([value, label]) => html`<option value="${value}"${values.original_source === value ? html` selected` : html``}>${label}</option>`)}</select></div>
</fieldset>
<button class="btn" type="submit"${csrf && enabled ? html`` : html` disabled`}>Anfrage speichern</button>
</form></div>`;
  return layout({ title: 'Anfrage erfassen', h1: 'Anfrage erfassen', body, identity });
}
