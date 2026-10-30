#!/usr/bin/env node
/** Verify current-build Seal visual and axe evidence, without pretending to approve it. */
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {resolvePlaywrightIsolation} from './playwright-isolation-config.mjs';

const root=resolve(resolvePlaywrightIsolation(process.env).outputDir,'seal-review');
const scenarios=Object.freeze([
 ['seal-web-desktop-light',1280,800,'light',false,false],
 ['seal-web-mobile-dark',375,812,'dark',false,false],
 ['seal-web-mobile-rtl-320',320,720,'light',true,false],
 ['seal-web-mobile-forced-colors',375,812,'light',false,true]
]);
const expected=scenarios.flatMap(([name])=>[name+'.png',name+'.json']).sort();
const actual=(await readdir(root)).filter(name=>name!=='manifest.json').sort();
assert.deepEqual(actual,expected,'Missing or unexpected candidate QA evidence');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const captures=[];
for(const [name,width,minHeight,mode,rtl,forcedColors] of scenarios){
 const image=await readFile(join(root,name+'.png'));
 const report=JSON.parse(await readFile(join(root,name+'.json'),'utf8'));
 assert.equal(image.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Invalid PNG '+name);
 assert.equal(image.subarray(12,16).toString('ascii'),'IHDR','Missing PNG IHDR '+name);
 assert.equal(image.readUInt32BE(16),width,'Wrong PNG viewport width '+name);
 assert.ok(image.readUInt32BE(20)>=minHeight,'Clipped candidate screenshot '+name);
 assert.equal(report.schema,'gc-ui-seal-web-browser-evidence.v1');
 assert.equal(report.scenario,name);
 assert.equal(report.width,width);
 assert.equal(report.height,minHeight);
 assert.equal(report.mode,mode);
 assert.equal(report.rtl,rtl);
 assert.equal(report.forcedColors,forcedColors);
 assert.equal(report.candidateVersion,'0.2.0-seal.0');
 assert.equal(report.revision,process.env.GITHUB_SHA??null,'Unpinned candidate report revision');
 assert.equal(report.screenshotSha256,sha(image),'Candidate screenshot digest mismatch '+name);
 assert.equal(report.screenshotBytes,image.length);
 if(forcedColors)assert.equal(report.primaryContrast,null,'System forced colors are not numeric CSS RGB values');
 else assert.ok(report.primaryContrast>=4.5,'Primary/on-primary contrast regression '+name);
 assert.ok(report.overflow?.content<=report.overflow?.viewport,'Horizontal reflow failure '+name);
 assert.ok(Number.isSafeInteger(report.axe?.passes)&&report.axe.passes>0,'No axe rules run '+name);
 assert.deepEqual(report.axe?.violations,[],'Confirmed axe violation '+name);
 assert.ok(Array.isArray(report.axe?.incomplete),'Missing incomplete axe evidence '+name);
 for(const item of report.axe.incomplete){
  assert.equal(typeof item.id,'string');
  assert.ok(Array.isArray(item.nodes));
  for(const node of item.nodes)assert.ok(Array.isArray(node.target)&&node.target.length,'Incomplete node missing selector');
 }
 captures.push({scenario:name,width,height:image.readUInt32BE(20),
  sha256:sha(image),bytes:image.length,axePassedRules:report.axe.passes,
  inconclusiveChecks:report.axe.incomplete.length,
  inconclusiveNodes:report.axe.incomplete.reduce((sum,x)=>sum+x.nodes.length,0)});
}
const manifest={
 schema:'gc-ui-seal-web-acceptance-manifest.v1',revision:process.env.GITHUB_SHA??null,
 candidate:'@goreecloud/gc-ui@0.2.0-seal.0',expected:scenarios.length,captured:captures.length,
 results:captures,checks:'Exact scenario inventory, browser states, PNG IHDR/size, SHA-256, axe no confirmed violation and preserved incomplete node targets',
 limitations:'Axe and screenshot evidence support scoped browser review; visual quality and human AT acceptance are not certified by this manifest.'
};
await writeFile(join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('PASS installed candidate Seal evidence '+manifest.captured+'/'+manifest.expected+
 ' scenarios; inconclusive node occurrences '+captures.reduce((n,x)=>n+x.inconclusiveNodes,0)+
 '; manual review not waived.');
