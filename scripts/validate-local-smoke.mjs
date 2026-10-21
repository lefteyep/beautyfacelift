import { spawn } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expectAssertionFailure, localEnv, rootFromArgs, runCommand } from './lib/validation.mjs';

async function withServer(root, calibration, work) {
  const server = spawn(process.execPath, ['--import', 'tsx', path.join(root, 'scripts/harness/worker-local-server.mts'), root, '0'], {
    cwd: root, env: localEnv({ BFL_HARNESS_CALIBRATION: calibration }), shell: false,
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });
  let logs = '';
  server.stdout.on('data', (chunk) => { logs += chunk; });
  server.stderr.on('data', (chunk) => { logs += chunk; });
  try {
    const baseUrl = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Local Worker did not start: ${logs}`)), 15_000);
      server.once('error', (error) => { clearTimeout(timer); reject(error); });
      server.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Local Worker exited ${code}: ${logs}`)); });
      server.once('message', (message) => {
        clearTimeout(timer);
        if (message?.type === 'ready' && /^http:\/\/127\.0\.0\.1:\d+$/.test(message.url)) resolve(message.url);
        else reject(new Error('Invalid local Worker readiness message.'));
      });
    });
    await work(baseUrl);
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      const exited = new Promise((resolve) => server.once('exit', resolve));
      server.kill('SIGTERM');
      const timer = setTimeout(() => server.kill('SIGKILL'), 3000);
      await exited;
      clearTimeout(timer);
    }
  }
}

export async function validateLocalSmoke(root) {
  const security = path.join(root, 'scripts/security-smoke.mjs');
  const worker = path.join(root, 'scripts/check-worker-api.mjs');
  await withServer(root, '', async (baseUrl) => {
    console.log(`\n[validate] offline security and Worker smoke at ${baseUrl}`);
    await runCommand(process.execPath, [security, '--base-url', baseUrl], { cwd: root, env: localEnv() });
    await runCommand(process.execPath, [worker], { cwd: root, env: localEnv({ BFL_WORKER_URL: baseUrl }) });
  });
  await withServer(root, 'security', async (baseUrl) => {
    await expectAssertionFailure(process.execPath, [security, '--base-url', baseUrl], { cwd: root, env: localEnv() });
  });
  console.log('[validate] security smoke calibration detected the broken response header');
  await withServer(root, 'worker', async (baseUrl) => {
    await expectAssertionFailure(process.execPath, [worker], { cwd: root, env: localEnv({ BFL_WORKER_URL: baseUrl }) });
  });
  console.log('[validate] Worker smoke calibration detected the broken booking page');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await validateLocalSmoke(rootFromArgs()); }
  catch (error) { console.error('[fail]', error.message); process.exitCode = 1; }
}
