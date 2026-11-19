import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ACCENTS, contrastRatio } from "../src/index.js";
const read = path => readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("shared expressive motion is opt-in, bounded and non-looping", () => {
  const css=read("src/components.css");
  const start=css.indexOf("/* Opt-in GoreeCloud UI expressive motion.");
  assert.ok(start>0);
  const block=css.slice(start,css.indexOf("/* A semantic button is a button",start));
  for (const selector of [".gc-motion-enter", ".gc-motion-enter--quiet",
    ".gc-motion-interactive", ".gc-motion-feedback"]) assert.ok(block.includes(selector));
  for (const token of ["--gc-motion-fast", "--gc-motion-base", "--gc-ease-expressive",
    "--gc-ease"]) assert.ok(block.includes("var("+token+")"),token);
  assert.match(block,/prefers-reduced-motion:no-preference/);
  assert.match(block,/prefers-reduced-motion:reduce/);
  assert.match(block,/hover:hover/);
  assert.match(block,/forced-colors:active/);
  assert.doesNotMatch(block,/transition\s*:\s*all|animation-iteration-count:\s*infinite/i);
  assert.doesNotMatch(block,/#[a-f\d]{3,8}|https?:\/\/|@import/i);
  assert.match(block,/gc-motion-enter,\.gc-motion-enter--quiet\s*\{\s*animation:none!important; opacity:1!important/);
});
test("context-band uses semantic colors, without hiding labels",()=>{
  const css=read("src/components.css");
  for (const [name,role] of [["positive","positive"],["warning","warning"],["negative","negative"]]) {
    assert.ok(css.includes('.gc-context-band[data-gc-tone="'+name+'"] { --gc-context-tone:var(--gc-'+role+'); }'));
  }
  const tokens=JSON.parse(read("tokens/gc.tokens.json"));
  for(const a of ACCENTS) for(const mode of ["light","dark"]) {
    const x=tokens.accents[a][mode];
    assert.ok(contrastRatio(x["brand-container"],x["on-brand-container"])>=4.5);
  }
});
test("motion design standard is documented with real-world acceptance limits",()=>{
 const doc=read("docs/MOTION_AND_EFFECTS.md");
 assert.match(doc,/motion, transitions and intentional effects/i);
 for(const requirement of ["reduced-motion","forced colors","keyboard",
   "touch","no JS","screenshot","No existing\\s+GoreeCloud app is automatically"]) assert.match(doc,new RegExp(requirement,"i"));
 assert.ok(read("docs/COMPONENTS.md").includes("MOTION_AND_EFFECTS.md"));
 assert.ok(read("docs/VISUAL_QUALITY.md").includes("MOTION_AND_EFFECTS.md"));
 assert.ok(read("README.md").includes("MOTION_AND_EFFECTS.md"));
});
