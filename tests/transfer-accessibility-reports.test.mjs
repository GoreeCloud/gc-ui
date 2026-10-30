import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {transferAccessibilityReports} from '../scripts/transfer-accessibility-reports.mjs';

test('axe report survives intermediate Playwright output cleanup via staged copy',async()=>{
 const root=await mkdtemp(join(tmpdir(),'gc-axe-transfer-'));
 try{
  const source=join(root,'visual-test-output','accessibility-review');
  const stash=join(root,'saved','accessibility-review');
  const next=join(root,'new-visual-test-output','accessibility-review');
  await mkdir(source,{recursive:true});
  await writeFile(join(source,'manifest.json'),'{"expected":26,"captured":26}');
  await writeFile(join(source,'components.json'),'{"scenario":"components"}');
  await transferAccessibilityReports(source,stash);
  await transferAccessibilityReports(stash,next);
  assert.equal(await readFile(join(next,'components.json'),'utf8'),'{"scenario":"components"}');
  assert.equal(await readFile(join(next,'manifest.json'),'utf8'),'{"expected":26,"captured":26}');
 }finally{await rm(root,{recursive:true,force:true})}
});
test('staging refuses absent manifests and the same source/destination directory',async()=>{
 const root=await mkdtemp(join(tmpdir(),'gc-axe-transfer-'));
 try{
  const dst=join(root,'other');
  await assert.rejects(transferAccessibilityReports(root,dst),/manifest is missing/);
  await assert.rejects(transferAccessibilityReports(root,root),TypeError);
 }finally{await rm(root,{recursive:true,force:true})}
});

test('CI archive retains stashed accessibility review after visual-suite failure',async()=>{
 const workflow=await readFile(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
 const section=workflow.split('      - name: Upload visual captures and failure traces\n')[1]?.split('\n  browser-firefox:')[0];
 assert.ok(section,'Chromium evidence upload job missing');
 assert.match(section,/if:\s*always\(\)/);
 assert.match(section,/dist\/qa\/accessibility-review\//);
});
