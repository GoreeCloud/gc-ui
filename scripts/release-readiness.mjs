#!/usr/bin/env node
/** Deterministic, read-only, fail-closed release readiness report. */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root=fileURLToPath(new URL("../",import.meta.url));
const read=path=>JSON.parse(readFileSync(join(root,path),"utf8"));
const plan=read("registry/release-plan.v1.json");
const pkg=read("package.json");
const args=process.argv.slice(2);
if(args.length>1||args.some(a=>!["--status","--require-ready"].includes(a))) {
  throw new Error("Use --status or --require-ready");
}
const strict=args.includes("--require-ready");
const blockers=[];
const required=(condition,label)=>{if(!condition)blockers.push(label);};
required(plan.schemaVersion===1,"Release plan schema is not version 1");
required(plan.authority==="GoreeCloud UI","Release authority mismatch");
required(plan.strategy==="web-first-incremental-stable","Release strategy mismatch");
required(plan.currentPackageVersion===pkg.version,"Plan current package version is stale");
required(plan.targetStableVersion==="1.0.0","Unexpected target Stable version");
required(plan.webFoundations?.status==="planned"||plan.webFoundations?.status==="candidate"||plan.webFoundations?.status==="verified",
  "Unknown web foundations state");
const candidates=plan.webFoundations?.candidateStableExports||[];
const preview=plan.webFoundations?.deferredPreviewExports||[];
const review=plan.webFoundations?.requiringClassification||[];
const classifications=[...candidates,...preview,...review];
required(new Set(classifications).size===classifications.length,"Export classifications overlap");
required(classifications.length===Object.keys(pkg.exports).length &&
  Object.keys(pkg.exports).every(key=>classifications.includes(key)),
  "Every current public package export must be classified");
required(review.length===0,"Root and other unresolved public API classifications");
required(pkg.version===plan.targetStableVersion,"Package is not version 1.0.0");
required(plan.status==="candidate-verified","Stable candidate has not been verified");
const gates=plan.gates||[];
required(gates.length>=7 && new Set(gates.map(g=>g.id)).size===gates.length,"Missing or duplicated 1.0 acceptance gates");
let sha=null;
if(strict){
  try { sha=execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim(); }
  catch { blockers.push("Cannot identify exact checked release commit"); }
}
for(const gate of gates){
  if(!gate.blocking)continue;
  if(gate.status!=="verified"){blockers.push("Open gate: "+gate.id);continue;}
  if(!Array.isArray(gate.evidence)||gate.evidence.length===0){
    blockers.push("Gate lacks reproducible evidence: "+gate.id);continue;
  }
  if(gate.evidence.some(e=>!e||!/^https:\/\//.test(e.url||"")||
    !/^[a-f0-9]{40}$/.test(e.sourceSha||"")||
    !e.testedAt||Number.isNaN(Date.parse(e.testedAt))||
    typeof e.summary!=="string"||e.summary.length<15||
    (sha!==null && e.sourceSha!==sha))){
    blockers.push("Invalid or stale evidence: "+gate.id);
  }
}
const result={target:plan.targetStableVersion,current:pkg.version,ready:blockers.length===0,blockers};
if(strict){
  if(blockers.length) {
    console.error("Stable 1.0.0 blocked:\n"+blockers.map(x=>"- "+x).join("\n"));
    process.exitCode=1;
  }else{
    console.log("Stable 1.0.0 candidate gates verified on exact source revision");
  }
}else {
  console.log(JSON.stringify(result,null,2));
}
