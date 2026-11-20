import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,chmodSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";

const root=new URL("../",import.meta.url);
const runner=new URL("../scripts/verify-android-emulator.mjs",import.meta.url);

test("physical-device serials are rejected before any ADB access", () => {
  for(const args of [[],["--serial","USB012345"],["--serial","127.0.0.1:5555"],["--serial","device"]]) {
    const r=spawnSync(process.execPath,[runner.pathname,...args],{
      encoding:"utf8",timeout:5000,
      env:{...process.env,GC_ADB_BIN:"/missing-adb-intentionally"}
    });
    assert.equal(r.status,2);
    assert.match(r.stderr,/physical devices are forbidden/);
  }
});

const fake=String.raw`#!/usr/bin/env node
import {readFileSync,writeFileSync} from "node:fs";
const file=process.env.GC_TEST_ADB_STATE;
const s=JSON.parse(readFileSync(file,"utf8"));
const [,serial,...a]=process.argv.slice(2);
const cmd=a.join(" ");
s.commands.push(cmd);
const done=(text="")=>{writeFileSync(file,JSON.stringify(s));process.stdout.write(text);};
if(serial!=="emulator-5588")process.exit(50);
if(cmd==="get-state")done("device");
else if(cmd==="shell getprop ro.kernel.qemu")done(s.isEmulator?"1":"0");
else if(cmd==="shell getprop sys.boot_completed")done("1");
else if(cmd==="shell pm path com.goreecloud.ui.samples.interop")done("package:/data/app/mock/base.apk");
else if(cmd==="shell dumpsys package com.goreecloud.ui.samples.interop")done(
  "Package: com.goreecloud.ui.samples.interop\nversionName=0.0.0-dev\nrequested permissions:\n"+
  s.permissions.map(p=>"    "+p+"\n").join("")+"install permissions:\n");
else if(cmd==="shell am force-stop com.goreecloud.ui.samples.interop"){s.taps=0;done();}
else if(cmd==="shell am start -n com.goreecloud.ui.samples.interop/.IntegrationActivity")done("Starting: Intent { cmp=... }");
else if(cmd.startsWith("shell uiautomator dump /sdcard/gc_ui_smoke_"))done("UI hierchary dumped");
else if(cmd.startsWith("exec-out cat /sdcard/gc_ui_smoke_"))done(
  '<hierarchy><node text="GoreeCloud UI integration"/>'+
  '<node text="Local button taps: '+s.taps+'"/>'+
  '<node text="Count a tap" bounds="[64,422][139,442]"/>'+
  '<node text="Development-only fixture. No live data or services."/></hierarchy>');
else if(cmd.startsWith("shell input tap ")){const [, , ,x,y]=a; s.taps++;done();}
else if(cmd==="shell cmd uimode night")done("Night mode: no");
else if(cmd.startsWith("shell rm -f /sdcard/gc_ui_smoke_"))done();
else {done();console.error("Unexpected fake ADB command: "+cmd);process.exit(51);}
`;

const runWithMock=overrides=>{
  const dir=mkdtempSync(join(tmpdir(),"gc-ui-emulator-contract-"));
  try{
    const adb=join(dir,"fake-adb.mjs"),state=join(dir,"state.json");
    writeFileSync(adb,fake);
    chmodSync(adb,0o700);
    writeFileSync(state,JSON.stringify({
      isEmulator:true,taps:0,commands:[],
      permissions:["com.goreecloud.ui.samples.interop.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION"],
      ...overrides
    }));
    const result=spawnSync(process.execPath,[runner.pathname,"--serial","emulator-5588"],{
      encoding:"utf8",timeout:20000,
      env:{...process.env,GC_ADB_BIN:adb,GC_TEST_ADB_STATE:state}
    });
    return {result,state:JSON.parse(readFileSync(state,"utf8"))};
  }finally{rmSync(dir,{recursive:true,force:true});}
};

test("real runner requires QEMU and never acts on spoofed emulator serial",()=>{
  const {result,state}=runWithMock({isEmulator:false});
  assert.equal(result.status,1);
  assert.match(result.stderr,/Refusing to operate/);
  assert.equal(state.commands.some(c=>c.includes("am force-stop")),false);
});

test("real runner rejects unexpected merged Android permissions before launch",()=>{
  const {result,state}=runWithMock({permissions:["android.permission.INTERNET"]});
  assert.equal(result.status,1);
  assert.match(result.stderr,/Unexpected merged Android permissions/);
  assert.equal(state.commands.some(c=>c.includes("am force-stop")),false);
});

test("real runner exercises only an installed synthetic app's accessible tap feedback",()=>{
  const {result,state}=runWithMock({});
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/native button 0→1/);
  assert.equal(state.taps,1);
  assert.ok(state.commands.some(c=>c.startsWith("shell input tap ")));
  assert.ok(state.commands.some(c=>c.startsWith("shell rm -f /sdcard/gc_ui_smoke_")));
  assert.equal(state.commands.some(c=>/\binstall\b|\buninstall\b|\bdevices\b/.test(c)),false);
  assert.equal(state.commands.some(c=>/wm size|wm density|cmd uimode night yes/.test(c)),false);
});
