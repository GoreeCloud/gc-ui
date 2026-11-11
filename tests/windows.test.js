import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("all window shells and dialog surfaces have four rounded corners",()=>{
 const css=load("src/components.css").split("/* Mandatory four-corner GoreeCloud application window geometry. */")[1];
 assert.ok(css);
 for(const token of [".gc-window {",".gc-window--compact",".gc-window--maximized",".gc-window__titlebar",
   ".gc-app .gc-dialog,.gc-app .gc-command,.gc-app .gc-drawer","[dir=\"rtl\"] .gc-drawer"])
   assert.ok(css.includes(token),token);
 assert.match(css,/\.gc-window\s*\{[^}]*border-radius:var\(--gc-radius-xl\)/);
 assert.match(css,/\.gc-window--compact\s*\{\s*border-radius:var\(--gc-radius-lg\)/);
 assert.doesNotMatch(css,/border-radius:0(?:;|\s)/);
 assert.ok(css.includes("inset-inline-end:var(--gc-space-3)"));
});
test("window policy is explicit without falsely claiming OS implementation",()=>{
 const reg=JSON.parse(load("registry/design-authority.v1.json"));
 assert.equal(reg.windowShape.requirement,"rounded-all-windows");
 assert.equal(reg.windowShape.nativeEnforcement,"requires-platform-adapters");
 assert.equal(reg.nativeSdkStatus,"not-implemented");
 assert.equal(reg.consumerMigrationStatus,"not-audited");
 assert.match(load("docs/WINDOWS_AND_NAVIGATION.md"),/Native window-manager boundary/);
});


test("window-owned navigation is a real distinct, bounded app-shell pattern",()=>{
 const css=load("src/components.css");
 const section=css.slice(css.indexOf("/* Window-owned Cloud Lens dock:"));
 assert.ok(section.length>500);
 assert.match(section,/\.gc-app \.gc-window--app-shell > \.gc-window__body\s*\{[^}]*overflow-y:auto/);
 assert.match(section,/\.gc-app \.gc-window--app-shell > \.gc-bottom-nav--window\s*\{[^}]*position:relative/);
 assert.ok(section.includes("inset-block-end:auto"));
 assert.ok(section.includes("left:auto"));
 assert.ok(section.includes("inline-size:min(540px,calc(100% - 2 * var(--gc-space-4)))"));
 const lab=load("lab/index.html");
 assert.ok(lab.includes('id="demo-window-nav" class="gc-bottom-nav gc-bottom-nav--window"'));
 assert.ok(lab.includes('aria-label="Window preview destinations"'));
 assert.ok(lab.includes("gc-window--app-shell"));
});

test("reusable app shell does not force design-lab-only window dimensions",()=>{
 const css=load("src/components.css");
 const start=css.indexOf("/* Window-owned Cloud Lens dock:");
 const windowBlock=css.slice(start).split("}")[0];
 assert.ok(!windowBlock.includes("block-size:min("));
 assert.match(windowBlock,/min-block-size:0/);
 assert.ok(load("lab/lab.css").includes("#demo-window { block-size:min(560px,70dvh)"));
});
