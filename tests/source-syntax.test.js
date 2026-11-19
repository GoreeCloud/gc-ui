import {test} from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,symlinkSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,relative} from "node:path";
import {listJavaScriptSources,checkJavaScriptSyntax} from "../scripts/check-source-syntax.mjs";

test("syntax audit covers all maintained JS roots, including previously omitted files",()=>{
  const filenames=listJavaScriptSources().map(file=>relative(new URL("../",import.meta.url).pathname,file));
  for(const name of ["src/foundation.js","src/index.js","scripts/verify-package.mjs","lab/app.js",
                     "tests/browser-smoke.mjs","tests/source-syntax.test.js"]) {
    assert.ok(filenames.includes(name),`Syntax audit omitted ${name}`);
  }
  assert.equal(filenames.length,new Set(filenames).size);
});

test("syntax audit rejects malformed JS and never follows external symlinks",()=>{
  const root=mkdtempSync(join(tmpdir(),"gc-ui-syntax-"));
  try {
    for(const directory of ["src","scripts","lab","tests"]) mkdirSync(join(root,directory));
    writeFileSync(join(root,"src","valid.js"),"export const valid = true;\n");
    writeFileSync(join(root,"lab","invalid.js"),"const invalid = ;\n");
    symlinkSync(join(root,"src"),join(root,"scripts","external-tree"),"dir");
    const results=checkJavaScriptSyntax(root);
    assert.equal(results.files.length,2);
    assert.deepEqual(results.failures.map(failure=>failure.file),["lab/invalid.js"]);
  } finally {rmSync(root,{recursive:true,force:true});}
});
