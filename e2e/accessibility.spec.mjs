import {test,expect} from '@playwright/test';
import {resolve} from 'node:path';
import {retainAxeEvidence} from '../scripts/axe-evidence.mjs';

/**
 * Automated WCAG A/AA screen, NOT a certification. Preserve inconclusive checks
 * as machine-readable attachments for manual accessibility review.
 */
const axePath=resolve('node_modules/axe-core/axe.min.js');
const tags=['wcag2a','wcag2aa','wcag21a','wcag21aa'];
const format=entry=>({
 id:entry.id,impact:entry.impact,help:entry.help,
 nodes:entry.nodes.map(node=>({target:node.target,summary:node.failureSummary}))
});
/** A browser-computed ARIA snapshot, not a physical screen-reader transcript. */
async function menuSemanticEvidence(page){
 const trigger=page.locator('#gc-file-action-trigger');
 const menu=page.getByRole('menu',{name:/Workspace actions/});
 await expect(trigger).toHaveAttribute('aria-haspopup','menu');
 await expect(trigger).toHaveAttribute('aria-controls','gc-file-actions');
 await expect(trigger).toHaveAttribute('aria-expanded','true');
 await expect(menu).toHaveAttribute('aria-labelledby','gc-file-action-trigger');
 await expect(menu).toBeVisible();
 await expect(menu.getByRole('menuitem',{name:'Duplicate workspace'})).toBeFocused();
 await expect(menu.getByRole('menuitem',{name:/Archive \(unavailable\)/})).toHaveAttribute('aria-disabled','true');
 const triggerTree=await trigger.ariaSnapshot();
 const menuTree=await menu.ariaSnapshot();
 if(!triggerTree.includes('Workspace actions')||
    !menuTree.includes('Duplicate workspace')||
    !menuTree.includes('Archive (unavailable)'))
  throw new Error('Menu accessibility tree evidence incomplete');
 return {engine:'Playwright browser-computed ARIA snapshot; not assistive-technology speech',
  triggerTree,menuTree,expanded:true,focusedItem:'Duplicate workspace'};
}
async function audit(page,testInfo,label){
 await page.addScriptTag({path:axePath});
 const results=await page.evaluate(async values=>
  await window.axe.run(document,{runOnly:{type:'tag',values}})
 ,tags);
 const menuEvidence=label.startsWith('components-menu-open')?await menuSemanticEvidence(page):null;
 await retainAxeEvidence(testInfo,{
  scenario:label,violations:results.violations.map(format),
  incomplete:results.incomplete.map(format),rulesPassed:results.passes.length,
  ...(menuEvidence?{semanticEvidence:menuEvidence}:{}),
  note:'Incomplete checks and browser accessibility trees require manual review; not WCAG certification.'
 });
 expect(results.violations.map(result=>
  result.id+': '+result.nodes.map(node=>node.target.join(' ')).join(', ')
 ),'Confirmed accessibility violations for '+label).toEqual([]);
}
for(const name of ['v1','components','catalog','adaptive','forms','environment','icon-atlas','pattern-workbench','motion-gallery','experience-studio']){
 test('axe WCAG A/AA baseline — '+name,async({page},testInfo)=>{
  await page.goto('/lab/'+name+'.html');
  await audit(page,testInfo,name);
 });
}
const states=[

 {name:'components-forced-colors',page:'components',width:375,setup:async page=>{
  await page.emulateMedia({forcedColors:'active'});
  await expect.poll(()=>page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);
 }},
 {name:'adaptive-forced-colors-compact',page:'adaptive',width:320,setup:async page=>{
  await page.emulateMedia({forcedColors:'active'});
  await expect(page.locator('.gc-nav-bottom')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);
 }},
 {name:'environment-forced-colors',page:'environment',width:375,setup:async page=>{
  await page.emulateMedia({forcedColors:'active'});
  await page.locator('#context').selectOption('reading');
  await expect.poll(()=>page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);
 }},
 {name:'experience-studio-reduced-motion',page:'experience-studio',width:375,setup:async page=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
 }},

 {name:'experience-studio-conserve',page:'experience-studio',width:375,setup:async page=>{
  await page.locator('#conserve').check();
  await expect(page.locator('html')).toHaveAttribute('data-gc-resource-mode','conserve');
 }},
 {name:'environment-reading-dark',page:'environment',width:320,setup:async page=>{
  await page.locator('#context').selectOption('reading');
  await page.getByRole('button',{name:'Switch to dark appearance'}).click();
 }},
 {name:'forms-retry-alert',page:'forms',width:375,setup:async page=>{
  await page.locator('#simulate-failure').click();
  await expect(page.locator('#recovery-error')).toBeVisible();
 }},
 {name:'forms-revealed-passphrase',page:'forms',width:375,setup:async page=>{
  await page.locator('#demo-passphrase').fill('invented-example');
  await page.locator('#passphrase-reveal').click();
  await expect(page.locator('#demo-passphrase')).toHaveAttribute('type','text');
 }},
 {name:'forms-invalid-summary',page:'forms',width:375,setup:async page=>{
  await page.getByRole('button',{name:'Create brief'}).click();
  await expect(page.locator('#brief-errors')).toBeVisible();
 }},
 {name:'forms-search-suggestions',page:'forms',width:375,setup:async page=>{
  await page.locator('#project-search').fill('d');
  await expect(page.locator('#project-suggestions')).toBeVisible();
 }},
 {name:'adaptive-sheet-open',page:'adaptive',width:375,setup:async page=>{
  await page.locator('#open-details').click();
  await expect(page.locator('#details-sheet')).toBeVisible();
 }},
 {name:'adaptive-mobile-dark',page:'adaptive',width:320,setup:async page=>{
  await page.getByRole('button',{name:'Switch to dark appearance'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
 }},
 {name:'adaptive-mobile-rtl',page:'adaptive',width:375,setup:async page=>{
  await page.evaluate(()=>document.documentElement.dir='rtl');
  await page.locator('.gc-nav-bottom [data-gc-route="activity"]').click();
 }},
 {name:'components-menu-open',page:'components',width:375,setup:async page=>{
  const trigger=page.locator('#gc-file-action-trigger');
  await trigger.focus();
  await trigger.press('ArrowDown');
  await expect(page.getByRole('menuitem',{name:'Duplicate workspace'})).toBeFocused();
 }},
 {name:'components-menu-open-forced-colors',page:'components',width:375,setup:async page=>{
  await page.emulateMedia({forcedColors:'active'});
  await expect.poll(()=>page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);
  const trigger=page.locator('#gc-file-action-trigger');
  await trigger.focus();
  await trigger.press('ArrowDown');
  await expect(page.getByRole('menuitem',{name:'Duplicate workspace'})).toBeFocused();
 }},
 {name:'components-high-contrast-dark',page:'components',width:375,setup:async page=>{
  await page.locator('[data-theme-mode="dark"]').click();
  await page.locator('label:has(#contrast-switch)').click();
  await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','high');
 }},
 {name:'foundations-dark',page:'v1',width:375,setup:async page=>{
  await page.locator('[data-mode="dark"]').click();
 }}
];
for(const state of states){
 test('axe WCAG A/AA interactive — '+state.name,async({page},testInfo)=>{
  await page.setViewportSize({width:state.width,height:812});
  await page.goto('/lab/'+state.page+'.html');
  await state.setup(page);
  await audit(page,testInfo,state.name);
 });
}
