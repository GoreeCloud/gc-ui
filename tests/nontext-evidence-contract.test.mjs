import test from 'node:test';
import assert from 'node:assert/strict';
import {expectedNontextSelectors,adaptiveNavigationGlyphs,expectedNontextSelectorsForViewport,verifyNontextEvidenceRecord} from '../scripts/nontext-evidence-contract.mjs';

const variant={width:320,mode:'light',rtl:false};
const recordFor=(lab,options=variant)=>({
 schema:'gc-ui-nontext-visual.v2',lab,...options,captureOrigin:{x:0,y:0},
 measurements:expectedNontextSelectorsForViewport(lab,options.width).map(selector=>({lab,selector,samples:160,min:5.1,decorative:true}))
});
const verify=(record,expected=variant)=>verifyNontextEvidenceRecord(record,{lab:record.lab,...expected});

test('exact selector inventory accepts nine selected glyphs across five labs',()=>{
 assert.deepEqual(Object.keys(expectedNontextSelectors),['v1','environment','components','adaptive','forms']);
 assert.equal(Object.values(expectedNontextSelectors).reduce((n,s)=>n+s.length,0),9);
 for(const lab of Object.keys(expectedNontextSelectors))assert.doesNotThrow(()=>verify(recordFor(lab)));
});
test('duplicate or substituted glyph cannot satisfy counts',()=>{
 const duplicated=recordFor('adaptive');
 duplicated.measurements[1]={...duplicated.measurements[0]};
 assert.throws(()=>verify(duplicated),/canonical glyph/);
 const substituted=recordFor('forms');
 substituted.measurements[0].selector='.totally-unrelated-glyph';
 assert.throws(()=>verify(substituted),/canonical glyph/);
});
test('reordered or missing glyphs invalidate evidence',()=>{
 const reordered=recordFor('adaptive');
 [reordered.measurements[0],reordered.measurements[1]]=[reordered.measurements[1],reordered.measurements[0]];
 assert.throws(()=>verify(reordered),/canonical glyph/);
 const missing=recordFor('adaptive');missing.measurements.pop();
 assert.throws(()=>verify(missing),/canonical glyph/);
});
test('rejects invented, malformed, or inconclusive sample claims',()=>{
 for(const samples of [31.5,Infinity,NaN,'100',30,-1]){
  const r=recordFor('forms');r.measurements[0].samples=samples;
  assert.throws(()=>verify(r),/pixel-sample count/);
 }
 for(const min of [2.999,Infinity,NaN,'9.2']){
  const r=recordFor('forms');r.measurements[0].min=min;
  assert.throws(()=>verify(r),/sampled ratio/);
 }
 const r=recordFor('forms');r.measurements[0].decorative=false;
 assert.throws(()=>verify(r),/decorative role/);
});
test('rejects mismatched lab or viewport metadata',()=>{
 const incorrect=recordFor('forms');incorrect.width=375;
 assert.throws(()=>verify(incorrect));
 const unknown=recordFor('forms');unknown.lab='not-a-lab';
 assert.throws(()=>verify(unknown),/Unknown non-text evidence lab/);
});

test('Components file-action chevron must remain independently evidenced',()=>{
 const omitted=recordFor('components');
 omitted.measurements.pop();
 assert.throws(()=>verify(omitted),/canonical glyph/);
 const altered=recordFor('components');
 altered.measurements[1]={...altered.measurements[1],decorative:false};
 assert.throws(()=>verify(altered),/decorative role/);
});

test('six Adaptive navigation glyph identities are gated by actual shell viewport',()=>{
 assert.equal(adaptiveNavigationGlyphs.phone.length,3);
 assert.equal(adaptiveNavigationGlyphs.desktop.length,3);
 assert.equal(new Set([...adaptiveNavigationGlyphs.phone,...adaptiveNavigationGlyphs.desktop]).size,6);
 for(const [width,extras] of [[320,adaptiveNavigationGlyphs.phone],[768,[]],[1440,adaptiveNavigationGlyphs.desktop]]){
  const expected=[...expectedNontextSelectors.adaptive,...extras];
  assert.deepEqual(expectedNontextSelectorsForViewport('adaptive',width),expected);
  assert.doesNotThrow(()=>verify(recordFor('adaptive',{...variant,width}),{...variant,width}));
 }
});
test('mobile, desktop and tablet evidence cannot substitute or omit navigation glyphs',()=>{
 for(const width of [320,1440]){
  const omitted=recordFor('adaptive',{...variant,width});
  omitted.measurements.pop();
  assert.throws(()=>verify(omitted,{...variant,width}),/canonical glyph/);
  const disguised=recordFor('adaptive',{...variant,width});
  disguised.measurements[4].decorative=false;
  assert.throws(()=>verify(disguised,{...variant,width}),/decorative role/);
  const tabletRecord=recordFor('adaptive',{...variant,width:768});
  tabletRecord.measurements.push(disguised.measurements[4]);
  assert.throws(()=>verify(tabletRecord,{...variant,width:768}),/canonical glyph/);
 }
});

test('screenshot records must prove their capture started at the document origin',()=>{
 const recorded=recordFor('adaptive');
 assert.doesNotThrow(()=>verify(recorded));
 for(const origin of [undefined,{x:0,y:200},{x:1,y:0},{x:0,y:0,extra:true}]){
  const invalid=recordFor('adaptive');
  invalid.captureOrigin=origin;
  assert.throws(()=>verify(invalid),/screenshot capture origin/);
 }
 const obsolete=recordFor('forms');obsolete.schema='gc-ui-nontext-visual.v1';
 assert.throws(()=>verify(obsolete));
});
