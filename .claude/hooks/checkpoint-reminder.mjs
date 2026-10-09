#!/usr/bin/env node
// Claude Code PostToolUse hook: remind Claude to checkpoint during long tasks.
// See AGENTS.md, "Working Protocol / Save as you go".
//
// Runs after every Edit/Write/Bash call. If *this session's* work has been uncommitted or
// unpushed for more than REMIND_AFTER_MS, it adds a short reminder to Claude's context: commit
// (WIP if unfinished) and push now. Then it stays quiet for another REMIND_AFTER_MS.
// Pre-existing changes by somebody else (see session-baseline.mjs) never trigger it.
// State lives in .git/claude-checkpoint-<session_id>.json (never tracked).
//
// This covers the gap the Stop hook cannot: a turn that is interrupted, hits a rate limit or
// fails never reaches the Stop hook. Work pushed ten minutes ago survives that; work that was
// never pushed does not. Fails open: any error -> exit 0 silently.

import fs from 'node:fs';
import { readInput, openRepo, assess, checkpointFile, listSome, saveAdvice, foreignNote } from './lib/git-state.mjs';

const REMIND_AFTER_MS = 10 * 60 * 1000;

const input = readInput();
try {
  const repo = openRepo(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
  const a = assess(repo, input.session_id);
  const stateFile = checkpointFile(repo, input.session_id);

  if (a.ownDirty.length === 0 && a.ownUnpushed === 0) {
    try {
      fs.unlinkSync(stateFile);
    } catch {
      /* nothing to reset */
    }
    process.exit(0);
  }

  const now = Date.now();
  let state = {};
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    state = {};
  }
  if (!state.firstUnsavedAt) {
    fs.writeFileSync(stateFile, JSON.stringify({ firstUnsavedAt: now }));
    process.exit(0);
  }
  if (now - Math.max(state.firstUnsavedAt, state.lastReminderAt || 0) < REMIND_AFTER_MS) process.exit(0);
  fs.writeFileSync(stateFile, JSON.stringify({ ...state, lastReminderAt: now }));

  const what = [];
  if (a.ownDirty.length > 0) what.push(`uncommitted changes in ${listSome(a.ownDirty)}`);
  if (a.ownUnpushed > 0) what.push(`${a.ownUnpushed} unpushed commit(s)`);

  const additionalContext =
    `Checkpoint reminder (AGENTS.md Working Protocol): this session has had ${what.join(' and ')} for more than ten minutes. ` +
    `${saveAdvice(a)}${foreignNote(a)} This keeps the work safe if this session is cut off.`;

  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext } }));
} catch {
  /* fail open */
}
process.exit(0);
