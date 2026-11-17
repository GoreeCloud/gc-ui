import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ACCENTS, contrastRatio } from "../src/index.js";

const load = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("opt-in color-led workspace composes a rail, context and opaque content", () => {
  const css = load("src/components.css");
  const block = css.slice(css.indexOf("/* Opt-in chromatic application workspace."));
  assert.ok(block.startsWith("/* Opt-in chromatic application workspace."));
  for (const selector of [".gc-scene", ".gc-scene__rail", ".gc-scene__workarea",
    ".gc-scene__header", ".gc-scene__content", ".gc-context-band", ".gc-card--accent"]) {
    assert.ok(block.includes(selector), "missing opt-in primitive " + selector);
  }
  for (const role of ["--gc-canvas", "--gc-surface", "--gc-surface-tonal",
    "--gc-brand-container", "--gc-on-brand-container", "--gc-brand"]) {
    assert.ok(block.includes("var(" + role + ")"), "missing semantic role " + role);
  }
  assert.match(block, /\.gc-scene__content \{[^}]*background:var\(--gc-surface\)/s);
  assert.match(block, /\.gc-card--accent \{[^}]*background-image:none/s);
  assert.match(block, /max-width:740px/);
  assert.match(block, /prefers-contrast:more/);
  assert.match(block, /prefers-reduced-transparency:reduce/);
  assert.match(block, /forced-colors:active/);
  assert.doesNotMatch(block, /#[0-9a-fA-F]{6}\b|https?:\/\/|@import\b/, "no invented colors or remote assets");
});

test("accent color block retains safe text contrast in every example accent and mode", () => {
  const tokens = JSON.parse(load("tokens/gc.tokens.json"));
  for (const accent of ACCENTS) for (const mode of ["light", "dark"]) {
    const c = tokens.accents[accent][mode];
    assert.ok(contrastRatio(c["brand-container"], c["on-brand-container"]) >= 4.5,
      accent + " " + mode + " container contrast");
  }
});

test("opt-in pattern is documented without promising consumer adoption", () => {
  const docs = load("docs/COMPONENTS.md");
  assert.match(docs, /## Opt-in chromatic workspace/);
  assert.match(docs, /<nav class="gc-nav"/);
  assert.match(docs, /aria-current="page"/);
  assert.match(docs, /not.*installed native SDK|not.*approved migrated product/i);
  assert.match(load("docs/VISUAL_QUALITY.md"), /Avoiding the white-card default/);
  assert.match(load("README.md"), /Color-led application compositions/);
  assert.match(load("tests/browser-smoke.mjs"), /Chromium chromatic scene/);
});
