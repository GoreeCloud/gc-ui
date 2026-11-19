import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  BADGE_FAMILIES, FEEDBACK_TONES, ASYNC_STATES, STATUS_TONES,
  createBadge, createStatusIndicator, createCountBadge, createTaskProgress, createAsyncFeedback
} from "../src/feedback.js";

class MockElement {
  constructor(tagName) { this.tagName = tagName; this.attributes = new Map(); this.children = []; this.className = ""; this.textContent = ""; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  append(...items) { this.children.push(...items); }
}
const doc = { createElement: name => new MockElement(name) };
const flatten = element => element.textContent + element.children.map(flatten).join("");

test("family and status model has explicit, bounded semantic meanings", () => {
  assert.deepEqual(BADGE_FAMILIES, ["icon", "achievement", "profile", "status", "role", "verification", "notification", "recognition"]);
  assert.deepEqual(FEEDBACK_TONES, ["neutral", "info", "positive", "warning", "negative"]);
  assert.ok(ASYNC_STATES.includes("permission-denied"));
  assert.equal(STATUS_TONES.offline, "neutral");
  assert.equal(STATUS_TONES.failed, "negative");
  assert.equal(STATUS_TONES.synced, "positive");
});

test("badge uses text nodes, safe built-in icon name and passive semantics", () => {
  const badge = createBadge({ family: "achievement", label: '<img src=x onerror="alert(1)">' }, doc);
  assert.equal(badge.tagName, "span");
  assert.equal(badge.getAttribute("role"), null);
  assert.equal(badge.getAttribute("data-gc-family"), "achievement");
  assert.equal(badge.children[0].tagName, "gc-icon");
  assert.equal(badge.children[0].getAttribute("aria-hidden"), "true");
  assert.equal(flatten(badge), '<img src=x onerror="alert(1)">');
  assert.throws(() => createBadge({ label: "x", icon: "evil-svg" }, doc), RangeError);
  assert.throws(() => createBadge({ label: "x", tone: "purple" }, doc), RangeError);
  assert.throws(() => createBadge({ label: "x", family: "admin" }, doc), RangeError);
  assert.equal(createBadge({ label: "private", visibility: "hidden" }, doc), null);
});

test("verified claims require provenance metadata; the UI never grants permission", () => {
  const v = { family: "verification", label: "Verified", tone: "positive", issuer: "Identity", evidenceRef: "claim:123", verifiedAt: "2026-11-19T00:00:00Z" };
  assert.throws(() => createBadge({ family: "verification", label: "Verified" }, doc), TypeError);
  assert.throws(() => createBadge({ ...v, verifiedAt: "yesterday" }, doc), TypeError);
  const badge = createBadge(v, doc);
  assert.equal(badge.getAttribute("data-gc-family"), "verification");
  assert.equal(badge.children[0].getAttribute("name"), "shield");
  assert.equal(badge.getAttribute("data-gc-issuer"), null);
  assert.equal(badge.getAttribute("aria-checked"), null);
});

test("status has a real label and a decorative shape with scoped state", () => {
  const indicator = createStatusIndicator({ state: "degraded", label: "Performance degraded" }, doc);
  assert.equal(indicator.getAttribute("data-gc-tone"), "warning");
  assert.equal(indicator.children[0].getAttribute("aria-hidden"), "true");
  assert.equal(flatten(indicator), "Performance degraded");
  assert.throws(() => createStatusIndicator({ state: "apparently-okay", label: "x" }, doc), RangeError);
  assert.throws(() => createStatusIndicator({ state: "online", label: "  " }, doc), TypeError);
});

test("counts have overflow, safe bounds, and privacy preserving modes", () => {
  assert.equal(createCountBadge({ count: 0, scope: "unread" }, doc), null);
  const count = createCountBadge({ count: 132, scope: "unread mentions" }, doc);
  assert.equal(count.textContent, "99+");
  assert.equal(count.getAttribute("aria-label"), "132 unread mentions");
  const sensitive = createCountBadge({ count: 50, scope: "private messages", sensitive: true }, doc);
  assert.equal(sensitive.textContent, "");
  assert.equal(sensitive.getAttribute("aria-label"), "New activity");
  assert.equal(sensitive.getAttribute("data-count"), null);
  assert.equal(createCountBadge({ count: 12, scope: "unread", mode: "hidden" }, doc), null);
  assert.throws(() => createCountBadge({ count: 12, sensitive: true, mode: "count" }, doc), TypeError);
  for (const n of [-1, 1.3, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => createCountBadge({ count: n, scope: "x" }, doc), RangeError);
});

test("task progress is indeterminate unless measured, and success requires proof", () => {
  const indeterminate = createTaskProgress({ label: "Syncing" }, doc);
  assert.equal(indeterminate.children[0].getAttribute("value"), null);
  assert.equal(indeterminate.children[0].getAttribute("aria-label"), "Syncing");
  const measured = createTaskProgress({ label: "Uploading", done: 3, total: 10 }, doc);
  assert.equal(measured.children[0].getAttribute("value"), "3");
  assert.equal(measured.children[0].getAttribute("max"), "10");
  assert.throws(() => createTaskProgress({ label: "done", phase: "complete" }, doc), TypeError);
  assert.throws(() => createTaskProgress({ label: "bad", done: 12, total: 10 }, doc), RangeError);
  const complete = createTaskProgress({ label: "Saved", phase: "complete", confirmed: true }, doc);
  assert.equal(complete.getAttribute("data-gc-phase"), "complete");
  assert.equal(complete.children[0].getAttribute("value"), "1");
  assert.equal(complete.children[0].getAttribute("max"), "1");
  assert.throws(() => createTaskProgress({ label: "Contradictory", done: 2, total: 4, phase: "complete", confirmed: true }, doc), RangeError);
});

test("skeleton placeholders are non-announced and terminal states are not endless skeletons", () => {
  const loading = createAsyncFeedback({ label: "Loading message list", rows: 4 }, doc);
  assert.equal(loading.children.length, 4);
  assert.equal(loading.children[0].getAttribute("aria-hidden"), "true");
  assert.equal(loading.getAttribute("aria-label"), "Loading message list");
  for (const state of ASYNC_STATES.filter(x => x !== "loading")) {
    const region = createAsyncFeedback({ state, label: state }, doc);
    assert.equal(region.children.length, 1);
    assert.ok(!region.children[0].className.includes("skeleton"));
  }
  assert.throws(() => createAsyncFeedback({ label: "Loading", rows: 100 }, doc), RangeError);
});

test("official package exports, styling and theme-independent semantic colors", async () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.exports["./feedback"].default, "./src/feedback.js");
  const root = await import("../src/index.js");
  assert.equal(root.createBadge, createBadge);
  const css = readFileSync(new URL("../src/components.css", import.meta.url), "utf8");
  for (const style of [".gc-feedback-badge", ".gc-indicator", ".gc-count-badge", ".gc-task-feedback", ".gc-async-feedback"]) assert.ok(css.includes(style));
  assert.match(css, /\[data-gc-tone="positive"\].*--gc-positive/);
  assert.match(css, /@media \(forced-colors:active\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
