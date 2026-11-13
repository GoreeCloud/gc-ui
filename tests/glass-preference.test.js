import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyTheme, createThemeController, TRANSPARENCY_MODES } from "../src/theme.js";

function rootStub() {
  const attributes = new Map();
  const properties = new Map();
  return {
    attributes,
    properties,
    setAttribute(name, value) { attributes.set(name, value); },
    style: {
      setProperty(name, value) { properties.set(name, value); },
      removeProperty(name) { properties.delete(name); }
    }
  };
}

test("transparency choice defaults to auto and remains independent of the accent family", () => {
  assert.deepEqual(TRANSPARENCY_MODES, ["auto", "reduce"]);
  const root = rootStub();
  assert.deepEqual(applyTheme(root, { accent: "moss", mode: "dark" }),
    { mode: "dark", accent: "moss", contrast: "normal" });
  assert.equal(root.attributes.get("data-gc-transparency"), "auto");
  applyTheme(root, { accent: "lagoon", mode: "light", transparency: "reduce" });
  assert.equal(root.attributes.get("data-gc-transparency"), "reduce");
  assert.equal(root.attributes.get("data-gc-accent"), "lagoon");
  assert.equal(root.properties.size, 0, "transparency must not inject brand overrides");
});

test("unknown transparency values fail before DOM mutation", () => {
  const root = rootStub();
  applyTheme(root, { mode: "dark", accent: "ember", transparency: "reduce" });
  const before = [...root.attributes];
  assert.throws(() => applyTheme(root, { transparency: "javascript:alert(1)" }), RangeError);
  assert.deepEqual([...root.attributes], before);
  assert.equal(root.properties.size, 0);
});

test("live theme-controller changes preserve or clear the user preference without persistence", () => {
  const root = rootStub();
  const controller = createThemeController(root, { transparency: "reduce" });
  assert.equal(root.attributes.get("data-gc-transparency"), "reduce");
  controller.update({ mode: "dark", accent: "iris" });
  assert.equal(root.attributes.get("data-gc-transparency"), "reduce");
  controller.update({ transparency: "auto" });
  assert.equal(root.attributes.get("data-gc-transparency"), "auto");
  controller.dispose();
  assert.throws(() => controller.update({ transparency: "reduce" }), /disposed/);
});

test("manual reduction provides explicit solid fallback even for opt-in glass", () => {
  const css = readFileSync(new URL("../src/glass.css", import.meta.url), "utf8");
  assert.ok(css.includes(':is(:root, .gc-app[data-gc-theme])[data-gc-transparency="reduce"]'));
  assert.ok(css.includes(':is(:root, .gc-app[data-gc-theme])[data-gc-contrast="more"]'));
  assert.match(css, /\[data-gc-translucent="true"\]\s*\{\s*background:\s*var\(--gc-lens-solid/);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, "material layer must remain theme agnostic");
});
