import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const content=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("offline package verifier explicitly labels persisted results as development-only",()=>{
  const script=content("scripts/verify-package.mjs");
  for(const term of ["--json","development-evidence-not-stable","sourceSha",
    'sha256:createHash("sha256")',"sha512Integrity:sha512","installedOffline:true",
    "installScriptsDisabled:true","published:false","signed:false","packedFiles:fileDigests",
    "installedFileDigestsChecked:true","digestInstalledFiles(installRoot,meta.files)"]){
    assert.ok(script.includes(term),term);
  }
  const ci=content(".github/workflows/ci.yml");
  assert.match(ci,/actions\/upload-artifact@b7c566a772e6b6bfb58ed0dc250532a479d7789f/);
  assert.match(ci,/retention-days: 7/);
  assert.match(ci,/if-no-files-found: warn/);
});
