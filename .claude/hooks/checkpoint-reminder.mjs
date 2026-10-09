#!/usr/bin/env node
// Claude Code PostToolUse hook: remind Claude to checkpoint during long tasks.
// See AGENTS.md, "Working Protocol / Save as you go".
//
// Runs after every Edit/Write/Bash call. If the working tree has uncommitted changes or the
// branch has unpushed commits, and that has been true for more than REMIND_AFTER_MS, it adds a
// short reminder to Claude's context: commit (WIP if unfinished) and push now. It then stays
// quiet for another REMIND_AFTER_MS. State lives in .git/claude-checkpoint.json (never tracked).
//
// This covers the gap the Stop hook cannot: a turn that is interrupted, hits a rate limit or
// fails never reaches the Stop hook. Work that was pushed ten minutes ago survives that; work
// that was never pushed does not.
//
// Fails open: any error -> exit 0 silently.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const REMIND_AFTER_MS = 10 * 60 * 1000;
const IGNORED_PATHS = ['.claude/settings.local.json'];

try {
  fs.readFileSync(0, 'utf8'); // drain stdin; the payload is not needed
} catch {
  /* ignore */
}

const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const git = (args) =>
  execSync(`git ${args}`, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

try {
  const gitDir = path.resolve(cwd, git('rev-parse --git-dir'));
  const stateFile = path.join(gitDir, 'claude-checkpoint.json');
  const branch = git('rev-parse --abbrev-ref HEAD');

  const dirty =
    git('status --porcelain --untracked-files=normal')
      .split('\n')
      .filter(Boolean)
      .filter((line) => !IGNORED_PATHS.some((p) => line.slice(3).startsWith(p))).length > 0;

  let ahead = 0;
  try {
    ahead = Number(git('rev-list --count @{upstream}..HEAD'));
  } catch {
    ahead = Number(git('rev-list --count HEAD --not --remotes'));
  }
  const unpushed = Number.isFinite(ahead) && ahead > 0;

  if (!dirty && !unpushed) {
    try { fs.unlinkSync(stateFile); } catch { /* nothing to reset */ }
    process.exit(0);
  }

  const now = Date.now();
  let state = {};
  try { state = JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { state = {}; }

  if (!state.firstUnsavedAt) {
    fs.writeFileSync(stateFile, JSON.stringify({ firstUnsavedAt: now }));
    process.exit(0);
  }

  const since = now - Math.max(state.firstUnsavedAt, state.lastReminderAt || 0);
  if (since < REMIND_AFTER_MS) process.exit(0);

  fs.writeFileSync(stateFile, JSON.stringify({ ...state, lastReminderAt: now }));

  const what = [dirty && 'uncommitted changes', unpushed && 'unpushed commits'].filter(Boolean).join(' and ');
  const action =
    branch === 'master'
      ? 'You are on master: create a task branch first (`git switch -c claude/<short-task-name>`), then commit and push there.'
      : `Commit now (prefix "WIP:" if the step is unfinished) and run \`git push -u origin ${branch}\`, then update the pull request checklist and continue.`;

  const additionalContext =
    `Checkpoint reminder (AGENTS.md Working Protocol): there have been ${what} for more than ten minutes. ` +
    `${action} This keeps the work safe if this session is cut off.`;

  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext } }),
  );
  process.exit(0);
} catch {
  process.exit(0);
}
