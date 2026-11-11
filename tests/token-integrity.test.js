import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

test("source JSON reproduces the exact checked-in browser stylesheet",()=>{
  const result=execFileSync(process.execPath,["scripts/generate-web-tokens.mjs","--check"],
    {cwd:new URL("../",import.meta.url),encoding:"utf8"});
  assert.match(result,/matches source JSON/);
});
test("eight theme variants pass all intended solid pair contrast comparisons",()=>{
  const output=execFileSync(process.execPath,["scripts/audit-contrast.mjs","--json"],
    {cwd:new URL("../",import.meta.url),encoding:"utf8"});
  const result=JSON.parse(output);
  assert.equal(result.failed,0);
  assert.ok(result.tested>=80);
  assert.ok(result.lowestContrast>=3);
  assert.ok(result.reviewNeeded.some(x=>x.includes("Lens")));
});
test("canonical manifest does not advertise an incompatible external token schema",()=>{
  const json=JSON.parse(readFileSync(new URL("../tokens/gc.tokens.json",import.meta.url),"utf8"));
  assert.ok(!Object.hasOwn(json,"$schema"));
  assert.equal(json.meta.format,"goreecloud-ui-alpha-1");
});
