import {test} from 'node:test';
import assert from 'node:assert/strict';
import {classifyTarget,buildTriage} from '../scripts/triage-axe-incomplete.mjs';

const target=(reason,selector=['#x'],rule='color-contrast',occurrences=2)=>({
 pagePath:'/lab/forms.html',rule,selector,reason,occurrences,scenarios:['forms','forms-invalid-summary']
});
test('prioritizes obstruction over gradient and symbols without waiving cases',()=>{
 assert.equal(classifyTarget(target('Background partly obscured by another element')).classification,'possible-obstruction');
 assert.equal(classifyTarget(target('Background gradient')).classification,'composited-background');
 const item=classifyTarget(target('Element content contains only non-text characters',['[aria-hidden="true"]']));
 assert.equal(item.classification,'non-text-symbol');
 assert.equal(item.decorativeHint,true);
 assert.equal(item.disposition,'manual-review-required');
 assert.equal(classifyTarget(target('Unable to determine controls target',['#menu'],'aria-valid-attr-value')).classification,'aria-relationship');
});
test('preserves source occurrence counts and exact target count',()=>{
 const original=[target('Element content contains only non-text characters',['[aria-hidden="true"]'],undefined,3),
  target('Background is partially obscured by another element',['#notes'],undefined,5)];
 const manifest={incompleteReviewTargets:original,incompleteByRule:[{id:'color-contrast',nodes:8}],
  incompleteNodes:8,incompleteChecks:2,uniqueIncompleteReviewTargets:2};
 const report=buildTriage(manifest);
 assert.equal(report.sourceOccurrences,8);
 assert.equal(report.targets[0].selector[0],'#notes');
 assert.equal(report.byCategory['non-text-symbol'].occurrences,3);
 assert.equal(report.byCategory['possible-obstruction'].occurrences,5);
});
test('rejects silent count changes and invalid selector input',()=>{
 const t=target('Background gradient');
 const m={incompleteReviewTargets:[t],incompleteByRule:[{nodes:2}],incompleteChecks:1,
  incompleteNodes:1,uniqueIncompleteReviewTargets:1};
 assert.throws(()=>buildTriage(m),/Lost\/invented/);
 assert.throws(()=>classifyTarget({...t,selector:[]}),/Invalid selector/);
});
