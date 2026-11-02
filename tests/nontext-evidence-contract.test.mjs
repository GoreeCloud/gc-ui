import test from 'node:test';
import assert from 'node:assert/strict';
import {expectedNontextSelectors,verifyNontextEvidenceRecord} from '../scripts/nontext-evidence-contract.mjs';

const variant={width:320,mode:'light',rtl:false};
const recordFor=lab=>({
 schema:'gc-ui-nontext-visual.v1',lab,...variant,
 measurements:expectedNontextSelectors[lab].map(selector=>({lab,selector,samples:160,min:5.1,decorative:true}))
});
const verify=record=>verifyNontextEvidenceRecord(record,{lab:record.lab,...variant});

test('exact selector inventory accepts five original glyph records',()=>{
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
