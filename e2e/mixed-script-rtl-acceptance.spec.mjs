import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';

/** Synthetic bilingual fixture: tests the runtime layout, not product translation.
 * Actual localization and native-language screen-reader approval remain separate.
 */
const layouts=[
 {width:320,height:812,nav:'bottom'},
 {width:375,height:812,nav:'bottom'},
 {width:768,height:900,nav:'rail'},
 {width:1440,height:900,nav:'sidebar'}
];
const translations={
 overview:'نظرة عامة · GC UI',
 activity:'النشاط · GC UI 2026',
 library:'المكتبة · GC UI',
 title:'النشاط في GC UI 2026.',
 lead:'تحديثات الفريق في GC UI 2026 — مراجعة التصميم والمشاريع.',
 content:'العمل اليوم · v2.0',
 crumb:'النشاط · GC UI',
 menu:'النشاط · GC UI 2026'
};
const navSelectors={bottom:'.gc-bottom-link',rail:'.gc-rail-link',sidebar:'.gc-nav-link'};
async function capture(page,testInfo,id){
 const folder=resolve(testInfo.project.outputDir,'mixed-script-rtl');
 await mkdir(folder,{recursive:true});
 const file=join(folder,id+'.png');
 await writeFile(file,await page.screenshot({fullPage:true,animations:'disabled'}));
 await testInfo.attach(id+'.png',{path:file,contentType:'image/png'});
}

const visibleTextHit=async element=>element.evaluate(node=>{
 const r=node.getBoundingClientRect();
 const x=Math.max(0,Math.min(innerWidth-1,r.left+r.width/2));
 const y=Math.max(0,Math.min(innerHeight-1,r.top+r.height/2));
 const top=document.elementFromPoint(x,y);
 return {hit:top===node||node.contains(top),left:r.left,right:r.right,width:innerWidth};
});
for(const layout of layouts){
 test('Adaptive mixed-script RTL route and focus '+layout.width,async({page},testInfo)=>{
  await page.setViewportSize({width:layout.width,height:layout.height});
  await page.goto('/lab/adaptive.html');
  await page.evaluate(copy=>{
   document.documentElement.dir='rtl';
   document.documentElement.lang='ar';
   for(const link of document.querySelectorAll('[data-gc-route]')){
    const value=copy[link.dataset.gcRoute];
    const visible=link.querySelector(':scope > span:last-child');
    if(visible&&visible.getAttribute('aria-hidden')!=='true')visible.textContent=value;
    else{
     const text=[...link.childNodes].find(node=>node.nodeType===Node.TEXT_NODE);
     if(!text)throw new Error('Navigation link has no text fallback');
     text.textContent=value;
    }
   }
  },translations);
  const target=page.locator(navSelectors[layout.nav]+'[data-gc-route="activity"]');
  await expect(target).toBeVisible();
  // Exercise keyboard activation on the actually visible translated navigation.
  await target.focus();
  await expect(target).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(target).toHaveAttribute('aria-current','page');
  await expect(page.locator('#page-title')).toBeFocused();
  await page.evaluate(copy=>{
   for(const [selector,key] of [
    ['#page-title > bdi','title'],['#page-subtitle > bdi','lead'],
    ['#content-title > bdi','content'],['#crumb-current > bdi','crumb']
   ]){
    const el=document.querySelector(selector);
    if(!el)throw new Error('Missing isolated '+selector);
    el.textContent=copy[key];
   }
  },translations);
  for(const [selector,key] of [
   ['#page-title > bdi','title'],['#page-subtitle > bdi','lead'],
   ['#content-title > bdi','content'],['#crumb-current > bdi','crumb']
  ]){
   const el=page.locator(selector);
   await expect(el).toHaveText(translations[key]);
   await expect(el).toHaveAttribute('dir','auto');
   await expect(el).toHaveCSS('direction','rtl');
   const position=await el.boundingBox();
   expect(position?.width??0).toBeGreaterThan(8);
   expect(position.x,selector+' clipped to left').toBeGreaterThanOrEqual(-2);
   expect(position.x+position.width,selector+' clipped to right').toBeLessThanOrEqual(layout.width+2);
  }
  await expect(target).toContainText(translations.activity);
  const hit=await visibleTextHit(target);
  expect(hit.hit,'Translated navigation target is clickable').toBe(true);
  expect(hit.left).toBeGreaterThanOrEqual(-2);
  expect(hit.right).toBeLessThanOrEqual(layout.width+2);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow,'RTL mixed-script horizontal overflow').toBeLessThanOrEqual(2);
  await expect(page.locator('#route-announcement')).toContainText('Your activity.');
  await capture(page,testInfo,'adaptive-'+layout.width);
  // Repeated keyboard navigation must restore heading focus and current route.
  const library=page.locator(navSelectors[layout.nav]+'[data-gc-route="library"]');
  await library.focus();
  await expect(library).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(library).toHaveAttribute('aria-current','page');
  await expect(page.locator('#page-title')).toBeFocused();
  await expect(target).not.toHaveAttribute('aria-current','page');
  await expect(page.locator('#route-announcement')).toContainText('Your library.');
 });
 test('Forms mixed-script RTL validation recovery '+layout.width,async({page},testInfo)=>{
  await page.setViewportSize({width:layout.width,height:layout.height});
  await page.goto('/lab/forms.html');
  await page.evaluate(()=>{
   document.documentElement.dir='rtl';
   document.documentElement.lang='ar';
   document.querySelector('.gc-form-intro h1 > bdi').textContent='تفاصيل المشروع في GC UI 2026.';
   const labels=['اسم المشروع · GC UI','البريد الإلكتروني · contact@example.com','ملاحظات المشروع · v2.0'];
   document.querySelectorAll('#brief-form .gc-field-label').forEach((el,index)=>{
    const text=[...el.childNodes].find(node=>node.nodeType===Node.TEXT_NODE);
    if(text&&index<labels.length)text.textContent=labels[index]+' ';
   });
  });
  await expect(page.locator('.gc-form-intro h1 > bdi')).toHaveCSS('direction','rtl');
  const submit=page.getByRole('button',{name:'Check brief'});
  await submit.focus();
  await expect(submit).toBeFocused();
  await page.keyboard.press('Enter');
  const summary=page.locator('#brief-errors');
  await expect(summary).toBeFocused();
  const links=summary.locator('#brief-errors-list a');
  await expect(links).toHaveCount(3);
  await links.nth(0).evaluate(el=>{el.textContent='اسم المشروع · GC UI 2026';});
  await links.nth(1).evaluate(el=>{el.textContent='البريد الإلكتروني · user@example.com';});
  await links.nth(2).evaluate(el=>{el.textContent='الملاحظات · v2.0';});
  for(const link of await links.all()){
   await link.scrollIntoViewIfNeeded();
   const hit=await link.evaluate(el=>{
    const range=document.createRange();range.selectNodeContents(el);
    return [...range.getClientRects()].some(r=>{
     const x=r.left+r.width/2,y=r.top+r.height/2;
     const top=document.elementFromPoint(x,y);
     return top===el||el.contains(top);
    });
   });
   expect(hit,'Bilingual wrapped error link unobstructed').toBe(true);
  }
  await capture(page,testInfo,'forms-errors-'+layout.width);
  await links.first().focus();
  await expect(links.first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#brief-name')).toBeFocused();
  await page.locator('#brief-name').fill('مشروع واجهة GC UI 2026');
  await page.locator('#brief-email').fill('team+rtl@example.org');
  // Email identifiers keep their LTR token order inside an otherwise RTL form.
  await expect(page.locator('#brief-email')).toHaveAttribute('dir','ltr');
  await expect(page.locator('#brief-email')).toHaveCSS('direction','ltr');
  await page.locator('#brief-notes').fill('مراجعة مشروع واجهة عربية وإنجليزية في GC UI 2026.');
  await expect(summary).toBeHidden();
  await submit.click();
  await expect(page.locator('#brief-success')).toBeVisible();
  await expect(page.locator('#brief-success')).toContainText('No data has been submitted or saved.');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow,'RTL error summary horizontal overflow').toBeLessThanOrEqual(2);
  await capture(page,testInfo,'forms-valid-'+layout.width);
 });
}
