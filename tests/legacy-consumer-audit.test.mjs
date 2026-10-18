import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,symlinkSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {auditConsumer,parseArguments} from '../scripts/audit-legacy-consumer.mjs';

function fixture(fn){
 const root=mkdtempSync(join(tmpdir(),'gc-migration-fixture-'));
 try{return fn(root);}finally{rmSync(root,{recursive:true,force:true});}
}
function make(root,path,value){
 const parts=path.split('/'),file=parts.pop();
 let dir=root;
 for(const section of parts){dir=join(dir,section);mkdirSync(dir,{recursive:true});}
 writeFileSync(join(dir,file),value);
}
test('recognizes real references without leaking source lines and never edits consumer',()=>{
 fixture(root=>{
  const files={
   'package.json':JSON.stringify({dependencies:{'@goreecloud/glaze':'1.7.0'}}),
   'src/app.ts':"import '@goreecloud/glaze';\nconst thing = 'Glaze';\n",
   'styles/site.css':'.app { color:var(--glz-primary); }\n',
   'README.md':'The old Glaze experience will be superseded.\n',
   'docs/compat.md':'Earlier example: import from Glaze; do not reuse.\n'
  };
  for(const [name,value] of Object.entries(files))make(root,name,value);
  const report=auditConsumer(root);
  assert.equal(report.status,'legacy-dependency-evidence');
  assert.ok(report.totals.active>=3);
  assert.ok(report.totals.informational>=1);
  assert.ok(report.totals.review>=1);
  assert.ok(report.findings.every(f=>!('sourceText' in f)&&!('excerpt' in f)));
  assert.ok(report.findings.every(f=>!f.path.startsWith('/')));
  assert.equal(report.sourceChanged,false);
  for(const [name,value] of Object.entries(files))
   assert.equal(readFileSync(join(root,name),'utf8'),value);
  assert.equal(report.consumerConformant,false);
 });
});
test('historical-only text nonblocking without claiming migration',()=>{
 fixture(root=>{
  make(root,'docs/archive.md','Glaze historically held this role.\n');
  const r=auditConsumer(root);
  assert.equal(r.status,'no-legacy-evidence-detected');
  assert.equal(r.totals.active,0);
  assert.equal(r.totals.informational,1);
  assert.equal(r.migrationComplete,false);
 });
});
test('ordinary glazed words and GC UI tokens are not false positives',()=>{
 fixture(root=>{
  make(root,'src/main.js','const label="glazed pottery"; const css="--gc-v1-color-primary";');
  assert.equal(auditConsumer(root).status,'no-legacy-evidence-detected');
 });
});
test('ambiguous active source reference demands manual review',()=>{
 fixture(root=>{
  make(root,'src/ui.js','const description = "Glaze was the old design system";');
  const r=auditConsumer(root);
  assert.equal(r.status,'manual-review-required');
  assert.equal(r.totals.review,1);
 });
});
test('oversized text is incomplete and never clean',()=>{
 fixture(root=>{
  make(root,'src/oversize.js','n'.repeat(65));
  assert.equal(auditConsumer(root,{maxSize:40}).status,'incomplete');
 });
});
test('symlink outside root never traversed or silently accepted',()=>{
 fixture(root=>{
  const outside=mkdtempSync(join(tmpdir(),'gc-audit-outside-'));
  try{
   make(outside,'secret.ts',"import 'Glaze';");
   make(root,'src/clean.js','export const n=42;');
   symlinkSync(outside,join(root,'linked'));
   const r=auditConsumer(root);
   assert.equal(r.status,'incomplete');
   assert.equal(r.scan.skippedSymlinks,1);
   assert.ok(r.incomplete.some(a=>a.reason==='symlink-skipped'));
   assert.ok(!r.findings.some(f=>f.path.includes('secret')));
  }finally{rmSync(outside,{recursive:true,force:true});}
 });
});
test('legacy binary filenames are recognized without reading bytes',()=>{
 fixture(root=>{
  make(root,'assets/glaze-brand.png','\0PNG');
  const r=auditConsumer(root);
  assert.equal(r.totals.active,1);
  assert.equal(r.findings[0].type,'legacy-filename');
 });
});
test('legacy source directories are active while archival filenames remain nonblocking',()=>{
 fixture(root=>{
  make(root,'src/glaze-old/theme.js','export const n=1;');
  make(root,'docs/glaze-history.md','Former design contract, kept for provenance.');
  const report=auditConsumer(root);
  assert.ok(report.findings.some(x=>x.type==='legacy-directory'&&x.severity==='active'));
  assert.ok(report.findings.some(x=>x.type==='legacy-filename'&&x.severity==='informational'));
  assert.equal(report.status,'legacy-dependency-evidence');
 });
});
test('empty directories are not clean',()=>{
 fixture(root=>{
  assert.equal(auditConsumer(root).status,'incomplete');
 });
});
test('CLI requires explicit root, reports JSON and strict status codes',()=>{
 fixture(root=>{
  make(root,'README.md','historic Glaze notes');
  const cli=new URL('../scripts/audit-legacy-consumer.mjs',import.meta.url).pathname;
  const run=(...args)=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});
  const missing=run();
  assert.equal(missing.status,4);
  assert.match(missing.stderr,/explicit --root/);
  const clean=run('--root',root,'--json','--strict');
  assert.equal(clean.status,0);
  assert.equal(JSON.parse(clean.stdout).status,'no-legacy-evidence-detected');
  make(root,'src/test.ts',"import '@goreecloud/glaze';\n");
  const blocked=run('--root',root,'--json','--strict');
  assert.equal(blocked.status,2);
  assert.equal(JSON.parse(blocked.stdout).status,'legacy-dependency-evidence');
  symlinkSync(root,join(root,'nested-link'));
  const incomplete=run('--root',root,'--json','--strict');
  assert.equal(incomplete.status,3);
  assert.equal(JSON.parse(incomplete.stdout).status,'incomplete');
 });
});
test('unsupported options and symlink roots are refused',()=>{
 assert.throws(()=>parseArguments(['--root','/x','--unsafe']),/Unrecognized/);
 fixture(root=>{
  const link=join(root,'sym');
  symlinkSync(root,link);
  assert.throws(()=>auditConsumer(link),/symlink/);
 });
});


test('dated discovery does not count the old consumer statuses as GC UI acceptance',()=>{
 const text=readFileSync(new URL('../docs/CONSUMER_MIGRATION_INVENTORY_2026_10_17.md',import.meta.url),'utf8');
 assert.match(text,/18.*product records.*15.*distinct repository/);
 assert.match(text,/unverified/);
 assert.match(text,/not.*a GC UI production consumer acceptance record/);
});
