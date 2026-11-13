import {test} from "node:test";
import assert from "node:assert/strict";
import { pngReceipt } from "../scripts/record-browser-evidence.mjs";
import { verifyBrowserEvidence } from "../scripts/verify-browser-evidence.mjs";
import { readFileSync } from "node:fs";

const sha="699dfab08b86c650b9159fd4b30483fd36c07746";
const signature=Buffer.from("89504e470d0a1a0a","hex");
function png(w,h){const b=Buffer.alloc(10200);signature.copy(b,0);
  b.writeUInt32BE(13,8);b.write("IHDR",12);b.writeUInt32BE(w,16);b.writeUInt32BE(h,20);return b;}
const clone=x=>JSON.parse(JSON.stringify(x));
function receipt(){
  const names=["gc-ui-light-desktop.png","gc-ui-dark-mobile.png","gc-ui-light-mobile-320.png",
    ...Array.from({length:50},(_,i)=>"gc-ui-independent-"+i+".png")];
  const map=new Map(names.map((name,i)=>[name,i===0?png(1440,900):i===1?png(390,844):i===2?png(320,760):png(390,844)]));
  const screenshots=[...map].map(([name,bytes])=>({...pngReceipt(name,bytes)}));
  const manifest={schemaVersion:1,kind:"chromium-screenshot-evidence",
    status:"development-evidence-not-stable",published:false,signed:false,
    sourceSha:sha,browserVersion:"Google Chrome 157.0.8103.50",
    platform:"linux",osRelease:"ID=ubuntu;VERSION_ID=24.04",
    runnerNodeVersion:"22.23.4",capturedAt:"2026-11-13T21:41:41.330Z",
    screenshotCount:screenshots.length,
    checks:{pngHeadersAndDimensions:true,requiredViewportsPresent:true,
      sha256PerScreenshot:true,installedTarballBrowserTest:"separate-green-CI-step-required"},
    screenshots};
  return {manifest,map};
}
test("offline browser artifact must agree with every actual PNG byte and source SHA",()=>{
  const {manifest,map}=receipt();
  assert.deepEqual(verifyBrowserEvidence(manifest,map,sha),
    {sourceSha:sha,browserVersion:"Google Chrome 157.0.8103.50",
      screenshots:53,unsignedDevelopmentEvidence:true,verified:true});
});
test("missing, stale, forged and unexpected browser evidence fails closed",()=>{
  const attacks=[
    ({manifest})=>{manifest.sourceSha="0".repeat(40)},
    ({manifest})=>{manifest.screenshotCount--},
    ({manifest})=>{manifest.screenshots[0].sha256="f".repeat(64)},
    ({manifest})=>{manifest.screenshots[1].bytes++},
    ({manifest})=>{manifest.screenshots[1].width++},
    ({manifest})=>{manifest.screenshots[0].name="gc-ui-forged.png"},
    ({manifest})=>{manifest.browserVersion="unverified browser"},
    ({manifest})=>{manifest.runnerNodeVersion="18.0.0"},
    ({manifest})=>{manifest.platform="darwin"},
    ({manifest})=>{manifest.signed=true},
    ({manifest})=>{manifest.published=true},
    ({manifest})=>{manifest.status="stable"},
    ({manifest})=>{manifest.checks.sha256PerScreenshot=false},
    ({map})=>{map.delete("gc-ui-dark-mobile.png")},
    ({map})=>{map.set("gc-ui-injected.png",png(390,844))}
  ];
  for(const attack of attacks){
    const {manifest,map}=receipt();attack({manifest,map});
    assert.throws(()=>verifyBrowserEvidence(manifest,map,sha),undefined,String(attack));
  }
});
test("workflow verifies same-run browser PNG archive after installed foundation and Node parity",()=>{
 const ci=readFileSync(new URL("../.github/workflows/ci.yml",import.meta.url),"utf8");
 const cross=ci.split("  cross-node-package-reproducibility:")[1].split("  browser-smoke:")[0];
 assert.match(cross,/needs: \[source-and-contract, browser-smoke\]/);
 assert.match(cross,/name: gc-ui-browser-evidence/);
 assert.match(cross,/scripts\/verify-browser-evidence\.mjs/);
 assert.match(cross,/--source-sha "\$\(git rev-parse HEAD\)"/);
 assert.match(cross,/qa\/browser-artifact\/browser-evidence\.json/);
 assert.match(cross,/qa\/browser-artifact\/screenshots/);
});
