import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("premium presentation uses shared canonical semantic roles",()=>{
  const css=load("src/components.css");
  for(const name of [".gc-premium-shell",".gc-showcase",".gc-showcase__content",".gc-showcase__visual",
    ".gc-showcase__floating",".gc-showcase__metrics",".gc-metric",".gc-overline",
    ".gc-feature-grid",".gc-feature-tile",".gc-feature-tile__icon"]) {
    assert.ok(css.includes(name),"Missing premium primitive "+name);
  }
  for(const role of ["--gc-brand","--gc-brand-container","--gc-surface","--gc-surface-tonal",
    "--gc-outline-soft","--gc-lens-solid","--gc-shadow-2","--gc-on-brand-container"]) {
    assert.ok(css.includes("var("+role+")"),"Missing semantic role "+role);
  }
  const section=css.slice(css.indexOf("/* GoreeCloud UI signature composition:"));
  assert.doesNotMatch(section,/#[0-9A-Fa-f]{6}\b/,"Do not introduce palette forks in signature CSS");
  assert.doesNotMatch(section,/https?:\/\/|@import\b/,"Premium appearance must not depend on remote assets");
});
test("premium visuals degrade gracefully in accessible modes",()=>{
  const css=load("src/components.css");
  const section=css.slice(css.indexOf("/* GoreeCloud UI signature composition:"));
  for(const media of ["prefers-reduced-motion:reduce","prefers-reduced-transparency:reduce",
    "prefers-contrast:more","forced-colors:active"])assert.ok(section.includes(media),media);
  assert.ok(section.includes(".gc-app a.gc-button { color:var(--gc-on-brand)"),"Anchor buttons need semantic foreground");
  assert.ok(section.includes("background:var(--gc-lens-solid)"),"Text must be on a solid backdrop");
  assert.ok(section.includes("inline-size:min(82%,320px)"));
  assert.ok(section.includes("grid-template-columns:minmax(0,1fr)"));
});
test("signature lab, governance and browser QA remain aligned",()=>{
  const lab=load("lab/index.html"),runner=load("tests/browser-smoke.mjs");
  for(const x of ['id="premium"','gc-showcase__title','gc-feature-tile','gc-premium-shell'])assert.ok(lab.includes(x),x);
  assert.ok(runner.includes("gc-ui-premium-dark-mobile.png"));
  assert.ok(runner.includes("gc-ui-premium-desktop.png"));
  assert.match(load("docs/VISUAL_QUALITY.md"),/mandatory|Premium/i);
  assert.match(load("docs/DESIGN_LANGUAGE.md"),/Premium visual quality is mandatory/);
});
