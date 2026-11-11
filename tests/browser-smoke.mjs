#!/usr/bin/env node
/** Dependency-free, loopback-only Chrome smoke runner for the GC UI browser lab. */
import { createServer } from "node:http";
import { readFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { spawnSync, execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve, sep, extname, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const runFile=promisify(execFile);
const root=resolve(fileURLToPath(new URL("../",import.meta.url)));
const candidates=process.env.GC_CHROME_BIN?[process.env.GC_CHROME_BIN]:["google-chrome","chromium","chromium-browser"];
const binary=candidates.find(name=>spawnSync("which",[name],{encoding:"utf8"}).status===0);
if(!binary)throw new Error("Chrome or Chromium is required for browser acceptance testing");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".json":"application/json"};
const server=createServer(async (req,res)=>{
  try{
    if(req.method!=="GET"){res.writeHead(405);res.end();return;}
    const url=new URL(req.url,"http://localhost");
    const path=decodeURIComponent(url.pathname);
    const relative=path==="/lab/"?"lab/index.html":path.slice(1);
    if(!/^(src|lab|tests|assets)\//.test(relative)){res.writeHead(404);res.end();return;}
    const full=resolve(root,relative);
    if(!full.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(full);
    res.writeHead(200,{"Content-Type":mime[extname(full)]||"application/octet-stream","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
    res.end(data);
  }catch{res.writeHead(404);res.end("Missing local fixture");}
});
const listen=()=>new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const close=()=>new Promise(ok=>server.close(ok));
async function launch(args){
  const profile=await mkdtemp(join(tmpdir(),"gc-ui-chrome-"));
  const flags=["--headless=new","--disable-dev-shm-usage","--disable-gpu",
    "--no-first-run","--no-default-browser-check","--disable-extensions","--disable-background-networking",
    "--user-data-dir="+profile,"--virtual-time-budget=3000",...args];
  try{
    const result=await runFile(binary,flags,{timeout:30000,maxBuffer:8*1024*1024});
    return result.stdout;
  }finally{await rm(profile,{recursive:true,force:true})}
}
await listen();
const base="http://127.0.0.1:"+server.address().port;
try{
  for(const [mode,accent,size] of [["light","iris","1440,900"],["dark","moss","390,844"]]){
    const url=base+"/tests/browser-smoke.html?mode="+mode+"&accent="+accent;
    const html=await launch(["--window-size="+size,"--dump-dom",url]);
    if(!/data-gc-smoke="pass"/.test(html)) {
      const detail=html.match(/<output id="smoke-status"[^>]*>([\s\S]*?)<\/output>/)?.[1] || "No fixture detail";
      throw new Error("Browser check failed for "+mode+"/"+accent+": "+detail.slice(0,900));
    }
    const match=html.match(/data-gc-check-count="(\d+)"/);
    assert.ok(match&&Number(match[1])>=12,"Insufficient browser checks for "+mode+"/"+accent);
    console.log("Chromium "+mode+"/"+accent+": "+match[1]+" real-DOM interaction checks passed");
  }
  // Check the full design lab, not only the small interaction fixture.
  for (const size of ["320,760","390,844","600,860","900,900","1440,900"]) {
    const html=await launch(["--window-size="+size,"--dump-dom",base+"/tests/layout-smoke.html"]);
    if(!/data-gc-layout="pass"/.test(html)) {
      const detail=html.match(/<output id="layout-result"[^>]*>([\s\S]*?)<\/output>/)?.[1]||"No layout diagnostics";
      throw new Error("Responsive layout failure "+size+": "+detail.slice(0,1500));
    }
    const measured=html.match(/data-gc-viewport="(\d+)"/)?.[1]||"unknown";
    console.log("Chromium layout "+size+" measured "+measured+"px: no horizontal page overflow");
  }
  const dir=join(root,"qa/screenshots");
  await mkdir(dir,{recursive:true});
  for(const [file,flags] of [
    ["gc-ui-light-desktop.png",["--window-size=1440,900"]],
    ["gc-ui-dark-mobile.png",["--window-size=390,844","--force-dark-mode"]],
    ["gc-ui-light-mobile-320.png",["--window-size=320,760"]]
  ]){
    const out=join(dir,file);
    await launch([...flags,"--screenshot="+out,base+"/lab/"]);
    const png=await readFile(out);
    assert.ok(png.length>10000&&png.subarray(0,8).equals(Buffer.from("89504e470d0a1a0a","hex")),file+" screenshot invalid");
    console.log("Captured "+file+" ("+png.length+" bytes)");
  }
}finally{await close()}
