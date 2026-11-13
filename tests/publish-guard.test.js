import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("npm normal publish is guarded by fail-closed eight-gate verifier",()=>{
 const pkg=JSON.parse(read("package.json"));
 assert.equal(pkg.scripts.prepublishOnly,"npm run release:verify");
 const result=spawnSync(process.execPath,["scripts/release-readiness.mjs","--require-ready"],{cwd:new URL("../",import.meta.url),encoding:"utf8"});
 assert.equal(result.status,1,"Current alpha must never satisfy public publish gate");
 assert.match(result.stderr,/Stable 1\.0\.0 blocked/);
 const runbook=read("docs/RELEASE_1_0_RUNBOOK.md");
 assert.match(runbook,/--ignore-scripts/);
 assert.match(runbook,/protected/);
 assert.match(runbook,/rollback/i);
 assert.match(read("CHANGELOG.md"),/Unreleased/);
});
