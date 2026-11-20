#!/usr/bin/env node
/**
 * Records hash-bound, exact-source synthetic Linux Firefox/WebKit screenshots.
 * No network access, browser installation, package update, private content or
 * production API calls. Runs after the isolated source-lab acceptance succeeds.
 */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {readFileSync,writeFileSync} from "node:fs";
import {join,resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("../",import.meta.url)));
const screenshots=join(root,"qa/screenshots");
const corePath=process.env.GC_PLAYWRIGHT_CORE_MODULE;
assert.ok(corePath&&corePath.startsWith("/"),"An inspected Playwright Core absolute path is required");
const coreMeta=JSON.parse(readFileSync(join(dirname(corePath),"package.json"),"utf8"));
assert.equal(coreMeta.name,"playwright-core");
assert.equal(coreMeta.version,"1.64.1");
const runtime=JSON.parse(readFileSync(join(root,"qa/cross-engine-runtimes.json"),"utf8"));
assert.equal(runtime.playwrightCore,coreMeta.version);
for(const browser of ["firefox","webkit"]){
  assert.match(runtime.engines[browser]||"",/^\d+(?:\.\d+){0,3}/,
    "Missing observed browser version: "+browser);
}
const sha=execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim();
assert.match(sha,/^[0-9a-f]{40}$/);
const specs=[
 {name:"desktop-light",width:900,height:800},
 {name:"mobile-dark",width:390,height:844},
 {name:"rtl-large-light",width:390,height:844}
];
const outputs=[];
for(const browser of ["firefox","webkit"])for(const scenario of specs)for(const variant of ["","-clean"]){
  const filename="gc-ui-"+browser+"-"+scenario.name+variant+".png";
  const bytes=readFileSync(join(screenshots,filename));
  assert.ok(bytes.length>1000&&bytes.length<5_000_000,filename+" abnormal screenshot size");
  assert.equal(bytes.subarray(0,8).toString("hex"),"89504e470d0a1a0a",filename+" not PNG");
  assert.equal(bytes.readUInt32BE(16),scenario.width,filename+" width mismatch");
  assert.equal(bytes.readUInt32BE(20),scenario.height,filename+" height mismatch");
  outputs.push({file:filename,bytes:bytes.length,
    sha256:createHash("sha256").update(bytes).digest("hex"),
    width:scenario.width,height:scenario.height});
}
assert.equal(outputs.length,12);
const evidence={schemaVersion:1,sourceCommit:sha,playwrightCoreVersion:coreMeta.version,
  browserVersions:runtime.engines,operatingSystemScope:"Linux x86_64",
  onlySyntheticLab:true,officialSafariQualified:false,
  humanScreenReaderQualified:false,fullSupportedVersionsQualified:false,
  screenshots:outputs};
writeFileSync(join(root,"qa/cross-engine-evidence.json"),JSON.stringify(evidence,null,2)+"\n");
console.log(JSON.stringify({sourceCommit:sha,engineVersions:runtime.engines,
  verifiedPngCount:outputs.length,allBytesAndHashesRecorded:true},null,2));
