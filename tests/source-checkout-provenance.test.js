import {test} from "node:test";
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {mkdtempSync,rmSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {assertCleanGitCheckout} from "../scripts/source-checkout-provenance.mjs";

test("exact-source package proof accepts only a clean committed local Git tree",()=>{
 const dir=mkdtempSync(join(tmpdir(),"gc-ui-source-provenance-"));
 const git=(...args)=>execFileSync("git",["-C",dir,...args],{encoding:"utf8",timeout:8000});
 try{
   git("init","-q");
   git("config","user.email","ci@example.invalid");
   git("config","user.name","Release QA");
   writeFileSync(join(dir,"sample.js"),"export const x=1;\n");
   git("add","sample.js");
   git("commit","-q","-m","fixture");
   const head=git("rev-parse","--verify","HEAD").trim();
   assert.equal(assertCleanGitCheckout(dir),head);
   writeFileSync(join(dir,"sample.js"),"export const x=2;\n");
   assert.throws(()=>assertCleanGitCheckout(dir),/checkout is dirty/);
   git("checkout","--","sample.js");
   writeFileSync(join(dir,"untracked-file"),"hidden payload");
   assert.throws(()=>assertCleanGitCheckout(dir),/checkout is dirty/);
   rmSync(join(dir,"untracked-file"));
   assert.equal(assertCleanGitCheckout(dir),head);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test("source proof fails closed for non-checkouts and invalid directory",()=>{
 const temp=mkdtempSync(join(tmpdir(),"gc-ui-not-a-git-repo-"));
 try{
   assert.throws(()=>assertCleanGitCheckout(temp),/cannot be independently verified/);
   assert.throws(()=>assertCleanGitCheckout("relative/source"),TypeError);
 }finally{rmSync(temp,{recursive:true,force:true});}
});
