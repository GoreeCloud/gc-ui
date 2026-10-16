import {test,expect} from '@playwright/test';

/** Visual evidence, not pixel-diff approval. Screenshots are attached to the CI test report. */
test('capture GC UI light, dark, high contrast and compact specimens',async({page},testInfo)=>{
  const scenarios=[
    {name:'desktop-light',width:1440,height:900,appearance:'light',high:false},
    {name:'desktop-dark',width:1440,height:900,appearance:'dark',high:false},
    {name:'desktop-high-contrast',width:1440,height:900,appearance:'dark',high:true},
    {name:'mobile-light',width:375,height:812,appearance:'light',high:false}
  ];
  for(const scenario of scenarios){
    await page.setViewportSize({width:scenario.width,height:scenario.height});
    await page.goto('/lab/components.html');
    await page.locator('[data-theme-mode="'+scenario.appearance+'"]').click();
    if(scenario.high)await page.locator('label:has(#contrast-switch)').click();
    await page.evaluate(()=>document.fonts?.ready);
    await expect(page.getByRole('heading',{name:/Made to feel/i})).toBeVisible();
    const png=await page.screenshot({fullPage:true,animations:'disabled'});
    await testInfo.attach('gc-ui-'+scenario.name,{body:png,contentType:'image/png'});
  }
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/lab/catalog.html');
  await expect(page.locator('#result-message')).toHaveText('63 of 63 patterns shown');
  const registry=await page.screenshot({fullPage:true,animations:'disabled'});
  await testInfo.attach('gc-ui-catalog',{body:registry,contentType:'image/png'});
});
