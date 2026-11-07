/** Fail-closed integrity check for the all-lab viewport screenshot matrix. */
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {resolvePlaywrightIsolation} from './playwright-isolation-config.mjs';
import {visualAcceptancePages,visualAcceptanceVariants} from './visual-acceptance-scenarios.mjs';

const folder=resolve(resolvePlaywrightIsolation(process.env).outputDir,'acceptance-matrix');
const files=await readdir(folder);
const expected=new Set(['manifest.json']);
const entries=[];
for(const page of visualAcceptancePages){
 for(const variant of visualAcceptanceVariants){
  const key=page.id+'-'+variant.id,pngName=key+'.png',jsonName=key+'.json';
  expected.add(pngName);expected.add(jsonName);
  const [png,raw]=await Promise.all([
   readFile(join(folder,pngName)),
   readFile(join(folder,jsonName),'utf8')
  ]);
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',key+' not PNG');
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  assert.equal(width,variant.width,key+' screenshot width');
  assert.equal(height,variant.height,key+' screenshot height');
  const record=JSON.parse(raw);
  assert.deepEqual(record.variant,variant,key+' complete variant');
  assert.equal(record.variant?.width,width,key+' metadata width');
  assert.equal(record.variant?.height,height,key+' metadata height');
  assert.equal(record.geometry?.viewport,width,key+' viewport');
  assert.ok(record.geometry?.rootScrollWidth<=width+2,key+' horizontal overflow');
  assert.ok(record.geometry?.bodyScrollWidth<=width+2,key+' body overflow');
  assert.equal(record.path,page.path,key+' canonical page path');
  assert.ok(record.geometry?.heading?.left>=-2,key+' visible heading left');
  assert.ok(record.geometry?.heading?.right<=width+2,key+' visible heading right');
  assert.equal(record.geometry?.visibleHeading,true,key+' visible heading');
  entries.push({case:key,width,height,
   sha256:createHash('sha256').update(png).digest('hex'),
   bytes:png.length});
 }
}
for(const file of files)assert.ok(expected.has(file),'Unexpected screenshot evidence: '+file);
assert.equal(entries.length,visualAcceptancePages.length*visualAcceptanceVariants.length);
assert.equal(entries.length,44,'required 11 labs × 4 variants');
await writeFile(join(folder,'manifest.json'),JSON.stringify({
 schema:'gc-ui-acceptance-matrix-evidence.v1',
 scope:'Actual-browser viewport screenshots and geometry only; not design approval',
 cases:entries
},null,2)+'\n');
console.log('PASS retained all-lab visual screenshots',entries.length+'/44 ('+folder+')');
