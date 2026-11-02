/** Fail-closed checksum and viewport verifier for open interactive-state evidence. */
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
import {resolvePlaywrightIsolation} from './playwright-isolation-config.mjs';

const folder=resolve(resolvePlaywrightIsolation(process.env).outputDir,'interactive-visual');
const states=['components-menu','forms-suggestions','forms-errors'];
const variants=[
 {id:'320-light',width:320,height:812},
 {id:'375-dark-reduced',width:375,height:812},
 {id:'768-rtl',width:768,height:900},
 {id:'1440-forced',width:1440,height:900}
];
const expected=new Set(['manifest.json']),entries=[];
for(const state of states)for(const variant of variants){
 const key=state+'-'+variant.id;
 expected.add(key+'.png');expected.add(key+'.json');
 const png=await readFile(join(folder,key+'.png'));
 const metadata=JSON.parse(await readFile(join(folder,key+'.json'),'utf8'));
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',key+' is not PNG');
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
 assert.equal(width,variant.width,key+' PNG width');
 assert.equal(height,variant.height,key+' PNG height');
 assert.equal(metadata.schema,'gc-ui-interactive-visual-state.v1');
 assert.equal(metadata.target,state,key+' target');
 assert.equal(metadata.variant.id,variant.id,key+' variant');
 assert.equal(metadata.geometry.viewport.width,width,key+' viewport width');
 assert.equal(metadata.geometry.viewport.height,height,key+' viewport height');
 assert.ok(metadata.path.startsWith('/lab/'),key+' only local fixtures');
 assert.ok(metadata.geometry.nodes.every(node=>node.isHit),key+' obstructed item');
 assert.equal(metadata.geometry.nodes.length,state==='components-menu'?4:3,key+' node count');
 entries.push({id:key,width,height,bytes:png.length,
  sha256:createHash('sha256').update(png).digest('hex')});
}
const files=await readdir(folder);
for(const name of files)assert.ok(expected.has(name),'Unexpected interactive-state evidence: '+name);
assert.equal(entries.length,12);
await writeFile(join(folder,'manifest.json'),JSON.stringify({
 schema:'gc-ui-interactive-visual-evidence.v1',
 scope:'Actual open state screenshot and hit-test evidence, not human aesthetic signoff',
 cases:entries
},null,2)+'\n');
console.log('PASS 12/12 interactive-state screenshots, geometry and SHA-256 manifest');
