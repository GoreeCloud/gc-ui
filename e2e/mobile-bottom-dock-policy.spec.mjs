import {test,expect} from '@playwright/test';

const labs=[
 'adaptive','catalog','components','environment','experience-studio',
 'forms','icon-atlas','motion-gallery','pattern-workbench','v1','workflow'
];
for(const name of labs){
 for(const variant of [
  {width:320,dir:'ltr',forced:'none',mode:'light'},
  {width:375,dir:'rtl',forced:'none',mode:'dark'},
  {width:599,dir:'ltr',forced:'active',mode:'light'},
  {width:680,dir:'rtl',forced:'none',mode:'dark'},
  {width:767,dir:'ltr',forced:'none',mode:'light'}
 ]){
  test(name+' mobile floating nav '+variant.width+' '+variant.dir+' '+variant.forced,async({page})=>{
   await page.setViewportSize({width:variant.width,height:720});
   await page.emulateMedia({colorScheme:variant.mode,forcedColors:variant.forced,reducedMotion:'reduce'});
   await page.goto('/lab/'+name+'.html');
   await page.evaluate(dir=>{document.documentElement.dir=dir},variant.dir);
   const dock=page.locator('.gc-mobile-dock');
   await expect(dock).toBeVisible();
   const expected=name==='adaptive'?3:4;
   await expect(dock.getByRole('link')).toHaveCount(expected);
   const bounds=await dock.evaluate(element=>{
    const rect=element.getBoundingClientRect(),style=getComputedStyle(element);
    const links=Array.from(element.querySelectorAll('a')).map(link=>{
     const r=link.getBoundingClientRect();
     const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
     return {width:r.width,height:r.height,left:r.left,right:r.right,
      hit:link===hit||link.contains(hit),name:link.textContent.trim(),
      clipped:link.scrollWidth>link.clientWidth+1};
    });
    return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,
     radius:parseFloat(style.borderTopLeftRadius),position:style.position,
     background:style.backgroundColor,links,overflow:document.documentElement.scrollWidth-innerWidth};
   });
   expect(bounds.position).toBe('fixed');
   expect(bounds.left).toBeGreaterThanOrEqual(7);
   expect(bounds.right).toBeLessThanOrEqual(variant.width-7);
   expect(bounds.bottom).toBeLessThanOrEqual(720-7);
   expect(bounds.top).toBeGreaterThan(720-135);
   expect(bounds.radius).toBeGreaterThanOrEqual(24);
   expect(bounds.background).not.toBe('rgba(0, 0, 0, 0)');
   expect(bounds.overflow,'no horizontal document scroll').toBeLessThanOrEqual(2);
   for(const link of bounds.links){
    expect(link.height,link.name+' tap target').toBeGreaterThanOrEqual(44);
    expect(link.left,link.name+' left').toBeGreaterThanOrEqual(0);
    expect(link.right,link.name+' right').toBeLessThanOrEqual(variant.width);
    expect(link.clipped,link.name+' full label').toBe(false);
    expect(link.hit,link.name+' topmost tap hit').toBe(true);
   }
   if(name!=='adaptive')await expect(page.locator('.gc-desktop-nav')).toBeHidden();
   if(name==='adaptive'){
    await expect(page.locator('.gc-nav-rail')).toBeHidden();
    await expect(page.locator('.gc-nav-sidebar')).toBeHidden();
    const content=await page.locator('.gc-main-content').boundingBox();
    expect(content.x).toBeGreaterThanOrEqual(-1);
    expect(content.x+content.width).toBeLessThanOrEqual(variant.width+1);
   }
  });
 }
}

test('custom colors are user-driven, persisted locally and not forced to a named preset',async({page})=>{
 await page.setViewportSize({width:320,height:760});
 await page.goto('/lab/components.html');
 const input=page.getByLabel('Pick any color');
 for(const seed of ['#E74024','#0C99D2','#A7BD1B']){
  await input.fill(seed);
  await expect(page.locator('html')).toHaveAttribute('data-gc-accent','custom');
  await expect(page.locator('#gc-custom-accent-value')).toHaveText(seed);
  await expect(page.locator('[data-theme-accent][aria-pressed=true]')).toHaveCount(0);
  const state=await page.evaluate(()=>({
   color:getComputedStyle(document.documentElement).getPropertyValue('--gc-v1-color-primary').trim(),
   stored:localStorage.getItem('gc-ui-v1:seed')
  }));
  expect(state.color).toMatch(/^#[0-9A-F]{6}$/);
  expect(state.stored).toBe(seed);
 }
 await page.reload();
 await expect(input).toHaveValue('#a7bd1b');
 await expect(page.locator('html')).toHaveAttribute('data-gc-accent','custom');
 await page.getByRole('button',{name:'Dark',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
 await expect(page.locator('#gc-custom-accent-value')).toHaveText('#A7BD1B');
});
