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
    for (let n=0; n<100; n++) {
      if (launchError) throw launchError;
      if (child.exitCode !== null) throw new Error("Chrome exited: " + stderr);
      try {
        const content = await readFile(join(profile, "DevToolsActivePort"), "utf8");
        port = Number(content.split("\n")[0]);
        if (port > 0) break;
      } catch {}
      await delay(100);
    }
    if (!port) throw new Error("Chromium DevTools port never opened: " + stderr);
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
    const setViewport = async (width, height, { dark=false }={}) => {
      await command("Emulation.setDeviceMetricsOverride", {
        width, height, screenWidth:width, screenHeight:height,
        mobile:width<=600, deviceScaleFactor:1
      });
      await command("Emulation.setEmulatedMedia", {
        features:[{ name:"prefers-color-scheme", value:dark ? "dark" : "light" }]
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
    if (result.viewport!==width) {
      const metrics=await browser.evaluate('JSON.stringify({innerWidth:innerWidth,clientWidth:document.documentElement.clientWidth,visualWidth:visualViewport?.width,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,screenWidth:screen.width,outerWidth:outerWidth,devicePixelRatio:devicePixelRatio,offenders:[...document.body.querySelectorAll("*")].filter(el=>el.getBoundingClientRect().right>document.documentElement.clientWidth+0.5).slice(0,8).map(el=>({tag:el.tagName,className:typeof el.className==="string"?el.className.slice(0,50):"",right:Math.round(el.getBoundingClientRect().right)}))})');
      throw new Error("Viewport discrepancy requested "+width+" observed "+result.viewport+" metrics "+metrics+" state "+result.state+" detail "+result.diagnostics);
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
    if (result.viewport!==width) {
      const metrics=await browser.evaluate('JSON.stringify({innerWidth:innerWidth,clientWidth:document.documentElement.clientWidth,visualWidth:visualViewport?.width,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,screenWidth:screen.width,outerWidth:outerWidth,devicePixelRatio:devicePixelRatio,offenders:[...document.body.querySelectorAll("*")].filter(el=>el.getBoundingClientRect().right>document.documentElement.clientWidth+0.5).slice(0,8).map(el=>({tag:el.tagName,className:typeof el.className==="string"?el.className.slice(0,50):"",right:Math.round(el.getBoundingClientRect().right)}))})');
      throw new Error("Viewport discrepancy requested "+width+" observed "+result.viewport+" metrics "+metrics+" state "+result.state+" detail "+result.diagnostics);
    }
    assert.equal(result.state,"pass","Interaction failure "+mode+"/"+accent+": "+result.diagnostics);
    assert.ok(result.scrollWidth<=result.viewport+1,"Interaction fixture horizontal overflow at "+width+"px: "+JSON.stringify({scrollWidth:result.scrollWidth,viewport:result.viewport}));
    const checks=Number(await browser.evaluate("document.documentElement.dataset.gcCheckCount"));
    assert.ok(checks>=12,"Not enough interaction tests: "+checks);
    console.log("Chromium "+mode+"/"+accent+" @ "+width+"px: "+checks+" live DOM checks passed");
  }
  const directory=join(root,"qa/screenshots");
  await mkdir(directory,{recursive:true});
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
