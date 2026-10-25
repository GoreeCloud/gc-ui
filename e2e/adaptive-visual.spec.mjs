import {test,expect} from '@playwright/test';
import {retainVisualEvidence} from '../scripts/retain-visual-evidence.mjs';

/** Independent viewport captures: evidence only, not pixel-diff signoff. */
for(const viewport of [
 {name:'compact',width:375,height:812},
 {name:'compact-320',width:320,height:740},
 {name:'compact-dark',width:375,height:812,appearance:'dark'},
 {name:'medium',width:840,height:900},
 {name:'expanded',width:1440,height:900}
]){
 test('capture adaptive shell '+viewport.name,async({page},testInfo)=>{
   await page.setViewportSize({width:viewport.width,height:viewport.height});
   await page.goto('/lab/adaptive.html');
   if(viewport.appearance==='dark'){
     await page.getByRole('button',{name:'Switch to dark appearance'}).click();
     await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
   }
   await expect(page.locator('#page-title')).toBeVisible();
   await page.evaluate(()=>document.fonts?.ready);
   const png=await page.screenshot({fullPage:true,animations:'disabled'});
   await retainVisualEvidence(testInfo,'adaptive-'+viewport.name,png);
 });
}
