import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const authority = JSON.parse(read("registry/design-authority.v1.json"));

test("canonical desktop startup state defaults to a normal window on each desktop OS", () => {
  const policy = authority.desktopWindowing;
  assert.equal(authority.schemaVersion, 1);
  assert.equal(policy.requirement, "normal-windowed-by-default");
  assert.equal(policy.firstLaunchState, "normal");
  assert.deepEqual(policy.platforms, ["linux", "windows", "macos"]);
  assert.equal(policy.maximize, "user-invoked-native-action");
  assert.equal(policy.fullscreen, "user-invoked-native-action");
  assert.equal(policy.restoreSavedState, "only-explicit-user-choice-when-supported");
});

test("window policy preserves usable work area and native transient dialog behavior", () => {
  const policy = authority.desktopWindowing;
  assert.equal(policy.onDisplayChange, "clamp-normal-window-to-available-work-area");
  assert.equal(policy.secondaryWindows, "native-transient-no-forced-immersive-state");
  const native = read(policy.docs);
  assert.match(native, /normal, windowed/);
  assert.match(native, /available work area/);
  assert.match(native, /secondary dialogs/);
});

test("machine authority and written contract do not falsely claim native release", () => {
  const policy = authority.desktopWindowing;
  assert.equal(policy.integrationStatus, "native-consumer-validation-required");
  assert.equal(policy.nativeSdkStatus, "not-implemented");
  assert.equal(policy.webStableScope, "not-applicable");
  assert.equal(authority.nativeSdkStatus, "not-implemented");
  const docs = read("docs/WINDOWS_AND_NAVIGATION.md");
  assert.match(docs, /normal, resizable, non-maximized/);
  assert.match(docs, /web-first Stable 1\.0 candidate/);
});
