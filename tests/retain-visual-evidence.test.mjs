import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {retainVisualEvidence,captureFullPageVisualEvidence} from '../scripts/retain-visual-evidence.mjs';

const signature=Buffer.from('89504e470d0a1a0a','hex');
test('successful visual capture remains at a deterministic artifact path and in report attachments',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-ui-visual-'));
 try{
  const calls=[],info={project:{outputDir:dir},async attach(name,options){calls.push({name,options})}};
  const png=Buffer.concat([signature,Buffer.from('fixture-payload')]);
  const result=await retainVisualEvidence(info,'forms-mobile-dark',png);
  assert.equal(result,join(dir,'visual-review','forms-mobile-dark.png'));
  assert.deepEqual(await readFile(result),png);
  assert.deepEqual(calls,[{name:'forms-mobile-dark',options:{path:result,contentType:'image/png'}}]);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('visual capture refuses traversal names, invalid output folders and non-PNG payloads',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-ui-visual-'));
 try{
  const info={project:{outputDir:dir},async attach(){}};
  for(const name of ['../escape','sub/folder','../other.png','', 'UPPERCASE'])
   await assert.rejects(retainVisualEvidence(info,name,signature),TypeError);
  await assert.rejects(retainVisualEvidence({project:{outputDir:''}},'safe',signature),TypeError);
  await assert.rejects(retainVisualEvidence(info,'safe',Buffer.from('bad-image')),TypeError);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('full-page capture resets scroll and focus before screenshot and retains its PNG',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'gc-ui-visual-baseline-'));
 try{
  const events=[],png=Buffer.concat([signature,Buffer.from('fixture-data')]);
  const page={
   async evaluate(){events.push('evaluate');return events.length===3?[]:undefined},
   async waitForFunction(){events.push('wait')},
   async screenshot(options){
    events.push('screenshot');
    assert.deepEqual(options,{fullPage:true,animations:'disabled'});
    return png;
   }
  };
  const info={project:{outputDir:dir},async attach(){events.push('attach')}};
  const file=await captureFullPageVisualEvidence(page,info,'components-desktop-light');
  assert.deepEqual(events,['evaluate','wait','evaluate','screenshot','attach']);
  assert.deepEqual(await readFile(file),png);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('a visible resting skip link fails screenshot capture rather than creating misleading evidence',async()=>{
 const events=[];
 const page={
  async evaluate(){events.push('evaluate');return events.length===2?['Skip to content']:undefined},
  async waitForFunction(){events.push('wait')},
  async screenshot(){throw Error('Screenshot must not run')}
 };
 await assert.rejects(captureFullPageVisualEvidence(page,{},'components-desktop-light'),/Skip to content/);
 assert.deepEqual(events,['evaluate','wait','evaluate']);
});
