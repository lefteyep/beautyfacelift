// One isolated, manually dispatched synthetic drill. No deployment, setup, seed or reset.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { appendFileSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { isDeepStrictEqual } from 'node:util';

export const SCOPE = Object.freeze({
  repository: 'lefteyep/beautyfacelift', ref: 'refs/heads/codex/d1-cloud-drill',
  account: 'ee2019b3b7bc0527ffa154de4d2349ca', confirmation: 'BFL-OPS-RECOVERY-04',
  source: { binding: 'DRILL_SOURCE', database_name: 'beautyfacelift-drill-2026-10-21', database_id: 'bf332224-68d3-42c8-be6c-20da9ba9cf4d' },
  target: { binding: 'DRILL_TARGET', database_name: 'beautyfacelift-drill-restore-2026-10-21', database_id: 'f4f0e5aa-01fe-4a80-922d-958ee3493703' },
});
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const fixture = (name) => readFileSync(join(ROOT, 'scripts/fixtures/d1-recovery', name), 'utf8');
const migration = () => readFileSync(join(ROOT, 'worker/migrations/0001_leads.sql'), 'utf8');
const baseline = () => fixture('03-verify-baseline.sql');
const plain = (value) => JSON.parse(JSON.stringify(value));
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const demand = (condition, label) => { if (!condition) throw new Error(label); };

export function guard(env, head) {
  demand(env.GITHUB_EVENT_NAME === 'workflow_dispatch', 'manual dispatch required');
  demand(env.GITHUB_REPOSITORY === SCOPE.repository && env.GITHUB_REF === SCOPE.ref, 'wrong repository or branch');
  demand(env.GITHUB_RUN_ATTEMPT === '1', 'reruns forbidden; inspect prior outcome');
  demand(env.DRILL_ACTION === 'synthetic-export-import' && env.DRILL_CONFIRMATION === SCOPE.confirmation, 'explicit drill inputs required');
  demand(/^[a-f0-9]{40}$/.test(env.DRILL_EXPECTED_SHA ?? '') && head === env.DRILL_EXPECTED_SHA && env.GITHUB_SHA === head, 'checkout / runtime / expected SHA mismatch');
  demand(env.CLOUDFLARE_ACCOUNT_ID === SCOPE.account && Boolean(env.CLOUDFLARE_API_TOKEN), 'existing approved account credentials required');
}

export function config() {
  return { name: 'beautyfacelift-isolated-d1-drill', account_id: SCOPE.account,
    compatibility_date: '2026-10-21', d1_databases: [SCOPE.source, SCOPE.target] };
}

// Deliberately small lexer: dumps may contain only exact schema and literal INSERTs.
// Quoted values/comments are handled before separators, so embedded SQL cannot escape.
export function tokens(sql) {
  const result = []; let i = 0;
  while (i < sql.length) {
    if (/\s/.test(sql[i])) { i++; continue; }
    if (sql.startsWith('--', i)) { const end = sql.indexOf('\n', i); i = end < 0 ? sql.length : end + 1; continue; }
    if (sql.startsWith('/*', i)) { const end = sql.indexOf('*/', i + 2); demand(end >= 0, 'unclosed SQL comment'); i = end + 2; continue; }
    const quote = sql[i];
    if (["'", '"', '`', '['].includes(quote)) {
      const endQuote = quote === '[' ? ']' : quote; let value = ''; let closed = false; i++;
      while (i < sql.length) {
        if (sql[i] === endQuote) {
          if (sql[i + 1] === endQuote && quote !== '[') { value += endQuote; i += 2; continue; }
          i++; closed = true; break;
        }
        value += sql[i++];
      }
      demand(closed, 'unclosed SQL quote');
      result.push({ kind: quote === "'" ? 'string' : 'word', value: quote === "'" ? value : value.toLowerCase() }); continue;
    }
    const word = /^[a-zA-Z_][a-zA-Z_0-9]*/.exec(sql.slice(i));
    if (word) { result.push({ kind: 'word', value: word[0].toLowerCase() }); i += word[0].length; continue; }
    const number = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(sql.slice(i));
    if (number) { result.push({ kind: 'number', value: number[0] }); i += number[0].length; continue; }
    demand('(),;='.includes(sql[i]), 'unsupported SQL token'); result.push({ kind: 'symbol', value: sql[i++] });
  }
  return result;
}
const canonical = (sql) => JSON.stringify(tokens(sql ?? '').filter((t) => t.value !== ';'));
const schemaSql = "SELECT type,name,tbl_name,sql FROM sqlite_schema WHERE name NOT GLOB '_cf_*' AND tbl_name NOT GLOB '_cf_*' ORDER BY type,name;";
const schema = (rows) => rows.map((row) => ({ ...row, sql: row.sql === null ? null : canonical(row.sql) }));

export function snapshot(db) {
  return plain({ schema: schema(db.prepare(schemaSql).all()),
    leads: db.prepare('SELECT * FROM leads ORDER BY id').all(),
    events: db.prepare('SELECT * FROM lead_events ORDER BY id').all(),
    sequence: db.prepare('SELECT name,seq FROM sqlite_sequence ORDER BY name').all(),
    checks: db.prepare(baseline()).all() });
}
export function expected() {
  const db = new DatabaseSync(':memory:');
  try { db.exec('PRAGMA foreign_keys=ON;'); db.exec(migration()); db.exec(fixture('01-seed.sql')); return snapshot(db); }
  finally { db.close(); }
}
export function compare(actual, wanted, label) {
  // Never put contact fields, SQL or failed row values in error output.
  demand(isDeepStrictEqual(actual, wanted), `${label}: complete schema/rows/events/sequence/baseline mismatch`);
  demand(actual.checks.length === 8 && actual.checks.every((row) => row.passed === 1), `${label}: baseline must pass 8/8`);
}

export function validateDump(bytes, wanted = expected()) {
  demand(bytes.length > 0 && bytes.length < 256_000, 'dump outside synthetic size limit');
  const sql = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const all = tokens(sql); const statements = []; let part = [];
  for (const token of all) { if (token.value === ';' && token.kind === 'symbol') { if (part.length) statements.push(part); part = []; } else part.push(token); }
  demand(part.length === 0 && statements.length > 0, 'dump must have terminated statements');
  const allowedSchema = new Set(wanted.schema.filter((r) => r.sql !== null && r.name !== 'sqlite_sequence').map((r) => r.sql));
  for (const statement of statements) {
    const values = statement.map((t) => t.value);
    if (values[0] === 'create') {
      // SQLite stores CREATE TABLE without IF NOT EXISTS; accept that exporter spelling.
      const normalized = [...statement];
      if (values.slice(2, 5).join(' ') === 'if not exists') normalized.splice(2, 3);
      demand(allowedSchema.has(JSON.stringify(normalized)), 'dump has unexpected schema'); continue;
    }
    if (values.join(' ') === 'pragma defer_foreign_keys = true' || values.join(' ') === 'pragma defer_foreign_keys = on' || values.join(' ') === 'pragma defer_foreign_keys = 1') continue;
    if (values.join(' ') === 'delete from sqlite_sequence') continue;
    demand(values[0] === 'insert' && values[1] === 'into' && ['leads', 'lead_events', 'sqlite_sequence'].includes(values[2]), 'dump has forbidden statement');
    let cursor = 3;
    if (values[cursor] === '(') { // optional explicit column list
      cursor++;
      do { demand(statement[cursor]?.kind === 'word', 'invalid INSERT column'); cursor++; if (values[cursor] !== ',') break; cursor++; } while (true);
      demand(values[cursor++] === ')', 'invalid INSERT columns');
    }
    demand(values[cursor++] === 'values', 'only literal INSERT VALUES permitted');
    do {
      demand(values[cursor++] === '(', 'invalid INSERT tuple');
      do {
        const token = statement[cursor++];
        demand(token && (['string', 'number'].includes(token.kind) || (token.kind === 'word' && token.value === 'null')), 'nonliteral INSERT value forbidden');
        if (values[cursor] !== ',') break; cursor++;
      } while (true);
      demand(values[cursor++] === ')', 'invalid INSERT tuple end');
      if (values[cursor] !== ',') break; cursor++;
    } while (true);
    demand(cursor === values.length, 'unexpected INSERT suffix');
  }
  const db = new DatabaseSync(':memory:');
  try { db.exec('PRAGMA foreign_keys=ON;'); db.exec(sql); compare(snapshot(db), wanted, 'offline dump'); }
  finally { db.close(); }
  return sha256(bytes);
}

export function runDrill({ env = process.env, invoke = spawnSync } = {}) {
  const head = invoke('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
  demand(head.status === 0, 'cannot confirm checkout commit'); guard(env, head.stdout.trim());
  const wanted = expected(); const work = mkdtempSync(join(env.RUNNER_TEMP || tmpdir(), 'bfl-d1-drill-'));
  const cfg = join(work, 'wrangler.json'); writeFileSync(cfg, JSON.stringify(config()));
  const cli = join(ROOT, 'node_modules/wrangler/bin/wrangler.js');
  demand(JSON.parse(readFileSync(join(ROOT, 'node_modules/wrangler/package.json'), 'utf8')).version === '4.148.0', 'reviewed Wrangler 4.148.0 required');
  const childEnv = Object.fromEntries(['PATH', 'HOME', 'USERPROFILE', 'SYSTEMROOT', 'TEMP', 'TMP'].filter((key) => env[key]).map((key) => [key, env[key]]));
  Object.assign(childEnv, { CI: 'true', CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ACCOUNT_ID: SCOPE.account, WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG: 'error' });
  const call = (args, label, json = false) => {
    const result = invoke(process.execPath, [cli, ...args, '--config', cfg], { cwd: work, env: childEnv, encoding: 'utf8', timeout: 120_000, maxBuffer: 2 * 1024 * 1024 });
    const diagnostic = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
    const category = /\b(10000|10001|authentication error|authorization error|not authorized|permission denied|not authenticated)\b/i.test(diagnostic)
      ? 'authentication/permission failure' : result.error?.code === 'ETIMEDOUT' ? 'timeout (outcome unconfirmed)' : 'failure or ambiguous outcome';
    demand(result.status === 0 && !result.error, `${label}: ${category}; STOP, preserve databases and inspect; do not retry`);
    if (!json) return;
    let data; try { data = JSON.parse(result.stdout); } catch { throw new Error(`${label}: ambiguous JSON; STOP without retry`); }
    return data;
  };
  const query = (db, sql, label) => {
    const result = call(['d1', 'execute', db.binding, '--remote', '--json', '--command', sql], label, true);
    demand(Array.isArray(result) && result.every((r) => r.success === true && Array.isArray(r.results)), `${label}: failed result`);
    return result.map((r) => r.results);
  };
  const remote = (db, label) => {
    const results = query(db, `${schemaSql}\nSELECT * FROM leads ORDER BY id; SELECT * FROM lead_events ORDER BY id; SELECT name,seq FROM sqlite_sequence ORDER BY name;\n${baseline()}`, label);
    demand(results.length === 5, `${label}: incomplete response`);
    return { schema: schema(results[0]), leads: results[1], events: results[2], sequence: results[3], checks: results[4] };
  };
  const empty = () => {
    const result = query(SCOPE.target, schemaSql, 'target empty-schema check');
    demand(result.length === 1 && result[0].length === 0, 'target is not pristine; STOP without modifying it');
  };
  const proof = { task: SCOPE.confirmation, repository: SCOPE.repository, ref: SCOPE.ref, sha: head.stdout.trim(),
    run_id: env.GITHUB_RUN_ID, attempt: 1, account: SCOPE.account, source: SCOPE.source, target: SCOPE.target,
    status: 'in_progress', stage: 'identity', import_attempted: false, checks: {} };
  const out = join(env.RUNNER_TEMP || tmpdir(), `bfl-d1-proof-${env.GITHUB_RUN_ID}`);
  mkdirSync(out); let validated = false;
  try {
    for (const db of [SCOPE.source, SCOPE.target]) {
      const info = call(['d1', 'info', db.binding, '--json'], 'database identity', true);
      demand(info.uuid === db.database_id && info.name === db.database_name, 'database name/ID mismatch');
    }
    proof.checks.identities = true; proof.stage = 'preflight';
    compare(remote(SCOPE.source, 'source preflight'), wanted, 'source preflight'); empty();
    proof.checks.source_before = '8/8 + full schema/rows/events/sequence'; proof.checks.target_before = 'empty';
    proof.stage = 'export'; const dump = join(work, 'synthetic.sql');
    call(['d1', 'export', SCOPE.source.binding, '--remote', '--output', dump, '--skip-confirmation'], 'source export');
    const bytes = readFileSync(dump); const hash = validateDump(bytes, wanted);
    proof.checks.offline_dump = '8/8 + full schema/rows/events/sequence'; proof.sha256 = hash;
    // Publishable SQL is copied only after its complete offline validation.
    copyFileSync(dump, join(out, 'synthetic.sql')); writeFileSync(join(out, 'synthetic.sql.sha256'), `${hash}  synthetic.sql\n`);
    validated = true;
    if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `export_validated=true\nartifact_path=${out}\n`);
    proof.stage = 'import-precheck'; empty();
    demand(sha256(readFileSync(dump)) === hash, 'export changed before import');
    proof.stage = 'import'; proof.import_attempted = true;
    const imported = call(['d1', 'execute', SCOPE.target.binding, '--remote', '--file', dump, '--yes', '--json'], 'single target import', true);
    demand(Array.isArray(imported) && imported.length === 1 && imported[0].success === true, 'import outcome ambiguous; STOP without retry');
    proof.stage = 'postflight';
    const sourceAfter = remote(SCOPE.source, 'source postflight'); const targetAfter = remote(SCOPE.target, 'target postflight');
    compare(sourceAfter, wanted, 'source postflight'); compare(targetAfter, wanted, 'target postflight');
    compare(targetAfter, sourceAfter, 'source/target comparison');
    demand(sha256(readFileSync(dump)) === hash && sha256(readFileSync(join(out, 'synthetic.sql'))) === hash, 'export changed after import');
    proof.checks.source_after = '8/8 + full schema/rows/events/sequence'; proof.checks.target_after = '8/8 + full schema/rows/events/sequence';
    proof.status = 'passed'; proof.stage = 'complete'; console.log('Synthetic D1 export/import passed; both databases preserved.');
  } catch (error) {
    proof.status = 'stopped'; console.error(`Drill stopped at ${proof.stage}; import attempted: ${proof.import_attempted}. Preserve both databases; no automatic retry.`);
    throw error;
  } finally {
    // Proof contains only fixed IDs, stage/status, hashes and check labels. No raw CLI output.
    if (validated) writeFileSync(join(out, 'proof.json'), `${JSON.stringify(proof, null, 2)}\n`);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { runDrill(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
