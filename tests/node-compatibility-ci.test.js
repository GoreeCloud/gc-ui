import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("package declared supported Node majors have isolated CI quality checks",()=>{
  const pkg=JSON.parse(read("package.json"));
  const ci=read(".github/workflows/ci.yml");
  assert.equal(pkg.engines.node,">=20");
  assert.match(ci,/source-and-contract:\s*\n(?:.|\n)*?strategy:\s*\n\s*fail-fast: false\s*\n\s*matrix:\s*\n\s*node: \["20", "22", "24"\]/);
  assert.match(ci,/node-version: \$\{\{ matrix\.node \}\}/);
  assert.match(ci,/Validate JavaScript and token contracts\s*\n\s*run: npm run check/);
  assert.match(ci,/Verify isolated offline package consumer\s*\n\s*run: npm run verify:package/);
  assert.match(ci,/browser-smoke:\s*\n(?:.|\n)*?node-version: "22"/);
  assert.match(ci,/persist-credentials: false/);
  assert.match(ci,/permissions:\s*\n\s*contents: read/);
  assert.ok(!ci.includes("npm publish"));
});
