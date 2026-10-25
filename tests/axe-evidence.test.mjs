import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {expectedAxeScenarios,retainAxeEvidence,verifyAxeEvidence} from '../scripts/axe-evidence.mjs';

const scenarioSource=readFileSync(new URL('../e2e/accessibility.spec.mjs',import.meta.url),'utf8');
const names=expectedAxeScenarios(scenarioSource);
const report=name=>({scenario:name,violations:[],incomplete:[],rulesPassed:90,
 note:'Manual checks still required'});

test('source-derived accessibility evidence inventory has all 26 unique scenarios',()=>{
 assert.equal(names.length,26);
 assert.equal(names[0],'v1');
 assert.ok(names.includes('components-forced-colors'));
 assert.ok(names.includes('experience-studio-reduced-motion'));
});
test('successful accessibility tests retain review JSON and reporter attachment',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-ui-axe-'));
 try{
  const attachments=[];
  const info={project:{outputDir:dir},async attach(name,options){attachments.push({name,options})}};
  const path=await retainAxeEvidence(info,report('components'));
  assert.deepEqual(JSON.parse(await readFile(path,'utf8')),report('components'));
  assert.deepEqual(attachments,[{name:'axe-components-review.json',
   options:{path,contentType:'application/json'}}]);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('complete source-derived report inventory produces manifest showing inconclusive checks',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-ui-axe-'));
 try{
  for(const name of names)await writeFile(join(dir,name+'.json'),
   JSON.stringify({...report(name),incomplete:name==='components'?[{id:'color-contrast'}]:[]}));
  const manifest=await verifyAxeEvidence(dir,names,{revision:'test'});
  assert.equal(manifest.expected,26);
  assert.equal(manifest.captured,26);
  assert.equal(manifest.incompleteChecks,1);
  assert.match(manifest.limitations,/Not certification/);
  assert.deepEqual(JSON.parse(await readFile(join(dir,'manifest.json'),'utf8')),manifest);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('missing, extra or non-JSON evidence and axe violations fail closed',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-ui-axe-'));
 try{
  await assert.rejects(verifyAxeEvidence(dir,names),/missing=/);
  for(const name of names)await writeFile(join(dir,name+'.json'),JSON.stringify(report(name)));
  await writeFile(join(dir,'surprise.json'),'{}');
  await assert.rejects(verifyAxeEvidence(dir,names),/unexpected=/);
  await rm(join(dir,'surprise.json'));
  await writeFile(join(dir,'components.json'),'broken');
  await assert.rejects(verifyAxeEvidence(dir,names),/Invalid accessibility report JSON/);
  await writeFile(join(dir,'components.json'),JSON.stringify({...report('components'),violations:[{id:'label'}]}));
  await assert.rejects(verifyAxeEvidence(dir,names),/Unresolved axe violations/);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('malformed report and scenario traversal are rejected',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-ui-axe-'));
 try{
  const info={project:{outputDir:dir},attach:async()=>{}};
  await assert.rejects(retainAxeEvidence(info,report('../unsafe')),TypeError);
  await assert.rejects(retainAxeEvidence(info,{scenario:'safe',violations:[],incomplete:'missing',rulesPassed:0}),TypeError);
 }finally{await rm(dir,{recursive:true,force:true})}
});
