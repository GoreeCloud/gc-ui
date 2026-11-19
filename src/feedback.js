/** GoreeCloud UI semantic feedback — alpha web DOM primitives (no network/storage). */
import { hasIcon } from "./icons.js";

export const BADGE_FAMILIES = Object.freeze([
  "icon", "achievement", "profile", "status", "role", "verification", "notification", "recognition"
]);
export const FEEDBACK_TONES = Object.freeze(["neutral", "info", "positive", "warning", "negative"]);
export const ASYNC_STATES = Object.freeze([
  "loading", "ready", "empty", "offline", "stale", "error", "permission-denied", "timed-out", "cancelled", "unknown"
]);
export const STATUS_TONES = Object.freeze({
  online: "positive", available: "positive", healthy: "positive", active: "positive", synced: "positive",
  away: "warning", busy: "warning", degraded: "warning", stale: "warning", conflict: "warning",
  failed: "negative", blocked: "negative", error: "negative",
  offline: "neutral", inactive: "neutral", pending: "neutral", queued: "neutral", syncing: "info", unknown: "neutral"
});

function requiredText(value, field) {
  if (typeof value !== "string" || !value.trim()) throw new TypeError(`${field} must be nonempty text`);
  return value.trim();
}
function allowed(value, choices, field) {
  if (!choices.includes(value)) throw new RangeError(`Unknown ${field}: ${String(value)}`);
  return value;
}
function documentFor(doc) {
  if (!doc || typeof doc.createElement !== "function") throw new TypeError("A document is required");
  return doc;
}
function appendText(doc, parent, text, cls) {
  const item = doc.createElement("span");
  item.className = cls;
  item.textContent = text;
  parent.append(item);
}

/** Static, passive badge. An issuer/reference is metadata, never frontend authorization. */
export function createBadge({ label, family = "status", tone = "neutral", size = "md", icon,
  issuer, evidenceRef, verifiedAt, visibility = "visible" } = {}, doc = globalThis.document) {
  allowed(family, BADGE_FAMILIES, "badge family");
  allowed(tone, FEEDBACK_TONES, "badge tone");
  allowed(size, ["sm", "md"], "badge size");
  allowed(visibility, ["visible", "hidden"], "badge visibility");
  requiredText(label, "badge label");
  if (family === "verification") {
    requiredText(issuer, "verification issuer");
    requiredText(evidenceRef, "verification evidence reference");
    requiredText(verifiedAt, "verification timestamp");
    if (!Number.isFinite(Date.parse(verifiedAt))) throw new TypeError("Invalid verification timestamp");
  }
  const defaultIcons = { achievement: "sparkle", profile: "user", role: "users", verification: "shield", notification: "bell", recognition: "check" };
  icon ??= defaultIcons[family];
  if (icon !== undefined && (typeof icon !== "string" || !hasIcon(icon))) throw new RangeError("Unknown badge icon");
  if (visibility === "hidden") return null;
  const d = documentFor(doc);
  const badge = d.createElement("span");
  badge.className = `gc-badge gc-feedback-badge gc-feedback-badge--${size}`;
  badge.setAttribute("data-gc-family", family);
  badge.setAttribute("data-gc-tone", tone);
  if (icon) {
    const mark = d.createElement("gc-icon");
    mark.setAttribute("name", icon);
    mark.setAttribute("size", "16");
    mark.setAttribute("aria-hidden", "true");
    badge.append(mark);
  }
  appendText(d, badge, label, "gc-feedback-badge__text");
  return badge;
}

/** Presence/health state is intentionally a label and a shape, not color alone. */
export function createStatusIndicator({ state = "unknown", label } = {}, doc = globalThis.document) {
  if (!Object.hasOwn(STATUS_TONES, state)) throw new RangeError("Unknown status state");
  const d = documentFor(doc);
  const el = d.createElement("span");
  el.className = "gc-indicator";
  el.setAttribute("data-gc-state", state);
  el.setAttribute("data-gc-tone", STATUS_TONES[state]);
  const mark = d.createElement("span");
  mark.className = "gc-indicator__mark";
  mark.setAttribute("aria-hidden", "true");
  el.append(mark);
  appendText(d, el, requiredText(label, "status label"), "gc-indicator__label");
  return el;
}

/** Privacy defaults to a generic dot for sensitive counts, with no exact count in the DOM. */
export function createCountBadge({ count, scope, max = 99, sensitive = false, mode = "auto" } = {}, doc = globalThis.document) {
  if (!Number.isSafeInteger(count) || count < 0) throw new RangeError("count must be a nonnegative safe integer");
  if (!Number.isSafeInteger(max) || max < 1 || max > 999) throw new RangeError("max must be 1–999");
  allowed(mode, ["auto", "count", "dot", "hidden"], "count mode");
  if (typeof sensitive !== "boolean") throw new TypeError("sensitive must be boolean");
  const exposure = mode === "auto" ? (sensitive ? "dot" : "count") : mode;
  if (sensitive && exposure === "count") throw new TypeError("Sensitive count cannot expose an exact count");
  if (!count || exposure === "hidden") return null;
  const d = documentFor(doc);
  const badge = d.createElement("span");
  badge.className = `gc-count-badge gc-count-badge--${exposure}`;
  badge.setAttribute("role", "img");
  badge.setAttribute("aria-label", sensitive ? "New activity" : `${count} ${requiredText(scope, "count scope")}`);
  badge.textContent = exposure === "dot" ? "" : count > max ? `${max}+` : String(count);
  return badge;
}

/** Native progress avoids invented percentages; completion requires caller confirmation. */
export function createTaskProgress({ label, done, total, phase = "working", confirmed = false } = {}, doc = globalThis.document) {
  allowed(phase, ["queued", "working", "paused", "failed", "complete"], "task phase");
  if (phase === "complete" && confirmed !== true) throw new TypeError("Completion requires confirmation");
  const hasMeasurements = done !== undefined || total !== undefined;
  if (hasMeasurements && (!Number.isFinite(done) || !Number.isFinite(total) || total <= 0 || done < 0 || done > total)) {
    throw new RangeError("Progress must be a measured 0 <= done <= total");
  }
  if (phase === "complete" && hasMeasurements && done !== total) {
    throw new RangeError("Confirmed completion cannot have unfinished measured progress");
  }
  const d = documentFor(doc);
  const region = d.createElement("div");
  region.className = "gc-task-feedback";
  region.setAttribute("data-gc-phase", phase);
  region.setAttribute("role", "group");
  region.setAttribute("aria-label", requiredText(label, "task label"));
  const progress = d.createElement("progress");
  progress.className = "gc-progress";
  progress.setAttribute("aria-label", label);
  if (hasMeasurements) {
    progress.setAttribute("value", String(done));
    progress.setAttribute("max", String(total));
  } else if (phase === "complete") {
    // Confirmed completion is observable evidence even when no intermediate metrics exist.
    progress.setAttribute("value", "1");
    progress.setAttribute("max", "1");
  }
  region.append(progress);
  appendText(d, region, phase === "complete" ? "Complete" : phase, "gc-task-feedback__phase");
  return region;
}

/** Skeleton when layout is predictable; plain fallback for terminal or unknown states. */
export function createAsyncFeedback({ state = "loading", label, rows = 3 } = {}, doc = globalThis.document) {
  allowed(state, ASYNC_STATES, "async state");
  if (!Number.isSafeInteger(rows) || rows < 1 || rows > 20) throw new RangeError("rows must be 1–20");
  const d = documentFor(doc);
  const region = d.createElement("div");
  region.className = "gc-async-feedback";
  region.setAttribute("data-gc-async-state", state);
  region.setAttribute("role", "status");
  region.setAttribute("aria-label", requiredText(label, "async state label"));
  if (state === "loading") {
    for (let i = 0; i < rows; i++) {
      const skeleton = d.createElement("span");
      skeleton.className = "gc-skeleton gc-async-feedback__placeholder";
      skeleton.setAttribute("aria-hidden", "true");
      region.append(skeleton);
    }
  } else {
    appendText(d, region, label, "gc-async-feedback__message");
  }
  return region;
}
