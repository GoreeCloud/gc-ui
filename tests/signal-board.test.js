import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SIGNAL_STATES, SIGNAL_FILTERS, summarizeSignals, initSignalBoard } from "../src/signal-board.js";

test("Signal Constellation enumerates only documented local states", () => {
  assert.deepEqual(SIGNAL_STATES, ["ready","attention","offline"]);
  assert.deepEqual(SIGNAL_FILTERS, ["all","ready","attention","offline"]);
  assert.equal(Object.isFrozen(SIGNAL_STATES),true);
});

test("counts are correct, immutable, and handle empty collections", () => {
  const counts = summarizeSignals(["ready","offline","attention","ready"]);
  assert.deepEqual(counts,{all:4,ready:2,attention:1,offline:1});
  assert.equal(Object.isFrozen(counts),true);
  assert.deepEqual(summarizeSignals([]),{all:0,ready:0,attention:0,offline:0});
});

test("unknown or unsafe signals fail closed without coercion", () => {
  for(const input of [null,{},new Set(), "ready"]) assert.throws(()=>summarizeSignals(input),TypeError);
  for(const state of ["error","online","READY","",null,undefined,42,"<script>"]) {
    assert.throws(()=>summarizeSignals([state]),RangeError);
  }
});

test("controller rejects unsupported roots and does not require browser globals on import", () => {
  for(const node of [null,{}, {querySelector(){}}, {querySelector(){},querySelectorAll(){}}]) {
    assert.throws(()=>initSignalBoard(node),TypeError);
  }
});

test("semantic design and package exports include filter, timeflow and accessibility fallbacks", () => {
  const css=readFileSync(new URL("../src/components.css",import.meta.url),"utf8");
  const html=readFileSync(new URL("../lab/index.html",import.meta.url),"utf8");
  const pkg=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));
  assert.match(css,/\.gc-signal-board__lens/);
  const glassBlock=css.slice(css.indexOf("/* Signal Constellation + Timeflow:"));
  assert.match(glassBlock,/\.gc-signal-board__lens\\s*\\{[^}]*background:var\\(--gc-lens-solid\\)/,
    "Unsupported backdrop-filter browsers must get opaque Lens baseline");
  assert.match(glassBlock,/@supports[^\\n]*backdrop-filter:[^\\n]*\\{[\\s\\S]*?background:var\\(--gc-lens-fill\\)/,
    "Only supported blurred rendering may receive translucent Lens fill");
  assert.match(css,/\.gc-timeflow > li/);
  assert.match(css,/prefers-reduced-transparency:reduce/);
  assert.match(css,/forced-colors:active/);
  assert.match(html,/id="signal-constellation"/);
  assert.match(html,/data-gc-signal-filter="attention"/);
  assert.match(html,/<ol class="gc-timeflow" data-gc-timeflow-list/);
  assert.match(html, /data-gc-timeflow-empty hidden/);
  assert.match(html, /<li data-gc-signal="attention"><time datetime=/);
  assert.match(html,/illustrative local records, not live GoreeCloud service checks/);
  assert.match(css,/\.gc-timeflow__empty/);
  assert.equal(pkg.exports["./signal-board"].types,"./src/signal-board.d.ts");
  assert.equal(pkg.exports["./signal-board"].default,"./src/signal-board.js");
});
