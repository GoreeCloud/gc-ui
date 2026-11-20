#!/usr/bin/env node
// Opt-in, local-only Android emulator runtime smoke. No installation,
// device discovery, account access, network, telemetry or physical-device use.
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";

const pkg="com.goreecloud.ui.samples.interop";
const activity=pkg+"/.IntegrationActivity";
const guard=pkg+".DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION";
const argv=process.argv.slice(2);
if(argv.length!==2||argv[0]!=="--serial"||!/^emulator-[0-9]{4,5}$/.test(argv[1])) {
  console.error("Usage: node scripts/verify-android-emulator.mjs --serial emulator-NNNN");
  console.error("An existing, explicitly named test emulator is REQUIRED; physical devices are forbidden.");
  process.exitCode=2;
} else {
  const serial=argv[1];
  const adbBin=process.env.GC_ADB_BIN||"adb";
  const adb=(...args)=>execFileSync(adbBin,["-s",serial,...args],{
    encoding:"utf8",timeout:25_000,maxBuffer:4_000_000,stdio:["ignore","pipe","pipe"]
  }).trim();
  const remote="/sdcard/gc_ui_smoke_"+process.pid+"_"+Date.now()+".xml";
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const body=async()=>{
    assert.equal(adb("get-state"),"device","Selected emulator must be online");
    assert.equal(adb("shell","getprop","ro.kernel.qemu"),"1",
      "Refusing to operate on anything but an Android emulator");
    assert.equal(adb("shell","getprop","sys.boot_completed"),"1",
      "Refusing to test before emulator boot completes");
    assert.match(adb("shell","pm","path",pkg),/^package:\/data\/app\//,
      "Dev fixture must already be installed; this command NEVER installs packages");
    const info=adb("shell","dumpsys","package",pkg);
    assert.match(info,/versionName=0\.0\.0-dev\b/,
      "Refusing to test anything except the synthetic development fixture");
    const permissions=info.match(/requested permissions:\s*\n([\s\S]*?)\n\s*install permissions:/)?.[1]||"";
    const requested=permissions.split("\n").map(s=>s.trim()).filter(Boolean);
    assert.ok(requested.length<=1&&requested.every(s=>s===guard),
      "Unexpected merged Android permissions in synthetic fixture");

    // Restart only our test fixture; no changes to other apps, system theme,
    // emulator settings, camera, accounts or user data.
    adb("shell","am","force-stop",pkg);
    assert.match(adb("shell","am","start","-n",activity),/Starting:|Warning:/);
    const snapshot=async()=>{
      // AOSP UIAutomator may need a short moment after Activity recreation.
      for(let attempt=0;attempt<3;attempt++){
        try{
          adb("shell","uiautomator","dump",remote);
          const xml=adb("exec-out","cat",remote);
          if(xml.includes('text="GoreeCloud UI integration"'))return xml;
        }catch(e){if(attempt===2)throw e;}
        await delay(500);
      }
      throw Error("Synthetic UI did not become accessible");
    };
    try{
      const initial=await snapshot();
      assert.match(initial,/text="GoreeCloud UI integration"/);
      assert.match(initial,/text="Local button taps: 0"/,
        "Restarted fixture did not begin with truthful zero state");
      assert.match(initial,/text="Development-only fixture\. No live data or services\."/);
      const button=initial.match(/<node\b[^>]*\btext="Count a tap"[^>]*>/)?.[0];
      assert.ok(button,"Accessible native Compose button label missing");
      const coords=button.match(/bounds="\[([0-9]+),([0-9]+)\]\[([0-9]+),([0-9]+)\]"/);
      assert.ok(coords,"Native button has no accessible hit bounds");
      const [,left,top,right,bottom]=coords.map(Number);
      assert.ok(right>left&&bottom>top,"Native button hit rectangle invalid");
      adb("shell","input","tap",String(Math.floor((left+right)/2)),
        String(Math.floor((top+bottom)/2)));
      await delay(500);
      const updated=await snapshot();
      assert.match(updated,/text="Local button taps: 1"/,
        "Real emulator tap did not update visible Compose state");
      const mode=adb("shell","cmd","uimode","night");
      console.log("PASS Android emulator runtime: "+serial+" / "+
        "synthetic package "+pkg+" / native button 0→1 / "+
        "visible accessibility labels / "+mode.replace(/\s+/g," ").trim());
    }finally{
      // Only our unique throwaway XML; never erase user/device paths.
      try{adb("shell","rm","-f",remote);}catch{}
    }
  };
  try{await body();}catch(err){
    console.error("Emulator smoke FAILED: "+(err?.message||String(err)).slice(0,400));
    process.exitCode=1;
  }
}
