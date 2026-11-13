#!/usr/bin/env node
/**
 * Read-only, fail-closed Stable 1.0 evidence gate. No release/publish side effects.
 * Structured metadata checks are not independent verification of linked evidence.
 */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { evaluateReleaseReadiness } from "./release-gate-core.mjs";

const root=fileURLToPath(new URL("../",import.meta.url));
const read=path=>JSON.parse(readFileSync(join(root,path),"utf8"));
const args=process.argv.slice(2);
if(args.length!==1||!["--status","--require-ready"].includes(args[0])){
  console.error("Usage: release-readiness.mjs --status | --require-ready");
  process.exit(2);
}
const strict=args[0]==="--require-ready";
let sha=null,clean=false;
try {
  sha=execFileSync("git",["rev-parse","--verify","HEAD"],{
    cwd:root,encoding:"utf8",timeout:5000
  }).trim();
  // A dirty tree invalidates the exact-source claim even when HEAD is valid.
  clean=execFileSync("git",["status","--porcelain","--untracked-files=normal"],{
    cwd:root,encoding:"utf8",timeout:5000
  }).trim()==="";
}catch{
  // No git checkout or detached/invalid revision => fail closed.
}
const result=evaluateReleaseReadiness(read("registry/release-plan.v1.json"),read("package.json"),{
  sourceSha:sha,cleanTree:clean
});
if(strict){
  if(result.ready){
    console.log("Stable 1.0 candidate metadata validated for "+sha+
      "; reviewer must independently verify source evidence before any release");
  }else{
    console.error("Stable 1.0.0 blocked:\n"+result.blockers.map(s=>"- "+s).join("\n"));
    process.exitCode=1;
  }
}else console.log(JSON.stringify(result,null,2));
