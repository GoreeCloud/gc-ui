#!/usr/bin/env node
/** Independently verify downloaded same-run Chromium screenshot artifact bytes. */
import { readFileSync, readdirSync, lstatSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pngReceipt, verifyScreenshotManifest } from "./record-browser-evidence.mjs";

export function verifyBrowserEvidence(manifest, assets, sourceSha) {
  if (!manifest || typeof manifest!=="object" || Array.isArray(manifest))
    throw new TypeError("Browser evidence must be a JSON object");
  if (manifest.schemaVersion!==1 || manifest.kind!=="chromium-screenshot-evidence" ||
    manifest.status!=="development-evidence-not-stable" ||
    manifest.published!==false || manifest.signed!==false)
    throw new Error("Browser evidence schema/maturity mismatch");
  if(manifest.sourceSha!==sourceSha || !/^[a-f0-9]{40}$/.test(sourceSha||""))
    throw new Error("Browser evidence source SHA mismatch");
  if(manifest.platform!=="linux" ||
    typeof manifest.osRelease!=="string" || !manifest.osRelease.includes("VERSION_ID=") ||
    typeof manifest.runnerNodeVersion!=="string" ||
    !/^22\./.test(manifest.runnerNodeVersion))
    throw new Error("Browser evidence runtime/OS is outside the supported CI configuration");
  if(typeof manifest.capturedAt!=="string" ||
    !/^\d{4}-\d\d-\d\dT/.test(manifest.capturedAt) ||
    !Number.isFinite(Date.parse(manifest.capturedAt)))
    throw new Error("Browser evidence capture date is invalid");
  const checks=manifest.checks||{};
  if(checks.pngHeadersAndDimensions!==true ||
    checks.requiredViewportsPresent!==true ||
    checks.sha256PerScreenshot!==true ||
    checks.installedTarballBrowserTest!=="separate-green-CI-step-required")
    throw new Error("Screenshot producer checks are incomplete");
  if(!Array.isArray(manifest.screenshots) ||
    manifest.screenshotCount!==manifest.screenshots.length)
    throw new Error("Screenshot count does not match the manifest");
  verifyScreenshotManifest({
    sourceSha:manifest.sourceSha,
    browserVersion:manifest.browserVersion,
    files:manifest.screenshots
  });
  if(!(assets instanceof Map) || assets.size!==manifest.screenshotCount)
    throw new Error("Screenshot archive missing or contains unexpected files");
  const expected=new Set(manifest.screenshots.map(item=>item.name));
  for(const name of assets.keys())
    if(!expected.has(name))throw new Error("Unexpected screenshot in archive: "+String(name));
  for(const entry of manifest.screenshots){
    if(!assets.has(entry.name))throw new Error("Missing screenshot: "+entry.name);
    const actual=pngReceipt(entry.name,assets.get(entry.name));
    for(const field of ["width","height","bytes","sha256"])
      if(actual[field]!==entry[field])
        throw new Error("Screenshot "+entry.name+" failed "+field+" integrity check");
  }
  return Object.freeze({
    sourceSha:manifest.sourceSha,browserVersion:manifest.browserVersion,
    screenshots:manifest.screenshotCount,
    unsignedDevelopmentEvidence:true,
    verified:true
  });
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  const args=process.argv.slice(2);
  if(args.length!==6 || args[0]!=="--source-sha" ||
    args[2]!=="--manifest" || args[4]!=="--screenshots") {
    console.error("Usage: node scripts/verify-browser-evidence.mjs --source-sha SHA --manifest browser-evidence.json --screenshots screenshots-directory");
    process.exit(2);
  }
  try {
    const manifestPath=resolve(args[3]);
    const info=lstatSync(manifestPath);
    if(!info.isFile()||info.size>262144)throw new Error("Invalid manifest file");
    const manifest=JSON.parse(readFileSync(manifestPath,"utf8"));
    const directory=resolve(args[5]);
    if(!lstatSync(directory).isDirectory())throw new Error("Screenshot source is not a directory");
    const files=new Map();
    for(const name of readdirSync(directory)){
      if(!/^gc-ui-[a-z0-9-]+\.png$/.test(name))
        throw new Error("Unexpected screenshot artifact entry: "+name);
      const path=join(directory,name),stat=lstatSync(path);
      if(!stat.isFile()||stat.size>16*1024*1024)
        throw new Error("Screenshot not a bounded regular file: "+name);
      files.set(name,readFileSync(path));
    }
    console.log(JSON.stringify(verifyBrowserEvidence(manifest,files,args[1]),null,2));
  } catch(error){
    console.error("Browser artifact evidence rejected: "+String(error?.message||error));
    process.exitCode=1;
  }
}
