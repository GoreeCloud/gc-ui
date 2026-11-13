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
import { assertGlassTextContrast } from "../scripts/glass-contrast-guard.mjs";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const candidates = process.env.GC_CHROME_BIN ? [process.env.GC_CHROME_BIN] :
  ["google-chrome", "chromium", "chromium-browser"];
const binary = candidates.find(name => spawnSync("which", [name], { encoding:"utf8" }).status === 0);
if (!binary) throw new Error("Chrome/Chromium not found in PATH. Set GC_CHROME_BIN to an existing executable path (for example a trusted Playwright Chromium binary) and rerun npm run browser:smoke; no browser is downloaded automatically.");
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
    const setViewport = async (width, height, { dark=false, reducedMotion=false, reducedTransparency=false, forcedColors=false }={}) => {
      await command("Emulation.setDeviceMetricsOverride", {
        width, height, screenWidth:width, screenHeight:height,
        mobile:width<=600, deviceScaleFactor:1
      });
      await command("Emulation.setEmulatedMedia", {
        features:[{ name:"prefers-color-scheme", value:dark ? "dark" : "light" },
          { name:"prefers-reduced-motion", value:reducedMotion ? "reduce" : "no-preference" },
          { name:"forced-colors", value:forcedColors ? "active" : "none" },
          { name:"prefers-reduced-transparency", value:reducedTransparency ? "reduce" : "no-preference" }]
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
    const accessibilityTree = async () => {
      const result = await command("Accessibility.getFullAXTree", { depth: -1 });
      return (result.nodes || []).filter(node => !node.ignored).map(node => ({
        role:node.role?.value ?? "", name:node.name?.value ?? "",
        description:node.description?.value ?? "",
        properties:(node.properties || []).map(prop => ({name:prop.name,value:prop.value?.value}))
      }));
    };
    return { evaluate, setViewport, navigate, waitFor, screenshot, accessibilityTree,
      dispatchHorizontalWheel:async(x,y,deltaX)=>{
        // CDP mouse-wheel delivery can race viewport emulation until a real
        // pointer-move has established the hit-test target.
        await command("Input.dispatchMouseEvent",{
          type:"mouseMoved",x,y,button:"none",buttons:0,pointerType:"mouse"
        });
        return command("Input.dispatchMouseEvent",{
          type:"mouseWheel",x,y,deltaX,deltaY:0,pointerType:"mouse"
        });
      },
      pressSpace:async()=>{
        const key={key:" ",code:"Space",windowsVirtualKeyCode:32,nativeVirtualKeyCode:32};
        await command("Input.dispatchKeyEvent",{type:"keyDown",...key});
        await command("Input.dispatchKeyEvent",{type:"keyUp",...key});
      },
      bringToFront:()=>command("Page.bringToFront"), close:cleanup };
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
  // Planned-form availability must survive real Chromium requestSubmit(), not
  // merely synthetic Node event dispatch, and must stop ordinary handlers.
  await browser.setViewport(390,844);
  await browser.navigate(base+"/lab/");
  const plannedForm=JSON.parse(await browser.evaluate(
    '(()=>{const form=document.querySelector("#demo-planned-form");let submitCalls=0;'+
    'form.addEventListener("submit",()=>{submitCalls++;});'+
    'form.querySelector("input").value="Local only";form.requestSubmit();'+
    'const status=document.querySelector(".gc-toast[role=status]");'+
    'return JSON.stringify({submitCalls,status:status?.textContent||"",'+
    'stillHere:location.pathname==="/lab/",formPresent:form.isConnected});})()'));
  assert.equal(plannedForm.submitCalls,0,"Planned form allowed a submit handler");
  assert.match(plannedForm.status,/Mesh connection setup is not available yet/);
  assert.equal(plannedForm.stillHere,true,"Planned form unexpectedly navigated");
  assert.equal(plannedForm.formPresent,true);
  console.log("Chromium planned Mesh form: prevented submit, visible status, no navigation");

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
  // On a cold load at an unknown fragment the HTML's static Home hint is
  // stale. Initialization must remove it before any history event fires.
  await browser.setViewport(390,844);
  await browser.navigate(base+"/lab/#unknown-on-entry");
  const initialUnknown=JSON.parse(await browser.evaluate(
    '(()=>{const links=[...document.querySelectorAll("#demo-bottom-nav a[href]")];'+
    'return JSON.stringify({current:links.filter(x=>x.hasAttribute("aria-current")).length,'+
    'active:links.filter(x=>x.hasAttribute("data-gc-active")).length});})()'));
  assert.deepEqual(initialUnknown,{current:0,active:0},
    "Cold unknown route announced a stale primary destination");
  await browser.navigate(base+"/lab/");
  const initialDefault=JSON.parse(await browser.evaluate(
    '(()=>{const links=[...document.querySelectorAll("#demo-bottom-nav a[href]")];'+
    'return JSON.stringify(links.filter(x=>x.getAttribute("aria-current")==="page").map(x=>x.getAttribute("href")));})()'));
  assert.deepEqual(initialDefault,["#overview"],
    "Valid no-fragment document default failed to restore the declared current destination");
  console.log("Chromium cold dock startup: no stale unknown route, explicit default preserved");

  // A native history update outside the dock must clear aria-current. A
  // recognized destination must restore exactly one active marker.
  await browser.setViewport(390,844);
  await browser.navigate(base+"/lab/");
  const dockRoute=JSON.parse(await browser.evaluate(
    '(()=>{const nav=document.querySelector("#demo-bottom-nav"),'+
    'links=[...nav.querySelectorAll("a[href]")];'+
    'location.hash="#unmatched-route-for-smoke";window.dispatchEvent(new Event("hashchange"));'+
    'const unknown={current:links.filter(x=>x.hasAttribute("aria-current")).length,'+
    'active:links.filter(x=>x.hasAttribute("data-gc-active")).length};'+
    'location.hash="#forms";window.dispatchEvent(new Event("hashchange"));'+
    'const restored=links.filter(x=>x.getAttribute("aria-current")==="page").map(x=>x.getAttribute("href"));'+
    'return JSON.stringify({unknown,restored});})()'));
  assert.deepEqual(dockRoute.unknown,{current:0,active:0},
    "Unknown history route leaked stale bottom-navigation selection");
  assert.deepEqual(dockRoute.restored,["#forms"],
    "Known history route failed to restore unique current destination");
  console.log("Chromium bottom navigation: unmatched route clears selection, known route restores it");

  // Real Chromium native popover: typeahead must cycle repeated initial
  // letters without activating an action, respect IME, and reset on outside
  // dismissal. A local mock in the lab never touches service accounts.
  await browser.setViewport(390,844);
  await browser.navigate(base+"/lab/");
  const menuTypeahead=JSON.parse(await browser.evaluate(
    '(()=>{const trigger=document.querySelector("#demo-action-trigger"),'+
    'menu=document.querySelector("#demo-action-menu"),'+
    'items=[...menu.querySelectorAll("button[role=menuitem]:not([disabled])")];'+
    'items[0].textContent="Save";items[1].textContent="Search";'+
    'trigger.click();const started=menu.matches(":popover-open")&&document.activeElement===items[0];'+
    'const press=(el,key,composing=false)=>el.dispatchEvent(new KeyboardEvent("keydown",'+
    '{key,bubbles:true,cancelable:true,isComposing:composing}));'+
    'press(items[0],"s");const cycled1=document.activeElement===items[1];'+
    'press(items[1],"s");const cycled2=document.activeElement===items[0];'+
    'press(items[0],"s",true);const ignoredIme=document.activeElement===items[0];'+
    'menu.hidePopover();menu.dispatchEvent(new Event("toggle"));'+
    'trigger.click();press(items[0],"s");'+
    'const reset=document.activeElement===items[1];'+
    'return JSON.stringify({started,cycled1,cycled2,ignoredIme,reset});})()'));
  assert.deepEqual(menuTypeahead,{
    started:true,cycled1:true,cycled2:true,ignoredIme:true,reset:true,
  },"Native menu typeahead keyboard behavior regressed");
  console.log("Chromium native menu: repeat cycling, composition and external-close reset passed");

  // Browser-semantic combobox: ArrowDown explicitly opens a closed, already
  // focused listbox; Home/End only intercept while that list remains open.
  await browser.setViewport(390,844);
  await browser.navigate(base+"/lab/");
  const comboboxKeyboard=JSON.parse(await browser.evaluate(
    '(()=>{const input=document.querySelector("#demo-combobox"),'+
    'list=document.querySelector("#demo-combobox-list");'+
    'const key=k=>input.dispatchEvent(new KeyboardEvent("keydown",{key:k,bubbles:true,cancelable:true}));'+
    'const initialized=input.getAttribute("aria-haspopup")==="listbox";'+
    'const closedEnd=key("End");input.focus();key("ArrowDown");'+
    'const focused=document.activeElement===input,expanded=input.getAttribute("aria-expanded"),'+
    'opened=!list.hidden;'+
    'const openEnd=key("End");const last=input.getAttribute("aria-activedescendant");'+
    'const openHome=key("Home");const first=input.getAttribute("aria-activedescendant");'+
    'document.body.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}));'+
    'const closedHome=key("Home");return JSON.stringify({initialized,focused,expanded,opened,'+
    'closedEnd,openEnd,last,openHome,first,closedHome,closed:!!list.hidden});})()'));
  console.log("Chromium combobox startup diagnostics: "+JSON.stringify(comboboxKeyboard));
  assert.deepEqual(comboboxKeyboard,{
    initialized:true,focused:true,expanded:"true",opened:true,
    closedEnd:true,openEnd:false,last:"demo-option-moss",
    openHome:false,first:"demo-option-iris",closedHome:true,closed:true,
  },"Chromium combobox Home/End semantics regressed");
  console.log("Chromium combobox: Home/End preserve text navigation when closed");

  // Real native <dialog> lifecycle: an earlier async command must not close
  // a later reopened palette or steal its active focus.
  await browser.setViewport(390,844);
  await browser.navigate(base+"/lab/");
  const commandAsync=JSON.parse(await browser.evaluate(
    '(async()=>{const {initCommandPalette}=await import("/src/commands.js");'+
    'const dialog=document.createElement("dialog"),input=document.createElement("input"),'+
    'action=document.createElement("button"),invoker=document.createElement("button");'+
    'input.type="search";action.dataset.gcCommand="1";action.textContent="Synthetic command";'+
    'dialog.append(input,action);document.body.append(invoker,dialog);'+
    'let finish;const pending=new Promise(resolve=>{finish=resolve});'+
    'const palette=initCommandPalette(dialog,{shortcut:false,onSelect:()=>pending});'+
    'invoker.focus();palette.open();action.click();'+
    'const wasBusy=dialog.getAttribute("aria-busy")==="true";'+
    'palette.close();palette.open();finish();'+
    'await Promise.resolve();await Promise.resolve();await Promise.resolve();'+
    'const result={wasBusy,open:dialog.open,focused:document.activeElement===input,'+
    'clean:dialog.getAttribute("aria-busy")===null};'+
    'palette.close();palette.dispose();dialog.remove();invoker.remove();'+
    'return JSON.stringify(result);})()'));
  assert.deepEqual(commandAsync,{wasBusy:true,open:true,focused:true,clean:true},
    "Chromium stale command callback dismissed a newer native dialog session");
  console.log("Chromium native command palette: stale async completion cannot dismiss a new session");

  // Native HTMLTableElement dynamic row reconciliation (no service data).
  await browser.setViewport(390,844);
  await browser.navigate(base+"/lab/");
  const dynamicTable=JSON.parse(await browser.evaluate(
    '(async()=>{const {initSortableTable}=await import("/src/table.js");'+
    'const table=document.createElement("table"),header=document.createElement("thead"),'+
    'body=document.createElement("tbody"),th=document.createElement("th"),'+
    'button=document.createElement("button");button.dataset.gcSort="text";'+
    'th.append(button);const heading=document.createElement("tr");heading.append(th);'+
    'header.append(heading);table.append(header,body);document.body.append(table);'+
    'const add=label=>{const row=document.createElement("tr"),cell=document.createElement("td");'+
    'cell.textContent=label;row.append(cell);body.append(row);return row};'+
    'const original=add("B"),firstA=add("A");const ctl=initSortableTable(table);'+
    'ctl.sortBy(0);add("C");add("A");'+
    'const count=ctl.refresh(),labels=()=>[...body.rows].map(r=>r.cells[0].textContent);'+
    'const sorted=labels(),current=th.getAttribute("aria-sort");'+
    'ctl.reset();const reset=labels();original.remove();'+
    'ctl.refresh();const removed=labels();ctl.dispose();table.remove();'+
    'return JSON.stringify({count,sorted,current,reset,removed});})()'));
  assert.deepEqual(dynamicTable,{count:4,sorted:["A","A","B","C"],
    current:"ascending",reset:["B","A","C","A"],removed:["A","C","A"]},
    "Chromium native sortable-table row refresh or reset regressed");
  console.log("Chromium native sortable table: dynamic insertion, sort and removal pass");

  // Native dialog must not turn text composition into a destructive command.
  await browser.setViewport(390,844);
  await browser.navigate(base+"/lab/");
  const commandIME=JSON.parse(await browser.evaluate(
    '(async()=>{const {initCommandPalette}=await import("/src/commands.js");'+
    'const dialog=document.createElement("dialog"),input=document.createElement("input"),'+
    'button=document.createElement("button"),status=document.createElement("p");'+
    'input.type="search";button.dataset.gcCommand="1";button.textContent="Open file";'+
    'status.dataset.gcCommandStatus="";dialog.append(input,button,status);document.body.append(dialog);'+
    'let calls=0;const api=initCommandPalette(dialog,{shortcut:false,onSelect:()=>{calls++;}});'+
    'api.open();const initial=status.textContent;'+
    'input.dispatchEvent(new CompositionEvent("compositionstart",{bubbles:true}));'+
    'input.value="zz-unmatched";'+
    'input.dispatchEvent(new InputEvent("input",{bubbles:true,isComposing:true}));'+
    'const unchanged=status.textContent===initial;'+
    'const enter=new KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true,isComposing:true});'+
    'input.dispatchEvent(enter);const ignored=!enter.defaultPrevented&&calls===0;'+
    'input.dispatchEvent(new CompositionEvent("compositionend",{bubbles:true}));'+
    'const updated=status.textContent==="No matching commands";'+
    'api.close();api.dispose();dialog.remove();'+
    'return JSON.stringify({unchanged,ignored,updated,calls});})()'));
  assert.deepEqual(commandIME,{unchanged:true,ignored:true,updated:true,calls:0},
    "Chromium IME composition unexpectedly activated a command or filtered interim text");
  console.log("Chromium native command palette: IME composing and committed input passed");

  const directory=join(root,"qa/screenshots");
  await mkdir(directory,{recursive:true});

  // Opt-in rail route truthfulness on a cold unmatched URL, using the
  // actual native rail in the design lab. The normal default remains unchanged.
  await browser.setViewport(820,900);
  await browser.navigate(base+"/lab/#not-in-rail");
  const railUnknown=JSON.parse(await browser.evaluate(
    '(async()=>{const {initNavigationRail}=await import("/src/navigation-rail.js");'+
    'const rail=document.querySelector(".gc-navigation-rail"),'+
    'links=[...rail.querySelectorAll("nav a[href]")];'+
    'links[0].setAttribute("aria-current","page");'+
    'const ctl=initNavigationRail(rail,{unknownRoute:"clear"});'+
    'const cold=links.filter(x=>x.getAttribute("aria-current")==="page").length;'+
    'location.hash="#forms";ctl.sync();'+
    'const known=links.filter(x=>x.getAttribute("aria-current")==="page").map(x=>x.getAttribute("href"));'+
    'location.hash="#missing-again";ctl.sync();'+
    'const missing=links.filter(x=>x.getAttribute("aria-current")==="page").length;'+
    'ctl.dispose();return JSON.stringify({cold,known,missing});})()'));
  assert.deepEqual(railUnknown,{cold:0,known:["#forms"],missing:0},
    "Chromium optional rail synchronization announced an unknown destination");
  console.log("Chromium optional rail: unmatched routes clear, recognized routes restore");

  // Navigation rail: real Chromium geometry, native focus/links, and tablet behavior.
  for (const [width,height,expectCollapsed] of [[1440,900,false],[820,900,true],[390,844,null]]) {
    await browser.setViewport(width,height);
    await browser.navigate(base+"/lab/");
    const before=JSON.parse(await browser.evaluate(
      '(()=>{const rail=document.querySelector(".gc-navigation-rail"),'+
      'shell=document.querySelector(".gc-navigation-shell"),toggle=rail.querySelector("[data-gc-rail-toggle]"),'+
      'link=rail.querySelector("nav a[href]"),label=link.querySelector(".gc-navigation-rail__label");'+
      'return JSON.stringify({railDisplay:getComputedStyle(rail).display,railWidth:rail.getBoundingClientRect().width,'+
      'shellWidth:shell.getBoundingClientRect().width,collapsed:rail.dataset.gcCollapsed,'+
      'expanded:toggle.getAttribute("aria-expanded"),name:toggle.getAttribute("aria-label"),'+
      'linkText:label.textContent.trim(),clip:getComputedStyle(label).clipPath,'+
      'docWidth:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,'+
      'dockDisplay:getComputedStyle(document.querySelector("#demo-bottom-nav")).display});})()'));
    assert.ok(before.docWidth<=before.viewport+1,
      "Navigation shell overflow at "+width+"px: "+JSON.stringify(before));
    if (expectCollapsed===null) {
      assert.equal(before.railDisplay,"none","Phone must keep compact bottom navigation");
      assert.notEqual(before.dockDisplay,"none","Phone bottom dock must be visible");
      continue;
    }
    assert.notEqual(before.railDisplay,"none","Tablet/desktop rail must remain visible");
    assert.equal(before.collapsed,String(expectCollapsed));
    assert.equal(before.expanded,String(!expectCollapsed));
    assert.equal(before.linkText,"Overview","Icon-only state must retain accessible link text");
    assert.equal(before.dockDisplay,"none","Do not present two primary navigation systems");
    assert.ok(before.railWidth<(expectCollapsed?100:270) && before.railWidth>(expectCollapsed?56:200),
      "Incorrect navigation rail width: "+JSON.stringify(before));
    if(expectCollapsed) assert.equal(before.clip,"inset(50%)","Compact labels are visually hidden, not removed");
    await browser.screenshot(join(directory,
      width===820?"gc-ui-rail-tablet-collapsed.png":"gc-ui-rail-desktop-expanded.png"));
    const after=JSON.parse(await browser.evaluate(
      '(()=>{const rail=document.querySelector(".gc-navigation-rail"),'+
      'toggle=rail.querySelector("[data-gc-rail-toggle]"),nav=rail.querySelector("nav");'+
      'toggle.focus();toggle.click();'+
      'const state={collapsed:rail.dataset.gcCollapsed,expanded:toggle.getAttribute("aria-expanded"),'+
      'focus:document.activeElement===toggle,width:rail.getBoundingClientRect().width,'+
      'label:toggle.getAttribute("aria-label"),scroll:document.documentElement.scrollWidth,'+
      'viewport:document.documentElement.clientWidth};'+
      'nav.querySelector(\'a[href="#forms"]\').click();'+
      'return JSON.stringify(state);})()'));
    assert.equal(after.collapsed,String(!expectCollapsed),"Toggle did not change rail state");
    assert.equal(after.expanded,String(expectCollapsed),"Toggle aria-expanded did not update");
    assert.equal(after.focus,true,"Rail toggle should retain keyboard focus");
    // Grid width animates when motion is allowed; measure only after it settles.
    await delay(300);
    const settled=JSON.parse(await browser.evaluate(
      '(()=>{const rail=document.querySelector(".gc-navigation-rail");'+
      'return JSON.stringify({width:rail.getBoundingClientRect().width,'+
      'scroll:document.documentElement.scrollWidth,'+
      'viewport:document.documentElement.clientWidth});})()'));
    assert.ok(settled.scroll<=settled.viewport+1,"Toggled rail caused horizontal overflow");
    assert.ok(expectCollapsed?settled.width>200:settled.width<100,
      "Toggled rail failed to resize: "+JSON.stringify({after,settled}));
    const selected=await browser.evaluate('document.querySelector(\'.gc-navigation-rail__links a[href="#forms"]\').getAttribute("aria-current")');
    assert.equal(selected,"page","Native link destination did not update active state");
    await browser.screenshot(join(directory,
      width===820?"gc-ui-rail-tablet-expanded.png":"gc-ui-rail-desktop-collapsed.png"));
    console.log("Chromium adaptive navigation rail @ "+width+"px: focus, collapse, route and geometry passed");
  }

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


  // Genuine Chromium tree text navigation with composition suppression.
  await browser.setViewport(390,844);
  await browser.navigate(base+"/lab/");
  const treeTyping=JSON.parse(await browser.evaluate(
    '(()=>{const tree=document.querySelector("#demo-tree"),'+
    'parent=tree.querySelector("[data-gc-tree-label=\\"Workspaces\\"]"),'+
    'design=tree.querySelector("[data-gc-tree-label=\\"Design tokens\\"]");'+
    'parent.focus();'+
    'const press=(item,key,isComposing=false)=>item.dispatchEvent(new KeyboardEvent("keydown",'+
    '{key,bubbles:true,cancelable:true,isComposing}));'+
    'const typedD=press(parent,"d"),first=document.activeElement===design;'+
    'const composed=press(design,"s",true),ignored=document.activeElement===design;'+
    'return JSON.stringify({typedD,first,composed,ignored});})()'));
  assert.deepEqual(treeTyping,{typedD:false,first:true,composed:true,ignored:true},
    "Chromium treeview typeahead or composition suppression regressed");
  // After the standard 700 ms typeahead buffer, the next initial is distinct.
  await delay(760);
  const treeNext=JSON.parse(await browser.evaluate(
    '(()=>{const tree=document.querySelector("#demo-tree"),'+
    'design=tree.querySelector("[data-gc-tree-label=\\"Design tokens\\"]"),'+
    'services=tree.querySelector("[data-gc-tree-label=\\"Services\\"]");'+
    'const typedS=design.dispatchEvent(new KeyboardEvent("keydown",'+
    '{key:"s",bubbles:true,cancelable:true}));'+
    'return JSON.stringify({typedS,next:document.activeElement===services});})()'));
  assert.deepEqual(treeNext,{typedS:false,next:true},
    "Chromium treeview did not reach the next visible matching node");
  console.log("Chromium tree keyboard: visible typeahead and IME suppression pass");

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
    await browser.bringToFront();
    await browser.evaluate("window.focus()");
    const focusQA=JSON.parse(await browser.evaluate(
      '(()=>{const skip=document.querySelector(".gc-link-skip"),'+
      'select=document.querySelector(".gc-lab-toolbar .gc-lab-select"),'+
      'badge=document.querySelector(".gc-lab-hero-copy .gc-badge"),'+
      'hero=document.querySelector(".gc-lab-hero h1"),root=document.documentElement;'+
      'const before=skip.getBoundingClientRect();skip.focus();'+
      'const after=skip.getBoundingClientRect();skip.blur();'+
      'return JSON.stringify({beforeBottom:before.bottom,focusedTop:after.top,focusedBottom:after.bottom,'+
      'hasFocus:document.hasFocus(),active:document.activeElement===skip,focusMatch:skip.matches(":focus"),'+
      'selectSize:parseFloat(getComputedStyle(select).fontSize),'+
      'badgeSize:parseFloat(getComputedStyle(badge).fontSize),badgeRight:badge.getBoundingClientRect().right,'+
      'heroSize:parseFloat(getComputedStyle(hero).fontSize),viewport:root.clientWidth});})()'));
    assert.ok(focusQA.beforeBottom<=0,
      "Skip link leaked into viewport before focus at 400%: "+JSON.stringify(focusQA));
    assert.ok(focusQA.focusedTop>=0&&focusQA.focusedBottom>focusQA.focusedTop,
      "Skip link not visible on keyboard focus: "+JSON.stringify(focusQA));
    assert.ok(focusQA.selectSize<=32&&focusQA.selectSize>=16,
      "Large-text lab theme selector overwhelms toolbar: "+JSON.stringify(focusQA));
    assert.ok(focusQA.badgeSize<=24&&focusQA.badgeRight<=focusQA.viewport+1,
      "Badge exceeds enlarged hero viewport: "+JSON.stringify(focusQA));
    assert.ok(focusQA.heroSize<=78,
      "Enlarged hero display exceeds mobile editorial scale: "+JSON.stringify(focusQA));
    if(mode.width===320) {
      const selectLayout=JSON.parse(await browser.evaluate(
        '(()=>{const group=document.querySelector(".gc-lab-toolbar-controls"),'+
        'select=document.querySelector("#appearance");'+
        'return JSON.stringify({columns:getComputedStyle(group).gridTemplateColumns,'+
        'selectWidth:select.getBoundingClientRect().width});})()'));
      assert.ok(selectLayout.selectWidth>=250,
        "Compact theme control should use one full-width readable column: "+JSON.stringify(selectLayout));
    }
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

  // Read Chromium's real accessibility tree, rather than inferring roles from
  // DOM attributes alone. This does not constitute screen-reader acceptance.
  for (const [name,width,dark] of [
    ["desktop-light",1440,false],
    ["mobile-dark",390,true]
  ]) {
    await browser.setViewport(width,900,{dark});
    await browser.navigate(base+"/lab/");
    await browser.bringToFront();
    await browser.evaluate("window.focus()");
    const nodes=await browser.accessibilityTree();
    const has=(role,label)=>nodes.some(n=>n.role===role&&n.name===label);
    const useRail = width > 600;
    assert.ok(has("navigation",useRail?"Design lab sections":"Primary application destinations"),
      "Visible navigation landmark missing in "+name);
    for(const label of (useRail?
      ["Overview","Foundations","Signature surfaces","Rounded windows","Components","Patterns","Forms","Iconography"]:
      ["Home","Design","Library","Forms"])) {
      assert.ok(has("link",label),
        "Visible navigation destination missing from accessibility tree: "+label+" ("+name+")");
    }
    assert.equal(has("navigation",useRail?"Primary application destinations":"Design lab sections"),false,
      "Hidden alternate navigation should not appear in assistive-tech tree");
    assert.ok(has("heading","Rounded. Always."),
      "Window showcase's visual heading is not in accessibility tree: "+name);
    const buttons=nodes.filter(n=>n.role==="button");
    assert.ok(buttons.some(n=>n.name==="Explore interaction"),
      "Real dialog action has no accessible button name: "+name);
    const missingNames=buttons.filter(n=>!String(n.name).trim());
    assert.equal(missingNames.length,0,
      "Unlabeled buttons exposed to Chromium assistive tech: "+JSON.stringify(missingNames));

    await browser.evaluate('document.querySelector("#demo-dialog").showModal()');
    const modal=await browser.accessibilityTree();
    const labeledDialog=modal.filter(n=>n.role==="dialog"&&n.name==="Interfaces with intention.");
    assert.equal(labeledDialog.length,1,
      "Native modal is not a single correctly named dialog in "+name+": "+
        JSON.stringify(modal.filter(n=>n.role==="dialog")));
    assert.ok(modal.some(n=>n.role==="button"&&n.name==="Close preview"),
      "Open modal lacks its accessible close action: "+name);
    assert.ok(modal.some(n=>n.role==="button"&&n.name==="Looks good"),
      "Open modal lacks its labeled confirmation action: "+name);
    await browser.evaluate('document.querySelector("#demo-dialog").close()');
    console.log("Chromium AX tree "+name+": named nav, 4 links, window heading, native dialog and buttons passed");
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
    'scrollbar:getComputedStyle(dock).scrollbarWidth,dockScroll:dock.scrollWidth,dockClient:dock.clientWidth,'+
    'labels:[...dock.querySelectorAll("a > span")].map(x=>({text:x.textContent,'+
    'client:x.clientWidth,scroll:x.scrollWidth,lines:(()=>{const range=document.createRange();range.selectNodeContents(x);return range.getClientRects().length;})(),overflow:getComputedStyle(x).textOverflow}))});})()'));
  assert.equal(zoomDock.ready,"true","Isolated dock fixture did not initialize");
  assert.ok(parseFloat(zoomDock.font)>=60,"400% root-font scaling did not apply");
  assert.ok(zoomDock.scroll<=zoomDock.width+1,"Dock-only horizontal page overflow "+JSON.stringify(zoomDock));
  assert.ok(zoomDock.left>=0&&zoomDock.right<=zoomDock.width+1,"Dock escapes viewport "+JSON.stringify(zoomDock));
  assert.ok(zoomDock.padding>=zoomDock.height+zoomDock.bottom+12,"Dock obscures content "+JSON.stringify(zoomDock));
  assert.equal(zoomDock.scrollbar,"thin","Enlarged-text dock must expose a scroll affordance");
  assert.ok(zoomDock.dockScroll>zoomDock.dockClient+1,"Zoom fixture did not exercise overflowing navigation");
  assert.ok(zoomDock.labels.every(x=>x.lines===1),"Short dock labels should stay intact, not break inside words: "+JSON.stringify(zoomDock));
  assert.ok(zoomDock.labels.every(x=>x.client+1>=x.scroll&&x.overflow==="clip"),
    "Dock truncates destination labels "+JSON.stringify(zoomDock));
  const shotDock=await browser.screenshot(join(directory,"gc-ui-dock-400-percent-text.png"));
  assert.equal(shotDock.width,390);
  const zoomKeyboard=JSON.parse(await browser.evaluate(
    '(async()=>{const dock=document.querySelector("#zoom-dock"),links=[...dock.querySelectorAll("a")];'+
    'const step=async()=>{await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)};'+
    'links[0].focus();links[0].dispatchEvent(new KeyboardEvent("keydown",{key:"End",bubbles:true,cancelable:true}));'+
    'await step();const navRect=dock.getBoundingClientRect(),lastRect=links.at(-1).getBoundingClientRect();'+
    'const endFocused=document.activeElement===links.at(-1),endScroll=dock.scrollLeft,'+
    'lastVisible=lastRect.left>=navRect.left-2&&lastRect.right<=navRect.right+2;'+
    'links.at(-1).dispatchEvent(new KeyboardEvent("keydown",{key:"Home",bubbles:true,cancelable:true}));'+
    'await step();return JSON.stringify({endFocused,endScroll,lastVisible,homeFocused:document.activeElement===links[0],homeScroll:dock.scrollLeft});})()'));
  assert.equal(zoomKeyboard.endFocused,true,"Keyboard End did not focus the final dock destination");
  assert.ok(zoomKeyboard.endScroll>0,"Keyboard focus did not reveal an offscreen destination");
  assert.equal(zoomKeyboard.lastVisible,true,"Final destination remained clipped after keyboard focus");
  assert.equal(zoomKeyboard.homeFocused,true,"Keyboard Home did not return to the first destination");
  assert.ok(zoomKeyboard.homeScroll<zoomKeyboard.endScroll,"Keyboard Home failed to restore viewport position");
  console.log("Chromium isolated 400% root-font dock: labels, clearance, reflow passed");

  // Verify RTL keyboard mirroring and scroll-to-focus on genuine 400% zoom.
  // RTL scrollLeft may be negative in Chromium: evaluate element geometry
  // rather than assuming an LTR-positive scroll coordinate.
  await browser.setViewport(390,900,{dark:false});
  await browser.navigate(base+"/tests/dock-zoom.html");
  const rtlZoom=JSON.parse(await browser.evaluate(
    '(async()=>{const root=document.documentElement;root.dir="rtl";root.style.fontSize="400%";'+
    'const dock=document.querySelector("#zoom-dock"),links=[...dock.querySelectorAll("a")];'+
    'const frames=async()=>{await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)};'+
    'const visible=link=>{const a=link.getBoundingClientRect(),b=dock.getBoundingClientRect();'+
    'return a.left>=b.left-2&&a.right<=b.right+2};'+
    'links[0].focus();links[0].dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowLeft",bubbles:true,cancelable:true}));'+
    'const forward=document.activeElement===links[1];'+
    'links[1].dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true,cancelable:true}));'+
    'const backward=document.activeElement===links[0];'+
    'links[0].dispatchEvent(new KeyboardEvent("keydown",{key:"End",bubbles:true,cancelable:true}));'+
    'await frames();const endFocused=document.activeElement===links.at(-1),endVisible=visible(links.at(-1)),'+
    'endScroll=dock.scrollLeft;'+
    'links.at(-1).dispatchEvent(new KeyboardEvent("keydown",{key:"Home",bubbles:true,cancelable:true}));'+
    'await frames();return JSON.stringify({dir:root.dir,forward,backward,endFocused,endVisible,endScroll,'+
    'homeFocused:document.activeElement===links[0],homeVisible:visible(links[0]),homeScroll:dock.scrollLeft,'+
    'pageWidth:root.clientWidth,pageScroll:root.scrollWidth,dockScroll:dock.scrollWidth,dockClient:dock.clientWidth});})()'));
  assert.equal(rtlZoom.dir,"rtl","RTL zoom fixture did not apply the document direction");
  assert.equal(rtlZoom.forward,true,"RTL ArrowLeft failed to advance to the next destination");
  assert.equal(rtlZoom.backward,true,"RTL ArrowRight failed to return to previous destination");
  assert.equal(rtlZoom.endFocused,true,"RTL End failed to focus final destination");
  assert.equal(rtlZoom.endVisible,true,"RTL End left final destination clipped");
  assert.ok(Math.abs(rtlZoom.endScroll)>1,"RTL End failed to scroll offscreen destinations into view");
  assert.equal(rtlZoom.homeFocused,true,"RTL Home failed to focus first destination");
  assert.equal(rtlZoom.homeVisible,true,"RTL Home left first destination clipped");
  assert.ok(rtlZoom.pageScroll<=rtlZoom.pageWidth+1,"RTL navigation caused page-level overflow");
  assert.ok(rtlZoom.dockScroll>rtlZoom.dockClient+1,"RTL test failed to exercise overflow");
  console.log("Chromium RTL 400% dock: mirrored arrow keys, Home/End and scroll reachability passed");

  // An actual Chromium horizontal wheel/trackpad-style input is distinct
  // from keyboard traversal; touch acceptance still requires physical devices
  // because headless synthetic touch gesture did not yield reliable movement.
  await browser.setViewport(390,900,{dark:false});
  await browser.navigate(base+"/tests/dock-zoom.html");
  const wheelDock=JSON.parse(await browser.evaluate(
    '(()=>{document.documentElement.style.fontSize="400%";'+
    'const nav=document.querySelector("#zoom-dock"),r=nav.getBoundingClientRect();'+
    'return JSON.stringify({x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2),'+
    'scrollWidth:nav.scrollWidth,clientWidth:nav.clientWidth,scrollLeft:nav.scrollLeft});})()'));
  assert.ok(wheelDock.scrollWidth>wheelDock.clientWidth+1,
    "Horizontal wheel fixture did not contain offscreen navigation");
  await browser.dispatchHorizontalWheel(wheelDock.x,wheelDock.y,320);
  await delay(240);
  let afterPositive=Number(await browser.evaluate('document.querySelector("#zoom-dock").scrollLeft'));
  if(Math.abs(afterPositive-wheelDock.scrollLeft)<=2){
    // Keep testing actual native wheel input: a dropped first CDP gesture is
    // retried once, never replaced by a scripted scrollLeft mutation.
    await browser.dispatchHorizontalWheel(wheelDock.x,wheelDock.y,480);
    await delay(240);
    afterPositive=Number(await browser.evaluate('document.querySelector("#zoom-dock").scrollLeft'));
  }
  await browser.dispatchHorizontalWheel(wheelDock.x,wheelDock.y,-320);
  await delay(120);
  const afterNegative=Number(await browser.evaluate('document.querySelector("#zoom-dock").scrollLeft'));
  console.log("Chromium horizontal wheel metrics "+JSON.stringify({wheelDock,afterPositive,afterNegative}));
  assert.ok(Math.abs(afterPositive-wheelDock.scrollLeft)>2 || Math.abs(afterNegative-afterPositive)>2,
    "Chromium horizontal wheel failed to scroll the overflowing dock");
  const wheelPage=JSON.parse(await browser.evaluate(
    '(()=>JSON.stringify({width:document.documentElement.clientWidth,'+
    'scrollWidth:document.documentElement.scrollWidth}))()'));
  assert.ok(wheelPage.scrollWidth<=wheelPage.width+1,
    "Wheel-scrollable dock created page-level horizontal overflow");
  console.log("Chromium 400% floating dock: horizontal-wheel scroll reachable without page overflow");

  // Real Chromium wheel input also needs to remain discoverable when the
  // document is RTL. Chromium reports negative scrollLeft in that direction.
  // This is a trackpad/wheel check, not a replacement for physical touch QA.
  await browser.setViewport(390,900,{dark:true,forcedColors:true});
  await browser.navigate(base+"/tests/dock-zoom.html");
  const rtlWheel=JSON.parse(await browser.evaluate(
    '(()=>{const root=document.documentElement;root.dir="rtl";root.style.fontSize="400%";'+
    'const dock=document.querySelector("#zoom-dock"),r=dock.getBoundingClientRect();'+
    'return JSON.stringify({x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2),'+
    'start:dock.scrollLeft,width:dock.clientWidth,content:dock.scrollWidth,'+
    'scrollbar:getComputedStyle(dock).scrollbarWidth,'+
    'forced:matchMedia("(forced-colors: active)").matches})})()'));
  assert.equal(rtlWheel.forced,true,"RTL wheel test did not enable forced colors");
  assert.equal(rtlWheel.scrollbar,"thin","RTL forced-colors dock lost its scroll affordance");
  assert.ok(rtlWheel.content>rtlWheel.width+1,"RTL wheel fixture did not overflow");
  await browser.dispatchHorizontalWheel(rtlWheel.x,rtlWheel.y,-320);
  await delay(240);
  let rtlAfter=Number(await browser.evaluate('document.querySelector("#zoom-dock").scrollLeft'));
  if(rtlAfter>=rtlWheel.start-3){
    await browser.dispatchHorizontalWheel(rtlWheel.x,rtlWheel.y,-480);
    await delay(240);
    rtlAfter=Number(await browser.evaluate('document.querySelector("#zoom-dock").scrollLeft'));
  }
  await browser.dispatchHorizontalWheel(rtlWheel.x,rtlWheel.y,320);
  await delay(150);
  const rtlReturned=Number(await browser.evaluate('document.querySelector("#zoom-dock").scrollLeft'));
  assert.ok(rtlAfter<rtlWheel.start-3,
    "RTL wheel failed to reach earlier offscreen destinations: "+JSON.stringify({rtlWheel,rtlAfter}));
  assert.ok(Math.abs(rtlReturned)<Math.abs(rtlAfter),
    "Opposite RTL wheel gesture failed to restore the initial viewport");
  const rtlPage=JSON.parse(await browser.evaluate(
    '(()=>JSON.stringify({width:document.documentElement.clientWidth,'+
    'scroll:document.documentElement.scrollWidth}))()'));
  assert.ok(rtlPage.scroll<=rtlPage.width+1,"RTL wheel caused page-level overflow");
  console.log("Chromium RTL forced-colors 400% dock: horizontal wheel reaches hidden items and returns");

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
    const scoped=JSON.parse(await browser.evaluate(
      '(()=>{const w=document.querySelector("#demo-window"),n=document.querySelector("#demo-window-nav"),'+
      'b=w.querySelector(".gc-window__body"),a=w.getBoundingClientRect(),v=n.getBoundingClientRect();'+
      'return JSON.stringify({window:{left:a.left,right:a.right,top:a.top,bottom:a.bottom},'+
      'dock:{left:v.left,right:v.right,top:v.top,bottom:v.bottom},'+
      'position:getComputedStyle(n).position,scroll:getComputedStyle(b).overflowY,'+
      'current:n.querySelector("a[aria-current=page]")?.textContent.trim()});})()'));
    assert.equal(scoped.position,"relative","Window dock must remain within its own shell");
    assert.equal(scoped.scroll,"auto","Window body must scroll independently");
    assert.ok(scoped.dock.left>=scoped.window.left&&scoped.dock.right<=scoped.window.right+1&&
      scoped.dock.top>=scoped.window.top&&scoped.dock.bottom<=scoped.window.bottom+1,
      "Floating dock escaped its rounded app window "+JSON.stringify(scoped));
    assert.equal(scoped.current,"Workspace","Scoped window nav lost selection");

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
      'expected,padding:parseFloat(getComputedStyle(main).paddingBottom),'+
      'railDisplay:getComputedStyle(document.querySelector(".gc-navigation-rail")).display,'+
      'railWidth:document.querySelector(".gc-navigation-rail").getBoundingClientRect().width});})()'));
    if (width >= 601) {
      assert.equal(actual.height,0,"Wide-layout viewport dock must be hidden");
      assert.notEqual(actual.railDisplay,"none","Wide layout requires visible rail");
      assert.ok(actual.railWidth>=76,"Rail width must be meaningful");
      assert.ok(actual.scroll<=actual.width+1,"Wide navigation caused horizontal overflow");
      console.log("Chromium tablet/desktop @ "+width+"px: one visible rail, no viewport dock");
      continue;
    }
    assert.ok(actual.left>=0 && actual.right<=actual.width+1,"Floating dock exceeds viewport "+JSON.stringify(actual));
    assert.ok(actual.bottom<=844 && actual.height>=50,"Floating dock height/position incorrect "+JSON.stringify(actual));
    assert.ok(parseFloat(actual.radius)>=26,"Bottom nav lost rounded capsule "+JSON.stringify(actual));
    assert.ok(actual.active && actual.activeColor===actual.expected,"Dock selected state unreadable "+JSON.stringify(actual));
    assert.ok(actual.padding>=actual.height,"Dock occludes content "+JSON.stringify(actual));
    assert.ok(actual.scroll<=actual.width+1,"Floating nav causes horizontal overflow "+JSON.stringify(actual));
    console.log("Chromium floating bottom dock @ "+width+"px: capsule, safe space and contrast passed");
  }

  for(const [label,width,height,dark] of [
    ["desktop",900,900,false],
    ["mobile",390,844,true]
  ]) {
    await browser.setViewport(width,height,{dark});
    await browser.navigate(base+"/lab/");
    await browser.evaluate('document.querySelector("#demo-window").scrollIntoView({block:"center",behavior:"instant"})');
    await delay(80);
    const screenshot=await browser.screenshot(join(directory,"gc-ui-window-scoped-dock-"+label+".png"));
    assert.equal(screenshot.width,width);
    console.log("Chromium window-owned floating dock screenshot "+label+": captured");
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

  // Signal Constellation is a native-first pattern, not live service telemetry.
  // Exercise actual Chromium buttons, keyboard input, dynamic data and disposal.
  await browser.setViewport(390,844,{dark:false});
  await browser.navigate(base+"/tests/signal-board-browser.html");
  const signalStart=JSON.parse(await browser.evaluate(
    '(()=>{const b=window.testBoard,items=[...document.querySelectorAll("[data-gc-signal-list] > li")];'+
    'return JSON.stringify({ready:document.documentElement.dataset.ready,filter:b?.filter,'+
    'visible:items.filter(item=>!item.hidden).length,'+
    'summary:document.querySelector("[data-gc-signal-summary]").textContent,'+
    'count:document.querySelector("[data-gc-signal-count=ready]").textContent,'+
    'cookie:document.cookie,storage:localStorage.length})})()'));
  assert.equal(signalStart.ready,"true","Signal Constellation fixture did not initialize");
  assert.equal(signalStart.filter,"all","Signal Constellation must start with All selected");
  assert.equal(signalStart.visible,4,"Board did not initially expose all four sample statuses");
  assert.equal(signalStart.summary,"Showing 4 of 4 signals; 3 of 3 related events");
  assert.equal(signalStart.count,"2");
  assert.ok(signalStart.summary.endsWith("3 of 3 related events"),
    "Initial Timeflow events were not included in accessible summary");

  const signalAX=(await browser.accessibilityTree()).filter(node=>
    node.role==="button" && ["All","Ready","Needs review","Offline"].includes(node.name));
  assert.equal(signalAX.length,4,"Signal filter buttons lost accessible native names");
  const attention=JSON.parse(await browser.evaluate(
    '(()=>{document.querySelector("[data-gc-signal-filter=attention]").click();'+
    'const items=[...document.querySelectorAll("[data-gc-signal-list] > li")];'+
    'const buttons=[...document.querySelectorAll("[data-gc-signal-filters] button")];'+
    'return JSON.stringify({filter:window.testBoard.filter,visible:items.filter(i=>!i.hidden).length,'+
    'selected:buttons.filter(b=>b.getAttribute("aria-pressed")==="true").map(b=>b.dataset.gcSignalFilter),'+
    'status:document.querySelector("[data-gc-signal-summary]").textContent,'+
    'empty:document.querySelector("[data-gc-signal-empty]").hidden})})()'));
  assert.deepEqual(attention,{filter:"attention",visible:1,selected:["attention"],
    status:"Showing 1 of 4 signals; 1 of 3 related events",empty:true},"Status filter did not select only attention items");

  const arrow=JSON.parse(await browser.evaluate(
    '(()=>{const b=document.querySelector("[data-gc-signal-filter=attention]");b.focus();'+
    'b.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true,cancelable:true}));'+
    'return JSON.stringify({filter:window.testBoard.filter,focus:document.activeElement.dataset.gcSignalFilter,'+
    'pressed:document.activeElement.getAttribute("aria-pressed")})})()'));
  assert.deepEqual(arrow,{filter:"offline",focus:"offline",pressed:"true"},
    "Native roving filter keyboard behavior failed");

  const changed=JSON.parse(await browser.evaluate(
    '(()=>{const list=document.querySelector("[data-gc-signal-list]");'+
    'const li=document.createElement("li");li.className="gc-signal-card";'+
    'li.setAttribute("data-gc-signal","ready");li.textContent="Fifth local signal";list.append(li);'+
    'const refreshed=window.testBoard.refresh();window.testBoard.setFilter("ready");'+
    'return JSON.stringify({refreshed,filter:window.testBoard.filter,'+
    'visible:[...list.children].filter(x=>!x.hidden).length,'+
    'readyCount:document.querySelector("[data-gc-signal-count=ready]").textContent,'+
    'summary:document.querySelector("[data-gc-signal-summary]").textContent})})()'));
  assert.equal(changed.refreshed.total,5,"Board refresh did not account for inserted item");
  assert.equal(changed.visible,3,"Board failed to show the new Ready status");
  assert.equal(changed.readyCount,"3","Board did not reconcile semantic counts");
  assert.equal(changed.summary,"Showing 3 of 5 signals; 1 of 3 related events");

  const safeFocus=JSON.parse(await browser.evaluate(
    '(()=>{const link=document.querySelector("#focusable-signal");link.focus();'+
    'window.testBoard.setFilter("attention");'+
    'let invalidRejected=false;try{window.testBoard.setFilter("url(javascript:alert(1))")}'+
    'catch(error){invalidRejected=error instanceof RangeError;}'+
    'return JSON.stringify({focus:document.activeElement.dataset.gcSignalFilter,'+
    'linkHidden:link.closest("li").hidden,invalidRejected,filter:window.testBoard.filter})})()'));
  assert.deepEqual(safeFocus,{focus:"attention",linkHidden:true,invalidRejected:true,filter:"attention"},
    "Filtering hid focused content or accepted an unsupported state");

  const historyFocus=JSON.parse(await browser.evaluate(
    '(()=>{window.testBoard.setFilter("ready");const link=document.querySelector("#focusable-history");link.focus();'+
    'window.testBoard.setFilter("offline");'+
    'const timeline=document.querySelector("[data-gc-timeflow-list]");'+
    'return JSON.stringify({focus:document.activeElement.dataset.gcSignalFilter,'+
    'historyLinkHidden:link.closest("li").hidden,'+
    'visibleHistory:[...timeline.children].filter(x=>!x.hidden).length,'+
    'summary:document.querySelector("[data-gc-signal-summary]").textContent})})()'));
  assert.deepEqual(historyFocus,{
    focus:"offline",historyLinkHidden:true,visibleHistory:1,
    summary:"Showing 1 of 5 signals; 1 of 3 related events"
  },"Linked history filtering hid focused content or lost its live counts");

  const historyEmpty=JSON.parse(await browser.evaluate(
    '(()=>{const b=window.testBoard;const history=document.querySelector("[data-gc-timeflow-list]");'+
    'const offline=history.querySelector("[data-gc-signal=offline]");'+
    'offline.setAttribute("data-gc-signal","attention");'+
    'const reduced=b.refresh();const empty=document.querySelector("[data-gc-timeflow-empty]");'+
    'const snapshot={emptyVisible:!empty.hidden,historyVisible:reduced.historyVisible,'+
    'historyTotal:reduced.historyTotal,summary:document.querySelector("[data-gc-signal-summary]").textContent};'+
    'offline.setAttribute("data-gc-signal","offline");b.refresh();'+
    'return JSON.stringify(snapshot)})()'));
  assert.deepEqual(historyEmpty,{
    emptyVisible:true,historyVisible:0,historyTotal:3,
    summary:"Showing 1 of 5 signals; 0 of 3 related events"
  },"Missing related events did not show clear Timeflow empty feedback");

  const invalidHistory=JSON.parse(await browser.evaluate(
    '(()=>{const b=window.testBoard;const history=document.querySelector("[data-gc-timeflow-list]");'+
    'const bad=document.createElement("li");bad.setAttribute("data-gc-signal","unknown");'+
    'const time=document.createElement("time");time.setAttribute("datetime","2026-11-12T12:00");'+
    'bad.append(time);history.append(bad);'+
    'let rejected=false;try{b.refresh()}catch(error){rejected=error instanceof TypeError;}'+
    'bad.remove();const state=b.refresh();'+
    'return JSON.stringify({rejected,historyVisible:state.historyVisible,historyTotal:state.historyTotal,'+
    'filter:b.filter})})()'));
  assert.deepEqual(invalidHistory,{rejected:true,historyVisible:1,historyTotal:3,filter:"offline"},
    "Malformed Timeflow entry corrupted filter state");

  const emptyState=JSON.parse(await browser.evaluate(
    '(()=>{const list=document.querySelector("[data-gc-signal-list]");'+
    'list.querySelector("[data-gc-signal=offline]").remove();window.testBoard.refresh();'+
    'window.testBoard.setFilter("offline");'+
    'return JSON.stringify({summary:document.querySelector("[data-gc-signal-summary]").textContent,'+
    'visible:[...list.children].filter(x=>!x.hidden).length,'+
    'emptyHidden:document.querySelector("[data-gc-signal-empty]").hidden})})()'));
  assert.deepEqual(emptyState,{summary:"Showing 0 of 4 signals; 1 of 3 related events",visible:0,emptyHidden:false},
    "Empty status feedback failed after removing all offline sample items");

  const disposed=JSON.parse(await browser.evaluate(
    '(()=>{const b=window.testBoard;const list=document.querySelector("[data-gc-signal-list]");'+
    'const bad=document.createElement("li");bad.setAttribute("data-gc-signal","unknown");list.append(bad);'+
    'let rejected=false;try{b.refresh()}catch(error){rejected=error instanceof TypeError;}bad.remove();'+
    'b.dispose();b.dispose();'+
    'document.querySelector("[data-gc-signal-filter=ready]").click();'+
    'let disposedRejected=false;try{b.setFilter("ready")}catch(error){disposedRejected=/disposed/.test(error.message);};'+
    'return JSON.stringify({rejected,disposedRejected,'+
    'visible:[...list.children].filter(x=>!x.hidden).length,'+
    'readyCount:document.querySelector("[data-gc-signal-count=ready]").textContent,'+
    'summary:document.querySelector("[data-gc-signal-summary]").textContent,'+
    'selected:document.querySelector("[data-gc-signal-filter=all]").getAttribute("aria-pressed"),'+
    'cookie:document.cookie,storage:localStorage.length})})()'));
  assert.equal(disposed.rejected,true,"Refresh accepted invalid dynamic status");
  assert.equal(disposed.disposedRejected,true,"Disposed board still permits new filtering");
  assert.equal(disposed.visible,4,"Dispose failed to restore original list visibility");
  assert.equal(disposed.readyCount,"2","Dispose failed to restore consumer-owned original count");
  assert.equal(disposed.summary,"Showing 4 of 4 signals; 3 of 3 related events","Dispose failed to restore status text");
  assert.equal(disposed.selected,"true","Dispose did not restore original native button states");
  const historyRestored=JSON.parse(await browser.evaluate(
    '(()=>{const list=document.querySelector("[data-gc-timeflow-list]");'+
    'return JSON.stringify({visible:[...list.children].filter(x=>!x.hidden).length,'+
    'emptyHidden:document.querySelector("[data-gc-timeflow-empty]").hidden})})()'));
  assert.deepEqual(historyRestored,{visible:3,emptyHidden:true},
    "Dispose failed to restore original linked Timeflow visibility and empty state");
  assert.equal(disposed.cookie,signalStart.cookie,"Board unexpectedly changed cookies");
  assert.equal(disposed.storage,signalStart.storage,"Board unexpectedly wrote local storage");
  const backwardsCompatible=JSON.parse(await browser.evaluate(
    '(()=>{const board=document.querySelector("#fixture-board"),timeline=board.querySelector(".gc-timeflow"),'+
    'empty=board.querySelector("[data-gc-timeflow-empty]");'+
    'empty.removeAttribute("data-gc-timeflow-empty");'+
    'let missingEmptyRejected=false;try{window.initSignalBoard(board)}'+
    'catch(error){missingEmptyRejected=error instanceof TypeError;}'+
    'timeline.removeAttribute("data-gc-timeflow-list");'+
    'const controller=window.initSignalBoard(board);controller.setFilter("ready");'+
    'const status=board.querySelector("[data-gc-signal-summary]").textContent;'+
    'const events=[...timeline.children].filter(node=>!node.hidden).length;'+
    'const selected=controller.filter;controller.dispose();'+
    'return JSON.stringify({missingEmptyRejected,status,events,selected})})()'));
  assert.deepEqual(backwardsCompatible,{
    missingEmptyRejected:true,status:"Showing 3 of 4 signals",
    events:3,selected:"ready"
  },"Optional linked Timeflow broke existing signal-only consumers");
  console.log("Chromium Signal Constellation: native filters, keyboard, dynamic refresh, focus, empty, disposal and privacy passed");

  // The real lab uses the same component without fake service backends.
  for (const scenario of [
    {name:"desktop-light",width:1440,dark:false,forcedColors:false,zoom:false},
    {name:"mobile-dark",width:390,dark:true,forcedColors:false,zoom:false},
    {name:"mobile-forced-colors",width:390,dark:true,forcedColors:true,zoom:false},
    {name:"mobile-rtl-enlarged",width:320,dark:false,forcedColors:false,zoom:true}
  ]) {
    await browser.setViewport(scenario.width,900,{dark:scenario.dark,forcedColors:scenario.forcedColors});
    await browser.navigate(base+"/lab/");
    const visual=JSON.parse(await browser.evaluate(
      '(()=>{const root=document.documentElement,board=document.querySelector("#signal-constellation");'+
      'if('+String(scenario.zoom)+'){root.dir="rtl";root.style.fontSize="400%";}'+
      'board.scrollIntoView({block:"start",behavior:"instant"});'+
      'window.scrollBy({top:-Math.max(0,document.querySelector(".gc-lab-toolbar").getBoundingClientRect().height),behavior:"instant"});'+
      'const r=board.getBoundingClientRect(),lens=board.querySelector(".gc-signal-board__lens");'+
      'const css=getComputedStyle(lens),cards=[...board.querySelectorAll("[data-gc-signal-list] > li")];'+
      'return JSON.stringify({width:root.clientWidth,scroll:root.scrollWidth,'+
      'rect:{left:r.left,right:r.right,width:r.width},'+
      'cards:cards.map(c=>({width:c.scrollWidth,client:c.clientWidth,hidden:c.hidden})),'+
      'filters:board.querySelectorAll("[data-gc-signal-filter]").length,'+
      'text:board.querySelector(".gc-signal-board__description").textContent,'+
      'blur:css.backdropFilter||css.webkitBackdropFilter,'+
      'color:css.color,background:css.backgroundColor})})()'));
    assert.ok(visual.rect.left>=0&&visual.rect.right<=visual.width+1,
      "Signal board escaped viewport "+scenario.name);
    assert.ok(visual.scroll<=visual.width+1,"Signal board caused page overflow "+scenario.name);
    assert.equal(visual.filters,4,"Live design lab signal filters are missing "+scenario.name);
    assert.ok(visual.cards.every(card=>!card.hidden&&card.width<=card.client+1),
      "Signal card content hidden or clipped "+scenario.name);
    assert.match(visual.text,/illustrative local records/i,"Preview is misrepresented as live");
    if(scenario.forcedColors) {
      assert.equal(visual.blur,"none","Forced-colors signal header retained blur");
    } else {
      assert.ok(visual.blur.includes("blur("),"Cloud Lens signal header lost frosted blur");
    }
    if(!scenario.zoom) {
      const shot=await browser.screenshot(join(directory,"gc-ui-signal-constellation-"+scenario.name+".png"));
      assert.equal(shot.width,scenario.width,"Signal QA screenshot width mismatch");
    }
    const linked=JSON.parse(await browser.evaluate(
      '(()=>{const board=document.querySelector("#signal-constellation");'+
      'board.querySelector("[data-gc-signal-filter=attention]").click();'+
      'const visible=selector=>[...board.querySelectorAll(selector)].filter(x=>!x.hidden);'+
      'return JSON.stringify({filter:board.querySelector("[data-gc-signal-filter=attention]").getAttribute("aria-pressed"),'+
      'cards:visible("[data-gc-signal-list] > li").map(x=>x.getAttribute("data-gc-signal")),'+
      'history:visible("[data-gc-timeflow-list] > li").map(x=>x.getAttribute("data-gc-signal")),'+
      'summary:board.querySelector("[data-gc-signal-summary]").textContent,'+
      'historyEmpty:board.querySelector("[data-gc-timeflow-empty]").hidden,'+
      'width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})})()'));
    assert.deepEqual(linked.cards,["attention"],"Live lab signal filter did not update cards "+scenario.name);
    assert.deepEqual(linked.history,["attention"],"Live lab Timeflow did not follow selected status "+scenario.name);
    assert.equal(linked.filter,"true","Live lab status filter lost selected semantics "+scenario.name);
    assert.equal(linked.summary,"Showing 1 of 4 signals; 1 of 3 related events",
      "Live lab summary did not coordinate cards and history "+scenario.name);
    assert.equal(linked.historyEmpty,true,"Live lab Timeflow incorrectly displays empty message");
    assert.ok(linked.scroll<=linked.width+1,
      "Filtered lab status view introduced horizontal overflow "+scenario.name);
    if (scenario.name==="desktop-light" || scenario.name==="mobile-dark") {
      const shot=await browser.screenshot(join(directory,
        "gc-ui-signal-constellation-filtered-"+scenario.name+".png"));
      assert.equal(shot.width,scenario.width,"Linked Timeflow screenshot width mismatch");
    }
    if (scenario.name==="mobile-dark") {
      await browser.evaluate('document.querySelector("#signal-constellation .gc-timeflow-panel").scrollIntoView({block:"center",behavior:"instant"})');
      const historyGeometry=JSON.parse(await browser.evaluate(
        '(()=>{const root=document.documentElement,section=document.querySelector("#signal-constellation .gc-timeflow-panel");'+
        'const r=section.getBoundingClientRect(),record=section.querySelector("[data-gc-timeflow-list] > li:not([hidden])");'+
        'const entry=record.getBoundingClientRect();'+
        'return JSON.stringify({width:root.clientWidth,scroll:root.scrollWidth,'+
        'left:r.left,right:r.right,entryLeft:entry.left,entryRight:entry.right,'+
        'entryTitle:record.querySelector("strong").textContent.trim()})})()'));
      assert.ok(historyGeometry.scroll<=historyGeometry.width+1,
        "Filtered Timeflow overflows narrow viewport");
      assert.ok(historyGeometry.left>=0&&historyGeometry.right<=historyGeometry.width+1,
        "Filtered Timeflow panel escapes narrow viewport");
      assert.ok(historyGeometry.entryLeft>=historyGeometry.left-1 &&
        historyGeometry.entryRight<=historyGeometry.right+1,
        "Filtered Timeflow event escapes its panel");
      assert.equal(historyGeometry.entryTitle,"Review suggested",
        "Visual Timeflow record does not match selected Needs review event");
      const historyShot=await browser.screenshot(join(directory,
        "gc-ui-timeflow-filtered-mobile-dark.png"));
      assert.equal(historyShot.width,scenario.width,"Timeflow-focused QA capture width mismatch");
    }
    console.log("Chromium Signal Constellation "+scenario.name+": bounds, semantics, frosted fallback passed");
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
  // A parent application may embed sibling products with independent palettes.
  // Test both OS appearance preferences against actual Chromium computed styles.
  for(const osDark of [false,true]){
    await browser.setViewport(900,760,{dark:osDark});
    await browser.navigate(base+"/lab/");
    const actual=JSON.parse(await browser.evaluate("(async()=>{\n const {applyTheme,deriveAccent}=await import(\"/src/theme.js\");\n const host=document.createElement(\"div\"),parts=[];\n for(let i=0;i<3;i++){const app=document.createElement(\"section\");app.className=\"gc-app\";const action=document.createElement(\"button\");action.className=\"gc-button\";action.textContent=\"Action\";app.append(action);host.append(app);parts.push(app);}\n document.body.append(host);\n const [a,b,c]=parts;\n applyTheme(a,{mode:\"dark\",accent:\"lagoon\"});\n applyTheme(b,{mode:\"light\",customAccent:\"#B13571\"});\n applyTheme(c,{mode:\"auto\",accent:\"moss\"});\n const read=el=>{const s=getComputedStyle(el);return {canvas:s.getPropertyValue(\"--gc-canvas\").trim(),brand:s.getPropertyValue(\"--gc-brand\").trim(),scheme:s.colorScheme,button:getComputedStyle(el.querySelector(\".gc-button\")).backgroundColor};};\n const parentBefore=getComputedStyle(document.documentElement).getPropertyValue(\"--gc-brand\").trim();\n const before={a:read(a),b:read(b),c:read(c)};\n applyTheme(a,{mode:\"light\",accent:\"ember\",contrast:\"more\"});\n const after={a:read(a),b:read(b),c:read(c)};\n const parentUnchanged=getComputedStyle(document.documentElement).getPropertyValue(\"--gc-brand\").trim()===parentBefore;\n const expectedCustom=deriveAccent(\"#B13571\",\"light\").brand;\n host.remove();\n return JSON.stringify({before,after,parentUnchanged,expectedCustom});\n})()"));
    assert.equal(actual.before.a.canvas,"#0D121D","Dark scope Canvas inherited the host");
    assert.equal(actual.before.a.brand,"#8BE7F1","Dark Lagoon scope lost its palette");
    assert.equal(actual.before.a.scheme,"dark");
    assert.equal(actual.before.b.canvas,"#F6F7FB","Light scope Canvas inherited dark");
    assert.equal(actual.before.b.brand,actual.expectedCustom,"Arbitrary custom hue missing");
    assert.equal(actual.before.b.scheme,"light");
    assert.equal(actual.before.c.brand,osDark?"#A9E0B3":"#326B42","Auto scope ignored OS appearance");
    assert.equal(actual.after.a.canvas,"#F6F7FB","Local scope did not switch appearance");
    assert.equal(actual.after.a.brand,"#A43F1D","Local scope did not switch accent");
    assert.deepEqual(actual.after.b,actual.before.b,"Sibling custom scope leaked changes");
    assert.deepEqual(actual.after.c,actual.before.c,"Sibling auto scope leaked changes");
    assert.equal(actual.parentUnchanged,true,"Scoped theme mutated document palette");
    console.log("Chromium independent app color/appearance "+(osDark?"dark":"light")+": passed");
  }

  // Reduced-motion preferences must override primitives on each configured app root.
  await browser.setViewport(900,760,{dark:true,reducedMotion:true});
  await browser.navigate(base+"/lab/");
  const scopedMotion=JSON.parse(await browser.evaluate("(async()=> {\n  const {applyTheme}=await import(\"/src/theme.js\");\n  const host=document.createElement(\"div\"),apps=[];\n  for(const mode of [\"light\",\"dark\",\"auto\"]){\n    const app=document.createElement(\"section\");app.className=\"gc-app\";host.append(app);\n    applyTheme(app,{mode,accent:\"lagoon\"});apps.push(app);\n  }\n  document.body.append(host);\n  const roles=apps.map(app=>{const s=getComputedStyle(app);return {fast:s.getPropertyValue(\"--gc-motion-fast\").trim(),base:s.getPropertyValue(\"--gc-motion-base\").trim(),slow:s.getPropertyValue(\"--gc-motion-slow\").trim()};});\n  host.remove();\n  return JSON.stringify({active:matchMedia(\"(prefers-reduced-motion: reduce)\").matches,roles});\n})()"));
  assert.equal(scopedMotion.active,true,"Reduced-motion emulation did not activate");
  assert.equal(scopedMotion.roles.length,3);
  for(const role of scopedMotion.roles) assert.deepEqual(role,
    {fast:"0ms",base:"0ms",slow:"0ms"},"Configured application bypassed reduced motion");
  console.log("Chromium app-scoped reduced-motion tokens: passed");


  // Real Chromium computed-style acceptance for the optional glass package.
  // Tests solid defaults, opt-in blur, explicit high contrast and forced colors.
  for (const scenario of [
    {name:"light",dark:false,forcedColors:false,contrast:false},
    {name:"dark",dark:true,forcedColors:false,contrast:false},
    {name:"high-contrast",dark:false,forcedColors:false,contrast:true},
    {name:"reduced-transparency",dark:false,forcedColors:false,contrast:false,reducedTransparency:true},
    {name:"forced-colors",dark:false,forcedColors:true,contrast:false},
    {name:"user-reduced-transparency",dark:true,forcedColors:false,contrast:false,manualTransparency:true},
    {name:"user-reduced-and-forced-colors",dark:true,forcedColors:true,contrast:false,manualTransparency:true}
  ]) {
    await browser.setViewport(390,844,{dark:scenario.dark,forcedColors:scenario.forcedColors,reducedTransparency:scenario.reducedTransparency});
    await browser.navigate(base+"/tests/glass-browser.html");
    const state=JSON.parse(await browser.evaluate(
      '(()=>{if('+JSON.stringify(scenario.contrast)+')document.documentElement.dataset.gcContrast="more";'+
      'if('+JSON.stringify(Boolean(scenario.manualTransparency))+')document.documentElement.dataset.gcTransparency="reduce";'+
      'const roles=["base","elevated","overlay","solid"];'+
      'const values=roles.map(role=>{const el=document.querySelector(".gc-glass-"+role);'+
      'const style=getComputedStyle(el);return {role,background:style.backgroundColor,color:style.color,blur:style.backdropFilter||style.webkitBackdropFilter,border:style.borderTopStyle,rect:el.getBoundingClientRect().toJSON()};});'+
      'const probe=document.createElement("span");probe.style.background="Canvas";probe.style.color="CanvasText";document.body.append(probe);'+
      'const sys=getComputedStyle(probe),systemBackground=sys.backgroundColor,systemText=sys.color;probe.remove();'+
      'const root=document.documentElement,rs=getComputedStyle(root);'+
      'return JSON.stringify({width:root.clientWidth,scroll:root.scrollWidth,values,'+
      'theme:root.dataset.gcTheme,emulatedDark:matchMedia("(prefers-color-scheme: dark)").matches,'+
      'systemBackground,systemText,'+
      'canvas:rs.getPropertyValue("--gc-canvas").trim(),text:rs.getPropertyValue("--gc-text").trim()});})()'));
    const brightness=value=>{
      assert.match(value,/^#[0-9a-f]{6}$/i,"Unexpected semantic color format "+value);
      return ([1,3,5].reduce((sum,i)=>sum+Number.parseInt(value.slice(i,i+2),16),0))/3;
    };
    assert.equal(state.theme,"auto","Glass fixture must respect the emulated appearance");
    assert.equal(state.emulatedDark,scenario.dark,"Browser did not emulate the requested appearance");
    assert.ok(scenario.dark
      ? brightness(state.text)>brightness(state.canvas)
      : brightness(state.text)<brightness(state.canvas),
      "Glass fixture failed to apply the effective "+(scenario.dark?"dark":"light")+" semantic palette: "+JSON.stringify(state));
    assert.ok(state.scroll<=state.width+1,"Glass fixture horizontal overflow: "+JSON.stringify({scenario:scenario.name,state}));
    assert.equal(state.values.length,4,"Missing material roles");
    const modeledRatios = [];
    for(const value of state.values) {
      const contrast = assertGlassTextContrast(value.color, value.background, 4.5);
      modeledRatios.push(contrast.ratio);
      assert.notEqual(value.background,"rgba(0, 0, 0, 0)","Transparent material background "+scenario.name+" "+value.role);
      assert.notEqual(value.border,"none","Missing material boundary "+scenario.name+" "+value.role);
      assert.ok(value.rect.width>0&&value.rect.right<=state.width+1,"Material escaped viewport "+scenario.name+" "+value.role);
      if(scenario.forcedColors) {
        assert.equal(value.background,state.systemBackground,
          "System Canvas background was overridden in "+scenario.name+" "+value.role);
        assert.equal(value.color,state.systemText,
          "System CanvasText foreground was overridden in "+scenario.name+" "+value.role);
      }
      if(scenario.contrast||scenario.forcedColors||scenario.reducedTransparency||scenario.manualTransparency||value.role==="solid") {
        assert.ok(value.blur==="none"||value.blur==="","Glass blur must be disabled "+scenario.name+" "+value.role+": "+value.blur);
      }
    }
    const glassShot=await browser.screenshot(join(directory,"gc-ui-glass-"+scenario.name+".png"));
    assert.equal(glassShot.width,390,"Glass evidence viewport mismatch");
    assert.equal(glassShot.height,844,"Glass evidence height mismatch");
    console.log("Chromium atmospheric materials "+scenario.name+": 4 roles, boundaries, fallback, bounds and minimum modeled text contrast "+Math.min(...modeledRatios).toFixed(2)+":1 passed");
  }

  // All four existing accent families retain independent light/dark glass
  // readability; selecting an accent must never lock the ecosystem to one hue.
  for(const dark of [false,true]) {
    await browser.setViewport(390,844,{dark});
    await browser.navigate(base+"/tests/glass-browser.html");
    const brands=[];
    for(const accent of ["iris","lagoon","ember","moss"]) {
      const palette=JSON.parse(await browser.evaluate(
        '(()=>{document.documentElement.dataset.gcAccent='+JSON.stringify(accent)+';'+
        'const root=document.documentElement,cs=getComputedStyle(root);'+
        'return JSON.stringify({accent:root.dataset.gcAccent,brand:cs.getPropertyValue("--gc-brand").trim(),'+
        'text:getComputedStyle(document.querySelector(".gc-glass-base")).color,'+
        'surfaces:["base","elevated","overlay","solid"].map(role=>{'+
        'const s=getComputedStyle(document.querySelector(".gc-glass-"+role));'+
        'return {role,foreground:s.color,background:s.backgroundColor}})});})()'));
      assert.equal(palette.accent,accent,"Accent selection was lost");
      assert.match(palette.brand,/^#[0-9a-f]{6}$/i,"Accent semantic token missing");
      brands.push(palette.brand);
      for(const {role,foreground,background} of palette.surfaces) {
        assertGlassTextContrast(foreground,background,4.5);
      }
    }
    assert.equal(new Set(brands).size,4,
      "Preset accent colors collapsed to a mandatory global hue in "+(dark?"dark":"light")+" mode");
    console.log("Chromium glass preset accents "+(dark?"dark":"light")+": four independent hues, all 4 roles >= 4.5:1 modeled contrast");
  }

  // A user opt-out must take effect without OS support and restore the exact
  // previous visual style when switched back to auto. This does not certify
  // every possible photographic or high-detail backdrop.
  await browser.setViewport(390,844,{dark:false});
  await browser.navigate(base+"/tests/glass-browser.html");
  const userToggle=JSON.parse(await browser.evaluate(
    '(()=>{const root=document.documentElement,el=document.querySelector(".gc-glass-base");'+
    'const read=()=>{const s=getComputedStyle(el);return {background:s.backgroundColor,blur:s.backdropFilter||s.webkitBackdropFilter}};'+
    'const before=read();root.dataset.gcTransparency="reduce";const reduced=read();'+
    'root.dataset.gcTransparency="auto";const restored=read();return JSON.stringify({before,reduced,restored});})()'));
  assert.equal(userToggle.reduced.blur,"none",
    "User accessibility preference failed to disable compositing");
  assert.match(userToggle.reduced.background,/^rgb\(/,
    "User accessibility preference failed to restore an opaque material");
  assert.deepEqual(userToggle.restored,userToggle.before,
    "Restoring auto transparency did not restore the original glass style");
  console.log("Chromium manual glass transparency: reversible, opaque and blur-free");

  // Real keyboard-operable UI for the optional preference, not just a test
  // mutating root dataset. It intentionally retains no state after reload.
  await browser.navigate(base+"/tests/glass-browser.html");
  const livePreference=JSON.parse(await browser.evaluate(
    '(()=>{const input=document.querySelector("#gc-glass-reduce"),'+
    'status=document.querySelector("#gc-glass-preference-status"),'+
    'el=document.querySelector(".gc-glass-base");'+
    'const read=()=>({preference:document.documentElement.dataset.gcTransparency,'+
    'checked:input.checked,status:status.textContent.trim(),'+
    'blur:getComputedStyle(el).backdropFilter||getComputedStyle(el).webkitBackdropFilter});'+
    'const initial=read();input.click();const reduced=read();'+
    'input.click();const restored=read();'+
    'return JSON.stringify({initial,reduced,restored,name:input.labels?.[0]?.textContent.trim()});})()'));
  assert.equal(livePreference.initial.checked,false,"Manual preference must default to off");
  assert.equal(livePreference.initial.preference,"auto","System setting should be active by default");
  assert.match(livePreference.name,/Reduce transparency/,"Toggle lacks a native accessible label");
  assert.equal(livePreference.reduced.checked,true,"UI did not select reduced transparency");
  assert.equal(livePreference.reduced.preference,"reduce","UI failed to update the theme controller");
  assert.match(livePreference.reduced.status,/Solid surfaces/,"Preference action lacks visible status");
  assert.ok(["none",""].includes(livePreference.reduced.blur),"Preference UI failed to disable blur");
  assert.equal(livePreference.restored.preference,"auto","UI failed to restore system transparency");
  assert.equal(livePreference.restored.checked,false,"UI restored state disagrees with the control");
  assert.equal(livePreference.restored.blur,livePreference.initial.blur,"UI did not restore visual style");
  await browser.navigate(base+"/tests/glass-browser.html");
  const localOnly=JSON.parse(await browser.evaluate(
    '(()=>JSON.stringify({checked:document.querySelector("#gc-glass-reduce").checked,'+
    'preference:document.documentElement.dataset.gcTransparency}))()'));
  assert.equal(localOnly.checked,false,"Lab preference unexpectedly persisted after navigation");
  assert.equal(localOnly.preference,"auto","Theme preference unexpectedly persisted after navigation");
  const checkboxAX=(await browser.accessibilityTree()).filter(n=>
    n.role==="checkbox" && n.name==="Reduce transparency");
  assert.equal(checkboxAX.length,1,"Toggle must appear exactly once with its native accessible name");
  await browser.evaluate('document.querySelector("#gc-glass-reduce").focus()');
  await browser.pressSpace();
  const selectedByKeyboard=JSON.parse(await browser.evaluate(
    '(()=>JSON.stringify({focused:document.activeElement.id==="gc-glass-reduce",'+
    'checked:document.querySelector("#gc-glass-reduce").checked,'+
    'transparency:document.documentElement.dataset.gcTransparency}))()'));
  assert.deepEqual(selectedByKeyboard,{focused:true,checked:true,transparency:"reduce"},
    "Native Space key must activate the transparency preference without stealing focus");
  await browser.pressSpace();
  const restoredByKeyboard=JSON.parse(await browser.evaluate(
    '(()=>JSON.stringify({checked:document.querySelector("#gc-glass-reduce").checked,'+
    'transparency:document.documentElement.dataset.gcTransparency}))()'));
  assert.deepEqual(restoredByKeyboard,{checked:false,transparency:"auto"},
    "Native Space key must restore system transparency");
  // Screenshot-led visual review found the label and live status touching at
  // compact sizes. Keep the block separation in real Chromium at 320/390px.
  for(const width of [320,390]) {
    await browser.setViewport(width,760,{dark:width===390});
    await browser.navigate(base+"/tests/glass-browser.html");
    const layout=JSON.parse(await browser.evaluate(
      '(()=>{const label=document.querySelector("label[for=gc-glass-reduce]").getBoundingClientRect(),'+
      'status=document.querySelector("#gc-glass-preference-status").getBoundingClientRect();'+
      'return JSON.stringify({width:document.documentElement.clientWidth,'+
      'scroll:document.documentElement.scrollWidth,'+
      'labelBottom:label.bottom,labelRight:label.right,statusTop:status.top,statusRight:status.right})})()'));
    assert.ok(layout.statusTop>=layout.labelBottom+2,
      "Live preference status collides with its label at "+width+"px");
    assert.ok(layout.labelRight<=layout.width+1&&layout.statusRight<=layout.width+1,
      "Glass preference content escapes viewport "+JSON.stringify(layout));
    assert.ok(layout.scroll<=layout.width+1,
      "Glass preference causes document overflow at "+width+"px");
    const shot=await browser.screenshot(join(directory,"gc-ui-glass-preference-"+width+".png"));
    assert.equal(shot.width,width,"Preference QA screenshot width mismatch");
  }
  console.log("Chromium transparency preference UI: labeled, reversible, live and nonpersistent");

  // The real design lab must honor the same preference on existing Cloud Lens
  // and floating navigation, not only on the optional glass.css utilities.
  for (const [width,dark] of [[320,false],[390,true]]) {
    await browser.setViewport(width,844,{dark});
    await browser.navigate(base+"/lab/");
    const labPreference=JSON.parse(await browser.evaluate(
      '(()=>{const root=document.documentElement,control=document.querySelector("#transparency"),'+
      'lens=document.querySelector(".gc-lab-toolbar.gc-lens"),nav=document.querySelector("#demo-bottom-nav");'+
      'const css=el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,blur:s.backdropFilter||s.webkitBackdropFilter}};'+
      'const snapshot=()=>({preference:root.dataset.gcTransparency,checked:control.checked,'+
      'lens:css(lens),nav:css(nav),windowDock:css(document.querySelector("#demo-window-nav")),width:root.clientWidth,scroll:root.scrollWidth});'+
      'const before=snapshot(),storageBefore=localStorage.length,cookieBefore=document.cookie;'+
      'control.click();const reduced=snapshot();'+
      'control.click();const restored=snapshot();'+
      'return JSON.stringify({before,reduced,restored,storageUnchanged:localStorage.length===storageBefore,'+
      'cookieUnchanged:document.cookie===cookieBefore,label:control.labels?.[0]?.textContent.trim()});})()'));
    assert.match(labPreference.label,/Reduce transparency/,
      "Live lab setting must keep a visible native accessible label");
    assert.equal(labPreference.before.preference,"auto",
      "Design lab should initially follow system transparency");
    assert.equal(labPreference.reduced.preference,"reduce",
      "Lab checkbox failed to apply manual transparency");
    assert.equal(labPreference.reduced.checked,true,"Lab checkbox and theme state disagree");
    for (const surface of ["lens","nav","windowDock"]) {
      assert.equal(labPreference.reduced[surface].blur,"none",
        "Manual setting did not disable blur on existing "+surface);
      assert.match(labPreference.reduced[surface].background,/^rgb\(/,
        "Manual setting did not restore opaque "+surface);
      assert.deepEqual(labPreference.restored[surface],labPreference.before[surface],
        "Lab did not restore original "+surface+" styling");
    }
    assert.equal(labPreference.restored.preference,"auto","Lab failed to return to auto");
    assert.equal(labPreference.restored.checked,false,"Restored checkbox remains checked");
    assert.equal(labPreference.storageUnchanged,true,"Lab preference wrote local storage");
    assert.equal(labPreference.cookieUnchanged,true,"Lab preference wrote a cookie");
    assert.ok(labPreference.reduced.scroll<=labPreference.reduced.width+1,
      "Manual preference caused page overflow at "+width+"px");
  }

  // Keyboard and accessibility-tree acceptance for the full design lab,
  // distinct from the isolated glass test fixture's smaller demo toggle.
  await browser.setViewport(390,844,{dark:false});
  await browser.navigate(base+"/lab/");
  const labTransparencyAX=(await browser.accessibilityTree()).filter(node=>
    node.role==="checkbox" && node.name==="Reduce transparency");
  assert.equal(labTransparencyAX.length,1,
    "Full design lab transparency switch must have one accessible checkbox name");
  await browser.evaluate('document.querySelector("#transparency").focus()');
  await browser.pressSpace();
  const labKeyboardOn=JSON.parse(await browser.evaluate(
    '(()=>JSON.stringify({focused:document.activeElement.id==="transparency",'+
    'checked:document.querySelector("#transparency").checked,'+
    'preference:document.documentElement.dataset.gcTransparency}))()'));
  assert.deepEqual(labKeyboardOn,{focused:true,checked:true,preference:"reduce"},
    "Space should enable the design lab transparency setting without stealing focus");
  await browser.pressSpace();
  const labKeyboardOff=JSON.parse(await browser.evaluate(
    '(()=>JSON.stringify({focused:document.activeElement.id==="transparency",'+
    'checked:document.querySelector("#transparency").checked,'+
    'preference:document.documentElement.dataset.gcTransparency}))()'));
  assert.deepEqual(labKeyboardOff,{focused:true,checked:false,preference:"auto"},
    "Space should restore the system setting without losing keyboard focus");
  await browser.evaluate('document.documentElement.style.fontSize="400%"');
  const enlargedPreference=JSON.parse(await browser.evaluate(
    '(()=>{const root=document.documentElement,control=document.querySelector("#transparency"),'+
    'label=control.closest("label"),r=label.getBoundingClientRect();'+
    'return JSON.stringify({width:root.clientWidth,scroll:root.scrollWidth,left:r.left,'+
    'right:r.right,visibleLabel:label.textContent.trim(),display:getComputedStyle(label).display})})()'));
  assert.ok(enlargedPreference.left>=0&&enlargedPreference.right<=enlargedPreference.width+1,
    "Full lab transparency switch escapes the 400% text viewport");
  assert.ok(enlargedPreference.scroll<=enlargedPreference.width+1,
    "Full lab transparency switch causes 400% horizontal overflow");
  assert.match(enlargedPreference.visibleLabel,/Reduce transparency/,
    "Enlarged transparency preference lost its visible label");
  console.log("Chromium full lab preference: named checkbox, native Space activation and 400% reflow passed");

  // The existing More Contrast control must disable real compositing blur
  // without requiring users to separately select reduced transparency.
  await browser.setViewport(390,844,{dark:false});
  await browser.navigate(base+"/lab/");
  const labContrast=JSON.parse(await browser.evaluate(
    '(()=>{const root=document.documentElement,control=document.querySelector("#contrast");'+
    'const lens=document.querySelector(".gc-lab-toolbar.gc-lens"),nav=document.querySelector("#demo-bottom-nav");'+
    'const read=el=>{const css=getComputedStyle(el);return {background:css.backgroundColor,'+
    'blur:css.backdropFilter||css.webkitBackdropFilter}};'+
    'const snapshot=()=>({contrast:root.dataset.gcContrast,transparency:root.dataset.gcTransparency,'+
    'lens:read(lens),nav:read(nav),windowDock:read(document.querySelector("#demo-window-nav"))});'+
    'const before=snapshot();control.click();const enabled=snapshot();'+
    'control.click();return JSON.stringify({before,enabled,restored:snapshot()})})()'));
  assert.equal(labContrast.before.contrast,"normal","Lab contrast should default to normal");
  assert.equal(labContrast.enabled.contrast,"more","Contrast checkbox failed to update the theme");
  assert.equal(labContrast.enabled.transparency,"auto",
    "Contrast control unexpectedly changed the transparency preference");
  for (const surface of ["lens","nav","windowDock"]) {
    assert.equal(labContrast.enabled[surface].blur,"none",
      "More Contrast did not disable existing "+surface+" backdrop blur");
    assert.ok(labContrast.enabled[surface].background.startsWith("rgb("),
      "More Contrast did not restore opaque "+surface+" background");
    assert.deepEqual(labContrast.restored[surface],labContrast.before[surface],
      "More Contrast failed to restore "+surface+" appearance");
  }
  assert.equal(labContrast.restored.contrast,"normal","More Contrast did not reset");

  // OS high-contrast colors must not be overwritten by a more specific app
  // preference rule, including when both are active simultaneously.
  await browser.setViewport(390,844,{dark:true,forcedColors:true});
  await browser.navigate(base+"/lab/");
  const labForced=JSON.parse(await browser.evaluate(
    '(()=>{document.querySelector("#transparency").click();document.querySelector("#contrast").click();'+
    'const swatch=document.createElement("span");swatch.style.background="Canvas";swatch.style.color="CanvasText";'+
    'document.body.append(swatch);const sys=getComputedStyle(swatch);'+
    'const colors={background:sys.backgroundColor,color:sys.color};swatch.remove();'+
    'const surfaces=[".gc-lab-toolbar.gc-lens","#demo-bottom-nav","#demo-window-nav"].map(selector=>{'+
    'const s=getComputedStyle(document.querySelector(selector));'+
    'return {selector,background:s.backgroundColor,color:s.color,blur:s.backdropFilter||s.webkitBackdropFilter}});'+
    'return JSON.stringify({forced:matchMedia("(forced-colors: active)").matches,colors,surfaces})})()'));
  assert.equal(labForced.forced,true,"Forced-colors mode was not emulated");
  for(const surface of labForced.surfaces) {
    assert.equal(surface.background,labForced.colors.background,
      "Manual transparency overrode OS Canvas on "+surface.selector);
    assert.equal(surface.color,labForced.colors.color,
      "Manual transparency overrode OS CanvasText on "+surface.selector);
    assert.equal(surface.blur,"none","Forced color/lab preference retained blur");
  }
  console.log("Chromium design lab transparency: existing Lens/nav, mobile reflow, reversible and forced-colors passed");

  // Signature frosted Cloud Lens stage must be a real composited scene, not
  // decorative copy or an opaque card styled to imitate glass.
  for(const scenario of [
    {name:"light",width:1440,dark:false,forcedColors:false,manual:false,contrast:false},
    {name:"dark-mobile",width:390,dark:true,forcedColors:false,manual:false,contrast:false},
    {name:"solid-preference",width:390,dark:true,forcedColors:false,manual:true,contrast:false},
    {name:"contrast-more",width:390,dark:false,forcedColors:false,manual:false,contrast:true},
    {name:"forced-colors",width:390,dark:true,forcedColors:true,manual:true,contrast:true}
  ]) {
    await browser.setViewport(scenario.width,900,{dark:scenario.dark,forcedColors:scenario.forcedColors});
    await browser.navigate(base+"/lab/");
    const scene=JSON.parse(await browser.evaluate(
      '(()=>{const root=document.documentElement;'+
      'if('+JSON.stringify(scenario.manual)+')document.querySelector("#transparency").click();'+
      'if('+JSON.stringify(scenario.contrast)+')document.querySelector("#contrast").click();'+
      'const panel=document.querySelector(".gc-frost-demo"),stage=panel.querySelector(".gc-frost-stage");'+
      'stage.scrollIntoView({block:"center",behavior:"instant"});'+
      'const role=selector=>{const el=stage.querySelector(selector),s=getComputedStyle(el),r=el.getBoundingClientRect();'+
      'return {blur:s.backdropFilter||s.webkitBackdropFilter,background:s.backgroundColor,'+
      'border:s.borderTopStyle,shadow:s.boxShadow,width:r.width,right:r.right,left:r.left,'+
      'label:el.querySelector("h4")?.textContent.trim()}};'+
      'const rect=stage.getBoundingClientRect();'+
      'return JSON.stringify({documentWidth:root.clientWidth,scroll:root.scrollWidth,'+
      'stage:{width:rect.width,left:rect.left,right:rect.right},'+
      'translucent:[...stage.querySelectorAll("[data-gc-translucent=true]")].length,'+
      'base:role(".gc-glass-elevated"),overlay:role(".gc-glass-overlay"),solid:role(".gc-glass-solid"),'+
      'ambient:getComputedStyle(stage,"::before").display})})()'));
    assert.equal(scene.translucent,2,"Frost scene must opt into exactly two real translucent panels");
    assert.ok(scene.stage.width>0&&scene.stage.left>=0&&scene.stage.right<=scene.documentWidth+1,
      "Signature frosted scene escaped the viewport "+scenario.name);
    assert.ok(scene.scroll<=scene.documentWidth+1,"Frost scene caused document overflow "+scenario.name);
    assert.match(scene.base.label,/quieter kind of depth/i,"Primary frost panel lost its accessible heading");
    assert.match(scene.overlay.label,/Elegant, not distracting/,"Floating frost panel lost its heading");
    assert.match(scene.solid.label,/Solid where it matters/,"Opaque reading card lost its heading");
    for(const role of [scene.base,scene.overlay,scene.solid]) {
      assert.notEqual(role.border,"none","Frost scene lost a semantic material boundary");
      assert.ok(role.width>0&&role.left>=0&&role.right<=scene.documentWidth+1,
        "Frost role escapes the viewport "+scenario.name);
    }
    assert.ok(scene.solid.blur==="none"||scene.solid.blur==="",
      "Essential reading content must not blur the background");
    const fallback=scenario.manual||scenario.contrast||scenario.forcedColors;
    for(const role of [scene.base,scene.overlay]) {
      if(fallback) {
        assert.equal(role.blur,"none","Accessibility fallback retained optical blur in "+scenario.name);
        assert.ok(role.background.startsWith("rgb("),"Frost fallback is not opaque "+scenario.name);
        assert.equal(role.shadow,"none","Frost fallback retained optical highlight/shadow "+scenario.name);
      } else {
        assert.ok(role.blur.includes("blur("),"Frosted material lost real backdrop blur "+scenario.name);
        assert.ok(role.background.startsWith("rgba("),
          "Frosted material must allow the ambient scene to show through "+scenario.name);
      }
    }
    if(fallback)assert.equal(scene.ambient,"none",
      "Accessible solid fallback should suppress ambient decorative shapes");
    const shot=await browser.screenshot(join(directory,"gc-ui-frost-stage-"+scenario.name+".png"));
    assert.equal(shot.width,scenario.width,"Frosted visual QA screenshot width mismatch");
    console.log("Chromium signature frosted stage "+scenario.name+": material depth, fallback, bounds and screenshot passed");
  }

  // Long text and RTL combined with 400% CSS-root font are a component
  // stress case, not proof of actual browser 400% zoom or AT acceptance.
  for(const width of [320,390]) {
    await browser.setViewport(width,900,{dark:width===390});
    await browser.navigate(base+"/lab/");
    const legibility=JSON.parse(await browser.evaluate(
      '(()=>{const root=document.documentElement;root.dir="rtl";root.style.fontSize="400%";'+
      'const stage=document.querySelector(".gc-frost-stage");'+
      'const panels=[...stage.querySelectorAll(".gc-frost-panel")].map(el=>{'+
      'const bounds=el.getBoundingClientRect();'+
      'const title=el.querySelector("h4").getBoundingClientRect();'+
      'return {width:el.clientWidth,scroll:el.scrollWidth,left:bounds.left,right:bounds.right,'+
      'titleLeft:title.left,titleRight:title.right}});'+
      'const box=stage.getBoundingClientRect();'+
      'return JSON.stringify({width:root.clientWidth,scroll:root.scrollWidth,'+
      'sceneLeft:box.left,sceneRight:box.right,panels})})()'));
    assert.ok(legibility.scroll<=legibility.width+1,
      "RTL 400% signature frost stage overflows the page at "+width+"px");
    assert.ok(legibility.sceneLeft>=0&&legibility.sceneRight<=legibility.width+1,
      "RTL 400% signature frost stage escapes viewport "+width+"px");
    for(const panel of legibility.panels) {
      assert.ok(panel.left>=0&&panel.right<=legibility.width+1,
        "Frost panel clips against viewport at 400% and "+width+"px");
      assert.ok(panel.scroll<=panel.width+1,
        "Frost panel hides content at 400% and "+width+"px: "+JSON.stringify(panel));
      assert.ok(panel.titleLeft>=panel.left-1&&panel.titleRight<=panel.right+1,
        "Frost heading escapes its panel at 400% and "+width+"px");
    }
    console.log("Chromium signature frosted stage: RTL 400% CSS-root content reflow @ "+width+"px passed");
  }

  // Multiple applications in one host must retain independent manual material preferences.
  // The fixture uses real stylesheet-computed values, never scripted blur/scroll mutations.
  for(const forcedColors of [false,true]){
    await browser.setViewport(900,800,{dark:true,forcedColors});
    await browser.navigate(base+"/tests/glass-browser.html");
    const scoped=JSON.parse(await browser.evaluate("(async()=>{\n const {applyTheme}=await import(\"/src/theme.js\");\n const host=document.createElement(\"section\");host.id=\"gc-scoped-glass-qa\";\n host.style.cssText=\"display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:24px;\";\n const make=(label,opts)=>{\n   const app=document.createElement(\"article\");app.className=\"gc-app\";\n   app.style.cssText=\"padding:18px;border:1px solid var(--gc-outline);border-radius:24px;min-width:0;\";\n   const heading=document.createElement(\"h2\");heading.textContent=label;\n   const glass=document.createElement(\"div\");glass.className=\"gc-glass-base\";\n   glass.dataset.gcTranslucent=\"true\";glass.textContent=\"Scoped Cloud Lens\";\n   glass.style.padding=\"18px\";\n   const signal=document.createElement(\"div\");signal.className=\"gc-signal-board__lens\";\n   signal.textContent=\"Local signal lens\";\n   app.append(heading,glass,signal);host.append(app);applyTheme(app,opts);return app;\n };\n const first=make(\"Independent light product\",{mode:\"light\",accent:\"moss\",transparency:\"reduce\"});\n const second=make(\"Independent dark product\",{mode:\"dark\",accent:\"lagoon\",transparency:\"auto\"});\n document.body.append(host);\n const probe=document.createElement(\"div\");probe.style.background=\"Canvas\";document.body.append(probe);\n const systemBackground=getComputedStyle(probe).backgroundColor;probe.remove();\n const read=app=>{\n   const g=getComputedStyle(app.querySelector(\".gc-glass-base\"));\n   const s=getComputedStyle(app.querySelector(\".gc-signal-board__lens\"));\n   const tokens=getComputedStyle(app);\n   return {scheme:tokens.colorScheme,brand:tokens.getPropertyValue(\"--gc-brand\").trim(),\n     transparency:app.dataset.gcTransparency,contrast:app.dataset.gcContrast,\n     blur:g.backdropFilter||g.webkitBackdropFilter,background:g.backgroundColor,\n     signalBlur:s.backdropFilter||s.webkitBackdropFilter,signalBackground:s.backgroundColor};\n };\n const parentBefore=getComputedStyle(document.documentElement).getPropertyValue(\"--gc-brand\").trim();\n const before={first:read(first),second:read(second)};\n applyTheme(first,{mode:\"light\",accent:\"ember\",contrast:\"more\",transparency:\"auto\"});\n const after={first:read(first),second:read(second)};\n const parentUnchanged=parentBefore===getComputedStyle(document.documentElement).getPropertyValue(\"--gc-brand\").trim();\n return JSON.stringify({before,after,parentUnchanged,systemBackground,\n   supportsBlur:CSS.supports(\"backdrop-filter\",\"blur(1px)\")||CSS.supports(\"-webkit-backdrop-filter\",\"blur(1px)\")});\n})()"));
    if(!forcedColors){
      assert.equal(scoped.before.first.scheme,"light");
      assert.equal(scoped.before.second.scheme,"dark");
    }else{
      // Forced-colors delegates control of the UA color-scheme to the OS.
      // Chromium can return "light dark" regardless of the scoped preference.
      assert.ok(scoped.before.first.scheme.includes("light"));
      assert.ok(scoped.before.second.scheme.includes("dark"));
    }
    assert.equal(scoped.before.first.brand,"#326B42","Independent light app lost Moss");
    assert.equal(scoped.before.second.brand,"#8BE7F1","Independent dark app lost Lagoon");
    assert.equal(scoped.before.first.blur,"none","Local reduced transparency retained blur");
    assert.equal(scoped.before.first.signalBlur,"none","Status Lens ignored local reduction");
    assert.ok(scoped.before.first.background.startsWith("rgb("),"Reduced glass was translucent");
    assert.equal(scoped.after.first.blur,"none","Local higher contrast retained blur");
    assert.equal(scoped.after.first.signalBlur,"none","Status Lens ignored local contrast");
    assert.equal(scoped.after.first.brand,"#A43F1D","Local theme update failed");
    assert.deepEqual(scoped.after.second,scoped.before.second,"Sibling glass leaked theme changes");
    assert.equal(scoped.parentUnchanged,true,"Scoped material settings changed parent theme");
    if(forcedColors){
      for(const a of [scoped.before.first,scoped.before.second,scoped.after.first,scoped.after.second]){
        assert.equal(a.blur,"none","Forced colors retained material blur");
        assert.equal(a.signalBlur,"none","Forced colors retained Status Lens blur");
        assert.equal(a.background,scoped.systemBackground,"Forced-colors glass ignored Canvas");
        assert.equal(a.signalBackground,scoped.systemBackground,"Forced-colors Status Lens ignored Canvas");
      }
    }else if(scoped.supportsBlur){
      assert.ok(scoped.before.second.blur.includes("blur("),"Unreduced sibling lost frosted Lens");
      assert.ok(scoped.before.second.signalBlur.includes("blur("),"Unreduced Status Lens lost blur");
    }
    await browser.evaluate('document.querySelector("#gc-scoped-glass-qa").scrollIntoView({block:"center",behavior:"instant"})');
    await delay(100);
    const shot=await browser.screenshot(join(directory,
      "gc-ui-scoped-glass-"+(forcedColors?"forced-colors":"light-dark")+".png"));
    assert.equal(shot.width,900);
    console.log("Chromium scoped glass / Signal Lens "+(forcedColors?"forced colors":"mixed appearances")+": passed");
  }

} finally {
  if (browser) await browser.close();
  await closeServer();
}
