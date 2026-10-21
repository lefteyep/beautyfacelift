import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { expectAssertionFailure, localEnv, rootFromArgs, runCommand, validationPlan } from './lib/validation.mjs';

export async function validateHarnesses(root) {
  const { harnesses } = validationPlan(root);
  if (harnesses.length === 0) throw new Error('No behavioral harnesses found.');
  for (const file of harnesses) {
    console.log(`\n[validate] behavioral harness: ${file}`);
    await runCommand(process.execPath, ['--import', 'tsx', path.join(root, 'scripts/harness', file), root], {
      cwd: root, env: localEnv(),
    });
  }
  // Negative controls exercise actual assertions and exit codes in the older harnesses.
  for (const [file, defect] of [['capi-harness.mts', 'capi'], ['cr3-harness.mts', 'cr3'], ['oldsite-harness.mts', 'oldsite']]) {
    const harness = path.join(root, 'scripts/harness', file);
    if (!existsSync(harness)) continue;
    await expectAssertionFailure(process.execPath, ['--import', 'tsx', harness, root], {
      cwd: root, env: localEnv({ BFL_HARNESS_CALIBRATION: defect }),
    });
    console.log(`[validate] calibration detected ${defect} defect`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await validateHarnesses(rootFromArgs()); }
  catch (error) { console.error('[fail]', error.message); process.exitCode = 1; }
}
