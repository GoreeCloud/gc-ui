import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { ICON_NAMES, iconSvg } from "../src/icons.js";
const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("deterministic icon generator matches all canonical source glyphs",()=>{
  const out=execFileSync(process.execPath,["scripts/build-icon-assets.mjs","--check"],{cwd:new URL("../",import.meta.url),encoding:"utf8"});
  assert.match(out,/match source glyphs/);
  const registry=JSON.parse(load("assets/gc-icons.json"));
  const svg=load("assets/gc-icons.svg");
  assert.equal(registry.count,ICON_NAMES.length);
  assert.equal(new Set(registry.icons.map(x=>x.name)).size,ICON_NAMES.length);
  for(const name of ICON_NAMES){
    assert.ok(registry.icons.some(x=>x.name===name));
    assert.ok(svg.includes('id="gc-icon-'+name+'"'));
    assert.match(iconSvg(name),/stroke-width="1.8"/);
  }
  assert.doesNotMatch(svg,/<script|onload=|onclick=/i);
});
test("TypeScript subpaths and sprite assets are included in npm export surface",()=>{
  const pkg=JSON.parse(load("package.json"));
  for(const name of ["./icons","./theme","./patterns"]){
    assert.ok(pkg.exports[name].types);
    assert.ok(load(pkg.exports[name].types.slice(2)).includes("export"));
  }
  assert.ok(pkg.exports["./icon-sprite"]);
  assert.ok(pkg.exports["./icon-registry"]);
  assert.ok(pkg.files.includes("assets/gc-icons.svg"));
  assert.ok(pkg.files.includes("assets/gc-icons.json"));
  assert.ok(!pkg.files.includes("assets/"),"Do not bundle official brand masters by broad assets directory");
});
