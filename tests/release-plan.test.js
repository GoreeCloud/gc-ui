import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
const root = new URL("../", import.meta.url);
const read = p => JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const plan=read("registry/release-plan.v1.json");
const pkg=read("package.json");

test("web-first release targets preserve the mandatory 1.0 scope and subsequent minor train",()=>{
  assert.equal(plan.schemaVersion,1);
  assert.equal(plan.strategy,"web-first-incremental-stable");
  assert.equal(plan.currentPackageVersion,pkg.version);
  assert.equal(pkg.version,"1.0.0","Test branch must use exact target tarball version");
  assert.equal(plan.targetStableVersion,"1.0.0");
  assert.equal(plan.status,"candidate-unverified");
  assert.deepEqual(plan.followOnReleases.map(x=>x.version),["1.1.0","1.2.0","1.3.0","1.4.0","1.5.0"]);
  assert.ok(plan.advisoryNotStableBlockers.some(x=>/screen-reader/.test(x)));
  assert.ok(plan.advisoryNotStableBlockers.some(x=>/native/.test(x)));
});
test("every actual package export is classified while root review remains open",()=>{
  const p=plan.webFoundations;
  const exports=[...p.candidateStableExports,...p.deferredPreviewExports,...p.requiringClassification];
  assert.deepEqual([...exports].sort(),Object.keys(pkg.exports).sort());
  assert.equal(new Set(exports).size,exports.length);
  for(const name of p.candidateStableExports) assert.ok(pkg.exports[name],name);
  assert.equal(p.rootEntryStatus,"preview-compatibility");
  assert.ok(p.deferredPreviewExports.includes("."),"Root remains backward-compatible preview");
  assert.deepEqual(p.requiringClassification,[]);
  assert.ok(!p.candidateStableExports.includes("./signal-board"));
});
test("1.0 gates require evidence and report blockers without misrepresenting Stable",()=>{
  const gates=plan.gates;
  assert.ok(gates.length>=7);
  assert.equal(new Set(gates.map(g=>g.id)).size,gates.length);
  for(const gate of gates){
    assert.equal(gate.blocking,true,gate.id);
    assert.equal(gate.status,"open",gate.id);
    assert.deepEqual(gate.evidence,[],gate.id);
  }
  const report=JSON.parse(execFileSync(process.execPath,["scripts/release-readiness.mjs","--status"],{cwd:root,encoding:"utf8"}));
  assert.equal(report.ready,false);
  assert.ok(report.blockers.some(x=>/Candidate has not been verified/.test(x)));
  const strict=spawnSync(process.execPath,["scripts/release-readiness.mjs","--require-ready"],{cwd:root,encoding:"utf8"});
  assert.equal(strict.status,1);
  assert.match(strict.stderr,/Stable 1.0.0 blocked/);
  assert.match(strict.stderr,/Open gate: public-api-contract/);
});

test("new dedicated JS foundation keeps root as explicitly preview compatibility",()=>{
  const p=plan.webFoundations;
  assert.ok(p.candidateStableExports.includes("./foundation"));
  assert.deepEqual(pkg.exports["./foundation"],{types:"./src/foundation.d.ts",default:"./src/foundation.js"});
  assert.equal(p.rootEntryStatus,"preview-compatibility");
  assert.ok(p.deferredPreviewExports.includes("."));
  assert.deepEqual(p.requiringClassification,[]);
  const parseExports=source=>[...source.matchAll(/export\s*{\s*([^}]+)\s*}\s*from\s*["'][^"']+["'];/g)]
    .flatMap(m=>m[1].split(",").map(s=>s.trim().split(/\s+as\s+/).pop().trim()));
  const rootJs=parseExports(readFileSync(new URL("../src/index.js",import.meta.url),"utf8"));
  const foundationJs=parseExports(readFileSync(new URL("../src/foundation.js",import.meta.url),"utf8"));
  const foundationDts=parseExports(readFileSync(new URL("../src/foundation.d.ts",import.meta.url),"utf8"));
  assert.equal(new Set(rootJs).size,rootJs.length);
  assert.equal(new Set(foundationJs).size,foundationJs.length);
  const classes=p.rootSymbolClassification;
  assert.deepEqual(rootJs.slice().sort(),[...classes.candidateStable,...classes.deferredPreview].sort());
  assert.deepEqual(foundationJs.slice().sort(),classes.candidateStable.slice().sort());
  assert.deepEqual(foundationDts.slice().sort(),foundationJs.slice().sort());
  assert.ok(classes.deferredPreview.includes("initSignalBoard"));
  assert.ok(!foundationJs.includes("initSignalBoard"));
  assert.match(readFileSync(new URL("../docs/PUBLIC_API_BOUNDARY.md",import.meta.url),"utf8"),/preview-compatibility|preview compatibility/i);
});
