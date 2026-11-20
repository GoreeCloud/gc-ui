import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const root=new URL("../",import.meta.url);
const read=relative=>readFileSync(new URL(relative,root),"utf8");

test("dedicated cross-engine CI pins independent Linux engines without shipping runtime deps",()=>{
 const workflow=read(".github/workflows/ci.yml");
 const job=workflow.split("  cross-engine-lab:\n")[1];
 assert.ok(job,"missing isolated source-bound cross-engine job");
 assert.match(job,/ubuntu-24\.04/);
 assert.match(job,/github\.event\.pull_request\.head\.sha \|\| github\.sha/);
 assert.match(job,/playwright-core@1\.64\.1/);
 assert.match(job,/--no-save --package-lock=false --ignore-scripts/);
 assert.match(job,/install --with-deps firefox webkit/);
 assert.match(job,/GC_PLAYWRIGHT_CORE_MODULE/);
 assert.match(job,/GC_FIREFOX_BIN/);
 assert.match(job,/GC_WEBKIT_BIN/);
 assert.match(job,/npm run browser:cross-engine/);
 assert.match(job,/scripts\/record-cross-engine-evidence\.mjs/);
 assert.match(job,/qa\/cross-engine-evidence\.json/);
 assert.match(job,/retention-days: 7/);
 assert.doesNotMatch(read("package.json"),/"playwright-core"\s*:/);
});
test("cross-engine proof is hash- and dimension-bound, and refuses absent reviewed Core",()=>{
 const manifest=read("scripts/record-cross-engine-evidence.mjs");
 for(const s of ["createHash","readUInt32BE(16)","readUInt32BE(20)","runtime.engines","sourceCommit","officialSafariQualified:false","onlySyntheticLab:true"])
  assert.ok(manifest.includes(s),"missing provenance check: "+s);
 assert.match(read("tests/browser-cross-engine.mjs"),/observedVersions\[engine\]=browser\.version\(\)/);
 assert.match(read("tests/browser-cross-engine.mjs"),/writeFile\(join\(root,"qa\/cross-engine-runtimes\.json"\)/);
 const cmd=new URL("scripts/record-cross-engine-evidence.mjs",root);
 const result=spawnSync(process.execPath,[cmd.pathname],{encoding:"utf8",timeout:5000,
  env:{...process.env,GC_PLAYWRIGHT_CORE_MODULE:""}});
 assert.notEqual(result.status,0);
 assert.match(result.stderr,/inspected Playwright Core absolute path is required/);
});

test("RTL focus and large text add four provenance-verified PNGs without weakening manifest bounds",()=>{
 const manifest=read("scripts/record-cross-engine-evidence.mjs");
 assert.match(manifest,/name:"rtl-large-light",width:390,height:844/);
 assert.match(manifest,/outputs\.length,12/);
 assert.match(read("docs/CROSS_ENGINE_BROWSER_QA.md"),/twelve SHA-256-validated CI screenshot files/);
});
