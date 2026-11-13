import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditPackageExports } from "../scripts/package-audit.mjs";
const pkg=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));
const files=new Set(["package.json","README.md","LICENSE","src/index.js","src/index.d.ts",
  "src/theme.js","src/theme.d.ts","src/foundation.js","src/foundation.d.ts","src/tokens.css"]);
test("offline package audit validates all current public export definitions",()=>{
  const artifacts=new Set([...files]);
  const walk=v=>typeof v==="string"?[v]:[v.default,v.types];
  for(const v of Object.values(pkg.exports))for(const f of walk(v))artifacts.add(f.slice(2));
  const found=auditPackageExports(pkg,artifacts);
  assert.equal(found.length,Object.keys(pkg.exports).length);
  assert.ok(found.some(e=>e.specifier==="."&&e.kind==="js"));
  assert.ok(found.some(e=>e.specifier==="./tokens.css"&&e.kind==="asset"));
});
test("package export audit rejects unsafe/missing content and hidden dependency drift",()=>{
  const basic={name:"@goreecloud/ui",version:"0.1.0-alpha.0",exports:{
    ".":{types:"./src/index.d.ts",default:"./src/index.js"}}};
  assert.equal(auditPackageExports(basic,files).length,1);
  assert.throws(()=>auditPackageExports({...basic,dependencies:{remote:"1.0"}},files),/runtime dependencies/);
  assert.throws(()=>auditPackageExports({...basic,exports:{".":"./src/../secret.js"}},files),/Unsafe package path/);
  assert.throws(()=>auditPackageExports({...basic,exports:{".":"./src/missing.css"}},files),/missing packed file/);
  assert.throws(()=>auditPackageExports({...basic,exports:{".":{types:"./src/index.js",default:"./src/index.d.ts"}}},files),/Invalid JS\/type pair/);
  assert.throws(()=>auditPackageExports({...basic,exports:{".":{types:"./src/index.d.ts",default:"https://example.net/mod.js"}}},files),/Unsafe package path/);
  const noLicense=new Set([...files].filter(x=>x!=="LICENSE"));
  assert.throws(()=>auditPackageExports(basic,noLicense),/Missing package metadata/);
});
