import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ACCENTS, MODES, contrastRatio, deriveAccent, getAccentColor, applyTheme, ICON_NAMES, hasIcon, iconSvg } from "../src/index.js";

const load = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const tokens = JSON.parse(load("tokens/gc.tokens.json"));
const registry = JSON.parse(load("registry/design-authority.v1.json"));
const css = load("src/tokens.css");
const components = load("src/components.css");

test("semantic roles, material layers and theme variants have browser tokens", () => {
  assert.deepEqual(tokens.meta.materials, ["Cloud Canvas", "Cloud Surface", "Cloud Lens"]);
  for (const mode of ["light", "dark"]) {
    for (const role of ["canvas", "surface", "surface-tonal", "text", "text-soft", "outline", "positive", "warning", "negative", "lens-fill", "lens-solid", "focus-ring"]) {
      assert.ok(tokens.semantic[mode][role], mode + ":" + role);
      assert.ok(css.includes("--gc-" + role + ":"), role);
    }
  }
  for (const accent of ACCENTS) {
    assert.ok(tokens.accents[accent]);
    for (const mode of ["light", "dark"]) {
      for (const role of ["brand", "on-brand", "brand-container", "on-brand-container"]) assert.ok(tokens.accents[accent][mode][role]);
    }
  }
  assert.deepEqual(ACCENTS, ["iris", "lagoon", "ember", "moss"]);
  assert.deepEqual(MODES, ["light", "dark", "auto"]);
  assert.equal(registry.schemaVersion, 1);
  assert.equal(registry.nativeSdkStatus, "not-implemented");
});

test("curated accent foreground and container contrasts reach 4.5:1", () => {
  for (const accent of ACCENTS) {
    for (const mode of ["light", "dark"]) {
      const colors = tokens.accents[accent][mode];
      assert.ok(contrastRatio(colors.brand, colors["on-brand"]) >= 4.5, accent + " " + mode + " brand");
      assert.ok(contrastRatio(colors["brand-container"], colors["on-brand-container"]) >= 4.5, accent + " " + mode + " container");
      assert.equal(getAccentColor(accent, mode), colors.brand);
    }
  }
});

test("core text on surfaces meets ordinary text contrast target", () => {
  for (const mode of ["light", "dark"]) {
    const palette = tokens.semantic[mode];
    assert.ok(contrastRatio(palette.text, palette.canvas) >= 4.5);
    assert.ok(contrastRatio(palette["text-soft"], palette.surface) >= 4.5);
  }
});

test("safe custom accent rejects injection and adjusts brand contrast", () => {
  assert.throws(() => deriveAccent("red"), TypeError);
  assert.throws(() => deriveAccent("#ffffff;color:red"), TypeError);
  for (const color of ["#EFEFEF", "#001122", "#5D69CC", "#B00020", "#222222"]) {
    for (const mode of ["light", "dark"]) {
      const x = deriveAccent(color, mode);
      assert.ok(contrastRatio(x.brand, x.onBrand) >= 4.5, color + " " + mode);
    }
  }
});

test("theme setter validates modes and removes obsolete custom overrides", () => {
  const props = new Map();
  const attrs = new Map();
  const root = {
    style: { setProperty(k, v) { props.set(k, v); }, removeProperty(k) { props.delete(k); } },
    setAttribute(k, v) { attrs.set(k, v); }
  };
  applyTheme(root, { mode: "dark", accent: "moss", contrast: "more" });
  assert.equal(attrs.get("data-gc-theme"), "dark");
  assert.equal(attrs.get("data-gc-accent"), "moss");
  applyTheme(root, { mode: "light", accent: "iris", customAccent: "#F9F9F9" });
  assert.ok(props.get("--gc-brand"));
  applyTheme(root);
  assert.equal(props.has("--gc-brand"), false);
  assert.throws(() => applyTheme(root, { accent: "unknown" }), RangeError);
  assert.throws(() => applyTheme(null), TypeError);
});

test("original icons have unique identifiers and bounded static markup", () => {
  assert.ok(ICON_NAMES.length >= 35);
  assert.equal(new Set(ICON_NAMES).size, ICON_NAMES.length);
  assert.ok(hasIcon("shield"));
  assert.ok(!hasIcon('<img src=x onerror="bad">'));
  assert.throws(() => iconSvg("<svg>"), RangeError);
  assert.throws(() => iconSvg("search", { size: Infinity }), RangeError);
  assert.match(iconSvg("search"), /viewBox="0 0 24 24"/);
  assert.doesNotMatch(iconSvg("search"), /onerror/);
});

test("component classes cover focus, state and rendering fallbacks", () => {
  for (const part of [".gc-button", ".gc-input", ".gc-dialog", ".gc-switch", ".gc-tabs", ".gc-toast", ".gc-lens", ".gc-table", ".gc-skeleton", ".gc-nav"]) assert.ok(components.includes(part), part);
  for (const part of [":focus-visible", '[aria-invalid', '[aria-selected', '[aria-current', "prefers-reduced-motion", "prefers-reduced-transparency", "forced-colors"]) assert.ok(components.includes(part), part);
  assert.match(load("README.md"), /alpha/i);
  assert.match(load("LICENSE"), /MIT License/);
});
