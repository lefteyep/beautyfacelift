import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

export function rootFromArgs(args = process.argv.slice(2)) {
  if (args.length === 0) return process.cwd();
  if (args.length === 2 && args[0] === '--root') return path.resolve(args[1]);
  throw new Error('Usage: node scripts/validate*.mjs [--root /absolute/worktree]');
}

export function npmInvocation(args) {
  // npm_execpath avoids shell/.cmd quoting on Windows when invoked through npm run.
  const npmCli = process.env.npm_execpath;
  if (npmCli?.endsWith('.js')) return [process.execPath, [npmCli, ...args]];
  if (process.platform === 'win32') {
    const installedCli = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
    if (existsSync(installedCli)) return [process.execPath, [installedCli, ...args]];
    throw new Error('Run this validation through npm run on Windows so npm_execpath is available.');
  }
  return ['npm', args];
}

export function validationPlan(root) {
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  const qa = Object.keys(pkg.scripts).filter((name) => name.startsWith('qa:') && name !== 'qa:worker').sort();
  const harnessDir = path.join(root, 'scripts/harness');
  const harnesses = existsSync(harnessDir)
    ? readdirSync(harnessDir).filter((name) => name.endsWith('.mts') && !name.endsWith('-server.mts')).sort()
    : [];
  return { qa, harnesses };
}

/** Execute without a shell; any failed assertion, signal or timeout fails the gate. */
export function runCommand(command, args, { cwd, env = process.env, capture = false, timeout = 300_000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, shell: false, stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
    let output = '';
    if (capture) {
      child.stdout.on('data', (chunk) => { output += chunk; });
      child.stderr.on('data', (chunk) => { output += chunk; });
    }
    const timer = setTimeout(() => child.kill('SIGTERM'), timeout);
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('close', (code, signal) => {
      clearTimeout(timer);
      const result = { code, signal, output };
      if (code !== 0) {
        const error = new Error(`${path.basename(command)} ${args.join(' ')} failed (${signal ?? `exit ${code}`})`);
        Object.assign(error, result);
        reject(error);
      } else resolve(result);
    });
  });
}

export async function runNpm(args, options) {
  const [command, argv] = npmInvocation(args);
  return runCommand(command, argv, options);
}

export async function expectAssertionFailure(command, args, options) {
  try {
    await runCommand(command, args, { ...options, capture: true });
  } catch (error) {
    if (error.code === 1 && /(?:FAIL|\[fail\]|not ok)/i.test(error.output ?? '')) return;
    throw new Error(`Calibration did not fail through an assertion: ${error.output ?? error.message}`);
  }
  throw new Error(`Calibration unexpectedly passed: ${args.join(' ')}`);
}

export const localEnv = (extra = {}) => ({
  ...process.env,
  // The behavior harness owns outbound fetch. Do not let live API settings enter its environment.
  PUBLIC_SUPABASE_URL: '', PUBLIC_SUPABASE_ANON_KEY: '', SUPABASE_SERVICE_ROLE_KEY: '',
  RESEND_API_KEY: '', META_ACCESS_TOKEN: '', GA4_API_SECRET: '', TURNSTILE_SECRET_KEY: '',
  CLOUDFLARE_API_TOKEN: '', CLOUDFLARE_ACCOUNT_ID: '', LEADS_SIGNING_SECRET: '',
  WRANGLER_SEND_METRICS: 'false',
  ...extra,
});
