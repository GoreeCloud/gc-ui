import {test,expect} from '@playwright/test';

/** Independent viewport captures: evidence only, not pixel-diff signoff. */
for(const viewport of [
 {name:'compact',width:375,height:812},
 {name:'medium',width:840,height:900},
 {name:'expanded',width:1440,height:900}
]){
 test('capture adaptive shell '+viewport.name,async({page},testInfo)=>{
   await page.setViewportSize({width:viewport.width,height:viewport.height});
   await page.goto('/lab/adaptive.html');
   await expect(page.locator('#page-title')).toBeVisible();
   await page.evaluate(()=>document.fonts?.ready);
   const png=await page.screenshot({fullPage:true,animations:'disabled'});
   await testInfo.attach('gc-ui-adaptive-'+viewport.name,{body:png,contentType:'image/png'});
 });
}
