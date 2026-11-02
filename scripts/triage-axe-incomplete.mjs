/** Source-derived, fail-closed prioritization of axe incompletes; never a waiver. */
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolvePlaywrightIsolation} from './playwright-isolation-config.mjs';
import {expectedAxeScenarios,verifyAxeEvidence} from './axe-evidence.mjs';

export function classifyTarget(target) {
 assert.ok(target&&typeof target==='object','Expected source target');
 assert.ok(typeof target.rule==='string'&&target.rule,'Missing rule ID');
 assert.ok(Array.isArray(target.selector)&&target.selector.length>0&&
  target.selector.every(value=>typeof value==='string'&&value),'Invalid selector');
 assert.ok(Number.isSafeInteger(target.occurrences)&&target.occurrences>0,'Invalid occurrence count');
 assert.ok(Array.isArray(target.scenarios)&&target.scenarios.length>0,'Missing scenarios');
 const reason=target.reason||'';
 assert.equal(typeof reason,'string','Invalid reason');
 let classification,priority;
 if(target.rule==='aria-valid-attr-value'){
  classification='aria-relationship';priority=2;
 }else if(target.rule==='color-contrast'){
  if(/overlap|obscur/i.test(reason)){
   classification='possible-obstruction';priority=1;
  }else if(/non-text characters/i.test(reason)){
   classification='non-text-symbol';priority=4;
  }else if(/gradient|background|image|transparen|opacity/i.test(reason)){
   classification='composited-background';priority=2;
  }else{
   classification='unresolved-text-or-control';priority=2;
  }
 }else{
  classification='unclassified-rule';priority=2;
 }
 return {...target,classification,priority,
  // aria-hidden in a CSS selector is only a hint; it never waives contrast.
  decorativeHint:target.selector.some(s=>s.includes('aria-hidden')),
  disposition:'manual-review-required'};
}

export function buildTriage(manifest) {
 assert.ok(manifest&&typeof manifest==='object','Expected verified axe manifest');
 const original=manifest.incompleteReviewTargets;
 assert.ok(Array.isArray(original),'Missing incomplete review targets');
 const counts=manifest.incompleteByRule;
 assert.ok(Array.isArray(counts),'Missing rule count inventory');
 const targets=original.map(classifyTarget).sort((a,b)=>
  a.priority-b.priority||b.occurrences-a.occurrences||
  a.pagePath.localeCompare(b.pagePath)||JSON.stringify(a.selector).localeCompare(JSON.stringify(b.selector)));
 assert.ok(targets.every(t=>typeof t.pagePath==='string'&&t.pagePath.startsWith('/lab/')),
  'Invalid review page');
 const total=targets.reduce((n,t)=>n+t.occurrences,0);
 assert.equal(total,manifest.incompleteNodes,'Lost/invented axe node occurrences');
 assert.equal(targets.length,manifest.uniqueIncompleteReviewTargets,'Lost/invented unique review target');
 assert.equal(counts.reduce((n,r)=>n+r.nodes,0),total,'Rule counts disagree');
 const byCategory={};
 for(const t of targets){
  const item=byCategory[t.classification]??{uniqueTargets:0,occurrences:0};
  item.uniqueTargets++;item.occurrences+=t.occurrences;
  byCategory[t.classification]=item;
 }
 return {
  schema:'gc-ui-axe-manual-triage.v1',
  revision:manifest.revision??null,
  sourceChecks:manifest.incompleteChecks,
  sourceOccurrences:total,
  uniqueTargets:targets.length,
  byCategory,
  disposition:'All cases remain inconclusive pending independent manual or targeted checks.',
  constraints:'Priorities are review order, not accessibility conformance, violation severity or automatic waivers.',
  targets
 };
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const base=resolve(resolvePlaywrightIsolation(process.env).outputDir);
 const source=join(base,'accessibility-review','manifest.json');
 const scenarioSource=readFileSync(new URL('../e2e/accessibility.spec.mjs',import.meta.url),'utf8');
 const names=expectedAxeScenarios(scenarioSource);
 await verifyAxeEvidence(join(base,'accessibility-review'),names,{revision:process.env.GITHUB_SHA??null});
 const raw=await readFile(source);
 const document=JSON.parse(raw.toString('utf8'));
 const triage=buildTriage(document);
 const out=resolve('dist','qa','accessibility-triage');
 await mkdir(out,{recursive:true});
 await writeFile(join(out,'manual-review.json'),JSON.stringify({
  ...triage,sourceManifestSha256:createHash('sha256').update(raw).digest('hex')
 },null,2)+'\n');
 console.log('PASS axe triage: '+triage.sourceOccurrences+' incomplete node occurrences, '+
  triage.uniqueTargets+' distinct review targets; all remain open.');
 console.log(JSON.stringify(triage.byCategory));
}
