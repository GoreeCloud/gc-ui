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

test("frosted optical rim uses semantic colors and keeps real blur opt-in", () => {
  assert.match(css, /@supports\s*\(color:\s*color-mix\(/);
  assert.match(css, /color-mix\(in srgb, var\(--gc-text\) 12%, transparent\)/);
  assert.match(css, /data-gc-translucent="true"/);
  // Each opt-in frost role may use a highlight, but the accessibility states
  // still remove both backdrop filtering and the highlight shadow.
  const fallback = css.slice(css.indexOf("/* Keep this override last:"));
  assert.ok(fallback.includes("box-shadow: none"),"No accessibility shadow fallback");
  assert.ok(fallback.includes("backdrop-filter: none"),"No accessibility blur fallback");
});

test("signature frosted gallery is semantic, opt-in and includes opaque reading", () => {
  const html = readFileSync(new URL("../lab/index.html", import.meta.url), "utf8");
  const cssScene = readFileSync(new URL("../lab/lab.css", import.meta.url), "utf8");
  assert.match(html, /href="\.\.\/src\/glass\.css"/);
  assert.match(html, /class="gc-frost-stage"/);
  assert.match(html, /id="gc-frost-demo-title"/);
  assert.match(html, /class="gc-glass-elevated gc-frost-panel gc-frost-panel--primary" data-gc-translucent="true"/);
  assert.match(html, /class="gc-glass-overlay gc-frost-panel" data-gc-translucent="true"/);
  assert.match(html, /class="gc-glass-solid gc-frost-panel"/);
  assert.match(cssScene, /:root:is\(\[data-gc-contrast="more"\],\[data-gc-transparency="reduce"\]\) \.gc-frost-stage/);
  assert.doesNotMatch(cssScene.slice(cssScene.indexOf("/* Signature frosted Cloud Lens scene")), /#[0-9a-fA-F]{3,8}\b/,
    "The frosted visual stage must reuse semantic colors, not invent a brand hue");
});
