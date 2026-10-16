import {test,expect} from '@playwright/test';

/** Screenshot evidence, not an approved visual baseline. */
for(const scenario of [
 {name:'desktop',width:1440,height:900,dark:false},
 {name:'compact-dark',width:375,height:812,dark:true}
]){
 test('capture GoreeCloud UI forms '+scenario.name,async({page},testInfo)=>{
  await page.setViewportSize({width:scenario.width,height:scenario.height});
  if(scenario.dark){
   await page.goto('/lab/components.html');
   await page.locator('[data-theme-mode="dark"]').click();
  }
  await page.goto('/lab/forms.html');
  await expect(page.getByRole('heading',{name:'Every detail matters.'})).toBeVisible();
  await expect(page.locator('#project-results li')).toHaveCount(6);
  await page.evaluate(()=>document.fonts?.ready);
  await testInfo.attach('gc-ui-forms-'+scenario.name,{
   body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'
  });
 });
}

test('capture GoreeCloud UI forms validation and retry at compact width',async({page},testInfo)=>{
 await page.setViewportSize({width:375,height:812});
 await page.goto('/lab/forms.html');
 await page.getByRole('button',{name:'Create brief'}).click();
 await expect(page.locator('#brief-errors')).toBeVisible();
 await page.locator('#simulate-failure').click();
 await expect(page.locator('#recovery-error')).toBeVisible();
 await page.evaluate(()=>document.fonts?.ready);
 await testInfo.attach('gc-ui-forms-recovery-compact',{
  body:await page.screenshot({fullPage:true,animations:'disabled'}),contentType:'image/png'
 });
});
