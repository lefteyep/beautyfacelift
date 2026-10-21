import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { config, expected, guard, runDrill, SCOPE, snapshot, tokens, validateDump } from './d1-cloud-drill.mjs';

const sha = '1234567890abcdef1234567890abcdef12345678';
const approved = () => ({ GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REPOSITORY: SCOPE.repository,
  GITHUB_REF: SCOPE.ref, GITHUB_RUN_ATTEMPT: '1', GITHUB_SHA: sha, DRILL_EXPECTED_SHA: sha,
  DRILL_ACTION: 'synthetic-export-import', DRILL_CONFIRMATION: SCOPE.confirmation,
  CLOUDFLARE_ACCOUNT_ID: SCOPE.account, CLOUDFLARE_API_TOKEN: 'test-placeholder' });
function model(change = '') {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../../worker/migrations/0001_leads.sql', import.meta.url), 'utf8'));
  db.exec(readFileSync(new URL('../fixtures/d1-recovery/01-seed.sql', import.meta.url), 'utf8'));
  if (change) db.exec(change);
  return db;
}
const literal = (value) => value === null ? 'NULL' : typeof value === 'number' ? String(value) : `'${value.replaceAll("'", "''")}'`;
function dump(db) {
  const definitions = db.prepare("SELECT sql FROM sqlite_schema WHERE sql IS NOT NULL AND name NOT GLOB 'sqlite_*' ORDER BY type DESC,name").all().map((r) => `${r.sql};`);
  const inserts = ['leads', 'lead_events', 'sqlite_sequence'].flatMap((table) => db.prepare(`SELECT * FROM ${table}`).all().map((r) => `INSERT INTO "${table}" VALUES(${Object.values(r).map(literal).join(',')});`));
  // Cover both SQLite's sequence reset and D1's foreign-key pragma spelling.
  inserts.splice(inserts.length - 1, 0, 'DELETE FROM sqlite_sequence;');
  return Buffer.from(['PRAGMA defer_foreign_keys=TRUE;', ...definitions, ...inserts].join('\n'));
}
function fixtureDump(change = '') { const db = model(change); try { return dump(db); } finally { db.close(); } }

test('only the fixed repository/ref/attempt/SHA/action/account are admitted', () => {
  guard(approved(), sha);
  for (const [key, value] of Object.entries({ GITHUB_EVENT_NAME: 'push', GITHUB_REPOSITORY: 'other/repo', GITHUB_REF: 'refs/heads/master',
    GITHUB_RUN_ATTEMPT: '2', GITHUB_SHA: '0'.repeat(40), DRILL_EXPECTED_SHA: 'bad', DRILL_ACTION: 'none', DRILL_CONFIRMATION: '', CLOUDFLARE_ACCOUNT_ID: 'other', CLOUDFLARE_API_TOKEN: '' })) {
    assert.throws(() => guard({ ...approved(), [key]: value }, sha), undefined, key);
  }
  assert.throws(() => guard(approved(), '0'.repeat(40)), /SHA mismatch/);
  const bindings = config().d1_databases;
  assert.deepEqual(bindings.map((b) => b.database_id), [SCOPE.source.database_id, SCOPE.target.database_id]);
  assert.equal(JSON.stringify(config()).includes('8df484ca-625f-4250-be9a-3c09279ebdde'), false);
});
test('full dump with quoted identifiers, exact schema and sequence validates', () => {
  assert.match(validateDump(fixtureDump()), /^[a-f0-9]{64}$/);
  assert.equal(expected().leads.length, 2); assert.equal(expected().events.length, 2);
  assert.deepEqual(expected().sequence, [{ name: 'lead_events', seq: 2 }]);
});
test('actual Wrangler 4.148.0 local export remains accepted with its original LF checksum', () => {
  const bytes = Buffer.from(readFileSync(new URL('../fixtures/d1-recovery/05-wrangler-local-export.sql', import.meta.url), 'utf8').replaceAll('\r\n', '\n'));
  assert.equal(validateDump(bytes), '9da114e8565f883d3c0d4869a8851a3bfb1ae177e01b8e263553732d44a8ffb4');
});
test('all fields and sequence are checked beyond the eight baseline checks', () => {
  for (const change of ["UPDATE leads SET topic='unexpected' WHERE name LIKE '% A'", "UPDATE sqlite_sequence SET seq=99 WHERE name='lead_events'"]) {
    const db = model(change);
    try { assert.equal(snapshot(db).checks.every((r) => r.passed === 1), true); assert.throws(() => validateDump(dump(db)), /complete schema\/rows\/events\/sequence/); }
    finally { db.close(); }
  }
  assert.throws(() => validateDump(fixtureDump("UPDATE lead_events SET meta='{}' WHERE id=2")), /mismatch/);
});
test('unknown schema, unrelated records, missing data and SQL side effects are refused', () => {
  for (const change of ['CREATE INDEX unexpected_index ON leads(topic)', 'DROP INDEX idx_leads_status; CREATE INDEX idx_leads_status ON leads(name)', 'DELETE FROM lead_events WHERE id=2']) {
    assert.throws(() => validateDump(fixtureDump(change)));
  }
  for (const suffix of ["ATTACH DATABASE '/tmp/forbidden' AS other;", "PRAGMA writable_schema=ON;", "SELECT load_extension('bad');", "INSERT INTO leads SELECT * FROM leads;", "CREATE TRIGGER bad AFTER INSERT ON leads BEGIN DELETE FROM lead_events; END;"]) {
    assert.throws(() => validateDump(Buffer.concat([fixtureDump(), Buffer.from(suffix)])));
  }
  assert.throws(() => validateDump(Buffer.from('CREATE TABLE leads (id TEXT);')), /unexpected schema/);
  assert.throws(() => validateDump(Buffer.from('PRAGMA defer_foreign_keys=TRUE')), /terminated/);
  assert.equal(tokens("SELECT 'a;''b--c/*d*/';").filter((t) => t.kind === 'string')[0].value, "a;'b--c/*d*/");
});

function fakeRun({ importFailure = false, invalidExport = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'bfl-d1-test-')); const output = join(dir, 'outputs'); writeFileSync(output, '');
  const db = model(); const rawSchema = db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_schema ORDER BY type,name").all();
  const full = snapshot(db); const sqlDump = dump(db); db.close();
  let imports = 0; const calls = [];
  const invoke = (_program, args, options) => {
    calls.push(args);
    if (args[0] === 'rev-parse') return { status: 0, stdout: `${sha}\n` };
    const command = args.slice(1); const binding = command[2];
    assert.equal(options.cwd.startsWith(dir), true);
    assert.equal(options.env.WRANGLER_LOG, 'log', 'requested Wrangler JSON must remain enabled and privately captured');
    const isolated = JSON.parse(readFileSync(command.at(-1), 'utf8')); assert.deepEqual(isolated, config());
    if (command[1] === 'info') { const selected = binding === SCOPE.source.binding ? SCOPE.source : SCOPE.target; return { status: 0, stdout: JSON.stringify({ uuid: selected.database_id, name: selected.database_name }) }; }
    if (command[1] === 'export') { writeFileSync(command[command.indexOf('--output') + 1], invalidExport ? Buffer.concat([sqlDump, Buffer.from('ATTACH DATABASE :memory: AS other;')]) : sqlDump); return { status: 0, stdout: '' }; }
    if (command.includes('--file')) {
      imports++; assert.equal(binding, SCOPE.target.binding);
      assert.deepEqual(readFileSync(command[command.indexOf('--file') + 1]), sqlDump);
      return importFailure ? { status: 1, stdout: '', stderr: 'Authentication error [code: 10000] secret-marker' } : { status: 0, stdout: JSON.stringify([{ results: [], success: true, finalBookmark: 'synthetic-bookmark', meta: {} }]) };
    }
    assert.equal(command[1], 'execute');
    const sql = command[command.indexOf('--command') + 1];
    const rows = sql.includes('SELECT * FROM leads') ? [rawSchema, full.leads, full.events, full.sequence, full.checks] : [[]];
    return { status: 0, stdout: JSON.stringify(rows.map((results) => ({ success: true, results }))) };
  };
  let error;
  try { runDrill({ env: { ...approved(), RUNNER_TEMP: dir, GITHUB_RUN_ID: 'offline-test', GITHUB_OUTPUT: output }, invoke }); } catch (caught) { error = caught; }
  return { imports, calls, error, outputs: readFileSync(output, 'utf8'), files: join(dir, 'bfl-d1-proof-offline-test') };
}
test('orchestration imports exactly once and publishes only the three approved artifacts', () => {
  const result = fakeRun(); assert.equal(result.error, undefined); assert.equal(result.imports, 1);
  assert.deepEqual(readdirSync(result.files).sort(), ['proof.json', 'synthetic.sql', 'synthetic.sql.sha256']);
  const proof = JSON.parse(readFileSync(join(result.files, 'proof.json'), 'utf8'));
  assert.equal(proof.status, 'passed'); assert.equal(proof.import_attempted, true);
  assert.equal(JSON.stringify(proof).includes('example.invalid'), false);
});
test('invalid export never imports or enables artifact upload', () => {
  const result = fakeRun({ invalidExport: true }); assert.ok(result.error); assert.equal(result.imports, 0); assert.equal(result.outputs, '');
  assert.deepEqual(readdirSync(result.files), []);
});
test('ambiguous/authentication import failure stops after one attempt without raw diagnostics', () => {
  const result = fakeRun({ importFailure: true }); assert.equal(result.imports, 1);
  assert.match(result.error.message, /authentication\/permission failure/); assert.equal(result.error.message.includes('secret-marker'), false);
  const proof = JSON.parse(readFileSync(join(result.files, 'proof.json'), 'utf8'));
  assert.equal(proof.status, 'stopped'); assert.equal(proof.stage, 'import'); assert.equal(proof.import_attempted, true);
  assert.equal(result.calls.filter((args) => args.includes('--file')).length, 1);
});
