import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("badge primitives retain semantic tokens and legible count/indicator affordances",()=>{
  const css=source("src/components.css");
  const section=css.slice(css.indexOf(".gc-badge {"),css.indexOf(".gc-alert {"));
  for(const selector of [".gc-badge {",".gc-badge--brand",".gc-badge--positive",
    ".gc-badge--warning",".gc-badge--negative",".gc-badge--count",".gc-badge__indicator"]) {
    assert.ok(section.includes(selector),`Missing badge primitive: ${selector}`);
  }
  assert.match(section,/overflow-wrap:anywhere/);
  assert.match(section,/max-inline-size:100%/);
  assert.match(section,/font-variant-numeric:tabular-nums/);
  assert.match(section,/background:currentColor/);
  assert.doesNotMatch(section, /#[0-9a-fA-F]{3,8}\b|https?:\/\/|@import\b/);
});

test("badge examples preserve words, mark decorative dots and don't pretend to verify identity",()=>{
  const lab=source("lab/index.html");
  const docs=source("docs/BADGES.md");
  const components=source("docs/COMPONENTS.md");
  const readme=source("README.md");
  assert.match(lab, /gc-badge--count[^>]*>7 unread alerts<\/span>/);
  assert.match(lab, /gc-badge__indicator" aria-hidden="true"/);
  assert.match(docs,/verification.*independent evidence/i);
  assert.match(docs,/GoreeCloud Identity owns account claims/);
  assert.match(docs,/<button>/);
  assert.match(components,/\(BADGES\.md\)/);
  assert.match(readme,/docs\/BADGES\.md/);
});
