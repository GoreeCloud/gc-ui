/** Fail-closed real glyph pixel acceptance evidence verification. */
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
import {expectedNontextSelectors,verifyNontextEvidenceRecord} from './nontext-evidence-contract.mjs';
import {resolvePlaywrightIsolation} from './playwright-isolation-config.mjs';

const folder=resolve(resolvePlaywrightIsolation(process.env).outputDir,'nontext-visual');
const variants=[
 {width:320,mode:'light',rtl:false},
 {width:320,mode:'dark',rtl:false},
 {width:1440,mode:'light',rtl:false},
 {width:1440,mode:'dark',rtl:false},
 {width:768,mode:'light',rtl:true}
];
const labs=Object.keys(expectedNontextSelectors);
const expected=new Set(['manifest.json']),entries=[];
for(const lab of labs)for(const variant of variants){
 const key=lab+'-'+variant.width+'-'+variant.mode+(variant.rtl?'-rtl':'');
 expected.add(key+'.png');expected.add(key+'.json');
 const png=await readFile(join(folder,key+'.png'));
 const record=JSON.parse(await readFile(join(folder,key+'.json'),'utf8'));
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',key+' PNG magic');
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
 assert.equal(width,variant.width,key+' width');
 assert.ok(height>=900&&height<=20000,key+' full-page height');
 verifyNontextEvidenceRecord(record,{lab,width,mode:variant.mode,rtl:variant.rtl});
 entries.push({id:key,width,height,sha256:createHash('sha256').update(png).digest('hex')});
}
for(const name of await readdir(folder))assert.ok(expected.has(name),'Unexpected nontext screenshot record '+name);
assert.equal(entries.length,25);
await writeFile(join(folder,'manifest.json'),JSON.stringify({
 schema:'gc-ui-nontext-visual-evidence.v2',cases:entries,
 scope:'Selected decorative symbol backdrops, not all WCAG or human visual approval'},null,2)+'\n');
console.log('PASS 25/25 glyph PNG dimensions, exact selectors, sampled ratios, semantics and hashes');
