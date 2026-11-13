#!/usr/bin/env node
/**
 * Read-only, fail-closed Stable 1.0 evidence gate. No release/publish side effects.
 * Structured metadata checks are not independent verification of linked evidence.
 */
import { readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, sep } from "node:path";
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
// Optional external file is a *manually reviewed, post-commit* release
// decision record. Keep it outside the tracked repository to avoid changing
// its own SHA. Without it, all current source gates stay fail-closed.
let externalEvidence=null;
if(process.env.GC_UI_RELEASE_EVIDENCE_FILE){
  try{
    const input=process.env.GC_UI_RELEASE_EVIDENCE_FILE;
    if(!isAbsolute(input))throw new Error("Path must be absolute");
    const evidencePath=realpathSync(input);
    const out=relative(root,evidencePath);
    if(out==="" || (!out.startsWith(".."+sep)&&out!==".."&&!isAbsolute(out)))
      throw new Error("Evidence must be outside the Git worktree");
    const info=statSync(evidencePath);
    if(!info.isFile() || info.size>262144)throw new Error("Invalid evidence file size/type");
    externalEvidence=JSON.parse(readFileSync(evidencePath,"utf8"));
  }catch(error){
    console.error("Release evidence rejected: "+String(error.message||error));
    process.exit(1);
  }
}
const result=evaluateReleaseReadiness(read("registry/release-plan.v1.json"),read("package.json"),{
  sourceSha:sha,cleanTree:clean,externalEvidence
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
