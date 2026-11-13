import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pngReceipt,verifyScreenshotManifest } from "../scripts/record-browser-evidence.mjs";
const signature=Buffer.from("89504e470d0a1a0a","hex");
const png=(width,height)=>{const b=Buffer.alloc(10200);signature.copy(b,0);b.writeUInt32BE(13,8);b.write("IHDR",12,"ascii");b.writeUInt32BE(width,16);b.writeUInt32BE(height,20);return b;};
const sha="540c3e049048e08edc7aec316b059cf02534f342";
test("browser QA screenshot receipts hash real PNG bytes and validate reference pixel dimensions",()=>{
 const x=pngReceipt("gc-ui-light-desktop.png",png(1440,900));
 assert.equal(x.width,1440);assert.equal(x.height,900);
 assert.match(x.sha256,/^[a-f0-9]{64}$/);
 assert.throws(()=>pngReceipt("gc-ui-light-desktop.png",png(100,100)),/viewport/);
 assert.throws(()=>pngReceipt("gc-ui-light-mobile-320.png",png(390,760)),/viewport/);
 assert.throws(()=>pngReceipt("../escape.png",png(320,760)),/file name/);
 assert.throws(()=>pngReceipt("gc-ui-dark-mobile.png",Buffer.alloc(100)),/PNG/);
 const bad=png(390,844);bad[0]=0;
 assert.throws(()=>pngReceipt("gc-ui-dark-mobile.png",bad),/PNG/);
});
test("manifest requires exact source, actual Chromium version, baseline frames and broad coverage",()=>{
 const names=["gc-ui-light-desktop.png","gc-ui-dark-mobile.png","gc-ui-light-mobile-320.png",
   ...Array.from({length:50},(_,i)=>"gc-ui-extra-"+i+".png")];
 const files=names.map((name,i)=>pngReceipt(name,i===0?png(1440,900):i===1?png(390,844):i===2?png(320,760):png(390,844)));
 const scope={sourceSha:sha,browserVersion:"Chromium 141.0.7000.0",files};
 assert.equal(verifyScreenshotManifest(scope),true);
 assert.throws(()=>verifyScreenshotManifest({...scope,sourceSha:"wrong"}),/Source commit/);
 assert.throws(()=>verifyScreenshotManifest({...scope,browserVersion:"unknown"}),/Browser version/);
 assert.throws(()=>verifyScreenshotManifest({...scope,files:files.slice(0,3)}),/coverage floor/);
 assert.throws(()=>verifyScreenshotManifest({...scope,files:[...files.slice(0,52),files[0]]}),/Duplicate/);
});
test("CI captures Chromium version and screenshot hashes after browser/installed-package checks",()=>{
 const ci=readFileSync(new URL("../.github/workflows/ci.yml",import.meta.url),"utf8");
 const a=ci.indexOf("Exercise offline-installed foundation inside Chromium");
 const b=ci.indexOf("Record exact Chromium binary and PNG hashes");
 const c=ci.indexOf("Preserve generated screenshots");
 assert.ok(a!==-1&&b>a&&c>b,"Manifest recording follows successful browser checks");
 assert.match(ci,/qa\/browser-evidence\.json/);
 assert.match(ci,/node scripts\/record-browser-evidence\.mjs/);
});
