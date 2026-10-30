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

test('mobile appearance switch remains accessible at 320px and preserves preferences',async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.goto('/lab/adaptive.html');
 const toggle=page.getByRole('button',{name:'Switch to dark appearance'});
 await expect(toggle).toBeVisible();
 const dims=await toggle.boundingBox();
 expect(dims.width).toBeGreaterThanOrEqual(44);
 expect(dims.height).toBeGreaterThanOrEqual(44);
 await toggle.click();
 await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
 await expect(page.getByRole('button',{name:'Switch to light appearance'})).toBeVisible();
 await page.locator('.gc-nav-bottom [data-gc-route="library"]').click();
 await expect(page).toHaveTitle('GoreeCloud UI · Library');
 await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(1);
});
test('responsive chrome stays in bounds and sheet anchors to inline end in RTL',async({page})=>{
 for(const width of [320,375,599,600,840,1199,1200,1440]){
  await page.setViewportSize({width,height:740});
  await page.goto('/lab/adaptive.html');
  await page.evaluate(()=>document.documentElement.dir='rtl');
  const values=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    visible:['bottom','rail','sidebar'].filter(s=>getComputedStyle(document.querySelector('.gc-nav-'+s)).display!=='none')
  }));
  expect(values.overflow,'Overflow at '+width+' RTL').toBeLessThanOrEqual(1);
  expect(values.visible).toHaveLength(1);
 }
 await page.setViewportSize({width:1024,height:740});
 await page.goto('/lab/adaptive.html');
 await page.evaluate(()=>document.documentElement.dir='rtl');
 await page.locator('#open-details').click();
 const left=await page.locator('#details-sheet').evaluate(el=>el.getBoundingClientRect().left);
 expect(left).toBeLessThanOrEqual(1);
});

test('footer links retain a touch-safe gap above fixed mobile navigation at maximum scroll',async({page})=>{
 for(const width of [320,360,375]){
  await page.setViewportSize({width,height:675});
  await page.goto('/lab/adaptive.html');
  await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  const clearance=await page.evaluate(()=>{
   const link=document.querySelector('.gc-shell-footer a[href="./forms.html"]');
   const nav=document.querySelector('.gc-nav-bottom');
   const rect=link.getBoundingClientRect(),navRect=nav.getBoundingClientRect();
   return {gap:navRect.top-rect.bottom,
    hit:document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2)===link};
  });
  expect(clearance.hit,'Footer link hit target at '+width+'px').toBe(true);
  expect(clearance.gap,'Touch clearance above bottom nav at '+width+'px').toBeGreaterThanOrEqual(80);
 }
});


test('floating navigation remains rounded and inset across responsive layouts and RTL',async({page})=>{
  for(const width of [320,375,840,1199,1200,1440]){
    await page.setViewportSize({width,height:812});
    await page.goto('/lab/adaptive.html');
    for(const direction of ['ltr','rtl']){
      await page.evaluate(dir=>{document.documentElement.dir=dir},direction);
      const result=await page.evaluate(()=>{
        const bars=['.gc-app-bar',...['bottom','rail','sidebar'].map(name=>'.gc-nav-'+name)]
          .map(selector=>document.querySelector(selector))
          .filter(el=>getComputedStyle(el).display!=='none');
        return {
          width:document.documentElement.clientWidth,
          scrollWidth:document.documentElement.scrollWidth,
          bars:bars.map(el=>{
            const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
            return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,
              radius:parseFloat(style.borderTopLeftRadius),background:style.backgroundColor};
          })
        };
      });
      expect(result.scrollWidth,'horizontal overflow at '+width+' '+direction).toBeLessThanOrEqual(result.width+1);
      expect(result.bars).toHaveLength(2);
      for(const bar of result.bars){
        expect(bar.left,'inline-start inset at '+width+' '+direction).toBeGreaterThanOrEqual(10);
        expect(result.width-bar.right,'inline-end inset at '+width+' '+direction).toBeGreaterThanOrEqual(10);
        expect(bar.radius,'rounded navigation at '+width+' '+direction).toBeGreaterThan(0);
        expect(bar.background,'opaque floating surface at '+width+' '+direction).not.toBe('rgba(0, 0, 0, 0)');
      }
      const nav=result.bars[1];
      if(width<600)expect(812-nav.bottom,'mobile safe bottom inset').toBeGreaterThanOrEqual(11);
      else expect(nav.top,'side navigation detachment').toBeGreaterThan(90);
    }
  }
});
