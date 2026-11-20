import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {spawnSync} from "node:child_process";
const base=new URL("../",import.meta.url);
const read=p=>readFileSync(new URL(p,base),"utf8");

test("real-device acceptance refuses implicit device selection without ADB interaction",()=>{
 const p=new URL("scripts/physical-android-acceptance.mjs",base);
 const r=spawnSync(process.execPath,[p.pathname],{encoding:"utf8",timeout:5000,
   env:{...process.env,GC_ANDROID_DEVICE_SERIAL:"",GC_PHYSICAL_TEST_ACK:""}});
 assert.notEqual(r.status,0);
 assert.match(r.stderr,/Set GC_ANDROID_DEVICE_SERIAL/);
 const s=read("scripts/physical-android-acceptance.mjs");
 assert.match(s,/ro\.kernel\.qemu/);
 assert.match(s,/topResumedActivity/);
 assert.match(s,/com\.goreecloud\.ui\.samples\.interop/);
 assert.match(s,/synthetic-ui-only/);
 assert.doesNotMatch(s,/adb install|adb uninstall|setprop|settings put|am start|\bINTERNET\b/);
});
test("phone browser local source server blocks unrelated data paths",()=>{
 const s=read("scripts/phone-browser-qa-server.mjs");
 assert.match(s,/server\.listen\(18745,'127\.0\.0\.1'/);
 assert.match(s,/\^\(src\|lab\|assets\|tests\)/);
 assert.match(s,/req\.method!=='GET'/);
 assert.ok(!s.includes("0.0.0.0"));
});
test("physical review captures are synthetic and release remains explicitly blocked",()=>{
 const a=read("docs/DEVICE_AND_HUMAN_ACCEPTANCE_20261120.md");
 const b=read("docs/FOUNDER_VISUAL_AND_RELEASE_REVIEW_20261120.md");
 assert.match(a,/human assistive-technology acceptance NOT EXECUTED/);
 assert.match(a,/TalkBack/);
 assert.match(a,/0 → 1/);
 assert.match(b,/Founder decision: \*\*NOT GIVEN/);
 assert.match(b,/BLOCKED \/ NOT AUTHORIZED/);
 for(const s of ["physical-android-compose-20261120.png","physical-android-chrome-shortcut-20261120.png"]){
  const p=new URL("docs/evidence/"+s,base);
  assert.ok(existsSync(p));
  const png=readFileSync(p);
  assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
  assert.ok(png.length>10000&&png.length<2*1024*1024);
 }
});
