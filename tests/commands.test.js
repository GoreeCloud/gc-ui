import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesCommand, initCommandPalette } from "../src/commands.js";
import { readFileSync } from "node:fs";

test("command matching is Unicode-normalized plain text, not a regex", () => {
  assert.equal(matchesCommand("DARK","Switch to dark mode","night"),true);
  assert.equal(matchesCommand("night","Switch to dark mode","night"),true);
  assert.equal(matchesCommand("(","Show notification","message"),false);
  assert.equal(matchesCommand("<img src=x>","show image",""),false);
  assert.equal(matchesCommand("re\u0301sume\u0301","Résumé",""),true);
  assert.equal(matchesCommand("other","Résumé",""),false);
});
test("command controller refuses non-native or inert shells", () => {
  assert.throws(()=>initCommandPalette(null,{onSelect() {}}),TypeError);
  const fake={showModal(){},close(){},querySelector(){return null},querySelectorAll(){return []},ownerDocument:{addEventListener(){}}};
  assert.throws(()=>initCommandPalette(fake),/onSelect/);
  assert.throws(()=>initCommandPalette(fake,{onSelect(){}}),/input/);
});
test("command stylesheet, typings, lab and browser verification remain connected", () => {
  const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
  const pkg=JSON.parse(load("package.json"));
  assert.equal(pkg.exports["./commands"].default,"./src/commands.js");
  assert.ok(load("src/commands.d.ts").includes("initCommandPalette"));
  const lab=load("lab/index.html"),smoke=load("tests/browser-smoke.html");
  assert.ok(lab.includes('id="command-dialog"'));
  assert.ok(lab.includes('id="open-command"'));
  assert.ok(smoke.includes("command search filters safely"));
  assert.ok(load("src/components.css").includes(".gc-command__item"));
});
