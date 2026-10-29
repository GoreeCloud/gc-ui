import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,writeFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {expectedAxeScenarios,retainAxeEvidence,verifyAxeEvidence,normalizeIncompleteReason} from '../scripts/axe-evidence.mjs';

const scenarioSource=readFileSync(new URL('../e2e/accessibility.spec.mjs',import.meta.url),'utf8');
const names=expectedAxeScenarios(scenarioSource);
const report=name=>({scenario:name,pagePath:'/lab/'+(name.startsWith('components')?'components':name.startsWith('forms')?'forms':name)+'.html',violations:[],incomplete:[],rulesPassed:90,
 ...(name.startsWith('components-menu-open')?{semanticEvidence:{
  engine:'Playwright browser-computed ARIA snapshot; not screen-reader speech',
  triggerTree:'- button "Workspace actions" [expanded]',
  menuTree:'- menu "Workspace actions": menuitem "Duplicate workspace"; menuitem "Archive (unavailable)"',
  expanded:true,focusedItem:'Duplicate workspace'
 }}:{}),
 note:'Manual checks still required'});

test('source-derived accessibility evidence inventory has all 27 unique scenarios',()=>{
 assert.equal(names.length,27);
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
   JSON.stringify({...report(name),incomplete:name==='components'?[{id:'color-contrast',nodes:[{target:['#project-title'],summary:'Manual contrast review required'}]}]:[]}));
  const manifest=await verifyAxeEvidence(dir,names,{revision:'test'});
  assert.equal(manifest.expected,27);
  assert.equal(manifest.captured,27);
  assert.deepEqual(manifest.menuSemanticTrees,['components-menu-open','components-menu-open-forced-colors']);
  assert.equal(manifest.incompleteChecks,1);
  assert.equal(manifest.incompleteNodes,1);
  assert.deepEqual(manifest.incompleteByRule,[{
   id:'color-contrast',checks:1,nodes:1,scenarios:['components']
  }]);
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

test('incomplete rule triage preserves separate check and node totals across screens',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-ui-axe-rule-'));
 try{
  for(const name of names){
   const incomplete=name==='components'?[{id:'aria-valid-attr-value',nodes:[{target:['#trigger']}]},
     {id:'color-contrast',nodes:[{target:['h1']},{target:['p']}]}]:
    name==='forms'?[{id:'color-contrast',nodes:[{target:['input']}]}]:[];
   await writeFile(join(dir,name+'.json'),JSON.stringify({...report(name),incomplete}));
  }
  const manifest=await verifyAxeEvidence(dir,names);
  assert.equal(manifest.incompleteChecks,3);
  assert.equal(manifest.incompleteNodes,4);
  assert.deepEqual(manifest.incompleteByRule,[
   {id:'color-contrast',checks:2,nodes:3,scenarios:['components','forms']},
   {id:'aria-valid-attr-value',checks:1,nodes:1,scenarios:['components']}
  ]);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('malformed incomplete-rule evidence cannot silently undercount affected elements',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-ui-axe-rule-'));
 try{
  for(const name of names)await writeFile(join(dir,name+'.json'),JSON.stringify(report(name)));
  await writeFile(join(dir,'components.json'),JSON.stringify({
   ...report('components'),incomplete:[{id:'color-contrast',nodes:'unknown'}]
  }));
  await assert.rejects(verifyAxeEvidence(dir,names),/Malformed incomplete axe rule/);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('open-menu evidence must include real browser-computed ARIA tree snapshots',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-ui-menu-a11y-'));
 try{
  for(const name of names)await writeFile(join(dir,name+'.json'),JSON.stringify(report(name)));
  await writeFile(join(dir,'components-menu-open.json'),JSON.stringify({
   ...report('components-menu-open'),semanticEvidence:null
  }));
  await assert.rejects(verifyAxeEvidence(dir,names),/Missing or invalid browser ARIA tree evidence/);
  await writeFile(join(dir,'components-menu-open.json'),JSON.stringify(report('components-menu-open')));
  const manifest=await verifyAxeEvidence(dir,names);
  assert.deepEqual(manifest.menuSemanticTrees,['components-menu-open','components-menu-open-forced-colors']);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('inconclusive rule reasons preserve axe language and fold header whitespace',()=>{
 assert.equal(normalizeIncompleteReason('Fix any of the following:\n  Background uses a gradient  '),'Background uses a gradient');
 assert.equal(normalizeIncompleteReason('Fix all of the following:\n Reference cannot be resolved'),'Reference cannot be resolved');
 assert.equal(normalizeIncompleteReason(null),'No failure summary supplied by axe');
});
test('manifest groups inconclusive node occurrences by exact reason and scenario',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-ui-axe-reasons-'));
 try{
  const gradient='Fix any of the following:\n Element background has a gradient';
  const symbol='Element content contains only non-text characters';
  for(const name of names){
   const incomplete=name==='components'?[
    {id:'color-contrast',nodes:[{target:['h1'],summary:gradient},
      {target:['.eyebrow'],summary:gradient},{target:['.icon'],summary:symbol}]}
   ]:name==='forms'?[
    {id:'color-contrast',nodes:[{target:['h2'],summary:gradient}]}
   ]:[];
   await writeFile(join(dir,name+'.json'),JSON.stringify({...report(name),incomplete}));
  }
  const manifest=await verifyAxeEvidence(dir,names);
  assert.equal(manifest.incompleteChecks,2);
  assert.equal(manifest.incompleteNodes,4);
  assert.deepEqual(manifest.incompleteByReason,[
   {rule:'color-contrast',reason:'Element background has a gradient',nodes:3,scenarios:['components','forms']},
   {rule:'color-contrast',reason:symbol,nodes:1,scenarios:['components']}
  ]);
 }finally{await rm(dir,{recursive:true,force:true})}
});
