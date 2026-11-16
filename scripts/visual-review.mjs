#!/usr/bin/env node
/**
 * Offline, evidence-based review gate. This cannot score subjective aesthetics.
 * Never uploads, captures, modifies, or publishes screenshots.
 */
import { createHash } from "node:crypto";
import { existsSync, openSync, closeSync, readFileSync, realpathSync, writeFileSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const registryPath = join(root, "registry/visual-quality-rubric.v1.json");
const FORMAT = "gc.visual-review.v1";
const FORMS = new Set(["mobile", "tablet", "desktop", "tv", "native-window"]);
const MODES = new Set(["light", "dark", "high-contrast"]);
const STATES = new Set(["default", "selected", "loading", "empty", "error", "offline", "denied", "recovery", "other"]);
const OUTCOMES = new Set(["pass", "fail", "not-reviewed", "not-applicable"]);

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}
function meaningful(value, min = 1) {
  return typeof value === "string" && value.trim().length >= min;
}
function unique(values) {
  return new Set(values).size === values.length;
}
function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
function rubric() {
  const data = readJson(registryPath);
  ensure(data.schema === "gc.visual-rubric.v1", "Incorrect rubric schema");
  ensure(data.criteria?.length === 20 && Array.isArray(data.criteria), "Expected exactly 20 rubric criteria");
  const ids = data.criteria.map(c => c.id);
  ensure(unique(ids), "Duplicate rubric criterion id");
  for (let i = 1; i <= 20; i++) {
    const c = data.criteria[i - 1];
    ensure(c.id === `VQ-${String(i).padStart(2, "0")}`, "Rubric criterion order or id is invalid");
    ensure(["critical", "major"].includes(c.severity), `Invalid severity for ${c.id}`);
    for (const key of ["title", "category", "expectation"]) {
      ensure(meaningful(c[key], 5), `Missing ${key} for ${c.id}`);
    }
  }
  return data;
}
function init(path, items) {
  const report = {
    schema: FORMAT, product: "", sourceSha: "", reviewer: "", reviewedAt: "",
    supportedFormFactors: [], supportedAppearances: [], surfaces: [],
    criteria: items.map(c => ({ id: c.id, status: "not-reviewed", notes: "", surfaceIds: [] }))
  };
  // Exclusive creation: accidental replacement of actual evidence is forbidden.
  const fd = openSync(path, "wx", 0o600);
  try { writeFileSync(fd, JSON.stringify(report, null, 2) + "\n"); }
  finally { closeSync(fd); }
  process.stdout.write(`Created unreviewed scaffold at ${path}\n`);
}
function checkTextArray(values, allowed, name) {
  ensure(Array.isArray(values) && values.length > 0, `${name} must be nonempty`);
  ensure(unique(values), `Duplicate ${name}`);
  ensure(values.every(v => allowed.has(v)), `Invalid ${name}`);
}
function safeEvidence(reportPath, entry) {
  ensure(entry && typeof entry === "object", "Image evidence entry must be an object");
  const path = entry.path;
  ensure(meaningful(path) && !isAbsolute(path) && !path.includes("\\") && !path.includes("\0"), "Evidence path must be relative and safe");
  const dir = realpathSync(dirname(reportPath));
  const absolute = resolve(dir, path);
  ensure(absolute.startsWith(dir + sep), "Evidence path escapes report directory");
  const real = realpathSync(absolute);
  ensure(real.startsWith(dir + sep), "Evidence symlink escapes report directory");
  ensure([".png", ".jpg", ".jpeg", ".webp"].includes(extname(real).toLowerCase()), "Evidence must be a PNG, JPEG or WebP");
  const size = statSync(real).size;
  ensure(size >= 40 && size <= 15 * 1024 * 1024, "Image must be nonempty and at most 15 MB");
  const bytes = readFileSync(real);
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  const kind = extname(real).toLowerCase();
  ensure((kind === ".png" && isPng) || ((kind === ".jpeg" || kind === ".jpg") && isJpeg) || (kind === ".webp" && isWebp), "Evidence magic bytes do not match image type");
  ensure(/^[a-f0-9]{64}$/.test(entry.sha256), "Evidence SHA-256 must be 64 lowercase hexadecimal characters");
  ensure(createHash("sha256").update(bytes).digest("hex") === entry.sha256, "Image hash mismatch (stale or substituted screenshot)");
}
function gate(reportPath, items) {
  ensure(existsSync(reportPath), "Review report does not exist");
  const report = readJson(reportPath);
  ensure(report?.schema === FORMAT, "Incorrect review report schema");
  ensure(meaningful(report.product, 3), "Actual product name required");
  ensure(/^[a-fA-F0-9]{40}(?:[a-fA-F0-9]{24})?$/.test(report.sourceSha ?? ""), "Actual Git source SHA required");
  ensure(meaningful(report.reviewer, 3), "Human reviewer name or identifier required");
  ensure(/^\d{4}-\d{2}-\d{2}$/.test(report.reviewedAt ?? "") && !Number.isNaN(Date.parse(report.reviewedAt)), "Actual ISO review date required");
  checkTextArray(report.supportedFormFactors, FORMS, "supportedFormFactors");
  checkTextArray(report.supportedAppearances, MODES, "supportedAppearances");
  ensure(Array.isArray(report.surfaces) && report.surfaces.length > 0, "At least one inspected surface required");
  const seen = new Set();
  const formCoverage = new Set();
  const modeCoverage = new Set();
  for (const surface of report.surfaces) {
    ensure(meaningful(surface.id, 2) && !seen.has(surface.id), "Surface id must be unique and nonempty");
    seen.add(surface.id);
    ensure(meaningful(surface.name, 3), `Surface ${surface.id} needs a name`);
    ensure(report.supportedFormFactors.includes(surface.formFactor), `Undeclared form factor in ${surface.id}`);
    ensure(report.supportedAppearances.includes(surface.appearance), `Undeclared appearance in ${surface.id}`);
    ensure(STATES.has(surface.state), `Invalid state in ${surface.id}`);
    ensure(Number.isInteger(surface.viewport?.width) && surface.viewport.width >= 240 && surface.viewport.width <= 10000, `Invalid viewport width for ${surface.id}`);
    ensure(Number.isInteger(surface.viewport?.height) && surface.viewport.height >= 240 && surface.viewport.height <= 10000, `Invalid viewport height for ${surface.id}`);
    ensure(Array.isArray(surface.evidence) && surface.evidence.length > 0, `Missing screenshot for ${surface.id}`);
    for (const entry of surface.evidence) safeEvidence(reportPath, entry);
    formCoverage.add(surface.formFactor);
    modeCoverage.add(surface.appearance);
  }
  for (const value of report.supportedFormFactors) ensure(formCoverage.has(value), `No screenshot for declared form factor ${value}`);
  for (const value of report.supportedAppearances) ensure(modeCoverage.has(value), `No screenshot for declared appearance ${value}`);
  ensure(Array.isArray(report.criteria) && report.criteria.length === items.length, "Exactly 20 criterion outcomes required");
  const outcomeIds = report.criteria.map(c => c.id);
  ensure(unique(outcomeIds), "Duplicate review criterion");
  for (const spec of items) {
    const result = report.criteria.find(c => c.id === spec.id);
    ensure(result && OUTCOMES.has(result.status), `Missing or invalid outcome for ${spec.id}`);
    ensure(result.status === "pass" || result.status === "not-applicable", `${spec.id} is not accepted (${result.status})`);
    ensure(meaningful(result.notes, result.status === "not-applicable" ? 30 : 15), `${spec.id}: substantial reviewer note or exclusion rationale required`);
    if (result.status === "pass") {
      ensure(Array.isArray(result.surfaceIds) && result.surfaceIds.length > 0, `${spec.id}: identify inspected screenshot-backed surfaces`);
      ensure(result.surfaceIds.every(id => seen.has(id)), `${spec.id}: unknown surface reference`);
    } else ensure(Array.isArray(result.surfaceIds) && result.surfaceIds.length === 0, `${spec.id}: not-applicable should have no evidence references`);
  }
  process.stdout.write(`Evidence contract passed for ${report.product} (${items.length} reviewed criteria, ${seen.size} rendered surfaces). Human visual signoff remains independent.\n`);
}
try {
  const items = rubric().criteria;
  const [flag, path, extra] = process.argv.slice(2);
  ensure(!extra, "Unexpected extra argument");
  if (flag === "--registry" && !path) process.stdout.write("20-point rubric is structurally valid.\n");
  else if (flag === "--init" && path) init(resolve(path), items);
  else if (flag === "--gate" && path) gate(resolve(path), items);
  else throw new Error("Usage: node scripts/visual-review.mjs --registry | --init report.json | --gate report.json");
} catch (error) {
  process.stderr.write(`Visual-review gate: ${error.message}\n`);
  process.exitCode = 1;
}
