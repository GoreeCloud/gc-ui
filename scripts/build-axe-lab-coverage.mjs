/** Fail-closed, read-only-by-source axe screening coverage by local lab page.
 * Never promotes automation to a manual AT or WCAG conformance verdict.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildTriage} from './triage-axe-incomplete.mjs';
import {expectedAxeScenarios} from './axe-evidence.mjs';
import {resolvePlaywrightIsolation} from './playwright-isolation-config.mjs';

const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const safePage=/^\/lab\/[a-z0-9-]+\.html$/;
const safeScenario=/^[a-z0-9][a-z0-9-]{0,79}$/;
const manual='not-established-by-axe-evidence';

export function buildLabCoverage(manifest,triage,manifestBytes){
 assert.ok(manifest&&typeof manifest==='object','Missing axe evidence manifest');
 assert.ok(triage&&typeof triage==='object','Missing source triage');
 assert.ok(Buffer.isBuffer(manifestBytes),'Expected raw manifest bytes');
 assert.equal(triage.sourceManifestSha256,sha256(manifestBytes),
  'Triage source hash must match exact manifest bytes');
 assert.deepEqual(JSON.parse(manifestBytes.toString('utf8')),manifest,
  'Manifest content differs from the bytes verified by triage');
 assert.equal(triage.revision,manifest.revision,'Different triage and manifest revisions');
 assert.ok(Array.isArray(manifest.reports)&&manifest.reports.length>0,'No axe scenario reports');
 assert.equal(manifest.captured,manifest.reports.length,'Screen inventory incomplete');
 assert.equal(manifest.expected,manifest.captured,'Not all expected screen states captured');
 const recomputed=buildTriage(manifest);
 for(const prop of ['sourceChecks','sourceOccurrences','uniqueTargets','byCategory','targets'])
  assert.deepEqual(triage[prop],recomputed[prop],`Unverified or altered triage ${prop}`);

 const byPage=new Map(),seen=new Set();
 for(const report of manifest.reports){
  assert.ok(safeScenario.test(report.scenario??''),'Invalid scenario ID');
  assert.ok(!seen.has(report.scenario),'Duplicate axe screen: '+report.scenario);
  seen.add(report.scenario);
  assert.ok(safePage.test(report.pagePath??''),'Invalid local page path');
  for(const prop of ['rulesPassed','incompleteChecks','incompleteNodes'])
   assert.ok(Number.isSafeInteger(report[prop])&&report[prop]>=0,'Invalid '+prop+' for '+report.scenario);
  assert.match(report.sha256??'',/^[a-f0-9]{64}$/,'Missing report digest');
  const page=byPage.get(report.pagePath)??{
   pagePath:report.pagePath,screens:[],incompleteChecks:0,incompleteOccurrences:0,
   distinctReviewTargets:0,categories:{},
   automatedScreening:'executed-no-reported-violations-in-verified-source',
   manualScreenReader:manual,realDevice:manual,translatedRTL:manual,
   zoomAndReflow:manual,keyboardAndFocus:manual
  };
  page.screens.push({scenario:report.scenario,rulesPassed:report.rulesPassed,
   incompleteChecks:report.incompleteChecks,incompleteOccurrences:report.incompleteNodes,
   semanticTreeCaptured:report.semanticTreeCaptured===true,
   menuRelationshipCaptured:report.menuRelationshipCaptured===true,
   reportSha256:report.sha256});
  page.incompleteChecks+=report.incompleteChecks;
  page.incompleteOccurrences+=report.incompleteNodes;
  byPage.set(report.pagePath,page);
 }
 assert.equal([...byPage.values()].reduce((v,p)=>v+p.incompleteChecks,0),
  manifest.incompleteChecks,'Lost incomplete rule checks');
 assert.equal([...byPage.values()].reduce((v,p)=>v+p.incompleteOccurrences,0),
  manifest.incompleteNodes,'Lost incomplete node occurrences');

 for(const target of triage.targets){
  const page=byPage.get(target.pagePath);
  assert.ok(page,'Unrepresented lab in triage: '+target.pagePath);
  assert.ok(Array.isArray(target.scenarios)&&target.scenarios.length,'Unscoped triage target');
  assert.ok(target.scenarios.every(s=>page.screens.some(x=>x.scenario===s)),
   'Triage target references a different page or missing scenario');
  assert.equal(target.disposition,'manual-review-required','Never auto-waive an axe incomplete');
  page.distinctReviewTargets++;
  const category=page.categories[target.classification]??{uniqueTargets:0,occurrences:0};
  category.uniqueTargets++;
  category.occurrences+=target.occurrences;
  page.categories[target.classification]=category;
 }
 for(const page of byPage.values()){
  assert.equal(Object.values(page.categories).reduce((n,q)=>n+q.occurrences,0),
   page.incompleteOccurrences,'Unattributed axe occurrences on '+page.pagePath);
  page.screens.sort((a,b)=>a.scenario.localeCompare(b.scenario));
  page.manualReviewDisposition=page.incompleteOccurrences>0?
   'all-incomplete-cases-remain-open':'no-incomplete-cases-in-screening-manual-evaluation-not-established';
 }
 return {
  schema:'gc-ui-axe-lab-coverage.v1',revision:manifest.revision??null,
  manifestSha256:sha256(manifestBytes),triageCanonicalJsonSha256:sha256(Buffer.from(JSON.stringify(triage))),
  screenStates:manifest.captured,labPages:byPage.size,
  incompleteChecks:manifest.incompleteChecks,incompleteOccurrences:manifest.incompleteNodes,
  distinctReviewTargets:triage.uniqueTargets,
  interpretation:'Source-verified zero-reported-violation axe screening with unresolved incompletes. Not complete WCAG, manual AT, translated content, keyboard or device certification.',
  pages:[...byPage.values()].sort((a,b)=>a.pagePath.localeCompare(b.pagePath))
 };
}

export function renderLabCoverage(matrix){
 assert.equal(matrix.schema,'gc-ui-axe-lab-coverage.v1');
 const lines=[
  '# GC UI — axe accessibility screening by lab (generated; NOT human acceptance)',
  '',`Source revision: \`${matrix.revision??'not recorded'}\`. Retained screening: **${matrix.screenStates} states / ${matrix.labPages} lab pages**, **${matrix.incompleteChecks} incomplete rule checks / ${matrix.incompleteOccurrences} occurrences / ${matrix.distinctReviewTargets} distinct review targets**.`,
  '',`Manifest SHA-256: \`${matrix.manifestSha256}\`.`,
  '', '| Lab (local path) | Screen states | Incomplete checks | Occurrences | Distinct review targets | Interpretation |',
  '| --- | ---: | ---: | ---: | ---: | --- |'
 ];
 for(const p of matrix.pages)lines.push(`| \`${p.pagePath}\` | ${p.screens.length} | ${p.incompleteChecks} | ${p.incompleteOccurrences} | ${p.distinctReviewTargets} | ${p.manualReviewDisposition} |`);
 lines.push('','## Boundaries','',
  '- The raw 27-screen A/AA axe reports and source triage remain authoritative. Every inconclusive item retains `manual-review-required` and its original selector/scenario provenance. Counts are **not confirmed violations**.',
  '- A page with zero incompletes is **not** proved accessible. This matrix does not evaluate speech output, native OS UI, keyboard focus, zoom, true localized RTL, all contrast states, or human visual quality.',
  '- Previously recorded owner-reported manual AT outcomes in separate dated documents are not overwritten or declared absent by this narrow report.',
  '- Screen-state, manual AT, and platform/consumer support claims require independent original evidence and owner-reviewed acceptance.');
 return lines.join('\n')+'\n';
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const output=resolve(resolvePlaywrightIsolation(process.env).outputDir);
 const manifestRaw=await readFile(join(output,'accessibility-review','manifest.json'));
 const manifest=JSON.parse(manifestRaw.toString('utf8'));
 const triage=JSON.parse(await readFile(resolve('dist/qa/accessibility-triage/manual-review.json'),'utf8'));
 const expected=expectedAxeScenarios(readFileSync(new URL('../e2e/accessibility.spec.mjs',import.meta.url),'utf8'));
 assert.deepEqual(new Set(manifest.reports.map(r=>r.scenario)),new Set(expected),
  'Axe matrix must use the exact executable inventory');
 const matrix=buildLabCoverage(manifest,triage,manifestRaw);
 const dir=resolve('dist/qa/accessibility-coverage');
 await mkdir(dir,{recursive:true});
 await writeFile(join(dir,'lab-matrix.json'),JSON.stringify(matrix,null,2)+'\n');
 await writeFile(join(dir,'lab-matrix.md'),renderLabCoverage(matrix));
 console.log(`PASS ${matrix.screenStates} source-verified axe screens / ${matrix.labPages} lab pages; ${matrix.incompleteOccurrences} occurrences remain inconclusive.`);
}
