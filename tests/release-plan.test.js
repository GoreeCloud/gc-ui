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
  assert.equal(pkg.version,"0.1.0-alpha.0","Planning must not silently promote package");
  assert.equal(plan.targetStableVersion,"1.0.0");
  assert.equal(plan.status,"planned-not-released");
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
  assert.ok(p.requiringClassification.includes("."),"Root's mixed experimental exports require review");
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
  assert.ok(report.blockers.some(x=>/version 1.0.0/.test(x)));
  const strict=spawnSync(process.execPath,["scripts/release-readiness.mjs","--require-ready"],{cwd:root,encoding:"utf8"});
  assert.equal(strict.status,1);
  assert.match(strict.stderr,/Stable 1.0.0 blocked/);
  assert.match(strict.stderr,/Open gate: public-api-contract/);
});
