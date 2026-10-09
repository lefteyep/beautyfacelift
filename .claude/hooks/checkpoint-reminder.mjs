#!/usr/bin/env node
// Claude Code PostToolUse hook: remind Claude to checkpoint during long tasks.
// See AGENTS.md, "Working Protocol / Save as you go", and lib/git-state.mjs for how this
// session's work is told apart from somebody else's.
//
// Runs after every Edit/Write/Bash call. Once *this session's* work has been uncommitted or
// unpushed for more than REMIND_AFTER_MS, it adds a reminder to Claude's context with the same
// instructions the Stop hook gives (stage own files, hunk-by-hunk for mixed files, push only when
// no foreign commits would ride along). Then it stays quiet for another REMIND_AFTER_MS.
// State lives in .git/claude-checkpoint-<session_id>.json (never tracked).
//
// This covers the gap the Stop hook cannot: a turn that is interrupted, hits a rate limit or
// fails never reaches the Stop hook. Fails open: any error -> exit 0 silently.

import fs from 'node:fs';
import { readInput, openRepo, assess, summarize, advice, checkpointFile, readJson } from './lib/git-state.mjs';

const REMIND_AFTER_MS = 10 * 60 * 1000;

const input = readInput();
try {
  const repo = openRepo(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
  const a = assess(repo, input.session_id);
  const stateFile = checkpointFile(repo, input.session_id);

  if (!a.needsSaving) {
    try {
      fs.unlinkSync(stateFile);
    } catch {
      /* nothing to reset */
    }
    process.exit(0);
  }

  const now = Date.now();
  const state = readJson(stateFile) || {};
  if (!state.firstUnsavedAt) {
    fs.writeFileSync(stateFile, JSON.stringify({ firstUnsavedAt: now }));
    process.exit(0);
  }
  if (now - Math.max(state.firstUnsavedAt, state.lastReminderAt || 0) < REMIND_AFTER_MS) process.exit(0);
  fs.writeFileSync(stateFile, JSON.stringify({ ...state, lastReminderAt: now }));

  const additionalContext =
    `Checkpoint reminder (AGENTS.md Working Protocol): for more than ten minutes there have been ${summarize(a).join('; ')}. ` +
    `${advice(a)} This keeps the work safe if this session is cut off.`;

  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext } }));
} catch {
  /* fail open */
}
process.exit(0);
