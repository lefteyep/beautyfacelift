import path from 'node:path';
import { rootFromArgs, runCommand, runNpm, validationPlan } from './lib/validation.mjs';
import { validateHarnesses } from './validate-harnesses.mjs';
import { validateLocalSmoke } from './validate-local-smoke.mjs';

try {
  const root = rootFromArgs();
  const options = { cwd: root };
  console.log(`[validate] checkout: ${root}`);
  for (const script of ['check', 'build']) await runNpm(['run', script], options);
  await runNpm(['audit', '--audit-level=moderate'], options);
  for (const script of validationPlan(root).qa) await runNpm(['run', script], options);
  await validateHarnesses(root);
  await runCommand(process.execPath, [path.join(root, 'scripts/seo-plan-smoke.mjs')], options);
  await runNpm(['run', 'launch:check'], options);
  await runNpm(['exec', '--', 'wrangler', 'deploy', '--dry-run'], {
    ...options, env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
  });
  await validateLocalSmoke(root);
  console.log('\n[ok] validation passed (local API behavior used blocked/stubbed outbound services)');
} catch (error) {
  console.error('[fail] Validation stopped:', error.message);
  process.exitCode = 1;
}
