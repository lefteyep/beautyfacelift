import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parseJsonc } from './lib/jsonc.mjs';
import { expectAssertionFailure, runCommand, validationPlan } from './lib/validation.mjs';

test('launch config accepts JSONC and keeps URL and comment-like string values intact', () => {
  const parsed = parseJsonc(`{ // deployment comment\n "url": "https://example.test/a//b", /* binding */ "vars": { "note": "/*literal*/", }, }`);
  assert.equal(parsed.url, 'https://example.test/a//b');
  assert.equal(parsed.vars.note, '/*literal*/');
  assert.throws(() => parseJsonc('{ "vars": '), SyntaxError);
});

test('validation discovers cockpit harnesses while excluding long-running servers', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'bfl-guardrails-'));
  try {
    mkdirSync(path.join(root, 'scripts/harness'), { recursive: true });
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({ scripts: { 'qa:worker': 'local smoke', 'qa:leads': 'source contracts', 'qa:marketing': 'tracking' } }));
    for (const file of ['capi-harness.mts', 'leads-access.mts', 'leads-cron.mts', 'worker-local-server.mts', 'fake-d1.mjs']) {
      writeFileSync(path.join(root, 'scripts/harness', file), '');
    }
    assert.deepEqual(validationPlan(root), { qa: ['qa:leads', 'qa:marketing'], harnesses: ['capi-harness.mts', 'leads-access.mts', 'leads-cron.mts'] });
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('a failed command fails the gate and calibration rejects false-green or crashed controls', async () => {
  await assert.rejects(runCommand(process.execPath, ['-e', 'process.exit(7)'], { capture: true }), { code: 7 });
  await expectAssertionFailure(process.execPath, ['-e', 'console.error("FAIL planted defect"); process.exit(1)']);
  await assert.rejects(expectAssertionFailure(process.execPath, ['-e', 'process.exit(0)']), /unexpectedly passed/);
  await assert.rejects(expectAssertionFailure(process.execPath, ['-e', 'throw new Error("crash")']), /did not fail through an assertion/);
});
