import { test } from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const ci=readFileSync(new URL("../.github/workflows/ci.yml",import.meta.url),"utf8");
test("cross-node source reproducibility requires all three same-run package jobs",()=>{
 const slice=ci.split("  cross-node-package-reproducibility:")[1]?.split("  browser-smoke:")[0];
 assert.ok(slice,"Missing cross-node reproducibility job");
 assert.match(slice,/needs: \[source-and-contract\]/);
 assert.match(slice,/actions\/download-artifact@018cc2cf5baa6db3ef3c5f8a56943fffe632ef53/);
 assert.match(slice,/pattern: gc-ui-package-evidence-node-\*/);
 assert.match(slice,/merge-multiple: false/);
 assert.match(slice,/ref: \$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
 assert.match(slice,/--source-sha "\$\(git rev-parse HEAD\)"/);
 assert.match(slice,/--version "/);
 for(const major of [20,22,24]){
   assert.ok(slice.includes("gc-ui-package-evidence-node-"+major+"/package-evidence.json"));
 }
 assert.match(slice,/node scripts\/compare-package-evidence\.mjs/);
 assert.match(slice,/persist-credentials: false/);
 assert.ok(!slice.includes("npm publish"));
});
