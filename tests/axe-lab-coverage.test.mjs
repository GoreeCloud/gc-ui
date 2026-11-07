import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildTriage} from '../scripts/triage-axe-incomplete.mjs';
import {buildLabCoverage,renderLabCoverage} from '../scripts/build-axe-lab-coverage.mjs';

const sha=x=>createHash('sha256').update(x).digest('hex');
function fixture(){
 const t={pagePath:'/lab/forms.html',rule:'color-contrast',selector:['#popup'],
  reason:'Element background partly obscured by another element',occurrences:2,
  scenarios:['forms','forms-search-suggestions']};
 const manifest={revision:'f'.repeat(40),expected:3,captured:3,incompleteChecks:2,
  incompleteNodes:2,uniqueIncompleteReviewTargets:1,
  incompleteByRule:[{id:'color-contrast',checks:2,nodes:2}],
  incompleteReviewTargets:[t],reports:[
   {scenario:'forms',pagePath:'/lab/forms.html',rulesPassed:25,incompleteChecks:1,
    incompleteNodes:1,sha256:'a'.repeat(64),semanticTreeCaptured:false,menuRelationshipCaptured:false},
   {scenario:'forms-search-suggestions',pagePath:'/lab/forms.html',rulesPassed:25,
    incompleteChecks:1,incompleteNodes:1,sha256:'b'.repeat(64),semanticTreeCaptured:false,menuRelationshipCaptured:false},
   {scenario:'catalog',pagePath:'/lab/catalog.html',rulesPassed:27,
    incompleteChecks:0,incompleteNodes:0,sha256:'c'.repeat(64),semanticTreeCaptured:false,menuRelationshipCaptured:false}
  ]};
 const raw=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
 const triage={...buildTriage(manifest),sourceManifestSha256:sha(raw)};
 return {manifest,raw,triage};
}

test('groups screens by lab without treating automation as human AT or completed WCAG review',()=>{
 const {manifest,raw,triage}=fixture();
 const result=buildLabCoverage(manifest,triage,raw);
 assert.equal(result.screenStates,3);
 assert.equal(result.labPages,2);
 assert.equal(result.incompleteOccurrences,2);
 assert.equal(result.distinctReviewTargets,1);
 const forms=result.pages.find(x=>x.pagePath==='/lab/forms.html');
 assert.equal(forms.screens.length,2);
 assert.equal(forms.incompleteChecks,2);
 assert.equal(forms.categories['possible-obstruction'].occurrences,2);
 assert.equal(forms.manualScreenReader,'not-established-by-axe-evidence');
 assert.equal(forms.manualReviewDisposition,'all-incomplete-cases-remain-open');
 const catalog=result.pages.find(x=>x.pagePath==='/lab/catalog.html');
 assert.equal(catalog.incompleteOccurrences,0);
 assert.match(catalog.manualReviewDisposition,/manual-evaluation-not-established/);
 assert.match(renderLabCoverage(result),/\| `\/lab\/forms\.html` \| 2 \| 2 \| 2 \| 1 \|/);
 assert.match(renderLabCoverage(result),/not confirmed violations/);
});

test('rejects stale source hash, altered triage or a silent manual waiver',()=>{
 const {manifest,raw,triage}=fixture();
 assert.throws(()=>buildLabCoverage(manifest,{...triage,sourceManifestSha256:'f'.repeat(64)},raw),/source hash/);
 assert.throws(()=>buildLabCoverage(manifest,{...triage,sourceOccurrences:1},raw),/Unverified or altered triage/);
 const changed=structuredClone(triage);changed.targets[0].disposition='waived';
 assert.throws(()=>buildLabCoverage(manifest,changed,raw),/Unverified or altered triage/);
});

test('rejects duplicate scenarios, incomplete screen sets and missing node occurrences',()=>{
 let {manifest,raw,triage}=fixture();
 manifest.reports[2].scenario='forms';
 raw=Buffer.from(JSON.stringify(manifest));
 triage.sourceManifestSha256=sha(raw);
 assert.throws(()=>buildLabCoverage(manifest,triage,raw),/Duplicate axe screen/);
 ({manifest,raw,triage}=fixture());
 manifest.expected=4;raw=Buffer.from(JSON.stringify(manifest));triage.sourceManifestSha256=sha(raw);
 assert.throws(()=>buildLabCoverage(manifest,triage,raw),/Not all expected screen states captured/);
 ({manifest,raw,triage}=fixture());
 manifest.reports[0].incompleteNodes=0;raw=Buffer.from(JSON.stringify(manifest));triage.sourceManifestSha256=sha(raw);
 assert.throws(()=>buildLabCoverage(manifest,triage,raw),/Lost incomplete node occurrences/);
});

test('rejects target pages, scenarios and source manifest mutation',()=>{
 let {manifest,raw,triage}=fixture();
 const bad=structuredClone(triage);bad.targets[0].scenarios=['catalog'];
 assert.throws(()=>buildLabCoverage(manifest,bad,raw),/Unverified or altered triage/);
 manifest.pagePath='https://unauthorized.example';
 assert.throws(()=>buildLabCoverage(manifest,triage,raw),/Manifest content differs/);
});
