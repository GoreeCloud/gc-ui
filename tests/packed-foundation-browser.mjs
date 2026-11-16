#!/usr/bin/env node
/**
 * Browser integration of a REAL offline-installed @goreecloud/ui tarball.
 * No external server, third-party dependency, lifecycle scripts, or publication.
 */
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve, sep, extname } from "node:path";
import { tmpdir } from "node:os";
import { spawn, spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import assert from "node:assert/strict";

const root=resolve(fileURLToPath(new URL("../",import.meta.url)));
const npm=process.platform==="win32"?"npm.cmd":"npm";
const run=(command,args,cwd)=>execFileSync(command,args,{
  cwd,encoding:"utf8",timeout:90000,maxBuffer:8*1024*1024,
  env:{...process.env,npm_config_audit:"false",npm_config_fund:"false"}
});
const browserCandidates=process.env.GC_CHROME_BIN?[process.env.GC_CHROME_BIN]:
  ["google-chrome","chromium","chromium-browser"];
const binary=browserCandidates.find(name=>spawnSync("which",[name],{encoding:"utf8"}).status===0);
if(!binary)throw new Error("Installed-package browser check requires trusted Chromium in PATH");
const temp=mkdtempSync(join(tmpdir(),"gc-ui-packed-browser-"));
const consumer=join(temp,"consumer");
const profile=join(temp,"chrome-profile");
const fixture=readFileSync(new URL("./packed-foundation.html",import.meta.url),"utf8");
let server=null,browser=null,socket=null;
try{
  const pkg=JSON.parse(readFileSync(join(root,"package.json"),"utf8"));
  const packed=JSON.parse(run(npm,[
    "pack","--json","--ignore-scripts","--offline","--pack-destination",temp
  ],root));
  assert.equal(packed.length,1);
  assert.equal(packed[0].name,pkg.name);
  assert.equal(packed[0].version,pkg.version);
  mkdirSync(consumer,{recursive:true});
  run(npm,["install","--offline","--ignore-scripts","--no-audit","--no-fund",
    "--package-lock=false","--prefix",consumer,join(temp,packed[0].filename)],consumer);
  const lib=resolve(consumer,"node_modules","@goreecloud","ui");
  const publicPaths=new Set(packed[0].files.map(f=>f.path));
  for(const path of ["src/foundation.js","src/theme.js","src/patterns.js","src/icons.js",
      "src/tokens.css","src/components.css","src/glass.css"]){
    assert.ok(publicPaths.has(path),"Missing installed foundation resource "+path);
  }
  const contentTypes={".js":"text/javascript; charset=utf-8",
    ".css":"text/css; charset=utf-8",".html":"text/html; charset=utf-8",
    ".json":"application/json"};
  server=createServer(async(req,res)=>{
    try{
      if(req.method!=="GET"){res.writeHead(405);res.end();return;}
      const path=new URL(req.url,"http://127.0.0.1").pathname;
      const headers={
        "Cache-Control":"no-store","X-Content-Type-Options":"nosniff",
        "Content-Security-Policy":"default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self'; img-src 'self' data:; connect-src 'none';"
      };
      if(path==="/"){
        res.writeHead(200,{"Content-Type":"text/html; charset=utf-8",...headers});
        res.end(fixture);return;
      }
      if(!path.startsWith("/lib/")){res.writeHead(404);res.end();return;}
      const relative=decodeURIComponent(path.slice(5));
      if(!/^(src|assets|tokens)\//.test(relative)||!publicPaths.has(relative)){
        res.writeHead(404);res.end();return;
      }
      const file=resolve(lib,relative);
      if(!file.startsWith(lib+sep)){res.writeHead(403);res.end();return;}
      res.writeHead(200,{"Content-Type":contentTypes[extname(file)]||"application/octet-stream",...headers});
      res.end(await readFile(file));
    }catch(error){res.writeHead(404);res.end("Not found");}
  });
  await new Promise((ok,fail)=>{
    server.once("error",fail);
    server.listen(0,"127.0.0.1",ok);
  });
  const port=server.address().port;
  const url="http://127.0.0.1:"+port+"/";
  // --dump-dom can hang indefinitely on some Chromium builds even for a
  // static offline data URL. Reuse the explicitly bounded, loopback-only
  // DevTools transport used by the main browser smoke suite instead.
  let stderr="", launchError=null;
  browser=spawn(binary,[
    "--headless=new","--disable-dev-shm-usage","--disable-gpu",
    "--no-first-run","--no-default-browser-check","--disable-background-networking",
    "--disable-extensions","--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"
  ],{stdio:["ignore","ignore","pipe"]});
  browser.stderr.on("data",chunk=>{stderr=(stderr+chunk.toString()).slice(-6000);});
  browser.on("error",error=>{launchError=error;});
  let debugPort=0;
  for(let attempt=0;attempt<300;attempt++){
    if(launchError)throw launchError;
    if(browser.exitCode!==null)throw new Error("Chromium exited before DevTools ready: "+stderr);
    try{
      const portFile=await readFile(join(profile,"DevToolsActivePort"),"utf8");
      debugPort=Number(portFile.split("\n")[0]);
      if(Number.isInteger(debugPort)&&debugPort>0&&debugPort<65536)break;
    }catch{}
    await delay(100);
  }
  if(!debugPort)throw new Error("Chromium DevTools port did not start within 30s: "+stderr);
  let target=null;
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch("http://127.0.0.1:"+debugPort+"/json/list",{
        signal:AbortSignal.timeout(4000),
      });
      if(response.ok){
        const pages=await response.json();
        target=pages.find(page=>page.type==="page"&&page.webSocketDebuggerUrl);
        if(target)break;
      }
    }catch{}
    await delay(200);
  }
  if(!target)throw new Error("Chromium local DevTools page discovery failed: "+stderr);
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error("Chromium WebSocket startup timed out")),8000);
    socket.addEventListener("open",()=>{clearTimeout(timer);resolve();},{once:true});
    socket.addEventListener("error",()=>{clearTimeout(timer);reject(new Error("Chromium WebSocket failed"));},{once:true});
  });
  let sequence=0;
  const pending=new Map();
  socket.addEventListener("message",event=>{
    let response;
    try{response=JSON.parse(event.data);}catch{return;}
    if(!pending.has(response.id))return;
    const item=pending.get(response.id);
    pending.delete(response.id);
    clearTimeout(item.timer);
    if(response.error)item.reject(new Error(response.error.message||"DevTools command failed"));
    else item.resolve(response.result);
  });
  socket.addEventListener("close",()=>{
    for(const item of pending.values()){
      clearTimeout(item.timer);
      item.reject(new Error("Chromium DevTools closed"));
    }
    pending.clear();
  });
  const command=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++sequence;
    const timer=setTimeout(()=>{
      pending.delete(id);
      reject(new Error("Chromium command timeout: "+method));
    },12000);
    pending.set(id,{timer,resolve,reject});
    try{socket.send(JSON.stringify({id,method,params}));}
    catch(error){clearTimeout(timer);pending.delete(id);reject(error);}
  });
  await command("Page.enable");
  await command("Runtime.enable");
  await command("Page.navigate",{url});
  let observed=null;
  for(let attempt=0;attempt<120;attempt++){
    const evaluation=await command("Runtime.evaluate",{
      expression:"JSON.stringify({url:location.href,state:document.documentElement?.dataset.gcPacked||'pending',text:document.getElementById('result')?.textContent?.slice(0,300)||''})",
      returnByValue:true,
    });
    if(evaluation.exceptionDetails)throw new Error("Chromium fixture evaluation failed");
    observed=JSON.parse(evaluation.result?.value||"null");
    if(observed?.url===url&&["pass","fail"].includes(observed.state))break;
    await delay(100);
  }
  assert.equal(observed?.url,url,"Installed fixture navigation did not complete");
  assert.equal(observed.state,"pass","Installed package fixture failed or timed out: "+observed.text);
  assert.equal(observed.text,"pass","Installed package fixture did not confirm its controls");
  console.log("Chromium passed installed offline @goreecloud/ui/foundation at "+pkg.version+
    "; two independent scopes, solid Canvas and interactive toggle tested");
}finally{
  try{socket?.close();}catch{}
  if(browser && browser.exitCode===null && browser.signalCode===null){
    // Chromium can still write to the fresh test profile after its DevTools
    // socket closes. Wait for the actual child close before deleting files.
    const closed=new Promise(resolve=>browser.once("close",resolve));
    browser.kill("SIGTERM");
    await Promise.race([closed,delay(1500)]);
    if(browser.exitCode===null && browser.signalCode===null){
      browser.kill("SIGKILL");
      await Promise.race([closed,delay(1500)]);
    }
  }
  if(server){
    server.closeAllConnections?.();
    await new Promise(ok=>server.close(ok));
  }
  // Background Chromium children can briefly race profile deletion on
  // hosted CI. Retry only this mkdtemp-owned test directory, never user files.
  rmSync(temp,{recursive:true,force:true,maxRetries:12,retryDelay:150});
}
