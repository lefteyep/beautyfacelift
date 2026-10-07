import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildStartTarget,
  findOrphanWorktreeDirs,
  isStaleTempWorktree,
  parseWorktreePorcelain,
  sanitizeSlug,
} from "./agent-worktree.mjs";

test("sanitizeSlug creates a stable branch-safe task slug", () => {
  assert.equal(sanitizeSlug(" Test Isolation! "), "test-isolation");
  assert.equal(sanitizeSlug("LP/Aquafacial 2026"), "lp-aquafacial-2026");
});

test("buildStartTarget uses origin/master and date-prefixed branch and path", () => {
  const root = path.join(os.tmpdir(), "beautyfacelift");
  const target = buildStartTarget(root, "Test Isolation", "2026-06-04");

  assert.equal(target.slug, "test-isolation");
  assert.equal(target.baseRef, "origin/master");
  assert.equal(target.branch, "codex/2026-06-04-test-isolation");
  assert.equal(
    target.worktreePath,
    path.join(root, ".worktrees", "2026-06-04-test-isolation"),
  );
});

test("parseWorktreePorcelain keeps branch and detached worktrees distinct", () => {
  const output = [
    "worktree C:/repo/astro-v2",
    "HEAD abc123",
    "branch refs/heads/master",
    "",
    "worktree C:/Temp/beautyfacelift-deploy-abc123",
    "HEAD def456",
    "detached",
    "",
  ].join("\n");

  const worktrees = parseWorktreePorcelain(output);

  assert.deepEqual(worktrees, [
    {
      path: "C:/repo/astro-v2",
      head: "abc123",
      branch: "master",
      detached: false,
      locked: false,
      prunable: false,
    },
    {
      path: "C:/Temp/beautyfacelift-deploy-abc123",
      head: "def456",
      branch: null,
      detached: true,
      locked: false,
      prunable: false,
    },
  ]);
});

test("findOrphanWorktreeDirs reports folders under .worktrees that are not registered", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "agent-worktree-test-"));
  const registered = path.join(root, ".worktrees", "registered");
  const orphan = path.join(root, ".worktrees", "orphan");
  fs.mkdirSync(registered, { recursive: true });
  fs.mkdirSync(orphan, { recursive: true });

  const orphans = findOrphanWorktreeDirs(root, [{ path: registered }]);

  assert.deepEqual(orphans, [orphan]);
});

test("isStaleTempWorktree only marks detached beautyfacelift temp worktrees as stale", () => {
  assert.equal(
    isStaleTempWorktree({
      path: path.join(os.tmpdir(), "beautyfacelift-deploy-abc123"),
      branch: null,
      detached: true,
    }),
    true,
  );

  assert.equal(
    isStaleTempWorktree({
      path: path.join(os.tmpdir(), "beautyfacelift-deploy-abc123"),
      branch: "codex/active",
      detached: false,
    }),
    false,
  );
});
