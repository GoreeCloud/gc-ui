import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,symlinkSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {digestInstalledFiles} from "../scripts/installed-file-digests.mjs";

test("actual installed package file SHA-256 values are source-bound and deterministic",()=>{
 const root=mkdtempSync(join(tmpdir(),"gc-ui-file-digest-test-"));
 try{
  mkdirSync(join(root,"src"));
  writeFileSync(join(root,"src","foundation.js"),"export const meaning=42;\n");
  writeFileSync(join(root,"LICENSE"),"MIT License");
  const files=[{path:"src/foundation.js",size:readFileSync(join(root,"src","foundation.js")).length},
    {path:"LICENSE",size:11}];
  const output=digestInstalledFiles(root,files);
  assert.deepEqual(output.map(f=>f.path),["LICENSE","src/foundation.js"]);
  for(const file of output)assert.equal(file.sha256,
    createHash("sha256").update(readFileSync(join(root,file.path))).digest("hex"));
  const modified=readFileSync(join(root,"src","foundation.js"),"utf8").replace("42","43");
  writeFileSync(join(root,"src","foundation.js"),modified);
  assert.notDeepEqual(digestInstalledFiles(root,files),output,"Same-size modification must change digest");
 }finally{rmSync(root,{recursive:true,force:true});}
});
test("installed package file hashing fails on size drift, symlinks, escapes, duplicate files",()=>{
 const root=mkdtempSync(join(tmpdir(),"gc-ui-file-attack-"));
 try{
  writeFileSync(join(root,"README.md"),"source");
  const original=[{path:"README.md",size:6}];
  assert.equal(digestInstalledFiles(root,original).length,1);
  assert.throws(()=>digestInstalledFiles(root,[{path:"README.md",size:5}]),/size mismatch/);
  assert.throws(()=>digestInstalledFiles(root,[...original,...original]),/duplicate/);
  assert.throws(()=>digestInstalledFiles(root,[{path:"../secret",size:6}]),/Invalid/);
  assert.throws(()=>digestInstalledFiles(root,[{path:"src/.env",size:6}]),/Invalid/);
  assert.throws(()=>digestInstalledFiles(root,null),TypeError);
  symlinkSync(join(root,"README.md"),join(root,"LICENSE"));
  assert.throws(()=>digestInstalledFiles(root,[{path:"LICENSE",size:6}]),/type\/size mismatch/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
