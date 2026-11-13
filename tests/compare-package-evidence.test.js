import {test} from "node:test";
import assert from "node:assert/strict";
import {comparePackageEvidence} from "../scripts/compare-package-evidence.mjs";
const sourceSha="24022457c4d2cb47f872d0240fd11cacfa6c232e",sha256="39761af381018e6521848aa79ad1087e3a1c4cea3b40a84a333917f5f5fc2ebb";
const candidate=(major)=>({
 schemaVersion:1,kind:"offline-verified-package-candidate",status:"development-evidence-not-stable",
 published:false,signed:false,sourceSha,
 package:{name:"@goreecloud/ui",version:"1.0.0",tarball:"goreecloud-ui-1.0.0.tgz",
  bytes:192852,sha256,sha512Integrity:"sha512-/jnklXiMFQuqHa+OsHdm8Ue1nGFiYFl1OsSHvtY5YTwWviJbdmWoPsDdjLhmeAnSrQe3wcGAyKV5MlRYbEDjdg=="},
 runtime:{node:major+".1.2",npm:"10.9.9"},
 checks:{generatorOutputsChecked:true,everyPublicExportResolved:true,installedOffline:true,
  installScriptsDisabled:true,publicTypeGraphChecked:true,typeEntryCount:12,
  installedFileDigestsChecked:true,publicExportCount:19,packedFileCount:2,
  isolatedConsumerResult:"Verified 19 public specifiers from installed offline tarball"},
 packedFiles:[{path:"LICENSE",size:1067,sha256:"a".repeat(64)},
  {path:"src/foundation.js",size:386,sha256:"b".repeat(64)}]
});
const clone=x=>JSON.parse(JSON.stringify(x)),base=()=>[candidate(20),candidate(22),candidate(24)];
const compare=records=>comparePackageEvidence(records,{sourceSha,version:"1.0.0"});
test("three exact-SHA CI package manifests must agree byte-for-byte",()=>{
 const result=compare(base());
 assert.equal(result.verified,true,result.errors.join("\n"));
 assert.deepEqual(result.nodeMajors,[20,22,24]);
 assert.equal(result.sha256,sha256);
 assert.equal(result.tarball,"goreecloud-ui-1.0.0.tgz");
});
test("mismatched source, archive hash, file list, or missing runtime fail closed",()=>{
 const edits=[
  x=>x[1].sourceSha="0000000000000000000000000000000000000000",
  x=>x[1].package.sha256="0".repeat(64),
  x=>x[1].package.bytes+=3,
  x=>x[1].packedFiles[1].size++,
  x=>x[1].packedFiles[1].sha256="c".repeat(64),
  x=>x[1].packedFiles[1].sha256="invalid",
  x=>x[1].checks.installedFileDigestsChecked=false,
  x=>x[1].checks.installedOffline=false,
  x=>x[1].checks.publicTypeGraphChecked=false,
  x=>x[1].checks.typeEntryCount=2,
  x=>x[1].checks.publicExportCount=18,
  x=>x[1].signed=true,
  x=>x[1].published=true,
  x=>x[1].runtime.node="20.2.0",
  x=>x[1].package.version="1.0.1",
  x=>x[1].package.sha512Integrity="sha512-bad",
  x=>x[1].packedFiles[1].path="../private/token"
 ];
 for(const edit of edits){
  const records=base();edit(records);
  assert.equal(compare(records).verified,false,JSON.stringify(edit));
 }
 const missing=base();missing.pop();
 assert.equal(compare(missing).verified,false);
 const extra=base();extra.push(candidate(24));
 assert.equal(compare(extra).verified,false);
});
test("report is an unsigned development verification, not a Stable release decision",()=>{
 const r=compare(base());assert.equal(r.verified,true);
 assert.equal(Object.hasOwn(r,"stableAccepted"),false);
 assert.equal(comparePackageEvidence(base(),{sourceSha:"wrong"}).verified,false);
 assert.equal(compare(null).verified,false);
});
