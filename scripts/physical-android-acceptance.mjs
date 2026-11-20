#!/usr/bin/env node
// Real-device acceptance is explicit opt-in and never installs, starts, signs
// or removes an app. Only touches the already foreground synthetic GC UI fixture.
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
const serial=process.env.GC_ANDROID_DEVICE_SERIAL||"";
if(!/^[\w.:+-]{3,100}$/.test(serial)||process.env.GC_PHYSICAL_TEST_ACK!=="synthetic-ui-only")
  throw Error("Set GC_ANDROID_DEVICE_SERIAL and GC_PHYSICAL_TEST_ACK=synthetic-ui-only explicitly.");
const pkg="com.goreecloud.ui.samples.interop";
function adb(...args){
 const r=spawnSync("adb",["-s",serial,...args],{encoding:"utf8",timeout:20000,maxBuffer:1024*1024});
 if(r.error||r.status!==0) throw Error("ADB fixture operation failed: "+args[0]+" "+(r.stderr||r.error?.message||""));
 return r.stdout;
}
assert.equal(adb("get-state").trim(),"device","Device not authorized");
assert.notEqual(adb("shell","getprop","ro.kernel.qemu").trim(),"1","Emulators do not qualify as physical");
assert.match(adb("shell","pm","path",pkg),/^package:/m,"Synthetic package must be installed manually");
assert.match(adb("shell","dumpsys","package",pkg),/versionName=0\.0\.0-dev/,
  "Unexpected installed package version");
const activity=adb("shell","dumpsys","activity","activities");
assert.match(activity,/topResumedActivity=[^\n]*com\.goreecloud\.ui\.samples\.interop/,
  "Synthetic fixture must already be foreground; no unrelated app is inspected");
const before="/sdcard/gc_ui_physical_qa_before.xml",after="/sdcard/gc_ui_physical_qa_after.xml";
try{
 adb("shell","uiautomator","dump",before);
 const xml=adb("exec-out","cat",before);
 const current=xml.match(/text="Local button taps: (\d+)"/);
 assert.ok(current,"Missing synthetic local counter");
 const node=xml.match(/<node\b(?=[^>]*text="Count a tap")[^>]*>/);
 assert.ok(node,"Expected synthetic button is not accessible");
 const rect=node[0].match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
 assert.ok(rect,"Button must have valid bounds");
 const [x1,y1,x2,y2]=rect.slice(1).map(Number);
 assert.ok(x2>x1&&y2>y1&&x2<=10800&&y2<=10800,"Refusing unexpected touch coordinates");
 adb("shell","input","tap",String(Math.floor((x1+x2)/2)),String(Math.floor((y1+y2)/2)));
 adb("shell","uiautomator","dump",after);
 const updated=adb("exec-out","cat",after);
 const target=Number(current[1])+1;
 assert.ok(updated.includes('text="Local button taps: '+target+'"'),
   "Physical touchscreen action did not update the local Compose counter");
 assert.ok(updated.includes("Development-only fixture. No live data or services."),
   "Expected synthetic-only disclaimer disappeared");
 console.log("PASS physical Android Compose UI: local counter "+
   Number(current[1])+" -> "+target+", real ADB input, accessible label and no service use");
}finally{
 try{adb("shell","rm","-f",before,after)}catch{console.error("QA XML cleanup requires manual inspection");}
}
