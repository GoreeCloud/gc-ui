/** Fail-closed integrity check for the 24 expanded viewport screenshots. */
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {resolvePlaywrightIsolation} from './playwright-isolation-config.mjs';

const pages=['components','catalog','adaptive','forms','environment','experience'];
const cases=[
 {id:'320-light',width:320,height:812},
 {id:'375-dark',width:375,height:812},
 {id:'768-rtl',width:768,height:900},
 {id:'1440-forced',width:1440,height:900}
];
const folder=resolve(resolvePlaywrightIsolation(process.env).outputDir,'acceptance-matrix');
const files=await readdir(folder);
const expected=new Set(['manifest.json']);
const entries=[];
for(const page of pages){
 for(const variant of cases){
  const key=page+'-'+variant.id,pngName=key+'.png',jsonName=key+'.json';
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
  assert.equal(record.variant?.id,variant.id,key+' variant');
  assert.equal(record.variant?.width,width,key+' metadata width');
  assert.equal(record.variant?.height,height,key+' metadata height');
  assert.equal(record.geometry?.viewport,width,key+' viewport');
  assert.ok(record.geometry?.rootScrollWidth<=width+2,key+' horizontal overflow');
  assert.ok(record.geometry?.bodyScrollWidth<=width+2,key+' body overflow');
  assert.ok(record.path?.startsWith('/lab/'),key+' local-only page path');
  entries.push({case:key,width,height,
   sha256:createHash('sha256').update(png).digest('hex'),
   bytes:png.length});
 }
}
for(const file of files)assert.ok(expected.has(file),'Unexpected screenshot evidence: '+file);
assert.equal(entries.length,24);
await writeFile(join(folder,'manifest.json'),JSON.stringify({
 schema:'gc-ui-acceptance-matrix-evidence.v1',
 scope:'Actual-browser viewport screenshots and geometry only; not design approval',
 cases:entries
},null,2)+'\n');
console.log('PASS retained expanded visual screenshots',entries.length+'/24 ('+folder+')');
