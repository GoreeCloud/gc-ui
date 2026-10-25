import {test,expect} from '@playwright/test';
import {captureFullPageVisualEvidence} from '../scripts/retain-visual-evidence.mjs';

/** Evidence captures run separately from interaction tests to avoid competing render workloads. */
const scenarios=[
 {name:'desktop-light',width:1440,height:900,appearance:'light',high:false},
 {name:'desktop-dark',width:1440,height:900,appearance:'dark',high:false},
 {name:'desktop-high-contrast',width:1440,height:900,appearance:'dark',high:true},
 {name:'mobile-light',width:375,height:812,appearance:'light',high:false}
];
for(const scenario of scenarios){
 test('capture GC UI component lab '+scenario.name,async({page},testInfo)=>{
   await page.setViewportSize({width:scenario.width,height:scenario.height});
   await page.goto('/lab/components.html');
   await page.locator('[data-theme-mode="'+scenario.appearance+'"]').click();
   if(scenario.high){
     await page.locator('label:has(#contrast-switch)').click();
     await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','high');
   }
   await page.evaluate(()=>document.fonts?.ready);
   await expect(page.getByRole('heading',{name:/Made to feel/i})).toBeVisible();
   await captureFullPageVisualEvidence(page,testInfo,'components-'+scenario.name);
 });
}
test('capture GC UI component registry',async({page},testInfo)=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/lab/catalog.html');
 await expect(page.locator('#result-message')).toHaveText('63 of 63 patterns shown');
 await page.evaluate(()=>document.fonts?.ready);
 await captureFullPageVisualEvidence(page,testInfo,'catalog-desktop');
});
