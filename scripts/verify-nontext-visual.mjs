/** Fail-closed real glyph pixel acceptance evidence verification. */
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
import {resolvePlaywrightIsolation} from './playwright-isolation-config.mjs';

const folder=resolve(resolvePlaywrightIsolation(process.env).outputDir,'nontext-visual');
const variants=[
 {width:320,mode:'light',rtl:false},
 {width:320,mode:'dark',rtl:false},
 {width:1440,mode:'light',rtl:false},
 {width:1440,mode:'dark',rtl:false},
 {width:768,mode:'light',rtl:true}
];
const labs={adaptive:4,forms:1};
const expected=new Set(['manifest.json']),entries=[];
for(const [lab,count] of Object.entries(labs))for(const variant of variants){
 const key=lab+'-'+variant.width+'-'+variant.mode+(variant.rtl?'-rtl':'');
 expected.add(key+'.png');expected.add(key+'.json');
 const png=await readFile(join(folder,key+'.png'));
 const record=JSON.parse(await readFile(join(folder,key+'.json'),'utf8'));
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',key+' PNG magic');
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
 assert.equal(width,variant.width,key+' width');
 assert.ok(height>=900&&height<=20000,key+' full-page height');
 assert.equal(record.schema,'gc-ui-nontext-visual.v1');
 assert.equal(record.lab,lab);
 assert.equal(record.width,width);
 assert.equal(record.mode,variant.mode);
 assert.equal(record.rtl,variant.rtl);
 assert.equal(record.measurements.length,count,key+' tested glyph count');
 for(const point of record.measurements){
  assert.equal(point.lab,lab);
  assert.ok(point.selector.startsWith('.'),key+' expected local CSS glyph');
  assert.ok(point.samples>30,key+' sampled pixels');
  assert.ok(Number.isFinite(point.min)&&point.min>=3,key+' actual sampled ratio');
  assert.ok(point.decorative===true,key+' decorative role');
 }
 entries.push({id:key,width,height,sha256:createHash('sha256').update(png).digest('hex')});
}
for(const name of await readdir(folder))assert.ok(expected.has(name),'Unexpected nontext screenshot record '+name);
assert.equal(entries.length,10);
await writeFile(join(folder,'manifest.json'),JSON.stringify({
 schema:'gc-ui-nontext-visual-evidence.v1',cases:entries,
 scope:'Selected decorative symbol backdrops, not all WCAG or human visual approval'},null,2)+'\n');
console.log('PASS 10/10 glyph PNG dimensions, sampled ratios, semantics and hashes');
