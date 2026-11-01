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
const expected=scenarios.flatMap(([name,,,,,forced])=>[
 name+'.png',name+'.json',...(forced?[name+'-menu-open.png']:[])
]).sort();
const actual=(await readdir(root)).filter(name=>name!=='manifest.json').sort();
assert.deepEqual(actual,expected,'Missing or unexpected candidate QA evidence');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const captures=[];
for(const [name,width,minHeight,mode,rtl,forcedColors] of scenarios){
 const image=await readFile(join(root,name+'.png'));
 const report=JSON.parse(await readFile(join(root,name+'.json'),'utf8'));
 const focusedMenu=forcedColors?await readFile(join(root,name+'-menu-open.png')):null;
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
 assert.equal(report.focusedMenuScreenshotSha256,focusedMenu?sha(focusedMenu):null,
  'Focused-menu image checksum mismatch '+name);
 assert.equal(report.focusedMenuScreenshotBytes,focusedMenu?.length??null,
  'Focused-menu screenshot byte count mismatch '+name);
 if(focusedMenu){
  assert.equal(focusedMenu.subarray(0,8).toString('hex'),'89504e470d0a1a0a',
   'Invalid focused-menu PNG '+name);
  assert.equal(focusedMenu.subarray(12,16).toString('ascii'),'IHDR',
   'Missing focused-menu dimensions '+name);
  assert.ok(focusedMenu.readUInt32BE(16)>=100&&focusedMenu.readUInt32BE(16)<=width,
   'Unexpected focused-menu screenshot width '+name);
  assert.ok(focusedMenu.readUInt32BE(20)>=44,
   'Unexpected focused-menu screenshot height '+name);
 }
 if(forcedColors)assert.equal(report.primaryContrast,null,'System forced colors are not numeric CSS RGB values');
 else assert.ok(report.primaryContrast>=4.5,'Primary/on-primary contrast regression '+name);
 assert.ok(report.overflow?.content<=report.overflow?.viewport,'Horizontal reflow failure '+name);
 const menuBase={popup:'menu',controls:'actions-menu',referenceCount:1,
  referencedRole:'menu',referencedConnected:true};
 assert.deepEqual(report.menuAria?.closed,{...menuBase,expanded:'false',
  referencedHidden:true,referencedRendered:false},'Invalid closed popup linkage '+name);
 assert.deepEqual(report.menuAria?.open,{...menuBase,expanded:'true',
  referencedHidden:false,referencedRendered:true},'Invalid expanded popup linkage '+name);
 for(const [phase,result] of [['closed',report.axe],['expanded',report.axeOpen]]){
  assert.ok(Number.isSafeInteger(result?.passes)&&result.passes>0,'No '+phase+' axe rules run '+name);
  assert.deepEqual(result.violations,[],'Confirmed '+phase+' axe violation '+name);
  assert.ok(Array.isArray(result.incomplete),'Missing '+phase+' inconclusive axe evidence '+name);
  for(const item of result.incomplete){
   assert.equal(typeof item.id,'string');
   assert.ok(Array.isArray(item.nodes));
   for(const node of item.nodes)assert.ok(Array.isArray(node.target)&&node.target.length,
    'Incomplete '+phase+' node missing selector');
  }
 }
 // Keep the exact inconclusive contrast targets and their real browser
 // compositing context. Offscreen samples must not invent a hit-test stack.
 const contrastSelectors=[...new Set(report.axeOpen.incomplete
  .filter(item=>item.id==='color-contrast')
  .flatMap(item=>item.nodes.map(node=>node.target[0])).filter(Boolean))];
 const samples=report.inconclusiveContrastSamples;
 assert.ok(Array.isArray(samples),'Missing expanded contrast context '+name);
 assert.deepEqual(samples.map(sample=>sample.selector),contrastSelectors,
  'Missing or reordered contrast review targets '+name);
 for(const sample of samples){
  assert.equal(sample.found,true,'Unresolved contrast element '+sample.selector);
  assert.equal(typeof sample.centerInViewport,'boolean');
  for(const key of ['x','y','width','height'])
   assert.ok(Number.isFinite(sample.rect?.[key]),'Invalid target geometry '+name);
  for(const key of ['color','backgroundColor','opacity','position','zIndex'])
   assert.equal(typeof sample.computed?.[key],'string','Missing computed CSS '+name);
  assert.ok(Array.isArray(sample.centerStack),'Missing element stacking data '+name);
  if(!sample.centerInViewport)assert.equal(sample.centerStack.length,0,
   'Offscreen elements must not report viewport overlap');
  for(const entry of sample.centerStack)assert.equal(typeof entry.tag,'string');
 }
 // A concrete opaque foreground/background pair supports a numeric check;
 // translucent forced-color surfaces still need composited/manual review.
 const item=report.menuItemComputedContrast;
 assert.equal(typeof item?.foreground,'string','Missing browser menu foreground '+name);
 assert.equal(typeof item?.background,'string','Missing browser menu background '+name);
 assert.equal(typeof item?.opaqueBackground,'boolean','Missing opacity evidence '+name);
 // Firefox may resolve forced colors as opaque while Chromium exposes
 // a translucent system color. Validate whichever real computed case applies.
 if(!forcedColors)
  assert.equal(item.opaqueBackground,true,'Opaque menu color unavailable '+name);
 if(item.opaqueBackground)
  assert.ok(Number.isFinite(item.ratio)&&item.ratio>=4.5,
   'Insufficient menu-item text contrast '+name);
 else{
  assert.equal(forcedColors,true,'Unexpected translucent standard menu '+name);
  assert.equal(item.ratio,null,'Do not invent composited contrast '+name);
 }
 const nodeCount=result=>result.incomplete.reduce((sum,x)=>sum+x.nodes.length,0);
 captures.push({scenario:name,width,height:image.readUInt32BE(20),
  sha256:sha(image),bytes:image.length,menuAriaReferenceVerified:true,
  axePassedRules:report.axe.passes,
  inconclusiveChecks:report.axe.incomplete.length,
  inconclusiveNodes:nodeCount(report.axe),
  expandedAxePassedRules:report.axeOpen.passes,
  expandedInconclusiveChecks:report.axeOpen.incomplete.length,
  expandedInconclusiveNodes:nodeCount(report.axeOpen),
  expandedContrastTargetsReviewed:samples.length,
  expandedOpaqueMenuTextContrast:item.opaqueBackground?+item.ratio.toFixed(3):null,
  focusedMenuScreenshot:focusedMenu?{
   sha256:sha(focusedMenu),bytes:focusedMenu.length,
   width:focusedMenu.readUInt32BE(16),height:focusedMenu.readUInt32BE(20)
  }:null});
}
const manifest={
 schema:'gc-ui-seal-web-acceptance-manifest.v1',revision:process.env.GITHUB_SHA??null,
 candidate:'@goreecloud/gc-ui@0.2.0-seal.0',expected:scenarios.length,captured:captures.length,
 results:captures,checks:'Exact scenario inventory, browser states, PNG IHDR/size, SHA-256, closed/expanded menu ARIA reference integrity, dual-state axe screening, preserved incomplete targets, expanded target CSS/stack evidence, opaque menu-item text contrast, and SHA-256-linked focused forced-colors menu screenshot',
 limitations:'Opaque menu-item text contrast does not resolve overlay occlusions or translucent forced-color compositing. Axe and screenshots do not establish full visual approval, WCAG certification, or human assistive-technology acceptance.'
};
await writeFile(join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('PASS installed candidate Seal evidence '+manifest.captured+'/'+manifest.expected+
 ' scenarios; inconclusive node occurrences '+captures.reduce((n,x)=>n+x.inconclusiveNodes,0)+
 '; manual review not waived.');
