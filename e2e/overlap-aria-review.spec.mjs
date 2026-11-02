import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';

// Direct geometry, hit-testing and role snapshots at axe's difficult overlap states.
// Evidence is not a substitute for sampled pixel contrast or screen-reader speech.
const sample = async page => page.evaluate(() => {
 const popup = document.querySelector('#project-suggestions:not([hidden]),#gc-file-actions:not([hidden])');
 if (!popup) return {popupFound:false};
 const nodes = [...popup.querySelectorAll('[role="option"],[role="menuitem"]')];
 const parent = popup.getBoundingClientRect();
 const samples = nodes.map(node => {
  const rect=node.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2;
  const stack=document.elementsFromPoint(x,y);
  const css=getComputedStyle(node),surface=getComputedStyle(popup);
  return {role:node.getAttribute('role'),name:node.textContent.trim(),disabled:node.getAttribute('aria-disabled'),
   rect:{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom},
   hitInsidePopup:stack[0]===popup || popup.contains(stack[0]),
   stack:stack.slice(0,5).map(el=>({tag:el.tagName,id:el.id||null,role:el.getAttribute('role')})),
   color:css.color,background:css.backgroundColor,surfaceBackground:surface.backgroundColor};
 });
 return {popupFound:true,viewport:{width:innerWidth,height:innerHeight},
  popupRect:{left:parent.left,right:parent.right,top:parent.top,bottom:parent.bottom},
  samples};
});
const write = async (testInfo,name,result,page) => {
 const dir=resolve(testInfo.outputDir,'overlap-review');
 await mkdir(dir,{recursive:true});
 const file=join(dir,name+'.json');
 await writeFile(file,JSON.stringify(result,null,2)+'\n');
 await testInfo.attach(name+'.json',{path:file,contentType:'application/json'});
 await testInfo.attach(name+'.png',{body:await page.screenshot({animations:'disabled'}),contentType:'image/png'});
};
for (const variant of [
 {id:'light-375',width:375,dark:false,rtl:false},
 {id:'dark-375',width:375,dark:true,rtl:false},
 {id:'rtl-320',width:320,dark:false,rtl:true}
]) {
 test('Forms autocomplete overlap and ARIA — '+variant.id,async({page},testInfo)=>{
  await page.setViewportSize({width:variant.width,height:812});
  await page.goto('/lab/forms.html');
  if(variant.rtl)await page.evaluate(()=>document.documentElement.dir='rtl');
  if(variant.dark)await page.evaluate(()=>document.documentElement.setAttribute('data-gc-mode','dark'));
  const input=page.getByRole('combobox',{name:'Search projects'});
  await input.fill('d');
  await expect(page.locator('#project-suggestions')).toBeVisible();
  await page.locator('#project-suggestions').scrollIntoViewIfNeeded();
  await expect(input).toHaveAttribute('aria-controls','project-suggestions');
  await expect(input).toHaveAttribute('aria-expanded','true');
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant','project-suggestion-0');
  const result=await sample(page);
  expect(result.popupFound).toBe(true);
  expect(result.samples).toHaveLength(3);
  for(const item of result.samples) {
   expect(item.hitInsidePopup,'Obstructed autocomplete option: '+item.name).toBe(true);
   expect(item.rect.left).toBeGreaterThanOrEqual(0);
   expect(item.rect.right).toBeLessThanOrEqual(variant.width+1);
  }
  const tree=await input.ariaSnapshot();
  expect(tree).toContain('Search projects');
  await write(testInfo,'forms-'+variant.id,{variant,tree,geometry:result,
   limitations:'Hit-testing and browser-computed styles; no human screen reader or composited pixel contrast claim.'},page);
  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded','false');
 });
}
for(const variant of [
 {id:'light-375',width:375,dark:false,forced:false,rtl:false},
 {id:'dark-375',width:375,dark:true,forced:false,rtl:false},
 {id:'forced-375',width:375,dark:false,forced:true,rtl:false},
 {id:'rtl-320',width:320,dark:false,forced:false,rtl:true}
]){
 test('Components action menu overlap and ARIA — '+variant.id,async({page},testInfo)=>{
  await page.setViewportSize({width:variant.width,height:812});
  if(variant.forced)await page.emulateMedia({forcedColors:'active'});
  await page.goto('/lab/components.html');
  if(variant.rtl)await page.evaluate(()=>document.documentElement.dir='rtl');
  if(variant.dark)await page.locator('[data-theme-mode="dark"]').click();
  const trigger=page.locator('#gc-file-action-trigger');
  await trigger.focus();
  await trigger.press('ArrowDown');
  await expect(trigger).toHaveAttribute('aria-expanded','true');
  await expect(trigger).toHaveAttribute('aria-controls','gc-file-actions');
  const menu=page.getByRole('menu',{name:'Workspace actions'});
  await expect(menu).toBeVisible();
  await menu.scrollIntoViewIfNeeded();
  await expect(menu.getByRole('menuitem',{name:'Duplicate workspace'})).toBeFocused();
  const result=await sample(page);
  expect(result.popupFound).toBe(true);
  expect(result.samples).toHaveLength(4);
  for(const item of result.samples){
   expect(item.hitInsidePopup,'Obstructed menu command: '+item.name).toBe(true);
   expect(item.rect.left).toBeGreaterThanOrEqual(0);
   expect(item.rect.right).toBeLessThanOrEqual(variant.width+1);
  }
  const tree={trigger:await trigger.ariaSnapshot(),menu:await menu.ariaSnapshot()};
  expect(tree.menu).toContain('Duplicate workspace');
  expect(tree.menu).toContain('Archive (unavailable)');
  await write(testInfo,'menu-'+variant.id,{variant,tree,geometry:result,
   limitations:'Hit-test and browser ARIA tree corroboration, not actual speech output, universal contrast or WCAG certification.'},page);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded','false');
 });
}
