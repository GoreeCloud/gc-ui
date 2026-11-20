import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const root = new URL("../", import.meta.url);
const load = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const pkg = load("package.json");
const plan = load("registry/release-plan.v1.json");
const candidate = load("registry/release-candidate.v1.json");

test("refreshed exact 1.0.0 candidate stays blocked until actual release acceptance", () => {
  assert.equal(pkg.name, "@goreecloud/ui");
  assert.equal(pkg.version, "1.0.0");
  assert.equal(plan.currentPackageVersion, pkg.version);
  assert.equal(plan.status, "candidate-unverified");
  assert.equal(plan.webFoundations.status, "candidate");
  assert.equal(candidate.status, "draft-candidate-unverified-unpublished");
  assert.equal(candidate.sourceBaseSha, "79949b3db58f2214e8d4c4eb2b647f75e1cfc724");
  assert.equal(candidate.latestIntegratedProtectedMainSha,
    "be8b819748d1ef0f6b2d3e786f4b22864cb3d07d");
  assert.equal(candidate.latestIntegrationDate, "2026-11-20");
  assert.equal(candidate.rollback.sourceBaselineSha,
    candidate.latestIntegratedProtectedMainSha,
    "Rollback must use the current protected source, not the historical initial base");
  assert.equal(candidate.sourceBranch, "release/stable-web-1.0.0-current-main-20261117");
  assert.equal(candidate.sourceCommitSha, null, "No self-referential Git SHA in candidate");
  assert.equal(candidate.candidateEvidence.testedSha, null);
  assert.equal(candidate.candidateEvidence.allGatesVerified, false);
  assert.equal(candidate.githubTagCreated, false);
  assert.equal(candidate.npmPublished, false);
  assert.equal(candidate.releasePublished, false);
  assert.equal(pkg.scripts.prepublishOnly, "npm run release:verify");
  assert.deepEqual(candidate.frozenExports, plan.webFoundations.candidateStableExports);
  assert.deepEqual(plan.webFoundations.requiringClassification, []);
  assert.ok(plan.gates.length === 8 &&
    plan.gates.every(g => g.blocking === true && g.status === "open" &&
      Array.isArray(g.evidence) && g.evidence.length === 0));
  const strict = spawnSync(process.execPath, ["scripts/release-readiness.mjs", "--require-ready"], {
    cwd: root, encoding: "utf8", timeout: 10000
  });
  assert.equal(strict.status, 1, strict.stderr);
  assert.match(strict.stderr, /Candidate has not been verified/);
  assert.match(strict.stderr, /Open gate: public-api-contract/);
  assert.match(strict.stderr, /Open gate: release-record/);
});

test("refreshed candidate retains newer protected-main previews and safety tests", () => {
  for (const path of [
    "src/window-command-nodes.js", "src/window-command-nodes.d.ts",
    "src/availability.js", "src/patterns.js", "src/foundation.js",
    "tests/window-command-nodes.test.js", "tests/visual-review.test.js",
    "tests/rejected-identity-adoption.test.js", "tests/lab-studio.test.js",
    "tests/availability.test.js", "tests/browser-smoke.mjs",
    "tests/packed-foundation-browser.mjs", "scripts/verify-package.mjs",
    "scripts/compare-package-evidence.mjs", "registry/visual-quality-rubric.v1.json"
  ]) assert.ok(existsSync(new URL("../" + path, import.meta.url)), "Lost main implementation/test: " + path);
  assert.ok(Object.hasOwn(pkg.exports, "./window-command-nodes"),
    "Deferred preview exports must be preserved, not removed to stabilize the package");
  assert.ok(plan.webFoundations.deferredPreviewExports.includes("./window-command-nodes"));
  assert.equal(pkg.exports["./foundation"].default, "./src/foundation.js");
  assert.equal(pkg.scripts["browser:packed"], "node tests/packed-foundation-browser.mjs");
  assert.equal(pkg.scripts["browser:cross-engine"], "node tests/browser-cross-engine.mjs");
  for (const path of [
    "docs/CROSS_ENGINE_BROWSER_QA.md", "docs/ANDROID_EMULATOR_RUNTIME_QA.md",
    "tests/browser-cross-engine-contract.test.js", "tests/android-emulator-runtime.test.js",
    "scripts/verify-android-emulator.mjs"
  ]) assert.ok(existsSync(new URL("../" + path, import.meta.url)),
    "Latest protected main QA source missing: " + path);
  assert.equal(pkg.scripts["visual:review"], "node scripts/visual-review.mjs");
});

test("candidate npm runtime assets retain marks-exclusion and omit remote dependencies", () => {
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
  assert.ok(!pkg.files.some(f => f === "assets/" || f.startsWith("assets/identity")));
  assert.ok(pkg.files.includes("assets/gc-icons.svg"));
  assert.ok(pkg.files.includes("assets/gc-icons.json"));
  assert.equal(pkg.scripts["release:verify"],
    "node scripts/release-readiness.mjs --require-ready");
});
