#!/usr/bin/env node
// Claude Code Stop hook: refuse to end a turn while *this session's* work is uncommitted or
// unpushed. See AGENTS.md, "Working Protocol / Save as you go", and lib/git-state.mjs for how
// this session's work is told apart from somebody else's.
//
// Behaviour:
// - Nothing of this session's is unsaved      -> exit 0. Pre-existing work is never flagged.
// - This session left work unsaved           -> {"decision":"block","reason":...} with precise,
//                                               non-contradictory instructions: what to stage,
//                                               what to stage hunk by hunk, whether a push is
//                                               allowed, what to leave alone.
// - Only unpushed commits remain and a push  -> block once per session (so the user gets asked),
//   would also publish somebody else's          then stay silent; the decision is the user's.
// - Second attempt (stop_hook_active)        -> exit 0, so Claude can explain instead of looping.
// - Any error (no git, not a repo, ...)      -> exit 0 silently. The hook fails open.
//
// Limits: the Stop hook only runs when Claude ends a turn normally. A turn that is interrupted by
// the user, hits a rate limit or fails with an error never reaches it. checkpoint-reminder.mjs
// covers long turns; the habit of pushing after every step covers the rest.

import fs from 'node:fs';
import { readInput, openRepo, assess, summarize, advice, flagsFile, readJson } from './lib/git-state.mjs';

const input = readInput();
if (input.stop_hook_active) process.exit(0);

let a;
let flagsPath;
try {
  const repo = openRepo(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
  a = assess(repo, input.session_id);
  flagsPath = flagsFile(repo, input.session_id);
} catch {
  process.exit(0);
}

if (!a.needsSaving) process.exit(0);

// Nothing left to commit, but the push needs the user's decision: ask once, then stay quiet.
if (a.ownDirty.length === 0 && a.mixedDirty.length === 0 && a.pushBlocked) {
  const flags = readJson(flagsPath) || {};
  if (flags.pushBlockedReported) process.exit(0);
  try {
    fs.writeFileSync(flagsPath, JSON.stringify({ ...flags, pushBlockedReported: true }));
  } catch {
    /* ignore */
  }
}

const reason =
  `AGENTS.md Working Protocol: never end a turn with this session's work unsaved. Found: ${summarize(a).join('; ')}. ` +
  `${advice(a)} If the user explicitly told you not to commit or push, say so in one line and stop.`;

process.stdout.write(JSON.stringify({ decision: 'block', reason }));
process.exit(0);
