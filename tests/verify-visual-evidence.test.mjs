import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {verifyVisualEvidence,visualEvidenceScenarios} from '../scripts/verify-visual-evidence.mjs';

function smallPngHeader(width,height){
 const bytes=Buffer.alloc(24);
 Buffer.from('89504e470d0a1a0a','hex').copy(bytes);
 bytes.write('IHDR',12,'ascii');
 bytes.writeUInt32BE(width,16);bytes.writeUInt32BE(height,20);
 return bytes;
}
test('full-page visual inventory has 21 distinct named browser states',()=>{
 const names=visualEvidenceScenarios.map(([name])=>name);
 assert.equal(names.length,21);assert.equal(new Set(names).size,21);
 for(const [name,width,height] of visualEvidenceScenarios){
  assert.match(name,/^[a-z0-9][a-z0-9-]+$/);
  assert.ok(width>=320&&height>=720);
 }
});
test('complete browser screenshots produce a checked SHA-256 manifest with no visual approval claim',async()=>{
 const root=await mkdtemp(join(tmpdir(),'gc-visual-verify-'));
 try{
  for(const [name,w,h] of visualEvidenceScenarios)
   await writeFile(join(root,name+'.png'),smallPngHeader(w,h));
  const report=await verifyVisualEvidence(root,{revision:'test-head'});
  assert.equal(report.expected,21);assert.equal(report.captured,21);
  assert.equal(report.revision,'test-head');
  assert.match(report.checks,/NOT visual approval/);
  assert.equal(report.images[0].sha256.length,64);
  assert.deepEqual(JSON.parse(await readFile(join(root,'manifest.json'),'utf8')),report);
 }finally{await rm(root,{recursive:true,force:true})}
});
test('partial and incorrectly sized screenshot inventories fail closed',async()=>{
 const root=await mkdtemp(join(tmpdir(),'gc-visual-verify-'));
 try{
  await assert.rejects(verifyVisualEvidence(root),/missing=/);
  for(const [name,w,h] of visualEvidenceScenarios)
   await writeFile(join(root,name+'.png'),smallPngHeader(w,h));
  await writeFile(join(root,'forms-desktop.png'),smallPngHeader(200,900));
  await assert.rejects(verifyVisualEvidence(root),/Unexpected viewport/);
 }finally{await rm(root,{recursive:true,force:true})}
});
