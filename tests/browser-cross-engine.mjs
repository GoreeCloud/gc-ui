#!/usr/bin/env node
/**
 * Opt-in Firefox/WebKit lab acceptance. Verified external Playwright Core and
 * browser paths are supplied by the operator; this repo installs nothing.
 * Unlike Chromium's CDP zoom acceptance, this checks ordinary CSS viewports.
 */
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile, mkdir, writeFile} from "node:fs/promises";
import {existsSync,statSync} from "node:fs";
import {extname,resolve,sep,join,isAbsolute} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";

const root=resolve(fileURLToPath(new URL("../",import.meta.url)));
const names=["GC_PLAYWRIGHT_CORE_MODULE","GC_FIREFOX_BIN","GC_WEBKIT_BIN"];
for(const name of names){
  const value=process.env[name];
  if(!value||!isAbsolute(value)||!existsSync(value)||!statSync(value).isFile()){
    throw Error(name+" must point to an inspected, existing, absolute file. "+
      "See docs/CROSS_ENGINE_BROWSER_QA.md; no browsers are downloaded.");
  }
}
const core=await import(pathToFileURL(process.env.GC_PLAYWRIGHT_CORE_MODULE).href);
for(const engine of ["firefox","webkit"]) {
  assert.equal(typeof core[engine]?.launch,"function",
    "Supplied Playwright Core does not expose "+engine);
}

const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".json":"application/json; charset=utf-8"};
const server=createServer(async(req,res)=>{
  try {
    if(req.method!=="GET"){res.writeHead(405);res.end();return;}
    const path=new URL(req.url,"http://127.0.0.1").pathname;
    const name=path==="/lab/"?"lab/index.html":decodeURIComponent(path.slice(1));
    if(!/^(lab|src|assets|tests)\//.test(name)){res.writeHead(404);res.end();return;}
    const file=resolve(root,name);
    if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"Content-Type":mime[extname(file)]||"application/octet-stream",
      "Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
    res.end(bytes);
  }catch{res.writeHead(404);res.end("Not found");}
});
const opened=new Promise((ok,fail)=>{
  server.once("error",fail);server.listen(0,"127.0.0.1",ok);
});
await opened;
const base="http://127.0.0.1:"+server.address().port;
const shots=join(root,"qa/screenshots");
await mkdir(shots,{recursive:true});
const observedVersions={};
const cases=[
  {name:"desktop-light",width:900,height:800,appearance:"light",accent:"iris"},
  {name:"mobile-dark",width:390,height:844,appearance:"dark",accent:"lagoon",
    reducedMotion:"reduce"},
  {name:"compact-light",width:320,height:760,appearance:"light",accent:"moss"},
  // RTL plus 200% CSS root text is a stress test, NOT native browser zoom.
  {name:"rtl-large-light",width:390,height:844,appearance:"light",accent:"ember",
    rtl:true,rootFontScale:2}
];
try{
  const selected=process.env.GC_BROWSER_SCENARIO_FILTER;
  const scenarios=selected?cases.filter(item=>item.name===selected):cases;
  assert.ok(scenarios.length, "Unknown GC_BROWSER_SCENARIO_FILTER: "+selected);
  for(const engine of ["firefox","webkit"]){
    const executablePath=process.env[engine==="firefox"?"GC_FIREFOX_BIN":"GC_WEBKIT_BIN"];
    const browser=await core[engine].launch({executablePath,headless:true,timeout:20000});
    observedVersions[engine]=browser.version();
    console.log(engine+" browser version: "+observedVersions[engine]);
    try {
      for(const scenario of scenarios) {
        const ctx=await browser.newContext({
          viewport:{width:scenario.width,height:scenario.height},
          colorScheme:scenario.appearance==="dark"?"dark":"light",
          reducedMotion:scenario.reducedMotion||"no-preference",
          deviceScaleFactor:1,
          serviceWorkers:"block"
        });
        try{
          // The inspected source server is the only permitted request origin.
          await ctx.route("**/*",route=>{
            if(route.request().url().startsWith(base+"/"))return route.continue();
            return route.abort("blockedbyclient");
          });
          const page=await ctx.newPage();
          const errors=[];
          page.on("pageerror",e=>errors.push(String(e).slice(0,200)));
          const response=await page.goto(base+"/lab/",{waitUntil:"networkidle",timeout:15000});
          assert.equal(response?.status(),200,engine+" did not open the actual UI lab");
          await page.locator("#accent").waitFor();
          await page.locator("#appearance").selectOption(scenario.appearance);
          await page.locator("#accent").selectOption(scenario.accent);
          if(scenario.rtl||scenario.rootFontScale){
            await page.evaluate(({rtl,scale})=>{
              const root=document.documentElement;
              if(rtl)root.dir="rtl";
              if(scale)root.style.fontSize=(scale*100)+"%";
            },{rtl:scenario.rtl,scale:scenario.rootFontScale});
          }
          const info=await page.evaluate(()=>{
            const root=document.documentElement;
            const keys=["foundations","components","patterns","forms"].map(id=>{
              const x=document.getElementById(id).getBoundingClientRect();
              return{id,left:x.left,right:x.right};
            });
            return {width:innerWidth,client:root.clientWidth,scroll:root.scrollWidth,
              theme:root.dataset.gcTheme,accent:root.dataset.gcAccent,
              direction:getComputedStyle(root).direction,
              rootFontPx:parseFloat(getComputedStyle(root).fontSize),
              navDisplayed:getComputedStyle(document.getElementById("demo-bottom-nav")).display!=="none",
              sections:keys};
          });
          assert.ok(Math.abs(info.width-scenario.width)<=1,
            engine+" CSS viewport mismatch "+JSON.stringify(info));
          assert.equal(info.theme,scenario.appearance,
            engine+" theme selector failed "+JSON.stringify(info));
          assert.equal(info.accent,scenario.accent,
            engine+" accent selector failed "+JSON.stringify(info));
          if(scenario.rtl)assert.equal(info.direction,"rtl",
            engine+" RTL layout not applied "+JSON.stringify(info));
          if(scenario.rootFontScale)assert.ok(info.rootFontPx>=28,
            engine+" enlarged CSS root text not applied "+JSON.stringify(info));
          assert.ok(info.scroll<=info.client+1,
            engine+" horizontal document overflow "+scenario.name+" "+JSON.stringify(info));
          assert.ok(info.sections.every(s=>s.left>=-1&&s.right<=info.client+1),
            engine+" clipped a primary lab section "+JSON.stringify(info));
          if(scenario.width<=390) {
            assert.equal(info.navDisplayed,true,engine+" compact navigation not shown");
            const nav=page.locator("#demo-bottom-nav");
            const link=nav.locator("a[href]").last();
            await link.focus();
            // Browser-native scrolling can be animated, especially for RTL.
            // Never scroll via script: the native focus behavior must succeed.
            await page.waitForFunction(()=>{
              const nav=document.querySelector("#demo-bottom-nav");
              const links=[...nav.querySelectorAll("a[href]")];
              const last=links.at(-1);
              const item=last.getBoundingClientRect(),bounds=nav.getBoundingClientRect();
              return item.left>=bounds.left-1&&item.right<=bounds.right+1;
            },null,{timeout:3000}).catch(()=>{});
            const box=await link.boundingBox(),navBox=await nav.boundingBox();
            const metrics=await page.evaluate(()=>{
              const nav=document.querySelector("#demo-bottom-nav");
              return {scrollLeft:nav.scrollLeft,scrollWidth:nav.scrollWidth,
                clientWidth:nav.clientWidth,scrollBehavior:getComputedStyle(nav).scrollBehavior,
                direction:getComputedStyle(nav).direction};
            });
            assert.ok(box&&navBox&&box.x>=navBox.x-1&&
              box.x+box.width<=navBox.x+navBox.width+1,
              engine+" could not focus/scroll last mobile destination "+JSON.stringify({box,navBox,metrics}));
            assert.equal(await link.evaluate(el=>document.activeElement===el),true,
              engine+" native focus was not retained");
          }else{
            const action=page.locator("#demo-action-trigger");
            await action.focus();
            assert.equal(await action.evaluate(el=>document.activeElement===el),true,
              engine+" desktop action did not accept focus");
          }
          // Capture the initial source lab before starting any expiring toast.
          // This screenshot cannot delay the required real dismiss click.
          if(scenario.name!=="compact-light") {
            await page.screenshot({path:join(shots,"gc-ui-"+engine+"-"+scenario.name+".png")});
          }
          const submit=await page.evaluate(()=>{
            const form=document.querySelector("#demo-planned-form");
            form.querySelector("input").value="Synthetic only";
            form.requestSubmit();
            return {samePath:location.pathname==="/lab/",
              status:document.querySelector(".gc-toast[role=status]")?.textContent||""};
          });
          assert.equal(submit.samePath,true,engine+" planned form navigated");
          assert.match(submit.status,/Mesh connection setup is not available yet/,
            engine+" planned form did not explain unavailability");
          // The planned-form notice is correctly auto-expiring. Create a second,
          // explicit local-only notice with no timer so actual pointer behavior
          // can be validated independently of screen-capture/CI latency.
          await page.evaluate(async()=>{
            const {toast}=await import("/src/elements.js");
            toast("Synthetic persistent dismiss interaction",{
              region:document.querySelector("[data-gc-toasts]"),duration:0
            });
          });
          const tracked=page.locator(".gc-toast[role=status]").filter({
            hasText:"Synthetic persistent dismiss interaction"
          });
          const toast=tracked.last();
          const toastGeometry=await toast.evaluate(item=>{
            const action=item.querySelector('button[aria-label="Dismiss notification"]');
            const range=document.createRange();
            range.selectNodeContents(action);
            const outer=item.getBoundingClientRect(),button=action.getBoundingClientRect();
            const message=item.querySelector("span").getBoundingClientRect();
            return {lines:range.getClientRects().length,
              whiteSpace:getComputedStyle(action).whiteSpace,
              within:button.left>=outer.left-1&&button.right<=outer.right+1,
              visible:button.width>30&&button.height>20,
              stacked:button.top>=message.bottom-1,
              messageWidthRatio:message.width/outer.width};
          });
          assert.equal(toastGeometry.lines,1,
            engine+" dismiss notification split across lines "+JSON.stringify(toastGeometry));
          assert.equal(toastGeometry.whiteSpace,"nowrap",
            engine+" notification action lost unbroken label");
          assert.ok(toastGeometry.within&&toastGeometry.visible,
            engine+" dismiss action clipped "+JSON.stringify(toastGeometry));
          if(scenario.width<=390){
            assert.ok(toastGeometry.stacked&&toastGeometry.messageWidthRatio>=.75,
              engine+" compact toast forced a narrow word-breaking column "+JSON.stringify(toastGeometry));
          }
          assert.deepEqual(errors,[],engine+" uncaught lab errors");
          // The real dismiss interaction must precede screenshots. On slower
          // hosted WebKit, screenshot/animation time can outlast the toast's
          // own automatic expiry; that must not masquerade as a click pass.
          await toast.locator('button[aria-label="Dismiss notification"]').click();
          assert.equal(await tracked.count(),0,
            engine+" persistent synthetic notification could not be dismissed by an actual pointer click");
          if(scenario.name!=="compact-light") {
            await page.evaluate(()=>scrollTo({top:0,left:0,behavior:"instant"}));
            await page.screenshot({path:join(shots,"gc-ui-"+engine+"-"+scenario.name+"-clean.png")});
          }
          console.log(engine+" "+scenario.name+": 200 response, native forms, "+
            "theme/accents, section reflow, no page overflow, focus and toast dismissal passed");
        } finally { await ctx.close(); }
      }
    } finally { await browser.close(); }
  }
} finally {
  await new Promise(done=>server.close(done));
}
await writeFile(join(root,"qa/cross-engine-runtimes.json"),
  JSON.stringify({playwrightCore:"1.64.1",engines:observedVersions,
    scope:"Linux Playwright Firefox/WebKit only; not official Apple Safari or global browser support"},
  null,2)+"\n");
