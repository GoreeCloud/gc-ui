import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const script = new URL("../scripts/visual-review.mjs", import.meta.url);
const rubric = JSON.parse(readFileSync(new URL("../registry/visual-quality-rubric.v1.json", import.meta.url), "utf8"));
function run(...args) { return spawnSync(process.execPath, [script.pathname, ...args], { encoding: "utf8" }); }
const tinyPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO4FnSsAAAAASUVORK5CYII=", "base64");
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "gc-review-test-"));
  const image = join(dir, "review.png");
  const reportPath = join(dir, "review.json");
  writeFileSync(image, tinyPng);
  const report = {
    schema: "gc.visual-review.v1",
    product: "Example local consumer",
    sourceSha: "a".repeat(40),
    reviewer: "Independent QA reviewer",
    reviewedAt: "2026-11-15",
    supportedFormFactors: ["desktop", "mobile"],
    supportedAppearances: ["light", "dark"],
    surfaces: [
      { id: "workbench", name: "Primary workbench", formFactor: "desktop", appearance: "light", state: "default", viewport: { width: 1440, height: 900 }, evidence: [{ path: "review.png", sha256: createHash("sha256").update(tinyPng).digest("hex") }] },
      { id: "compact", name: "Compact navigation", formFactor: "mobile", appearance: "dark", state: "empty", viewport: { width: 390, height: 844 }, evidence: [{ path: "review.png", sha256: createHash("sha256").update(tinyPng).digest("hex") }] }
    ],
    criteria: rubric.criteria.map(c => ({ id: c.id, status: "pass", notes: "Reviewed composition and task-specific behavior.", surfaceIds: ["workbench", "compact"] }))
  };
  return { dir, image, reportPath, report, save() { writeFileSync(reportPath, JSON.stringify(report)); }, dispose() { rmSync(dir, { recursive: true, force: true }); } };
}

test("rubric contract has all twenty ranked checks", () => {
  const result = run("--registry");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(rubric.criteria.length, 20);
});

test("initializer produces only pending review and never overwrites evidence", () => {
  const f = fixture();
  try {
    const initial = run("--init", f.reportPath);
    assert.equal(initial.status, 0, initial.stderr);
    const doc = JSON.parse(readFileSync(f.reportPath, "utf8"));
    assert.ok(doc.criteria.every(c => c.status === "not-reviewed"));
    assert.notEqual(run("--gate", f.reportPath).status, 0, "template must not falsely pass");
    assert.notEqual(run("--init", f.reportPath).status, 0, "must not overwrite existing report");
  } finally { f.dispose(); }
});

test("evidence contract accepts explicit full review with hash-backed surfaces", () => {
  const f = fixture();
  try { f.save(); const result = run("--gate", f.reportPath); assert.equal(result.status, 0, result.stderr); }
  finally { f.dispose(); }
});

test("tampered screenshots and missing reviewed contexts fail closed", () => {
  const f = fixture();
  try {
    f.save();
    writeFileSync(f.image, Buffer.concat([tinyPng, Buffer.from("tampered")]));
    assert.match(run("--gate", f.reportPath).stderr, /hash mismatch/i);
    writeFileSync(f.image, tinyPng);
    f.report.surfaces.pop();
    f.save();
    assert.match(run("--gate", f.reportPath).stderr, /no screenshot for declared form factor/i);
  } finally { f.dispose(); }
});

test("unreviewed, unsubstantiated, and duplicate criteria are rejected", () => {
  const f = fixture();
  try {
    f.report.criteria[0].status = "not-reviewed";
    f.save();
    assert.notEqual(run("--gate", f.reportPath).status, 0);
    f.report.criteria[0].status = "pass";
    f.report.criteria[0].notes = "";
    f.save();
    assert.match(run("--gate", f.reportPath).stderr, /reviewer note/i);
    f.report.criteria[0].notes = "Reviewed composition and task-specific behavior.";
    f.report.criteria[1].id = f.report.criteria[0].id;
    f.save();
    assert.match(run("--gate", f.reportPath).stderr, /duplicate review criterion/i);
  } finally { f.dispose(); }
});

test("evidence cannot point to an absolute or escaping path", () => {
  const f = fixture();
  try {
    f.report.surfaces[0].evidence[0].path = "/etc/passwd";
    f.save();
    assert.match(run("--gate", f.reportPath).stderr, /relative and safe/i);
  } finally { f.dispose(); }
});
