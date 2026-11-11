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
