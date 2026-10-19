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
test('historical acceptance JSON stays preserved without suppressing runtime evidence',()=>{
 fixture(root=>{
  make(root,'acceptance/glaze-v1.7-accepted.json',JSON.stringify({old:'@goreecloud/glaze',decision:'historical'}));
  make(root,'evidence/glaze-v1.6.yml','old_token: --glz-surface');
  make(root,'acceptance/verify-glaze.js',"import '@goreecloud/glaze';");
  make(root,'css/glaze-runtime.css',':root { --glz-surface: red; }');
  const report=auditConsumer(root);
  assert.ok(report.findings.some(x=>x.path.endsWith('v1.7-accepted.json')&&x.type==='historical-acceptance-or-evidence'&&x.severity==='informational'));
  assert.ok(report.findings.some(x=>x.path.endsWith('v1.6.yml')&&x.severity==='informational'));
  assert.ok(report.findings.some(x=>x.path.endsWith('verify-glaze.js')&&x.severity==='active'));
  assert.ok(report.findings.some(x=>x.path.endsWith('glaze-runtime.css')&&x.severity==='active'));
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

test('TypeScript .mts and .cts module imports cannot yield a false-clean migration audit',()=>{
 fixture(root=>{
  make(root,'src/modern.mts',"import '@goreecloud/glaze';\n");
  make(root,'src/common.cts',"const theme = require('@goreecloud/glaze');\n");
  make(root,'types/module.d.mts',"export * from '@goreecloud/glaze';\n");
  make(root,'types/module.d.cts',"export * from '@goreecloud/glaze';\n");
  const report=auditConsumer(root);
  assert.equal(report.status,'legacy-dependency-evidence');
  assert.equal(report.scan.filesScanned,4);
  assert.equal(report.totals.active,4);
  for(const file of ['modern.mts','common.cts','module.d.mts','module.d.cts'])
   assert.ok(report.findings.some(item=>item.path.endsWith(file)&&item.severity==='active'),file);
  assert.equal(report.migrationComplete,false);
 });
});
test('strict CLI rejects predecessor usage in .mts even without other checked source',()=>{
 fixture(root=>{
  make(root,'src/entry.mts',"import {theme} from '@goreecloud/glaze';");
  const cli=new URL('../scripts/audit-legacy-consumer.mjs',import.meta.url).pathname;
  const result=spawnSync(process.execPath,[cli,'--root',root,'--json','--strict'],{encoding:'utf8'});
  assert.equal(result.status,2,result.stderr);
  const report=JSON.parse(result.stdout);
  assert.equal(report.status,'legacy-dependency-evidence');
  assert.equal(report.totals.active,1);
 });
});

test('abbreviated glz- component namespace and legacy asset filenames cannot scan clean',()=>{
 fixture(root=>{
  make(root,'src/panel.html','<glz-button type="button">Continue</glz-button>');
  make(root,'src/panel.css','.glz-card {display:block}');
  make(root,'assets/glz-icon.svg','<svg xmlns="http://www.w3.org/2000/svg"/>');
  const report=auditConsumer(root);
  assert.equal(report.status,'legacy-dependency-evidence');
  assert.ok(report.findings.some(x=>x.path==='src/panel.html'&&x.type==='legacy-component'&&x.severity==='active'));
  assert.ok(report.findings.some(x=>x.path==='src/panel.css'&&x.type==='legacy-component'&&x.severity==='active'));
  assert.ok(report.findings.some(x=>x.path==='assets/glz-icon.svg'&&x.type==='legacy-filename'&&x.severity==='active'));
  const cli=new URL('../scripts/audit-legacy-consumer.mjs',import.meta.url).pathname;
  const result=spawnSync(process.execPath,[cli,'--root',root,'--json','--strict'],{encoding:'utf8'});
  assert.equal(result.status,2,result.stderr);
  assert.equal(JSON.parse(result.stdout).totals.active,report.totals.active);
 });
});

test('undecodable UTF-8 source must be incomplete, not no-legacy-evidence-detected',()=>{
 fixture(root=>{
  mkdirSync(join(root,'src'));
  writeFileSync(join(root,'src','corrupted.ts'),Buffer.from([0xff,0xfe,0xfd]));
  const report=auditConsumer(root);
  assert.equal(report.status,'incomplete');
  assert.ok(report.incomplete.some(x=>x.path==='src/corrupted.ts'&&x.reason==='invalid-utf8-text-file'));
  assert.equal(report.migrationComplete,false);
  const cli=new URL('../scripts/audit-legacy-consumer.mjs',import.meta.url).pathname;
  const result=spawnSync(process.execPath,[cli,'--root',root,'--json','--strict'],{encoding:'utf8'});
  assert.equal(result.status,3,result.stderr);
  assert.ok(JSON.parse(result.stdout).incomplete.some(x=>x.reason==='invalid-utf8-text-file'));
 });
});

test('SVG symbol content and Astro component templates cannot bypass legacy source audit',()=>{
 fixture(root=>{
  make(root,'assets/icons.svg','<svg xmlns="http://www.w3.org/2000/svg"><symbol id="glz-icon-menu"><path d="M0 0"/></symbol></svg>');
  make(root,'src/dashboard.astro','---\nconst title = "Dashboard";\n---\n<glz-button>{title}</glz-button>');
  const report=auditConsumer(root);
  assert.equal(report.status,'legacy-dependency-evidence');
  assert.equal(report.scan.filesScanned,2,'both text asset and component source must be scanned');
  assert.ok(report.findings.some(x=>x.path==='assets/icons.svg'&&x.severity==='active'));
  assert.ok(report.findings.some(x=>x.path==='src/dashboard.astro'&&x.type==='legacy-component'&&x.severity==='active'));
  const cli=new URL('../scripts/audit-legacy-consumer.mjs',import.meta.url).pathname;
  const result=spawnSync(process.execPath,[cli,'--root',root,'--json','--strict'],{encoding:'utf8'});
  assert.equal(result.status,2,result.stderr);
  assert.equal(JSON.parse(result.stdout).scan.filesScanned,2);
 });
});

test('an oversized SVG source cannot be misrepresented as a clean audit',()=>{
 fixture(root=>{
  make(root,'assets/icons.svg','<svg>'+'z'.repeat(100)+'</svg>');
  const report=auditConsumer(root,{maxSize:40});
  assert.equal(report.status,'incomplete');
  assert.ok(report.incomplete.some(x=>x.reason==='oversized-text-file'&&x.path==='assets/icons.svg'));
 });
});
