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
let server=null,browser=null;
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
  let stdout="",stderr="";
  browser=spawn(binary,[
    "--headless=new","--disable-dev-shm-usage","--disable-gpu",
    "--no-first-run","--no-default-browser-check","--disable-background-networking",
    "--disable-extensions","--user-data-dir="+profile,"--virtual-time-budget=8000",
    "--dump-dom",url
  ],{stdio:["ignore","pipe","pipe"]});
  browser.stdout.on("data",chunk=>{stdout=(stdout+chunk.toString()).slice(-2*1024*1024);});
  browser.stderr.on("data",chunk=>{stderr=(stderr+chunk.toString()).slice(-6000);});
  const exit=await new Promise((ok,fail)=>{
    let done=false;
    const timeout=setTimeout(()=>{
      if(!done)browser.kill("SIGKILL");
      fail(new Error("Packed Chromium test exceeded 45 seconds: "+stderr));
    },45000);
    browser.once("error",error=>{
      done=true;clearTimeout(timeout);fail(error);
    });
    browser.once("close",(code,signal)=>{
      done=true;clearTimeout(timeout);ok({code,signal});
    });
  });
  assert.equal(exit.code,0,"Chromium failed: "+stderr);
  assert.match(stdout,/<html[^>]+data-gc-packed="pass"/,
    "Installed package did not pass in Chromium. Browser output: "+stdout.slice(-2500)+
    " STDERR: "+stderr.slice(-1500));
  assert.match(stdout,/<output id="result" role="status">pass<\/output>/);
  console.log("Chromium passed installed offline @goreecloud/ui/foundation at "+pkg.version+
    "; two independent scopes, solid Canvas and interactive toggle tested");
}finally{
  if(browser && browser.exitCode===null)browser.kill("SIGKILL");
  if(server){
    server.closeAllConnections?.();
    await new Promise(ok=>server.close(ok));
  }
  rmSync(temp,{recursive:true,force:true});
}
