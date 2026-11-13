import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/glass.css", import.meta.url), "utf8");

test("all four glass roles exist without a mandatory accent color", () => {
  for (const role of ["base", "elevated", "overlay", "solid"]) {
    assert.match(css, new RegExp("\\.gc-glass-" + role + "\\b"));
  }
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, "do not hardcode brand or surface colors");
});

test("translucency is explicit opt-in and defaults to a solid fallback", () => {
  assert.match(css, /data-gc-translucent="true"/);
  assert.match(css, /background:\s*var\(--gc-lens-solid/);
  assert.match(css, /@supports\s*\(/);
});

test("accessibility preferences disable blur and forced colors use system palette", () => {
  for (const query of ["prefers-reduced-transparency: reduce", "prefers-contrast: more", "forced-colors: active"]) {
    assert.ok(css.includes(query), query);
  }
  assert.match(css, /backdrop-filter:\s*none/);
  assert.match(css, /color:\s*CanvasText/);
  assert.match(css, /background:\s*Canvas;/);
  assert.match(css, /data-gc-contrast="more"/);
});
