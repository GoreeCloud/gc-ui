import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ICON_NAMES } from "../src/icons.js";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("designed reference replaces blank token playground with distinct nonfiction workflow", () => {
  const html = read("tests/craft-workspace.html");
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /<main class="gc-scene__content" id="main">/);
  assert.match(html, /<h1 class="gc-scene__title">Held-file review<\/h1>/);
  assert.match(html, /<ol class="gc-workflow" aria-label="Private scan workflow stages">/);
  assert.match(html, /<dl>/);
  assert.match(html, /<details>/);
  assert.match(html, /No real scans, accounts, files or decisions/);
  assert.doesNotMatch(html, /onclick=|onmouseover=|<iframe|<canvas|https?:\/\/|data:|<img/i,
    "no inert or remote visual controls in this static design reference");
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const hrefs = [...html.matchAll(/<a href="#([a-z-]+)"/g)].map(x => x[1]);
  assert.deepEqual(hrefs, ["overview", "admission", "boundaries", "review"]);
  for (const id of ["main", ...hrefs]) {
    assert.ok(html.includes('id="' + id + '"'), "missing anchor " + id);
  }
  const icons = [...html.matchAll(/<gc-icon name="([a-zA-Z]+)"/g)].map(x => x[1]);
  assert.ok(icons.length >= 5);
  assert.ok(icons.every(x => ICON_NAMES.includes(x)), "must use original approved icon family");
});

test("opt-in workflow typography and layout use canonical roles instead of a new theme", () => {
  const css = read("src/components.css");
  const start = css.indexOf("/* Designed workflow composition:");
  const end = css.indexOf("/* Opt-in GoreeCloud UI expressive motion.", start);
  assert.ok(start > 0 && end > start);
  const block = css.slice(start, end);
  for (const cls of [
    ".gc-scene__identity", ".gc-scene__mark", ".gc-scene__title",
    ".gc-scene__overline", ".gc-scene__split", ".gc-workflow",
    ".gc-reference-panel", ".gc-scene__rail-note", ".gc-scene__footnote",
  ]) assert.ok(block.includes(cls), "missing compositional primitive " + cls);
  for (const role of [
    "--gc-type-title", "--gc-type-heading", "--gc-type-support",
    "--gc-font-ui", "--gc-font-mono", "--gc-space-4",
    "--gc-brand-container", "--gc-on-brand-container", "--gc-outline-soft",
  ]) {
    if (role === "--gc-font-ui") continue; // inherited by the approved app root
    assert.ok(block.includes("var(" + role + ")"), "missing approved role " + role);
  }
  assert.match(block, /max-width:740px/);
  assert.match(block, /max-width:1040px/);
  assert.match(block, /forced-colors:active/);
  assert.match(block, /overflow-x:auto/);
  assert.doesNotMatch(block, /#[0-9a-f]{3,8}\b|https?:\/\/|@import\b|animation-iteration-count/i);
  assert.match(read("tests/browser-smoke.mjs"), /gc-ui-crafted-workspace-/);
  assert.match(read("lab/index.html"), /href="\.\.\/tests\/craft-workspace\.html"/);
});
