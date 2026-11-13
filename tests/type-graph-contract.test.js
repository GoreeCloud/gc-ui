import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
import {auditTypeGraph} from "../scripts/audit-type-graph.mjs";
const text=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const pkg=JSON.parse(text("package.json"));
const fixture=()=>{
 const files=new Set(["package.json",...readdirSync(new URL("../src/",import.meta.url)).map(x=>"src/"+x)]);
 return {files,read:p=>text(p)};
};
test("each public JS entry matches installed declaration values, including transitive Signal Board",()=>{
 const {files,read}=fixture(),record=auditTypeGraph(pkg,files,read);
 assert.equal(record.entryCount,Object.values(pkg.exports).filter(v=>v&&typeof v==="object").length);
 assert.equal(record.entries.find(x=>x.path==="./foundation").values,15);
 assert.equal(record.entries.find(x=>x.path==="./signal-board").values,4);
 assert.ok(record.entries.find(x=>x.path===".").values>=34);
});
test("missing/phantom declarations, external type dependencies and missing transitive files fail",()=>{
 const {files,read}=fixture();
 const altered=(file,fn)=>p=>p===file?fn(read(p)):read(p);
 const mismatch=(file,fn)=>assert.throws(()=>auditTypeGraph(pkg,files,altered(file,fn)),
   /JS\/type value API mismatch|Undeclared TypeScript re-export/);
 mismatch("src/index.d.ts",s=>s.replace("export declare function initToggleGroup","declare function initToggleGroup"));
 mismatch("src/index.d.ts",s=>s.replace("SIGNAL_STATES, SIGNAL_FILTERS, summarizeSignals, initSignalBoard","SIGNAL_STATES, SIGNAL_FILTERS, summarizeSignals"));
 mismatch("src/foundation.d.ts",s=>s.replace("initDrawer }","initDrawer, madeUpController }"));
 const external=altered("src/theme.d.ts",s=>s+'\nexport { stolen } from "external-package";');
 assert.throws(()=>auditTypeGraph(pkg,files,external),/External declaration dependency/);
 const incomplete=new Set(files);incomplete.delete("src/index.d.ts");
 assert.throws(()=>auditTypeGraph(pkg,incomplete,read),/Unpacked declaration import|Missing packed public source/);
});
test("test validates exact package bytes without pretending semantic TypeScript compilation",()=>{
 const source=text("scripts/audit-type-graph.mjs");
 assert.match(source,/NOT a semantic TypeScript compiler/);
 assert.match(text("scripts/verify-package.mjs"),/installRoot/);
 assert.match(text("scripts/compare-package-evidence.mjs"),/typeEntryCount/);
});
