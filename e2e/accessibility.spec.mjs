import {test,expect} from '@playwright/test';
import {resolve} from 'node:path';

/**
 * WCAG A/AA automated smoke screen, NOT conformance certification.
 * Incomplete checks are attached for manual review, never silently counted as passes.
 * Pinned axe-core is installed independently in browser CI (not a runtime dependency).
 */
const axePath=resolve('node_modules/axe-core/axe.min.js');
const tags=['wcag2a','wcag2aa','wcag21a','wcag21aa'];
for(const name of ['v1','components','catalog','adaptive']){
 test('axe WCAG A/AA smoke — '+name,async({page},testInfo)=>{
  await page.goto('/lab/'+name+'.html');
  await page.addScriptTag({path:axePath});
  const results=await page.evaluate(async tags=>
    await window.axe.run(document,{runOnly:{type:'tag',values:tags}})
  ,tags);
  const format=entry=>({
   id:entry.id,impact:entry.impact,help:entry.help,
   nodes:entry.nodes.map(node=>({target:node.target,summary:node.failureSummary}))
  });
  await testInfo.attach('axe-'+name+'-review.json',{
   body:Buffer.from(JSON.stringify({
    lab:name,violations:results.violations.map(format),
    incomplete:results.incomplete.map(format),
    rulesPassed:results.passes.length,
    note:'Incomplete checks require manual review; a green test is not WCAG certification.'
   },null,2)),
   contentType:'application/json'
  });
  const failures=results.violations.map(result=>
   result.id+': '+result.nodes.map(node=>node.target.join(' ')).join(', ')
  );
  expect(failures,'Confirmed accessibility violations for '+name).toEqual([]);
 });
}
