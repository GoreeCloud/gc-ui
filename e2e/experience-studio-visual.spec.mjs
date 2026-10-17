import {test,expect} from '@playwright/test';

for(const state of [
 {name:'workspace-light',width:1440,height:900},
 {name:'reading-dark',width:1440,height:900,scene:'reading',dark:true},
 {name:'mobile-320',width:320,height:720},
 {name:'tv-profile',width:1280,height:800,platform:'tv'}
]){
 test('capture experience studio '+state.name,async({page},testInfo)=>{
  await page.setViewportSize({width:state.width,height:state.height});
  await page.goto('/lab/experience-studio.html');
  if(state.scene)await page.locator('#scene').selectOption(state.scene);
  if(state.platform)await page.locator('#platform').selectOption(state.platform);
  if(state.dark)await page.getByRole('button',{name:'Switch to dark appearance'}).click();
  await expect(page.getByRole('heading',{name:/One language/i})).toBeVisible();
  await page.evaluate(()=>document.fonts?.ready);
  const png=await page.screenshot({fullPage:true,animations:'disabled'});
  await testInfo.attach('gc-experience-'+state.name,{body:png,contentType:'image/png'});
 });
}
