#!/usr/bin/env node
/** Offline verification of independent package evidence from Node 20/22/24. */
import { readFileSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
const MAJORS=[20,22,24], expectedType="development-evidence-not-stable";
const hex=(s,length)=>typeof s==="string" && new RegExp("^[a-f0-9]{"+length+"}$").test(s);
const same=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
const sha512Valid=s=>typeof s==="string" && s.startsWith("sha512-") &&
  /^[A-Za-z0-9+/]+={0,2}$/.test(s.slice(7)) &&
  Buffer.from(s.slice(7),"base64").length===64;

/** Pure structural and cross-runtime comparison. Does not verify GitHub claims. */
export function comparePackageEvidence(records,{sourceSha,version="1.0.0"}={}){
  const errors=[], reject=(okay,message)=>{if(!okay)errors.push(message)};
  reject(hex(sourceSha,40),"Expected exact 40-digit source SHA");
  reject(Array.isArray(records)&&records.length===MAJORS.length,
    "Provide exactly one evidence record for each Node 20/22/24 job");
  const first=Array.isArray(records)?records[0]:null;
  const seen=[];
  if(Array.isArray(records))for(const record of records){
    if(!record || typeof record!=="object" || Array.isArray(record)){
      errors.push("Malformed package evidence record");continue;
    }
    const runtime=record.runtime||{}, pkg=record.package||{}, checks=record.checks||{};
    const major=Number(String(runtime.node||"").split(".")[0]);
    seen.push(major);
    reject(MAJORS.includes(major),"Unsupported Node major: "+String(major));
    reject(record.schemaVersion===1 && record.kind==="offline-verified-package-candidate",
      "Unknown package evidence schema");
    reject(record.status===expectedType && record.signed===false &&
      record.published===false,"Evidence must be explicitly unsigned and unpublished");
    reject(record.sourceSha===sourceSha,"Evidence source SHA does not match expected commit");
    reject(pkg.name==="@goreecloud/ui" && pkg.version===version,
      "Wrong candidate package name/version");
    reject(pkg.tarball==="goreecloud-ui-"+version+".tgz",
      "Unexpected npm tarball name");
    reject(Number.isSafeInteger(pkg.bytes) && pkg.bytes>0 &&
      hex(pkg.sha256,64) && sha512Valid(pkg.sha512Integrity),
      "Missing or malformed artifact digest/size");
    reject(checks.publicTypeGraphChecked===true &&
      Number.isSafeInteger(checks.typeEntryCount) &&
      checks.typeEntryCount>0 && checks.typeEntryCount<=checks.publicExportCount,
      "Installed public type declaration graph unchecked");
    reject(checks.generatorOutputsChecked===true &&
      checks.everyPublicExportResolved===true &&
      checks.installedOffline===true &&
      checks.installScriptsDisabled===true,
      "Missing offline verified consumer checks");
    reject(checks.installedFileDigestsChecked===true,
      "Missing installed per-file SHA-256 verification");
    const files=record.packedFiles;
    reject(Array.isArray(files) && files.length>0 &&
      files.every(f=>typeof f?.path==="string" && f.path.length>0 &&
        !f.path.startsWith("/") && !f.path.includes("..") &&
        Number.isSafeInteger(f.size) && f.size>0 &&
        hex(f.sha256,64)) &&
      new Set(files.map(f=>f.path)).size===files.length,
      "Invalid packed-file inventory");
    reject(Number.isSafeInteger(checks.publicExportCount) && checks.publicExportCount>0 &&
      Number.isSafeInteger(checks.packedFileCount) &&
      checks.packedFileCount===files?.length,
      "Packed-file/export count mismatch");
    reject(typeof checks.isolatedConsumerResult==="string" &&
      checks.isolatedConsumerResult.includes("Verified "+checks.publicExportCount+" public specifiers"),
      "Missing completed installed consumer receipt");
    if(first && record!==first){
      const refPkg=first.package||{},refChecks=first.checks||{};
      for(const key of ["name","version","tarball","bytes","sha256","sha512Integrity"])
        reject(refPkg[key]===pkg[key],"Cross-Node package mismatch: "+key);
      for(const key of ["publicExportCount","packedFileCount","typeEntryCount"])
        reject(refChecks[key]===checks[key],"Cross-Node verification mismatch: "+key);
      reject(same(first.packedFiles,files),"Cross-Node packed file inventory mismatch");
    }
  }
  reject(same([...seen].sort((a,b)=>a-b),MAJORS),
    "Missing or duplicated expected Node major");
  return Object.freeze({verified:errors.length===0,
    sourceSha:sourceSha||null,version,sha256:first?.package?.sha256||null,
    tarball:first?.package?.tarball||null,
    nodeMajors:[...seen].sort((a,b)=>a-b),errors});
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  const args=process.argv.slice(2);
  if(args.length!==7 || args[0]!=="--source-sha" || args[2]!=="--version"){
    console.error("Usage: node scripts/compare-package-evidence.mjs --source-sha SHA --version VERSION node20.json node22.json node24.json");
    process.exit(2);
  }
  try{
    const entries=args.slice(4).map(path=>{
      const stat=statSync(path);
      if(!stat.isFile() || stat.size>262144)throw new Error("Evidence file invalid or exceeds 256 KiB");
      return JSON.parse(readFileSync(path,"utf8"));
    });
    const report=comparePackageEvidence(entries,{sourceSha:args[1],version:args[3]});
    console.log(JSON.stringify(report,null,2));
    if(!report.verified)process.exitCode=1;
  }catch(error){
    console.error("Invalid release package evidence: "+String(error?.message||error));
    process.exitCode=1;
  }
}
