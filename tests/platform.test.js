import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const load = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
test("native token exporter output stays byte-for-byte in sync with source", () => {
  assert.match(execFileSync(process.execPath, ["scripts/export-platform-tokens.mjs", "--check"], { cwd: new URL("../", import.meta.url), encoding:"utf8" }), /match canonical tokens/);
});
test("all eight palette variants exist across target platform resources", () => {
  const p=JSON.parse(load("platform/generated/GCUI.palettes.json"));
  assert.equal(Object.keys(p.palettes).length, 8);
  const android=load("platform/generated/android/gc-colors.xml");
  const windows=load("platform/generated/windows/GCUIColors.xaml");
  const swift=load("platform/generated/swift/GCUIColors.swift");
  const kotlinMissing=android.includes("invalid");
  assert.equal(kotlinMissing,false);
  const gtk=load("platform/generated/gtk/gc-colors.css");
  for(const a of ["iris","lagoon","ember","moss"]) for(const m of ["light","dark"]) {
    const key=a+"/"+m;
    assert.ok(p.palettes[key]);
    assert.ok(android.includes('name="gc_'+a+'_'+m+'_brand"'));
    assert.ok(gtk.includes("gc_"+a+"_"+m+"_brand"));
    assert.ok(windows.includes('x:Key="Gc'+a[0].toUpperCase()+a.slice(1)+m[0].toUpperCase()+m.slice(1)+'Brand"'));
    assert.ok(swift.includes(" "+a+m[0].toUpperCase()+m.slice(1)+": [String: Color]"));
  }
  assert.match(load("platform/generated/android/gc-dimensions.xml"), /gc_radius_md/);
});
test("generator uses controlled paths and has no network or telemetry", () => {
  const source=load("scripts/export-platform-tokens.mjs");
  assert.doesNotMatch(source,/\bfetch\s*\(/);
  assert.doesNotMatch(source,/sendBeacon/);
  assert.match(source,/throw new TypeError/);
});
