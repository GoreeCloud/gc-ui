import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {spawnSync} from "node:child_process";
const root=new URL("../",import.meta.url);
const source=relative=>readFileSync(new URL(relative,root),"utf8");

test("cross-engine runner refuses unreviewed or missing browsers with no auto-install",()=>{
  const runner=new URL("tests/browser-cross-engine.mjs",root);
  const r=spawnSync(process.execPath,[runner.pathname],{encoding:"utf8",timeout:5000,
    env:{...process.env,GC_PLAYWRIGHT_CORE_MODULE:"",GC_FIREFOX_BIN:"",GC_WEBKIT_BIN:""}});
  assert.notEqual(r.status,0);
  assert.match(r.stderr,/must point to an inspected, existing, absolute file/);
  const code=source("tests/browser-cross-engine.mjs");
  assert.match(code,/server\.listen\(0,"127\.0\.0\.1"/);
  assert.match(code,/return route\.abort\("blockedbyclient"\)/);
  assert.match(code,/serviceWorkers:"block"/);
  assert.match(code,/native forms/);
  assert.match(code,/toastGeometry\.lines,1/);
  assert.doesNotMatch(code,/npm\s+(?:install|ci)|playwright\s+install/);
});

test("notification dismiss label has a stable nonshrinking layout",()=>{
  const css=source("src/components.css");
  assert.match(css,/\.gc-toast > span \{ flex:1 1 auto; min-inline-size:0/);
  assert.match(css,/\.gc-toast > \.gc-button \{ flex:0 0 auto; white-space:nowrap/);
  assert.match(css,/\.gc-app \.gc-toast > \.gc-button \{ white-space:nowrap/);
  const pkg=JSON.parse(source("package.json"));
  assert.equal(pkg.scripts["browser:cross-engine"],"node tests/browser-cross-engine.mjs");
  assert.ok(existsSync(new URL("docs/CROSS_ENGINE_BROWSER_QA.md",root)));
  assert.match(source("docs/CROSS_ENGINE_BROWSER_QA.md"),/not.*(?:universal|support claim)/i);
});

test("synthetic screenshots cannot outlive the toast before its required dismiss click",()=>{
  const code=source("tests/browser-cross-engine.mjs");
  const initial=code.indexOf('await page.screenshot({path:join(shots,"gc-ui-"+engine+"-"+scenario.name+".png")})');
  const submit=code.indexOf("const submit=await page.evaluate",initial);
  const click=code.indexOf('await toast.locator(\'button[aria-label="Dismiss notification"]\').click()',submit);
  const after=code.indexOf('await page.screenshot({path:join(shots,"gc-ui-"+engine+"-"+scenario.name+"-clean.png")})',click);
  assert.ok(initial>0&&submit>initial&&click>submit&&after>click,
    "Initial snapshot must be before toast; real click must precede post-dismiss snapshot");
  assert.match(code,/persistent synthetic notification could not be dismissed by an actual pointer click/);
  assert.match(code,/duration:0/);
  assert.match(code,/Synthetic persistent dismiss interaction/);
  assert.doesNotMatch(code,/const visualToast=/);
});

test("Firefox and WebKit include RTL 200% CSS text stress without claiming native zoom",()=>{
  const run=source("tests/browser-cross-engine.mjs");
  assert.match(run,/name:"rtl-large-light",width:390,height:844,appearance:"light",accent:"ember"/);
  assert.match(run,/rtl:true,rootFontScale:2/);
  assert.match(run,/root\.dir="rtl"/);
  assert.match(run,/root\.style\.fontSize=/);
  assert.match(run,/info\.direction,"rtl"/);
  assert.match(run,/info\.scroll<=info\.client\+1/);
  assert.match(run,/info\.sections\.every/);
  assert.equal((run.match(/scenario\.name!=="compact-light"/g)||[]).length,2,
    "Desktop, mobile and RTL cases must produce snapshot and post-dismiss evidence");
  assert.match(source("docs/CROSS_ENGINE_BROWSER_QA.md"),/CSS root.*not.*native browser zoom/i);
});
