#!/usr/bin/env node
/**
 * Source- and Chromium-version-bound screenshot inventory.
 * Merely verifies PNG structure/digest; not a human visual assessment.
 */
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, readdirSync, lstatSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { platform, arch } from "node:os";

const root=fileURLToPath(new URL("../",import.meta.url));
const shaPattern=/^[a-f0-9]{40}$/;
const signature=Buffer.from("89504e470d0a1a0a","hex");
const important=Object.freeze({
  "gc-ui-light-desktop.png":[1440,900],
  "gc-ui-dark-mobile.png":[390,844],
  "gc-ui-light-mobile-320.png":[320,760]
});
export function pngReceipt(name,bytes) {
  if(typeof name!=="string" || !/^gc-ui-[a-z0-9-]+\.png$/.test(name))
    throw new Error("Unexpected screenshot file name: "+String(name));
  if(!Buffer.isBuffer(bytes) || bytes.length<=10000 ||
    !bytes.subarray(0,8).equals(signature) ||
    bytes.toString("ascii",12,16)!=="IHDR" ||
    bytes.readUInt32BE(8)!==13)
    throw new Error("Invalid PNG header/content: "+name);
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  if(width<100||width>8000||height<100||height>8000)
    throw new Error("Unreasonable PNG dimensions: "+name);
  const expected=important[name];
  if(expected && (width!==expected[0]||height!==expected[1]))
    throw new Error("Unexpected reference viewport dimensions: "+name);
  return Object.freeze({
    name,width,height,bytes:bytes.length,
    sha256:createHash("sha256").update(bytes).digest("hex")
  });
}
export function verifyScreenshotManifest({sourceSha,browserVersion,files}){
  if(!shaPattern.test(sourceSha||""))throw new Error("Source commit SHA invalid");
  if(typeof browserVersion!=="string"||
    !/(?:Chromium|Chrome|Google Chrome)/i.test(browserVersion) ||
    browserVersion.length>170)throw new Error("Browser version missing");
  if(!Array.isArray(files)||files.length<50 || files.length>200)
    throw new Error("Screenshot coverage floor failed (expect at least 50 screenshots)");
  const names=files.map(x=>x.name);
  if(new Set(names).size!==names.length)throw new Error("Duplicate screenshots");
  for(const name of Object.keys(important))
    if(!names.includes(name))throw new Error("Missing required reference viewport: "+name);
  for(const file of files){
    if(!file||!/^gc-ui-[a-z0-9-]+\.png$/.test(file.name) ||
      !Number.isSafeInteger(file.bytes)||file.bytes<=10000 ||
      !Number.isSafeInteger(file.width)||!Number.isSafeInteger(file.height)||
      !/^[a-f0-9]{64}$/.test(file.sha256||""))
      throw new Error("Invalid screenshot hash/size metadata");
  }
  return true;
}
const command=(name,args)=>execFileSync(name,args,{
  cwd:root,encoding:"utf8",timeout:8000,maxBuffer:1024*1024
}).trim();
function main(){
  const sha=command("git",["rev-parse","--verify","HEAD"]);
  const candidates=process.env.GC_CHROME_BIN?[process.env.GC_CHROME_BIN]:
    ["google-chrome","chromium","chromium-browser"];
  const binary=candidates.find(c=>spawnSync("which",[c],{encoding:"utf8"}).status===0);
  if(!binary)throw new Error("Cannot identify the tested Chromium executable");
  const browserVersion=command(binary,["--version"]);
  const dir=join(root,"qa/screenshots");
  const names=readdirSync(dir).filter(s=>s.endsWith(".png")).sort();
  const files=names.map(name=>{
    const path=join(dir,name);
    if(!lstatSync(path).isFile())throw new Error("Non-regular screenshot: "+name);
    return pngReceipt(name,readFileSync(path));
  });
  verifyScreenshotManifest({sourceSha:sha,browserVersion,files});
  const osRelease=platform()==="linux"?readFileSync("/etc/os-release","utf8")
    .split("\n").filter(s=>/^(?:ID|VERSION_ID)=/.test(s)).join(";"):"not-linux";
  const manifest={
    schemaVersion:1,kind:"chromium-screenshot-evidence",
    status:"development-evidence-not-stable",
    published:false,signed:false,
    sourceSha:sha,browserVersion,
    platform:platform(),architecture:arch(),osRelease,
    runnerNodeVersion:process.versions.node,
    capturedAt:new Date().toISOString(),
    screenshotCount:files.length,
    checks:{pngHeadersAndDimensions:true,requiredViewportsPresent:true,
      sha256PerScreenshot:true,installedTarballBrowserTest:"separate-green-CI-step-required"},
    screenshots:files
  };
  writeFileSync(join(root,"qa/browser-evidence.json"),JSON.stringify(manifest,null,2)+"\n",{encoding:"utf8",mode:0o600});
  console.log("Recorded "+files.length+" same-source Chromium screenshot SHA-256 receipts at "+sha);
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)main();
