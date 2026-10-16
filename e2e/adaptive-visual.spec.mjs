import {test,expect} from '@playwright/test';

/** Evidence fixtures only: no pixel baseline or visual conformance claim. */
test('capture adaptive shell evidence on mobile, tablet and desktop',async({page},testInfo)=>{
  for(const view of [
    {name:'compact',width:375,height:812},
    {name:'medium',width:840,height:900},
    {name:'expanded',width:1440,height:900}
  ]){
    await page.setViewportSize({width:view.width,height:view.height});
    await page.goto('/lab/adaptive.html');
    await expect(page.locator('#page-title')).toBeVisible();
    await testInfo.attach('gc-ui-adaptive-'+view.name,{
      body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'
    });
  }
});
