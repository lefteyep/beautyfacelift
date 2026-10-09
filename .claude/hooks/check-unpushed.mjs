#!/usr/bin/env node
// Claude Code Stop hook: refuse to end a turn while work is uncommitted or unpushed.
// See AGENTS.md, "Working Protocol / Save as you go".
//
// Limits: the Stop hook only runs when Claude ends a turn normally. A turn that is interrupted
// by the user, hits a rate limit or fails with an error never reaches it. The checkpoint hook
// (checkpoint-reminder.mjs) covers long turns; the habit of pushing after every step covers the rest.
//
// Behaviour:
// - Clean tree and nothing to push        -> exit 0, Claude stops normally.
// - Uncommitted or unpushed work          -> prints {"decision":"block","reason":...}, Claude
//                                           is told to commit, push and update the PR checklist.
// - Second attempt (stop_hook_active)     -> exit 0, so Claude can explain instead of looping.
// - Any error (no git, not a repo, ...)   -> exit 0 silently. The hook fails open; it never
//                                           blocks the user because of tooling trouble.

import fs from 'node:fs';
import { execSync } from 'node:child_process';

// Personal, machine-specific file; Claude Code rewrites it on every permission grant.
const IGNORED_PATHS = ['.claude/settings.local.json'];

let input = {};
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  input = {};
}

if (input.stop_hook_active) process.exit(0);

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const git = (args) =>
  execSync(`git ${args}`, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

let branch = '';
let dirty = false;
let unpushed = false;

try {
  git('rev-parse --is-inside-work-tree');
  branch = git('rev-parse --abbrev-ref HEAD');

  const statusLines = git('status --porcelain --untracked-files=normal')
    .split('\n')
    .filter(Boolean)
    .filter((line) => !IGNORED_PATHS.some((p) => line.slice(3).startsWith(p)));
  dirty = statusLines.length > 0;

  let ahead = 0;
  try {
    ahead = Number(git('rev-list --count @{upstream}..HEAD'));
  } catch {
    // No upstream yet: count commits that exist on no remote branch at all.
    ahead = Number(git('rev-list --count HEAD --not --remotes'));
  }
  unpushed = Number.isFinite(ahead) && ahead > 0;
} catch {
  process.exit(0);
}

if (!dirty && !unpushed) process.exit(0);

const problems = [];
if (dirty) problems.push('uncommitted changes (see git status)');
if (unpushed) problems.push('commits not yet pushed to origin');

const advice =
  branch === 'master'
    ? 'You are on master. Do not commit here: create a task branch with `git switch -c claude/<short-task-name>`, commit there, then `git push -u origin <branch>`.'
    : `Commit now (prefix the message with "WIP:" if the step is unfinished), then run \`git push -u origin ${branch}\`. Then update the Done / Left to do checklist in the pull request, or open a draft pull request if none exists yet.`;

const reason =
  `AGENTS.md Working Protocol: never end a turn with unsaved work. Found: ${problems.join(' and ')}. ` +
  `${advice} If the user explicitly told you not to commit or push, say so in one line and stop.`;

process.stdout.write(JSON.stringify({ decision: 'block', reason }));
process.exit(0);
