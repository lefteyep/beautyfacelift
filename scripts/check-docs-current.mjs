import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const activeFiles = [
  'README.md',
  'AGENTS.md',
  'docs/README.md',
  'docs/current/ARCHITECTURE.md',
  'docs/current/CODEX-START.md',
  'docs/current/DESIGN-SYSTEM.md',
  'docs/current/HANDOVER-2026-10-21.md',
  'docs/current/LEAD-COCKPIT-PLAN.md',
  'docs/current/DOMAIN-LAUNCH.md',
  'docs/current/PPC-TRACKING.md',
  'docs/current/SECURITY.md',
  'docs/current/SETUP.md',
  'docs/current/SITEMAP.md',
  'docs/current/STATUS.md',
  'docs/current/TODO.md',
];

const forbidden = [
  {
    pattern: /live Worker URL is `https:\/\/beautyfacelift\.mediapaulo\.workers\.dev\/`/i,
    reason: 'workers.dev must not be described as the live production URL',
  },
  {
    pattern: /beautyfacelift\.pages\.dev/i,
    reason: 'Pages host is historical and should not appear in active docs',
  },
  {
    pattern: /currently live at beautyfacelift\.pages\.dev/i,
    reason: 'old Pages-era deployment text is stale',
  },
  {
    pattern: /BookingWidget.*active public booking path/i,
    reason: 'BookingWidget is legacy while Treatwell is active',
  },
];

let failed = false;

for (const file of activeFiles) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    console.error(`[missing] ${file}`);
    failed = true;
    continue;
  }

  const text = fs.readFileSync(absolute, 'utf8');
  for (const rule of forbidden) {
    if (rule.pattern.test(text)) {
      console.error(`[stale] ${file}: ${rule.reason}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log('[ok] current docs do not contain known stale deployment claims');
