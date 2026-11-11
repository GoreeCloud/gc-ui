#!/usr/bin/env node
/**
 * Dependency-free Chromium browser verification with exact CSS viewport emulation.
 * Chrome's --window-size alone can clamp the CSS viewport to 500px on Linux;
 * use DevTools Emulation.setDeviceMetricsOverride and verify innerWidth instead.
 * All requests are loopback and assets are served read-only from the repository.
 * Node 22+ is required for its built-in WebSocket client.
 */
import { createServer } from "node:http";
import { readFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { resolve, sep, extname, join } from "node:path";
import { tmpdir } from "node:os";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const candidates = process.env.GC_CHROME_BIN ? [process.env.GC_CHROME_BIN] :
  ["google-chrome", "chromium", "chromium-browser"];
const binary = candidates.find(name => spawnSync("which", [name], { encoding:"utf8" }).status === 0);
if (!binary) throw new Error("Google Chrome or Chromium is required for browser smoke tests");
if (typeof WebSocket !== "function") throw new Error("Node 22+ WebSocket support is required");
const mime = {
  ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8", ".svg":"image/svg+xml",
  ".json":"application/json"
};
const server = createServer(async (req, res) => {
  try {
    if (req.method !== "GET") { res.writeHead(405); res.end(); return; }
    const url = new URL(req.url, "http://localhost");
    const relative = url.pathname === "/lab/" ? "lab/index.html" : decodeURIComponent(url.pathname).slice(1);
    if (!/^(src|lab|tests|assets)\//.test(relative)) { res.writeHead(404); res.end(); return; }
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    const bytes = await readFile(file);
    res.writeHead(200, {
      "Content-Type":mime[extname(file)] || "application/octet-stream",
      "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff"
    });
    res.end(bytes);
  } catch {
    res.writeHead(404); res.end("Not found");
  }
});
const listen = () => new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const closeServer = () => new Promise(resolve => server.close(resolve));

async function startBrowser() {
  const profile = await mkdtemp(join(tmpdir(), "gc-ui-chrome-"));
  const args = [
    "--headless=new", "--disable-dev-shm-usage", "--disable-gpu",
    "--no-first-run", "--no-default-browser-check", "--disable-extensions",
    "--disable-background-networking", "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=0", "--user-data-dir=" + profile, "about:blank"
  ];
  const child = spawn(binary, args, { stdio:["ignore", "ignore", "pipe"] });
  let stderr = "", launchError = null;
  child.stderr.on("data", chunk => {
    stderr = (stderr + chunk.toString()).slice(-5000);
  });
  child.on("error", error => { launchError = error; });
  let socket = null;
  const pending = new Map();
  let sequence = 0;
  const cleanup = async () => {
    for (const entry of pending.values()) entry.reject(new Error("Chromium connection closed"));
    pending.clear();
    try { socket?.close(); } catch {}
    if (child.exitCode === null && !child.killed) child.kill("SIGTERM");
    await delay(250);
    if (child.exitCode === null) child.kill("SIGKILL");
    await rm(profile, { recursive:true, force:true });
  };
  try {
    let port = 0;
    for (let n=0; n<300; n++) {
      if (launchError) throw launchError;
      if (child.exitCode !== null) throw new Error("Chrome exited: " + stderr);
      try {
        const content = await readFile(join(profile, "DevToolsActivePort"), "utf8");
        port = Number(content.split("\n")[0]);
        if (port > 0) break;
      } catch {}
      await delay(100);
    }
    if (!port) throw new Error("Chromium DevTools port never opened within 30s: " + stderr);
    const response = await fetch("http://127.0.0.1:" + port + "/json/list", {
      signal:AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error("Cannot inspect local Chromium page target");
    const pages = await response.json();
    const target = pages.find(item => item.type === "page" && item.webSocketDebuggerUrl);
    if (!target) throw new Error("Chrome did not expose a page target");
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once:true });
      socket.addEventListener("error", reject, { once:true });
    });
    socket.addEventListener("message", event => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const task = pending.get(data.id);
        pending.delete(data.id);
        clearTimeout(task.timer);
        if (data.error) task.reject(new Error(data.error.message));
        else task.resolve(data.result);
      }
    });
    socket.addEventListener("close", () => {
      for (const task of pending.values()) {
        clearTimeout(task.timer);
        task.reject(new Error("Chromium DevTools connection closed unexpectedly"));
      }
      pending.clear();
    });
    const command = (method, params={}) => new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error("Chromium command timed out: " + method));
      }, 15000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params }));
    });
    await command("Page.enable");
    await command("Runtime.enable");
    const evaluate = async expression => {
      const result = await command("Runtime.evaluate", {
        expression, returnByValue:true, awaitPromise:true
      });
      if (result.exceptionDetails) throw new Error("Browser JS exception: " + JSON.stringify(result.exceptionDetails));
      return result.result?.value;
    };
    const setViewport = async (width, height, { dark=false, reducedMotion=false, forcedColors=false }={}) => {
      await command("Emulation.setDeviceMetricsOverride", {
        width, height, screenWidth:width, screenHeight:height,
        mobile:width<=600, deviceScaleFactor:1
      });
      await command("Emulation.setEmulatedMedia", {
        features:[{ name:"prefers-color-scheme", value:dark ? "dark" : "light" },
          { name:"prefers-reduced-motion", value:reducedMotion ? "reduce" : "no-preference" },
          { name:"forced-colors", value:forcedColors ? "active" : "none" }]
      });
    };
    const navigate = async url => {
      await command("Page.navigate", { url });
      for (let n=0; n<100; n++) {
        const result = await evaluate("JSON.stringify({url:location.href,ready:document.readyState})");
        const state = JSON.parse(result);
        if (state.url===url && state.ready==="complete") return;
        await delay(100);
      }
      throw new Error("Chromium never completed navigation to "+url);
    };
    const waitFor = async (name, url) => {
      for (let n=0; n<80; n++) {
        const result=JSON.parse(await evaluate("JSON.stringify({url:location.href,state:document.documentElement.dataset['"+name+"'],viewport:visualViewport?.width??innerWidth,layoutWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,diagnostics:document.querySelector('output[id$=\"result\"],output[id$=\"status\"]')?.textContent||''})"));
        if (result.url===url && (result.state==="pass" || result.state==="fail")) return result;
        await delay(100);
      }
      throw new Error("Browser fixture timed out waiting for "+name+" at "+url);
    };
    const screenshot = async file => {
      const result = await command("Page.captureScreenshot", { format:"png", captureBeyondViewport:false });
      const bytes = Buffer.from(result.data, "base64");
      assert.ok(bytes.length>10000 && bytes.subarray(0,8).equals(Buffer.from("89504e470d0a1a0a","hex")),"Invalid PNG");
      await writeFile(file, bytes);
      return { width:bytes.readUInt32BE(16), height:bytes.readUInt32BE(20), size:bytes.length };
    };
    return { evaluate, setViewport, navigate, waitFor, screenshot, close:cleanup };
  } catch (error) {
    await cleanup();
    throw error;
  }
}

await listen();
const base = "http://127.0.0.1:" + server.address().port;
let browser;
try {
  browser = await startBrowser();
  for (const [width,height] of [[320,760],[390,844],[600,860],[900,900],[1440,900]]) {
    await browser.setViewport(width,height);
    const url=base+"/tests/layout-smoke.html";
    await browser.navigate(url);
    const result=await browser.waitFor("gcLayout",url);
    if (Math.abs(result.viewport-result.layoutWidth)>1 || result.layoutWidth>width || width-result.layoutWidth>20) {
      const metrics=await browser.evaluate('JSON.stringify({innerWidth:innerWidth,clientWidth:document.documentElement.clientWidth,visualWidth:visualViewport?.width,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,screenWidth:screen.width,outerWidth:outerWidth,devicePixelRatio:devicePixelRatio,offenders:[...document.body.querySelectorAll("*")].filter(el=>el.getBoundingClientRect().right>document.documentElement.clientWidth+0.5).slice(0,8).map(el=>({tag:el.tagName,className:typeof el.className==="string"?el.className.slice(0,50):"",right:Math.round(el.getBoundingClientRect().right)}))})');
      throw new Error("Viewport discrepancy requested "+width+" observed "+result.viewport+" client "+result.layoutWidth+" metrics "+metrics+" state "+result.state+" detail "+result.diagnostics);
    }
    assert.equal(result.state,"pass","Layout overflow at "+width+"px: "+result.diagnostics);
    console.log("Chromium full lab @ "+width+"px: no horizontal overflow");
  }
  for (const [mode, accent, width, height] of [
    ["light","iris",1440,900], ["dark","moss",390,844]
  ]) {
    await browser.setViewport(width, height, { dark:mode==="dark" });
    const url=base+"/tests/browser-smoke.html?mode="+mode+"&accent="+accent;
    await browser.navigate(url);
    const result=await browser.waitFor("gcSmoke",url);
    if (Math.abs(result.viewport-result.layoutWidth)>1 || result.layoutWidth>width || width-result.layoutWidth>20) {
      const metrics=await browser.evaluate('JSON.stringify({innerWidth:innerWidth,clientWidth:document.documentElement.clientWidth,visualWidth:visualViewport?.width,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,screenWidth:screen.width,outerWidth:outerWidth,devicePixelRatio:devicePixelRatio,offenders:[...document.body.querySelectorAll("*")].filter(el=>el.getBoundingClientRect().right>document.documentElement.clientWidth+0.5).slice(0,8).map(el=>({tag:el.tagName,className:typeof el.className==="string"?el.className.slice(0,50):"",right:Math.round(el.getBoundingClientRect().right)}))})');
      throw new Error("Viewport discrepancy requested "+width+" observed "+result.viewport+" client "+result.layoutWidth+" metrics "+metrics+" state "+result.state+" detail "+result.diagnostics);
    }
    assert.equal(result.state,"pass","Interaction failure "+mode+"/"+accent+": "+result.diagnostics);
    assert.ok(result.scrollWidth<=result.viewport+1,"Interaction fixture horizontal overflow at "+width+"px: "+JSON.stringify({scrollWidth:result.scrollWidth,viewport:result.viewport}));
    const checks=Number(await browser.evaluate("document.documentElement.dataset.gcCheckCount"));
    assert.ok(checks>=12,"Not enough interaction tests: "+checks);
    console.log("Chromium "+mode+"/"+accent+" @ "+width+"px: "+checks+" live DOM checks passed");
  }
  const directory=join(root,"qa/screenshots");
  await mkdir(directory,{recursive:true});

  // Exercise every curated accent in both explicit appearances on a real rendered lab.
  const manifest=JSON.parse(await readFile(join(root,"tokens/gc.tokens.json"),"utf8"));
  await browser.setViewport(390,844,{dark:false});
  await browser.navigate(base+"/lab/");
  const evaluation="(function(mode,accent){"+
    "const appearance=document.querySelector('#appearance');const choice=document.querySelector('#accent');"+
    "appearance.value=mode;appearance.dispatchEvent(new Event('change',{bubbles:true}));"+
    "choice.value=accent;choice.dispatchEvent(new Event('change',{bubbles:true}));"+
    "const root=document.documentElement;const computed=getComputedStyle(root);"+
    "return JSON.stringify({mode:root.dataset.gcTheme,accent:root.dataset.gcAccent,"+
    "brand:computed.getPropertyValue('--gc-brand').trim().toUpperCase(),"+
    "surface:computed.getPropertyValue('--gc-surface').trim().toUpperCase(),"+
    "viewport:root.clientWidth,scrollWidth:root.scrollWidth});"+
    "})";
  for(const accent of ["iris","lagoon","ember","moss"]) {
    for(const mode of ["light","dark"]) {
      const code=evaluation+"("+JSON.stringify(mode)+","+JSON.stringify(accent)+")";
      const actual=JSON.parse(await browser.evaluate(code));
      assert.equal(actual.mode,mode,"Lab appearance control did not update");
      assert.equal(actual.accent,accent,"Lab accent control did not update");
      assert.equal(actual.brand,manifest.accents[accent][mode].brand.toUpperCase(),"Brand token differs from canonical JSON");
      assert.equal(actual.surface,manifest.semantic[mode].surface.toUpperCase(),"Surface token differs from canonical JSON");
      assert.ok(actual.scrollWidth<=actual.viewport+1,"Theme-specific horizontal overflow: "+accent+"/"+mode);
      await delay(60);
      const shot=await browser.screenshot(join(directory,"gc-ui-"+accent+"-"+mode+"-mobile.png"));
      assert.equal(shot.width,390);
      assert.equal(shot.height,844);
      console.log("Chromium theme "+accent+"/"+mode+": semantic colors and 390px layout passed");
    }
  }
  // Honor reduced motion and explicit increased-contrast Lens fallbacks.
  await browser.setViewport(390,844,{dark:true,reducedMotion:true});
  await browser.navigate(base+"/lab/");
  const reduced=await browser.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--gc-motion-base').trim()");
  assert.equal(reduced,"0ms","Reduced-motion preference is not represented by token CSS");
  const contrast=JSON.parse(await browser.evaluate(
    "(function(){const checkbox=document.querySelector('#contrast');checkbox.checked=true;"+
    "checkbox.dispatchEvent(new Event('change',{bubbles:true}));"+
    "const root=document.documentElement,style=getComputedStyle(root);"+
    "return JSON.stringify({mode:root.dataset.gcContrast,lens:style.getPropertyValue('--gc-lens-fill').trim(),solid:style.getPropertyValue('--gc-lens-solid').trim()});})()"));
  assert.equal(contrast.mode,"more","Contrast preference did not apply");
  assert.equal(contrast.lens,contrast.solid,"High-contrast Lens did not resolve to an opaque surface");
  console.log("Chromium reduced-motion and opaque high-contrast Lens fallbacks passed");


  // Accessibility/localization regression: genuine RTL DOM, enlarged root text and forced colors.
  // These tests are browser-level evidence only; no screen-reader or true browser zoom claim.
  for (const width of [390,900]) {
    await browser.setViewport(width,900,{dark:false});
    await browser.navigate(base+"/lab/");
    const result=JSON.parse(await browser.evaluate(
      '(()=>{document.documentElement.dir="rtl";'+
      'const root=document.documentElement,tree=document.querySelector("#demo-tree");'+
      'const parent=tree.querySelector(\'[role="treeitem"][aria-expanded="true"]\');'+
      'const child=parent.querySelector(\'[role="treeitem"]\');'+
      'parent.focus();parent.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowLeft",bubbles:true}));'+
      'return JSON.stringify({dir:root.dir,clientWidth:root.clientWidth,scrollWidth:root.scrollWidth,'+
      'entered:document.activeElement===child,selected:child.getAttribute("aria-selected")});})()'));
    assert.equal(result.dir,"rtl","RTL direction was not applied");
    assert.equal(result.entered,true,"RTL ArrowLeft did not enter an expanded tree group");
    assert.equal(result.selected,"true","RTL tree keyboard selection did not update");
    assert.ok(result.scrollWidth<=result.clientWidth+1,"RTL lab overflow at "+width+"px: "+JSON.stringify(result));
    if(width===390) {
      const shot=await browser.screenshot(join(directory,"gc-ui-rtl-mobile-390.png"));
      assert.equal(shot.width,390);
    }
    console.log("Chromium RTL @ "+width+"px: tree keys and page reflow passed");
  }

  for (const [width,percent] of [[390,200],[390,400],[900,300]]) {
    await browser.setViewport(width,900,{dark:false});
    await browser.navigate(base+"/lab/");
    const result=JSON.parse(await browser.evaluate(
      '((scale)=>{const root=document.documentElement;root.style.fontSize=scale+"%";'+
      'const label=document.querySelector("#demo-tree .gc-tree__row");'+
      'label.append(document.createTextNode(" — Internationalized detailed workspace example"));'+
      'return JSON.stringify({fontSize:getComputedStyle(root).fontSize,'+
      'clientWidth:root.clientWidth,scrollWidth:root.scrollWidth,treeWidth:document.querySelector("#demo-tree").getBoundingClientRect().width});})('+percent+')'));
    assert.ok(parseFloat(result.fontSize)>=percent*0.15,"Enlarged CSS root text size did not take effect");
    if(result.scrollWidth>result.clientWidth+1) {
      const offenders=JSON.parse(await browser.evaluate(
        'JSON.stringify([...document.body.querySelectorAll("*")].filter(el=>{const r=el.getBoundingClientRect();'+
        'const s=getComputedStyle(el);return r.width>0 && s.display!=="none" && r.right>document.documentElement.clientWidth+1;})'+
        '.slice(0,30).map(el=>{const r=el.getBoundingClientRect();const c=getComputedStyle(el);return {'+
        'tag:el.tagName,id:el.id,klass:typeof el.className==="string"?el.className.slice(0,80):"",'+
        'left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),'+
        'minWidth:c.minWidth,display:c.display,overflowX:c.overflowX};}))'));
      const sections=JSON.parse(await browser.evaluate(
        'JSON.stringify([...document.querySelectorAll("main > section")].map(x=>'+
        '({id:x.id,client:x.clientWidth,scroll:x.scrollWidth,rect:x.getBoundingClientRect().right})))'));
      const unclipped=JSON.parse(await browser.evaluate(
        'JSON.stringify([...document.body.querySelectorAll("*")].filter(el=>{'+
        'const r=el.getBoundingClientRect();if(r.right<=document.documentElement.clientWidth+1)return false;'+
        'for(let p=el.parentElement;p&&p!==document.documentElement;p=p.parentElement){'+
        'if(["hidden","clip","auto","scroll"].includes(getComputedStyle(p).overflowX))return false;}'+
        'return true;}).slice(0,25).map(el=>({tag:el.tagName,id:el.id,'+
        'klass:typeof el.className==="string"?el.className.slice(0,75):"",'+
        'left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right),' +
        'parent:el.parentElement?.className||""})))'));
      throw new Error("Enlarged text overflow "+width+"px / "+percent+"%: "+JSON.stringify({result,sections,unclipped,offenders}));
    }
    if(width===390) {
      const shot=await browser.screenshot(join(directory,"gc-ui-text-"+percent+"-percent-mobile.png"));
      assert.equal(shot.width,390);
    }
    const visibleText=JSON.parse(await browser.evaluate(
      '(()=>{const hero=document.querySelector(".gc-lab-hero h1");'+
      'const dock=document.querySelector("#demo-bottom-nav");'+
      'const links=[...dock.querySelectorAll("a.gc-bottom-nav__link")];'+
      'return JSON.stringify({heroWidth:hero.clientWidth,heroScroll:hero.scrollWidth,'+
      'dockWidth:dock.clientWidth,dockScroll:dock.scrollWidth,'+
      'labels:links.map(a=>{const e=a.querySelector("span");const s=getComputedStyle(e);'+
      'return {text:e.textContent,client:e.clientWidth,scroll:e.scrollWidth,'+
      'overflow:s.overflowX,whiteSpace:s.whiteSpace,ellipsis:s.textOverflow};})});})()'));
    assert.ok(visibleText.heroScroll<=visibleText.heroWidth+1,
      "Enlarged hero text clipped within rounded window: "+JSON.stringify(visibleText));
    assert.ok(visibleText.labels.every(label =>
      label.scroll<=label.client+1 && label.ellipsis==="clip" && label.whiteSpace!=="nowrap"),
      "Floating navigation labels truncated at enlarged text: "+JSON.stringify(visibleText));
    assert.ok(visibleText.dockScroll>=visibleText.dockWidth,
      "Floating dock must retain an internally scrollable overflow surface");

    if(width===390 && percent===400) {
      const editorial=JSON.parse(await browser.evaluate(
        'JSON.stringify((()=>({toolbar:getComputedStyle(document.querySelector(".gc-lab-toolbar")).position,'+
        'title:parseFloat(getComputedStyle(document.querySelector("#foundations-heading")).fontSize),'+
        'body:parseFloat(getComputedStyle(document.body).fontSize)}))())'));
      assert.equal(editorial.toolbar,"static","Mobile theme bar must not obscure headings at 400% text");
      assert.ok(editorial.title<=76&&editorial.title>=28,
        "Enlarged section heading is out of the intended editorial scale "+JSON.stringify(editorial));
      const internals=JSON.parse(await browser.evaluate(
        '(()=>{const root=document.documentElement,selectors=[".gc-tabs",".gc-table-wrap",".gc-breadcrumbs",".gc-details-list",".gc-lab-type-sample"];'+
        'return JSON.stringify({viewport:root.clientWidth,scrollWidth:root.scrollWidth,'+
        'items:selectors.map(selector=>{const el=document.querySelector(selector),r=el.getBoundingClientRect();'+
        'return {selector,left:r.left,right:r.right,width:el.clientWidth,scroll:el.scrollWidth};})});})()'));
      assert.ok(internals.items.every(x=>x.left>=-1&&x.right<=internals.viewport+1),
        "Responsive component escaped 400% layout viewport: "+JSON.stringify(internals));
      const table=internals.items.find(x=>x.selector===".gc-table-wrap");
      assert.ok(table.scroll>=table.width,"Sortable data table should retain internal horizontal scroll");
      for(const id of ["foundations","components","patterns","forms"]) {
        await browser.evaluate('document.querySelector("#'+id+'").scrollIntoView({behavior:"instant",block:"start"})');
        await delay(60);
        const shot=await browser.screenshot(join(directory,"gc-ui-full-400-"+id+".png"));
        assert.equal(shot.width,390);
      }
    }

    console.log("Chromium CSS root text "+percent+"% @ "+width+"px: no horizontal overflow");
  }

  // Full-lab 400% typography under alternate accessibility/display conditions.
  // This is still CSS root-font emulation, never a claim of browser zoom.
  for (const mode of [
    {name:"dark-rtl",width:390,dark:true,rtl:true,forcedColors:false},
    {name:"forced-colors",width:390,dark:false,rtl:false,forcedColors:true},
    {name:"compact",width:320,dark:false,rtl:false,forcedColors:false}
  ]) {
    await browser.setViewport(mode.width,900,{dark:mode.dark,forcedColors:mode.forcedColors});
    await browser.navigate(base+"/lab/");
    const results=JSON.parse(await browser.evaluate(
      '((rtl)=>{const root=document.documentElement;root.style.fontSize="400%";'+
      'if(rtl)root.dir="rtl";'+
      'const nav=document.querySelector("#demo-bottom-nav"),rect=nav.getBoundingClientRect();'+
      'return JSON.stringify({font:getComputedStyle(root).fontSize,width:root.clientWidth,'+
      'scroll:root.scrollWidth,dir:root.dir,forced:matchMedia("(forced-colors:active)").matches,'+
      'dock:{left:rect.left,right:rect.right},sections:["foundations","components","patterns","forms"]'+
      '.map(id=>{const el=document.getElementById(id);return {id,client:el.clientWidth,scroll:el.scrollWidth};})});})('+mode.rtl+')'));
    assert.ok(parseFloat(results.font)>=60,"400% root font did not take effect for "+mode.name);
    assert.equal(results.forced,mode.forcedColors,"Forced-colors mode mismatch "+mode.name);
    if(mode.rtl)assert.equal(results.dir,"rtl","RTL direction was not applied");
    assert.ok(results.scroll<=results.width+1,
      "400% multi-mode page overflow "+mode.name+": "+JSON.stringify(results));
    assert.ok(results.dock.left>=-1&&results.dock.right<=results.width+1,
      "400% multi-mode dock escaped "+mode.name+": "+JSON.stringify(results));
    const shot=await browser.screenshot(join(directory,"gc-ui-full-400-"+mode.name+".png"));
    assert.equal(shot.width,mode.width);
    console.log("Chromium full 400% "+mode.name+": text and layout pass");
  }

  // 400% root-font is an isolated dock stress test, NOT whole-app zoom acceptance.
  await browser.setViewport(390,900,{dark:false});
  await browser.navigate(base+"/tests/dock-zoom.html");
  await browser.evaluate('document.documentElement.style.fontSize="400%"');
  await delay(180);
  const zoomDock=JSON.parse(await browser.evaluate(
    '(()=>{const root=document.documentElement,dock=document.querySelector("#zoom-dock"),'+
    'content=document.querySelector("#zoom-content"),rect=dock.getBoundingClientRect();'+
    'return JSON.stringify({ready:root.dataset.dockReady,font:getComputedStyle(root).fontSize,'+
    'width:root.clientWidth,scroll:root.scrollWidth,left:rect.left,right:rect.right,height:rect.height,'+
    'bottom:parseFloat(getComputedStyle(dock).bottom),padding:parseFloat(getComputedStyle(content).paddingBottom),'+
    'labels:[...dock.querySelectorAll("a > span")].map(x=>({text:x.textContent,'+
    'client:x.clientWidth,scroll:x.scrollWidth,lines:(()=>{const range=document.createRange();range.selectNodeContents(x);return range.getClientRects().length;})(),overflow:getComputedStyle(x).textOverflow}))});})()'));
  assert.equal(zoomDock.ready,"true","Isolated dock fixture did not initialize");
  assert.ok(parseFloat(zoomDock.font)>=60,"400% root-font scaling did not apply");
  assert.ok(zoomDock.scroll<=zoomDock.width+1,"Dock-only horizontal page overflow "+JSON.stringify(zoomDock));
  assert.ok(zoomDock.left>=0&&zoomDock.right<=zoomDock.width+1,"Dock escapes viewport "+JSON.stringify(zoomDock));
  assert.ok(zoomDock.padding>=zoomDock.height+zoomDock.bottom+12,"Dock obscures content "+JSON.stringify(zoomDock));
  assert.ok(zoomDock.labels.every(x=>x.lines===1),"Short dock labels should stay intact, not break inside words: "+JSON.stringify(zoomDock));
  assert.ok(zoomDock.labels.every(x=>x.client+1>=x.scroll&&x.overflow==="clip"),
    "Dock truncates destination labels "+JSON.stringify(zoomDock));
  const shotDock=await browser.screenshot(join(directory,"gc-ui-dock-400-percent-text.png"));
  assert.equal(shotDock.width,390);
  console.log("Chromium isolated 400% root-font dock: labels, clearance, reflow passed");

  await browser.setViewport(390,844,{dark:true,forcedColors:true});
  await browser.navigate(base+"/lab/");
  const forced=JSON.parse(await browser.evaluate(
    '(()=>{const tree=document.querySelector("#demo-tree");'+
    'const root=document.documentElement;return JSON.stringify({active:matchMedia("(forced-colors: active)").matches,'+
    'border:getComputedStyle(tree).borderTopStyle,clientWidth:root.clientWidth,scrollWidth:root.scrollWidth});})()'));
  assert.equal(forced.active,true,"Chromium forced-colors media emulation did not activate");
  assert.notEqual(forced.border,"none","Treeview lost its boundary in forced colors");
  assert.ok(forced.scrollWidth<=forced.clientWidth+1,"Forced-colors mobile layout overflow");
  const forcedShot=await browser.screenshot(join(directory,"gc-ui-forced-colors-mobile.png"));
  assert.equal(forcedShot.width,390);
  console.log("Chromium forced-colors @ 390px: semantic boundary and layout passed");

  // Verify every window corner in the full lab, including simulated desktop/compact layouts.
  for(const width of [320,390,900,1440]) {
    await browser.setViewport(width,844,{dark:width===390});
    await browser.navigate(base+"/lab/");
    const actual=JSON.parse(await browser.evaluate(
      '(()=>{const root=document.documentElement,window=document.querySelector("#demo-window");'+
      'const s=getComputedStyle(window);return JSON.stringify({width:root.clientWidth,scroll:root.scrollWidth,'+
      'radii:[s.borderTopLeftRadius,s.borderTopRightRadius,s.borderBottomRightRadius,s.borderBottomLeftRadius],'+
      'rect:window.getBoundingClientRect().width});})()'));
    assert.ok(actual.radii.every(v=>parseFloat(v)>=18),"Unrounded window corners "+JSON.stringify(actual));
    assert.ok(actual.scroll<=actual.width+1,"Rounded window page overflow "+JSON.stringify(actual));
    assert.ok(actual.rect<=actual.width,"Window escaped viewport "+JSON.stringify(actual));
    console.log("Chromium rounded windows @ "+width+"px: four corners and reflow passed");
  }

  // Floating dock geometry, readable active state and reserved content space.
  for(const width of [320,390,900,1440]) {
    await browser.setViewport(width,844,{dark:width===390});
    await browser.navigate(base+"/lab/");
    const actual=JSON.parse(await browser.evaluate(
      '(()=>{const dock=document.querySelector("#demo-bottom-nav"),r=dock.getBoundingClientRect();'+
      'const links=[...dock.querySelectorAll("a")],main=document.querySelector("#main");'+
      'const active=links.find(a=>a.getAttribute("aria-current")==="page");'+
      'const probe=document.createElement("span");probe.style.color="var(--gc-on-brand-container)";'+
      'document.body.append(probe);const expected=getComputedStyle(probe).color;probe.remove();'+
      'return JSON.stringify({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,'+
      'left:r.left,right:r.right,bottom:r.bottom,height:r.height,radius:getComputedStyle(dock).borderTopLeftRadius,'+
      'active:active?.textContent.trim(),activeColor:active?getComputedStyle(active).color:null,'+
      'expected,padding:parseFloat(getComputedStyle(main).paddingBottom)});})()'));
    assert.ok(actual.left>=0 && actual.right<=actual.width+1,"Floating dock exceeds viewport "+JSON.stringify(actual));
    assert.ok(actual.bottom<=844 && actual.height>=50,"Floating dock height/position incorrect "+JSON.stringify(actual));
    assert.ok(parseFloat(actual.radius)>=26,"Bottom nav lost rounded capsule "+JSON.stringify(actual));
    assert.ok(actual.active && actual.activeColor===actual.expected,"Dock selected state unreadable "+JSON.stringify(actual));
    assert.ok(actual.padding>=actual.height,"Dock occludes content "+JSON.stringify(actual));
    assert.ok(actual.scroll<=actual.width+1,"Floating nav causes horizontal overflow "+JSON.stringify(actual));
    console.log("Chromium floating bottom dock @ "+width+"px: capsule, safe space and contrast passed");
  }

  // Dedicated signature-composition screenshots: not a replacement for human design review.
  for(const [filename,width,height,dark] of [
    ["gc-ui-premium-desktop.png",1440,900,false],
    ["gc-ui-premium-dark-mobile.png",390,844,true]
  ]) {
    await browser.setViewport(width,height,{dark});
    await browser.navigate(base+"/lab/");
    const result=JSON.parse(await browser.evaluate(
      '(()=>{const root=document.documentElement,section=document.querySelector("#premium");'+
      'const surface=section.querySelector(".gc-showcase"),tile=section.querySelector(".gc-feature-tile");const action=section.querySelector(".gc-showcase__actions a.gc-button");const probe=document.createElement("span");probe.style.color="var(--gc-on-brand)";section.append(probe);const expectedAction=getComputedStyle(probe).color;probe.remove();'+
      'return JSON.stringify({width:root.clientWidth,scroll:root.scrollWidth,'+
      'gradient:getComputedStyle(surface,"::before").backgroundImage.includes("gradient"),'+
      'radius:getComputedStyle(surface).borderTopLeftRadius,'+
      'anchorColor:getComputedStyle(action).color,expectedAction:expectedAction,'+
      'tile:getComputedStyle(tile).backgroundColor});})()'));
    assert.ok(result.scroll<=result.width+1,"Premium lab page overflow: "+JSON.stringify(result));
    assert.equal(result.gradient,true,"Signature surface gradient missing");
    assert.equal(result.anchorColor,result.expectedAction,"Primary anchor button text is not readable on its brand fill");
    assert.ok(parseFloat(result.radius)>=18,"Signature surface lost its premium shape");
    await browser.evaluate('document.querySelector("#premium").scrollIntoView({behavior:"instant",block:"start"})');
    await delay(150);
    const shot=await browser.screenshot(join(directory,filename));
    assert.equal(shot.width,width);
    assert.equal(shot.height,height);
    console.log("Chromium signature composition "+filename+": material, bounds and capture passed");
  }

  for (const [filename,width,height,dark] of [
    ["gc-ui-light-desktop.png",1440,900,false],
    ["gc-ui-dark-mobile.png",390,844,true],
    ["gc-ui-light-mobile-320.png",320,760,false]
  ]) {
    await browser.setViewport(width,height,{dark});
    await browser.navigate(base+"/lab/");
    await delay(200);
    const screenshot=await browser.screenshot(join(directory,filename));
    assert.equal(screenshot.width,width,"PNG pixel width does not match tested viewport");
    assert.equal(screenshot.height,height,"PNG pixel height does not match tested viewport");
    console.log("Captured "+filename+" ("+width+"×"+height+", "+screenshot.size+" bytes)");
  }
} finally {
  if (browser) await browser.close();
  await closeServer();
}
