import test from "node:test";
import assert from "node:assert/strict";
import {
  ACCENTS, MODES, applyTheme, contrastRatio, deriveAccent, createThemeController
} from "../src/theme.js";

function rootStub() {
  const attributes = new Map();
  const properties = new Map();
  return {
    attributes, properties,
    setAttribute(name, value) { attributes.set(name, value); },
    style: {
      setProperty(name, value) { properties.set(name, value); },
      removeProperty(name) { properties.delete(name); }
    }
  };
}

test("all optional accent presets and appearance modes remain available", () => {
  assert.deepEqual(ACCENTS, ["iris", "lagoon", "ember", "moss"]);
  assert.deepEqual(MODES, ["light", "dark", "auto"]);
  for (const accent of ACCENTS) {
    for (const mode of MODES) {
      const root = rootStub();
      assert.deepEqual(applyTheme(root, { accent, mode }), { mode, accent, contrast: "normal" });
      assert.equal(root.attributes.get("data-gc-accent"), accent);
      assert.equal(root.properties.size, 0, "presets must not inject custom brand overrides");
    }
  }
});

test("custom accents are legible on the mode-specific reference surface", () => {
  for (const input of ["#000000", "#FFFFFF", "#3366CC", "#FFCC00", "#888888"]) {
    for (const mode of ["light", "dark"]) {
      const derived = deriveAccent(input, mode);
      assert.ok(contrastRatio(derived.brand, mode === "dark" ? "#0D121D" : "#FFFFFF") >= 4.5,
        `${input} must be legible in ${mode} mode`);
      assert.ok(contrastRatio(derived.brand, derived.onBrand) >= 4.5,
        `${input} must have legible on-brand text in ${mode} mode`);
    }
  }
});

test("invalid custom colors are rejected before changing DOM state", () => {
  const root = rootStub();
  applyTheme(root, { accent: "moss", mode: "light" });
  const before = [...root.attributes];
  assert.throws(() => applyTheme(root, { customAccent: "url(javascript:alert(1))" }), TypeError);
  assert.deepEqual([...root.attributes], before);
  assert.equal(root.properties.size, 0);
});

test("removing a custom accent restores preset-controlled styling", () => {
  const root = rootStub();
  applyTheme(root, { mode: "dark", customAccent: "#3366CC" });
  assert.equal(root.properties.size, 4);
  applyTheme(root, { mode: "dark", accent: "lagoon" });
  assert.equal(root.properties.size, 0);
  assert.equal(root.attributes.get("data-gc-accent"), "lagoon");
});

test("theme controller updates are local, disposable and do not persist data", () => {
  const root = rootStub();
  const controller = createThemeController(root, { mode: "light" });
  controller.update({ accent: "ember", contrast: "more" });
  assert.equal(root.attributes.get("data-gc-contrast"), "more");
  controller.dispose();
  controller.dispose();
  assert.throws(() => controller.update({ mode: "dark" }), /disposed/);
});
