import {test,expect} from '@playwright/test';

const pages=[
 {path:'/lab/environment.html',title:'Environment',brand:'.identity',nav:'Lab navigation',mobileCount:6,mobileBreakpoint:900},
 {path:'/lab/experience-studio.html',title:'Studio',brand:'.brand',nav:'Other design labs',mobileCount:3,mobileBreakpoint:680}
];
for(const spec of pages){
 test(spec.title+' floating header remains bounded and readable across viewports',async({page},testInfo)=>{
  for(const width of [320,375,680,840,1440]){
   await page.setViewportSize({width,height:780});
   await page.goto(spec.path);
   for(const dir of ['ltr','rtl']){
    await page.evaluate(dir=>document.documentElement.dir=dir,dir);
    const m=await page.evaluate(()=>{
     const bar=document.querySelector('.gc-lab-floating-topbar');
     const styles=getComputedStyle(bar),r=bar.getBoundingClientRect();
     const brand=bar.querySelector('a').getBoundingClientRect();
     const action=bar.querySelector('button').getBoundingClientRect();
     return {
      left:r.left,right:r.right,width:document.documentElement.clientWidth,
      pageWidth:document.documentElement.scrollWidth,
      radius:parseFloat(styles.borderTopLeftRadius),
      background:styles.backgroundColor,
      brand:{left:brand.left,right:brand.right},
      button:{left:action.left,right:action.right,height:action.height}
     };
    });
    expect(m.left,'left inset at '+width+' '+dir).toBeGreaterThanOrEqual(10);
    expect(m.width-m.right,'right inset at '+width+' '+dir).toBeGreaterThanOrEqual(10);
    expect(m.radius,'radius at '+width+' '+dir).toBeGreaterThanOrEqual(20);
    expect(m.pageWidth,'horizontal reflow at '+width+' '+dir).toBeLessThanOrEqual(m.width+1);
    expect(m.button.height,'appearance target at '+width).toBeGreaterThanOrEqual(44);
    if(width===320)expect(m.button.height,'single-line appearance label').toBeLessThanOrEqual(52);
    expect(m.brand.left,'brand clipping').toBeGreaterThanOrEqual(m.left);
    expect(m.button.right,'button clipping').toBeLessThanOrEqual(m.right);
    expect(m.brand.right<=m.button.left||m.button.right<=m.brand.left,
      'no brand and appearance overlap at '+width+' '+dir).toBe(true);
    expect(m.background,'opaque navigation').not.toBe('rgba(0, 0, 0, 0)');
   }
   await page.evaluate(()=>document.documentElement.dir='ltr');
   const links=page.getByRole('navigation',{name:spec.nav}).getByRole('link');
   const drawer=page.locator('.gc-lab-mobile-links');
   if(width<=767){
    await expect(drawer).toBeHidden();
    await expect(links.first()).toBeHidden();
    const dock=page.getByRole('navigation',{name:'Primary mobile navigation'});
    await expect(dock).toBeVisible();
    await expect(dock.getByRole('link')).toHaveCount(4);
    const geometry=await dock.boundingBox();
    expect(geometry.y+geometry.height).toBeLessThanOrEqual(780-8);
    expect(geometry.y).toBeGreaterThan(780-134);
   }else if(width<=spec.mobileBreakpoint){
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('nav a')).toHaveCount(spec.mobileCount);
    const trigger=drawer.locator('summary');
    await trigger.focus();await page.keyboard.press('Enter');
    await expect(drawer).toHaveAttribute('open','');
    if(width===320){
     const png=testInfo.outputPath(spec.title+'-mobile-lab-navigation-open.png');
     await page.screenshot({path:png,animations:'disabled'});
     await testInfo.attach(spec.title+'-mobile-lab-navigation-open',{path:png,contentType:'image/png'});
    }
    const linkSize=await drawer.locator('nav a').evaluateAll(links=>links.map(x=>({
     height:x.getBoundingClientRect().height,left:x.getBoundingClientRect().left,
     right:x.getBoundingClientRect().right
    })));
    for(const link of linkSize){
     expect(link.height).toBeGreaterThanOrEqual(44);
     expect(link.left).toBeGreaterThanOrEqual(0);
     expect(link.right).toBeLessThanOrEqual(width+1);
    }
    await trigger.focus();await page.keyboard.press('Enter');
    await expect(drawer).not.toHaveAttribute('open','');
   }else await expect(drawer).toBeHidden();
   if(width>spec.mobileBreakpoint){
    await expect(links.first()).toBeVisible();
    expect(await links.first().evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
   }
  }
  await page.getByRole('button',{name:'Switch to dark appearance'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
 });

 test(spec.title+' floating header respects forced-colors boundary and focus',async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await page.goto(spec.path);
  const s=await page.locator('.gc-lab-floating-topbar').evaluate(el=>{
   const x=getComputedStyle(el);return {background:x.backgroundColor,border:x.borderTopColor,shadow:x.boxShadow};
  });
  expect(s.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(s.shadow).toBe('none');
  await page.getByRole('button',{name:'Switch to dark appearance'}).focus();
  await expect(page.getByRole('button',{name:'Switch to dark appearance'})).toBeFocused();
 });
}
