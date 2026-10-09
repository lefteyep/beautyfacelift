// Shared helpers for the Claude Code hooks in this folder.
//
// The hooks must only ever ask Claude to save work made in the *current* session. A snapshot of
// the working tree is taken when the session starts (session-baseline.mjs): the uncommitted files
// with a content hash each, and the exact ids of the commits that were not pushed yet. Against
// that snapshot every piece of unsaved work falls into one of these groups:
//
//   own      a file that was clean at session start and is dirty now: this session's work
//   mixed    a file that was already dirty at session start and changed again since: it holds
//            somebody else's edits AND this session's; it must be staged hunk by hunk or left
//   foreign  a file that is byte-for-byte as it was at session start: not this session's work
//   own / foreign unpushed commits, told apart by commit id, not by time
//
// The classification is a best guess. The messages say so and tell Claude to look at
// `git status` and `git diff` before staging. Without a snapshot everything counts as own and
// the message says it cannot tell.
//
// All git calls use argument arrays (no shell quoting) and run from the repository root, because
// `git status --porcelain` prints paths relative to the root regardless of the current directory.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Personal, machine-specific files that never count as work to publish.
export const IGNORED_PATHS = ['.claude/settings.local.json'];

export function readInput() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

export function openRepo(startDir) {
  const run = (args, cwd) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const root = run(['rev-parse', '--show-toplevel'], startDir).trim();
  const git = (args) => run(args, root).trim(); // single values: hashes, names, counts
  const gitRaw = (args) => run(args, root); // line-oriented output: never trim, see dirtyEntries
  const gitDir = path.resolve(root, git(['rev-parse', '--git-dir']));
  return { root, git, gitRaw, gitDir };
}

// Porcelain v1 lines look like "XY path" or "XY old -> new". The first column may be a space,
// so the output must not be trimmed before slicing.
export function dirtyEntries(repo) {
  return repo
    .gitRaw(['status', '--porcelain=v1', '--untracked-files=all'])
    .split(/\r?\n/)
    .filter((line) => line.length > 3)
    .map((line) => {
      let p = line.slice(3);
      const arrow = p.indexOf(' -> ');
      if (arrow !== -1) p = p.slice(arrow + 4);
      if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
      return { code: line.slice(0, 2), path: p };
    })
    .filter((e) => !IGNORED_PATHS.includes(e.path));
}

export function hashPath(repo, p) {
  const abs = path.join(repo.root, p);
  try {
    if (!fs.existsSync(abs)) return 'deleted';
    if (fs.statSync(abs).isDirectory()) return 'dir';
    return repo.git(['hash-object', '--', p]);
  } catch {
    return 'unreadable';
  }
}

// Ids of the commits that are not on the remote yet, newest first.
export function unpushedShas(repo) {
  const read = (range) =>
    repo
      .gitRaw(['rev-list', ...range])
      .split(/\r?\n/)
      .filter(Boolean);
  try {
    return read(['@{upstream}..HEAD']);
  } catch {
    try {
      return read(['HEAD', '--not', '--remotes']);
    } catch {
      return [];
    }
  }
}

export function currentBranch(repo) {
  return repo.git(['rev-parse', '--abbrev-ref', 'HEAD']);
}

function safeId(sessionId) {
  return String(sessionId || 'unknown').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64) || 'unknown';
}

export const baselineFile = (repo, id) => path.join(repo.gitDir, `claude-session-${safeId(id)}.json`);
export const checkpointFile = (repo, id) => path.join(repo.gitDir, `claude-checkpoint-${safeId(id)}.json`);
export const flagsFile = (repo, id) => path.join(repo.gitDir, `claude-flags-${safeId(id)}.json`);

export function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

export function loadBaseline(repo, sessionId) {
  return readJson(baselineFile(repo, sessionId));
}

export function writeBaseline(repo, sessionId) {
  const dirty = {};
  for (const e of dirtyEntries(repo)) dirty[e.path] = hashPath(repo, e.path);
  const data = {
    createdAt: Date.now(),
    head: repo.git(['rev-parse', 'HEAD']),
    branch: currentBranch(repo),
    unpushed: unpushedShas(repo),
    dirty,
  };
  fs.writeFileSync(baselineFile(repo, sessionId), JSON.stringify(data));
  return data;
}

// Remove snapshot, checkpoint and flag files from sessions older than a week.
export function pruneSessionFiles(repo, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  const now = Date.now();
  for (const name of fs.readdirSync(repo.gitDir)) {
    if (!/^claude-(session|checkpoint|flags)-.*\.json$/.test(name)) continue;
    const file = path.join(repo.gitDir, name);
    try {
      if (now - fs.statSync(file).mtimeMs > maxAgeMs) fs.unlinkSync(file);
    } catch {
      /* ignore */
    }
  }
}

export function assess(repo, sessionId) {
  const baseline = loadBaseline(repo, sessionId);
  const ownDirty = [];
  const mixedDirty = [];
  const foreignDirty = [];
  for (const e of dirtyEntries(repo)) {
    if (!baseline) {
      ownDirty.push(e.path);
      continue;
    }
    const before = baseline.dirty?.[e.path];
    if (before === undefined) ownDirty.push(e.path);
    else if (hashPath(repo, e.path) !== before) mixedDirty.push(e.path);
    else foreignDirty.push(e.path);
  }

  const known = new Set(baseline?.unpushed || []);
  const ownUnpushed = [];
  const foreignUnpushed = [];
  for (const sha of unpushedShas(repo)) {
    if (!baseline || !known.has(sha)) ownUnpushed.push(sha);
    else foreignUnpushed.push(sha);
  }

  return {
    branch: currentBranch(repo),
    hasBaseline: Boolean(baseline),
    ownDirty,
    mixedDirty,
    foreignDirty,
    ownUnpushed,
    foreignUnpushed,
    // Is there anything this session must still save?
    needsSaving: ownDirty.length > 0 || mixedDirty.length > 0 || ownUnpushed.length > 0,
    // Would a push publish commits that are not this session's?
    pushBlocked: foreignUnpushed.length > 0,
  };
}

export function listSome(paths, max = 6) {
  const shown = paths.slice(0, max).join(', ');
  return paths.length > max ? `${shown} and ${paths.length - max} more` : shown;
}

// What was found, as short phrases.
export function summarize(a) {
  const found = [];
  if (a.ownDirty.length > 0) found.push(`files from this session not committed: ${listSome(a.ownDirty)}`);
  if (a.mixedDirty.length > 0)
    found.push(`files holding both pre-existing edits and this session's: ${listSome(a.mixedDirty)}`);
  if (a.ownUnpushed.length > 0) found.push(`${a.ownUnpushed.length} commit(s) from this session not pushed`);
  return found;
}

// What to do about it, as one paragraph. Honest about uncertainty, never contradictory.
export function advice(a) {
  const steps = [];
  const target = a.branch === 'master' ? '<branch>' : a.branch;

  if (!a.hasBaseline) {
    steps.push(
      'No session snapshot exists, so this may include changes that were already there before this session; ' +
        'if any of them are not yours, do not commit them, say so, and stop.',
    );
  }
  if (a.branch === 'master') {
    steps.push('You are on master. Create a task branch first: `git switch -c claude/<short-task-name>`.');
  }
  if (a.ownDirty.length > 0 || a.mixedDirty.length > 0) {
    steps.push(
      'Check `git status` and `git diff` yourself before staging; the lists above are a best guess from the session snapshot.',
    );
    if (a.ownDirty.length > 0) {
      steps.push(
        'Stage your files one by one (`git add <file>`, never `git add -A`) and commit; prefix the message with "WIP:" if the step is unfinished.',
      );
    }
    if (a.mixedDirty.length > 0) {
      steps.push(
        `For ${listSome(a.mixedDirty)}: stage only your own hunks (\`git add -p <file>\`) or ask the user; do not commit the pre-existing edits.`,
      );
    }
  }
  if (a.pushBlocked) {
    steps.push(
      `Do NOT push: this branch carries ${a.foreignUnpushed.length} older commit(s) not made in this session, and a push would publish them too. Tell the user and ask before pushing.`,
    );
  } else {
    steps.push(
      `Then \`git push -u origin ${target}\` and update the Done / Left to do checklist in the pull request, or open a draft pull request if none exists yet.`,
    );
  }
  if (a.foreignDirty.length > 0) {
    steps.push(
      `Leave alone (already there when this session started, not yours): ${listSome(a.foreignDirty)}. Do not commit it; mention it to the user.`,
    );
  }
  return steps.join(' ');
}
