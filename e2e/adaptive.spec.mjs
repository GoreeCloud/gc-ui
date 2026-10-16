import {test,expect} from '@playwright/test';

test('navigation adapts to desktop, tablet and compact viewports',async({page})=>{
  const layouts=[
    {width:1440,height:900,visible:'sidebar',hidden:['rail','bottom']},
    {width:840,height:900,visible:'rail',hidden:['sidebar','bottom']},
    {width:375,height:812,visible:'bottom',hidden:['sidebar','rail']}
  ];
  for(const layout of layouts){
    await page.setViewportSize({width:layout.width,height:layout.height});
    await page.goto('/lab/adaptive.html');
    await expect(page.locator('.gc-nav-'+layout.visible)).toBeVisible();
    for(const name of layout.hidden)await expect(page.locator('.gc-nav-'+name)).toBeHidden();
    await expect(page.locator('.gc-nav-'+layout.visible+' [aria-current=page]')).toHaveCount(1);
  }
});
test('navigation preserves route and its active destination when resizing',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto('/lab/adaptive.html');
  await page.locator('.gc-nav-bottom [data-gc-route="activity"]').click();
  await expect(page).toHaveURL(/#activity$/);
  await expect(page.getByRole('heading',{name:'Your activity.'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Your activity.'})).toBeFocused();
  await expect(page.locator('#route-announcement')).toHaveText('Now viewing Your activity.');
  await page.setViewportSize({width:1440,height:900});
  await expect(page.locator('.gc-nav-sidebar [data-gc-route="activity"]')).toHaveAttribute('aria-current','page');
  await expect(page.locator('.gc-nav-bottom')).toBeHidden();
  await page.locator('.gc-nav-sidebar [data-gc-route="library"]').click();
  await expect(page.getByRole('heading',{name:'Your library.'})).toBeVisible();
  await expect(page.locator('#crumb-current')).toHaveText('Library');
});
test('modal side sheet uses native Escape dismissal and restores trigger focus',async({page})=>{
  await page.goto('/lab/adaptive.html');
  const trigger=page.getByRole('button',{name:'Details',exact:true});
  await trigger.click();
  const sheet=page.getByRole('dialog',{name:'Designed to adapt.'});
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('button',{name:'Close details'})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await sheet.getByRole('button',{name:'Done'}).click();
  await expect(sheet).toBeHidden();
});
test('adaptive shell retains theme accessibility preferences across labs',async({page})=>{
  await page.goto('/lab/components.html');
  await page.locator('label:has(#contrast-switch)').click();
  await page.goto('/lab/adaptive.html');
  await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','high');
  await expect(page.locator('html')).toHaveAttribute('data-gc-material','solid');
  await page.getByRole('button',{name:/Switch to dark appearance|Switch to light appearance/}).click();
  await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','high');
});
test('compact layout avoids horizontal document overflow',async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto('/lab/adaptive.html');
  await expect(page.locator('.gc-nav-bottom')).toBeVisible();
  const dims=await page.evaluate(()=>({
    viewport:document.documentElement.clientWidth,
    content:document.documentElement.scrollWidth
  }));
  expect(dims.content).toBeLessThanOrEqual(dims.viewport+1);
});

test('adaptive browser title uses the full GoreeCloud UI product name on route changes',async({page})=>{
 await page.goto('/lab/adaptive.html');
 await expect(page).toHaveTitle('GoreeCloud UI · Overview');
 await page.locator('.gc-nav-sidebar [data-gc-route="activity"]').click();
 await expect(page).toHaveTitle('GoreeCloud UI · Activity');
 await page.goBack();
 await expect(page).toHaveTitle('GoreeCloud UI · Overview');
});
test('destroying an open native dialog clears the modal state',async({page})=>{
 await page.goto('/lab/adaptive.html');
 const result=await page.evaluate(async()=>{
  const {initDialog}=await import('../src/gc-interactions.mjs');
  const temp=document.createElement('dialog');
  temp.id='temporary-lifecycle-test';
  temp.innerHTML='<button data-gc-dialog-close>Close</button>';
  document.body.append(temp);
  const controller=initDialog(temp);
  controller.open();
  const wasOpen=temp.open;
  controller.destroy();
  const nowClosed=!temp.open;
  temp.remove();
  return {wasOpen,nowClosed};
 });
 expect(result).toEqual({wasOpen:true,nowClosed:true});
});
