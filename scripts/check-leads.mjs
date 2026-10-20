// npm run qa:leads — source-level checks for the lead database (no network).
// Locks the D1 schema, the shared/leads.ts exports, the copies of page constants in shared/leads.ts,
// the D1/cron/vars config and the hidden `source` fields of the forms.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failed = false;

function read(file) {
  return readFileSync(path.join(root, file), 'utf8').replace(/\r/g, '');
}

function check(condition, label) {
  if (condition) {
    console.log(`[ok] ${label}`);
  } else {
    failed = true;
    console.error(`[fail] ${label}`);
  }
}

function filesUnder(dir) {
  const absolute = path.join(root, dir);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute).flatMap((name) => {
    const relative = path.posix.join(dir, name);
    return statSync(path.join(root, relative)).isDirectory() ? filesUnder(relative) : [relative];
  });
}

// ---- migration ---------------------------------------------------------------------------------
const migrationFile = 'worker/migrations/0001_leads.sql';
const migration = existsSync(path.join(root, migrationFile)) ? read(migrationFile) : '';
check(migration !== '', `${migrationFile} exists`);
check(migration.includes('CREATE TABLE leads ('), 'migration creates table leads');
check(migration.includes('CREATE TABLE lead_events ('), 'migration creates table lead_events');

const indexes = [
  'idx_leads_created_at ON leads(created_at)',
  'idx_leads_status ON leads(status)',
  'idx_leads_email_normalized ON leads(email_normalized)',
  'idx_leads_phone_normalized ON leads(phone_normalized)',
  'idx_leads_utm_content ON leads(utm_content)',
];
for (const index of indexes) {
  check(migration.includes(`CREATE INDEX ${index}`), `migration creates index ${index.split(' ')[0]}`);
}
check(migration.includes('CREATE INDEX idx_lead_events_lead ON lead_events(lead_id, at)'), 'migration creates index idx_lead_events_lead');

const leadColumns = [
  'id', 'created_at', 'updated_at', 'source', 'campaign', 'offer', 'treatment', 'topic', 'landing_page',
  'page_url', 'referrer', 'name', 'email', 'email_normalized', 'phone', 'phone_normalized',
  'preferred_contact_method', 'preferred_callback_time', 'preferred_date', 'skin_goal', 'message',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'msclkid',
  'status', 'status_changed_at', 'first_contact_at', 'contact_attempts', 'appointment_at',
  'revenue_first_visit_chf', 'follow_up_booked', 'notes', 'marketing_consent', 'marketing_consent_at',
  'marketing_synced_at', 'confirmation_sent_at', 'nudge_sent_at', 'followup_sent_at', 'review_sent_at',
  'unsubscribed_at', 'returning_of_lead_id', 'treatwell_booking_ref', 'exclude',
];
const eventColumns = ['id', 'lead_id', 'at', 'type', 'actor', 'from_status', 'to_status', 'note', 'meta'];
const leadsTable = migration.split('CREATE TABLE leads (')[1]?.split(');')[0] ?? '';
const eventsTable = migration.split('CREATE TABLE lead_events (')[1]?.split(');')[0] ?? '';
const hasColumn = (table, column) => new RegExp(`(^|\\n)\\s*${column}\\s+(TEXT|INTEGER)\\b`).test(table);
const missingLeadColumns = leadColumns.filter((column) => !hasColumn(leadsTable, column));
const missingEventColumns = eventColumns.filter((column) => !hasColumn(eventsTable, column));
check(missingLeadColumns.length === 0, `leads has all ${leadColumns.length} columns${missingLeadColumns.length ? ` (missing: ${missingLeadColumns.join(', ')})` : ''}`);
check(missingEventColumns.length === 0, `lead_events has all ${eventColumns.length} columns${missingEventColumns.length ? ` (missing: ${missingEventColumns.join(', ')})` : ''}`);
check(/status TEXT NOT NULL DEFAULT 'neu'/.test(leadsTable), "leads.status defaults to 'neu'");
check(/lead_id TEXT NOT NULL REFERENCES leads\(id\) ON DELETE CASCADE/.test(eventsTable), 'lead_events.lead_id references leads(id) ON DELETE CASCADE');

// worker/leads/db.ts inserts exactly the migration's columns (same set; order does not matter).
const migrationLeadColumns = [...leadsTable.matchAll(/^\s*([a-z_]+)\s+(TEXT|INTEGER)\b/gm)].map((m) => m[1]);
const db = read('worker/leads/db.ts');
const dbColumns = [...(db.split('const LEAD_COLUMNS = [')[1]?.split('] as const')[0] ?? '').matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
const sameSet = (a, b) => a.length === b.length && new Set(a).size === a.length && a.every((column) => b.includes(column));
check(migrationLeadColumns.length === 48 && sameSet(dbColumns, migrationLeadColumns),
  `LEAD_COLUMNS in worker/leads/db.ts = the ${migrationLeadColumns.length} leads columns of the migration (db.ts lists ${dbColumns.length})`);

// ---- shared/leads.ts ------------------------------------------------------------------------------
const leads = read('shared/leads.ts');
const requiredExports = [
  'LEAD_STATUSES', 'LeadStatus', 'LEAD_STATUS_LABELS', 'LEAD_SOURCES', 'LeadSource', 'leadSourceFor',
  'CAMPAIGN_OFFERS', 'OPENING_HOURS_WEEKLY', 'DUPLICATE_WINDOW_DAYS', 'NUDGE_AFTER_MINUTES',
  'FOLLOWUP_AFTER_HOURS', 'REVIEW_AFTER_HOURS', 'whatsappPrefillText', 'normalizeEmail', 'normalizePhone',
  'LEAD_ACTORS', 'LeadEventType',
];
const missingExports = requiredExports.filter((name) => !new RegExp(`export (const|function|type) ${name}\\b`).test(leads));
check(missingExports.length === 0, `shared/leads.ts exports ${requiredExports.length} names${missingExports.length ? ` (missing: ${missingExports.join(', ')})` : ''}`);
check(!/^import\s/m.test(leads), 'shared/leads.ts has no imports (loads in Worker, Astro and Node)');

const statuses = ['neu', 'kontaktiert', 'gebucht', 'erschienen', 'no_show', 'abgesagt', 'nicht_erreicht'];
const statusList = leads.split('export const LEAD_STATUSES = [')[1]?.split(']')[0] ?? '';
check(JSON.stringify([...statusList.matchAll(/'([^']+)'/g)].map((m) => m[1])) === JSON.stringify(statuses), 'LEAD_STATUSES are the seven slugs in order');
const sources = ['kontakt-page', 'aquafacial-lp', 'aquafacial-microneedling-lp', 'manual'];
const sourceList = leads.split('export const LEAD_SOURCES = [')[1]?.split(']')[0] ?? '';
check(JSON.stringify([...sourceList.matchAll(/'([^']+)'/g)].map((m) => m[1])) === JSON.stringify(sources), 'LEAD_SOURCES are kontakt-page, aquafacial-lp, aquafacial-microneedling-lp, manual');
check(/DUPLICATE_WINDOW_DAYS = 30;/.test(leads) && /NUDGE_AFTER_MINUTES = 60;/.test(leads)
  && /FOLLOWUP_AFTER_HOURS = 72;/.test(leads) && /REVIEW_AFTER_HOURS = 24;/.test(leads), 'timing constants are 30 days / 60 min / 72 h / 24 h');
check(leads.includes('`Guten Tag ${firstName}, hier ist Teresa Stimac von Beauty Face Lift. Vielen Dank für Ihre Anfrage zu ${treatment}. Wann passt es Ihnen für einen Termin?`'),
  'whatsappPrefillText uses the approved wording');

// normalizeEmail uses the contact route's validation rule.
const leadsEmailPattern = leads.match(/const EMAIL_PATTERN = (\/.+\/);/)?.[1];
const routeEmailPattern = read('worker/routes/contact.ts').match(/function isValidEmail\(email: string\): boolean \{\s*return (\/.+\/)\.test\(email\);/)?.[1];
check(leadsEmailPattern !== undefined && leadsEmailPattern === routeEmailPattern,
  `EMAIL_PATTERN in shared/leads.ts equals the isValidEmail regex in worker/routes/contact.ts (${routeEmailPattern ?? 'not found'})`);

// Copies of the ad pages' constants.
const comboLp = read('src/pages/lp/aquafacial-microneedling/index.astro');
const aktionLp = read('src/pages/lp/aquafacial/index.astro');
const pageConstant = (source, name) => source.match(new RegExp(`const ${name} = '([^']*)'`))?.[1];
const offerBlock = (key) => leads.match(new RegExp(`\\b${key}: \\{([^}]*)\\}`))?.[1] ?? '';
const offerValue = (key, field) => offerBlock(key).match(new RegExp(`${field}: (?:'([^']*)'|(null))`))?.slice(1).find((v) => v !== undefined);
const comboValidUntil = pageConstant(comboLp, 'OFFER_VALID_UNTIL');
check(comboValidUntil !== undefined && offerValue('aquafacial_microneedling', 'validUntil') === comboValidUntil,
  `CAMPAIGN_OFFERS.aquafacial_microneedling.validUntil equals OFFER_VALID_UNTIL of the combo LP (${comboValidUntil})`);
check(offerValue('aquafacial_microneedling', 'bookingService') === pageConstant(comboLp, 'BOOKING_SERVICE'),
  'CAMPAIGN_OFFERS.aquafacial_microneedling.bookingService equals BOOKING_SERVICE of the combo LP');
check(offerValue('aquafacial_microneedling', 'label') === pageConstant(comboLp, 'OFFER_LABEL'),
  'CAMPAIGN_OFFERS.aquafacial_microneedling.label equals OFFER_LABEL of the combo LP');
check(offerValue('aquafacial_aktion', 'label') === pageConstant(aktionLp, 'OFFER_LABEL'),
  'CAMPAIGN_OFFERS.aquafacial_aktion.label equals OFFER_LABEL of the Aquafacial LP');
check(pageConstant(comboLp, 'CONTACT_CAMPAIGN') === 'aquafacial_microneedling' && pageConstant(aktionLp, 'CAMPAIGN') === 'aquafacial_aktion',
  'CAMPAIGN_OFFERS keys match the campaigns the LPs post');

// OPENING_HOURS_WEEKLY (index 0 = Sunday) rendered like OPENING_HOURS in shared/site.ts.
const site = read('shared/site.ts');
const siteHours = Object.fromEntries([...(site.split('export const OPENING_HOURS = [')[1]?.split('] as const')[0] ?? '')
  .matchAll(/\{ label: '([^']+)', value: '([^']+)' \}/g)].map((m) => [m[1], m[2]]));
const weeklyBlock = leads.split('export const OPENING_HOURS_WEEKLY')[1]?.split('];')[0] ?? '';
const weekly = [...weeklyBlock.matchAll(/^\s*(null|\{ open: '(\d\d:\d\d)', close: '(\d\d:\d\d)' \}),/gm)]
  .map((m) => (m[1] === 'null' ? 'Geschlossen' : `${m[2]} - ${m[3]}`));
check(weekly.length === 7, `OPENING_HOURS_WEEKLY has 7 days (got ${weekly.length})`);
check(weekly.slice(1, 6).every((value) => value === siteHours['Montag bis Freitag']),
  `OPENING_HOURS_WEEKLY Monday-Friday = "${siteHours['Montag bis Freitag']}" (shared/site.ts)`);
check(weekly[6] === siteHours.Samstag, `OPENING_HOURS_WEEKLY Saturday = "${siteHours.Samstag}" (shared/site.ts)`);
check(weekly[0] === siteHours.Sonntag, `OPENING_HOURS_WEEKLY Sunday = "${siteHours.Sonntag}" (shared/site.ts)`);

// ---- config -----------------------------------------------------------------------------------------
const wrangler = read('wrangler.jsonc');
const d1Block = wrangler.split('"d1_databases"')[1]?.split(']')[0] ?? '';
check(/"binding": "LEADS_DB"/.test(d1Block) && /"database_name": "beautyfacelift-leads"/.test(d1Block)
  && /"migrations_dir": "worker\/migrations"/.test(d1Block) && /"database_id": "[0-9a-f-]{36}"/.test(d1Block),
  'wrangler.jsonc binds LEADS_DB to beautyfacelift-leads with migrations_dir worker/migrations');
check(/"crons": \["\*\/15 \* \* \* \*"\]/.test(wrangler), 'wrangler.jsonc has the cron */15 * * * *');
check(/"LEADS_FORWARD_TO": "[^"]+@[^"]+"/.test(wrangler) && /"LEADS_NUDGE_TO": "[^"]+@[^"]+"/.test(wrangler),
  'wrangler.jsonc sets the vars LEADS_FORWARD_TO and LEADS_NUDGE_TO');
check(!/"LEADS_(FORWARD|NUDGE)_TO": "info@beautyfacelift\.ch"/.test(wrangler), 'LEADS_FORWARD_TO / LEADS_NUDGE_TO do not point at the studio inbox yet');

const deploy = read('.github/workflows/deploy.yml');
check(deploy.includes('preCommands: npx wrangler d1 migrations apply beautyfacelift-leads --remote'), 'deploy.yml applies the D1 migrations before deploying');
check(/command: deploy\b/.test(deploy), 'deploy.yml runs wrangler deploy explicitly');

const env = read('worker/env.ts');
check(/LEADS_DB\?: D1Database;/.test(env), 'worker/env.ts declares LEADS_DB');

const contactRoute = read('worker/routes/contact.ts');
const ingestIndex = contactRoute.indexOf('await createLeadFromSubmission(');
const mailIndex = contactRoute.indexOf('await sendNotificationEmail(data, request, env, ip)');
check(ingestIndex !== -1 && mailIndex !== -1 && ingestIndex < mailIndex, 'contact route stores the lead before the owner e-mail');
check(contactRoute.includes("console.error('Lead ingest failed:'"), 'contact route logs and continues when the lead ingest fails');

// ---- forms ------------------------------------------------------------------------------------------
check(aktionLp.includes('<input type="hidden" name="source" value="aquafacial-lp" />'), '/lp/aquafacial/ posts source=aquafacial-lp');
check(read('src/pages/kontakt/index.astro').includes('<input type="hidden" name="source" value="kontakt-page" />'), '/kontakt/ posts source=kontakt-page');
check(pageConstant(comboLp, 'CONTACT_SOURCE') === 'aquafacial-microneedling-lp' && comboLp.includes('<input type="hidden" name="source" value={CONTACT_SOURCE} />'),
  '/lp/aquafacial-microneedling/ posts source=aquafacial-microneedling-lp');

// ---- Swiss spelling -----------------------------------------------------------------------------------
const spellingFiles = ['shared/leads.ts', ...filesUnder('worker/leads'), ...filesUnder('worker/migrations')];
const withEszett = spellingFiles.filter((file) => read(file).includes('ß'));
check(withEszett.length === 0, `no "ß" in ${spellingFiles.length} lead files${withEszett.length ? ` (found in: ${withEszett.join(', ')})` : ''}`);

if (failed) {
  process.exit(1);
}
console.log('[ok] lead database sources are consistent');
