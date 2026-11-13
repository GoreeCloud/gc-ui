#!/usr/bin/env node
/**
 * Verifies every declared public export in an exact tarball, entirely offline.
 * No registry, telemetry, installer scripts or third-party dependencies.
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { auditPackageExports } from "./package-audit.mjs";

const root=fileURLToPath(new URL("../",import.meta.url));
const pkg=JSON.parse(readFileSync(join(root,"package.json"),"utf8"));
const temp=mkdtempSync(join(tmpdir(),"gc-ui-package-audit-"));
const npm=process.platform==="win32"?"npm.cmd":"npm";
const run=(cmd,args,cwd)=>execFileSync(cmd,args,{
  cwd,encoding:"utf8",timeout:90000,maxBuffer:8*1024*1024,
  env:{...process.env,npm_config_audit:"false",npm_config_fund:"false"}
});
try {
  // Check generated assets byte-for-byte; do not regenerate and silently alter
  // source material between the commit under test and npm pack.
  for(const task of ["tokens:check","icons:check","export:check"]) {
    run(npm,["run",task,"--offline"],root);
  }
  const packed=JSON.parse(run(npm,[
    "pack","--json","--ignore-scripts","--offline","--pack-destination",temp
  ],root));
  if(packed.length!==1 || packed[0].name!==pkg.name ||
    packed[0].version!==pkg.version)throw new Error("Unexpected packed artifact");
  const meta=packed[0];
  const files=new Set(meta.files.map(f=>f.path));
  const entries=auditPackageExports(pkg,files);
  for(const f of meta.files){
    if(!Number.isSafeInteger(f.size)||f.size<=0)throw new Error("Empty or invalid packed file: "+f.path);
    if(/(?:^|\/)(?:\.env(?:\.|$)|\.github|node_modules|tests)(?:\/|$)/.test(f.path))
      throw new Error("Non-runtime or secret material in package: "+f.path);
  }
  // Npm's integrity digest is recomputed from the actual tarball bytes, not
  // trusted solely from package metadata or the checkout.
  const archive=readFileSync(join(temp,meta.filename));
  const sha512="sha512-"+createHash("sha512").update(archive).digest("base64");
  if(sha512!==meta.integrity)throw new Error("Tarball digest mismatch");
  const consumer=join(temp,"consumer");
  mkdirSync(consumer,{recursive:true});
  run(npm,["install","--offline","--ignore-scripts","--no-audit","--no-fund",
    "--package-lock=false","--prefix",consumer,join(temp,meta.filename)],consumer);
  // Run in the isolated installed consumer rather than against the repo tree.
  const consumerSource=`
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const entries=${JSON.stringify(entries)};
const identity=${JSON.stringify({name:pkg.name,version:pkg.version})};
const pkg=JSON.parse(readFileSync(fileURLToPath(import.meta.resolve("@goreecloud/ui/../package.json")),"utf8"));
assert.equal(pkg.name,identity.name);
assert.equal(pkg.version,identity.version);
for(const entry of entries) {
  const name="@goreecloud/ui"+(entry.specifier==="."?"":entry.specifier.slice(1));
  const path=fileURLToPath(import.meta.resolve(name));
  const asset=readFileSync(path);
  assert.ok(asset.length>0,name+" empty");
  if(entry.kind==="js") {
    const exports=await import(name);
    assert.ok(Object.keys(exports).length>0,name+" has no exports");
  }else if(entry.target.endsWith(".json")){
    JSON.parse(asset.toString("utf8"));
  }else if(entry.target.endsWith(".css")){
    assert.match(asset.toString("utf8"),/gc[-_]/);
  }else if(entry.target.endsWith(".svg")){
    assert.match(asset.toString("utf8"),/<svg/);
  }
}
const root=await import("@goreecloud/ui");
assert.equal(typeof root.applyTheme,"function");
assert.equal(typeof root.initSignalBoard,"function");
console.log("Verified "+entries.length+" public specifiers from installed offline tarball");
`;
  writeFileSync(join(consumer,"verify.mjs"),consumerSource,"utf8");
  console.log(run(process.execPath,["verify.mjs"],consumer).trim());
  console.log("Packaged "+files.size+" files; SHA512 digest rechecked locally; no script execution");
}finally {
  rmSync(temp,{recursive:true,force:true});
}
