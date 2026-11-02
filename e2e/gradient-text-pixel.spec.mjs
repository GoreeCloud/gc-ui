import {test,expect} from '@playwright/test';
import {sampleBackdrop} from './support/sample-backdrop.mjs';

for(const viewport of [
 {name:'desktop',width:1440,height:900},
 {name:'compact',width:320,height:812},
 {name:'mobile',width:375,height:812}
])for(const mode of ['light','dark']){
 test('actual Components gradient keeps text readable in '+mode+' at '+viewport.name,async({page})=>{
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await page.goto('/lab/components.html');
  if(mode==='dark')await page.locator('[data-theme-mode=dark]').click();
  await expect(page.locator('.environment')).not.toHaveCSS('background-image','none');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow,viewport.name+' horizontal reflow').toBeLessThanOrEqual(1);
  for(const selector of ['.intro > .eyebrow','.intro > .summary','#components-title']){
   const result=await sampleBackdrop(page,selector);
   console.log('PIXEL-CONTRAST '+JSON.stringify({mode,viewport:viewport.name,width:viewport.width,selector,...result}));
   expect(result.samples).toBeGreaterThan(20);
   expect(result.min,mode+' '+selector).toBeGreaterThanOrEqual(4.5);
  }
 });
}

/* A custom accent changes both semantic roles and the ambient gradient. Do
 * not infer readability from the default Iris screenshots: sample the actual
 * pixels beneath the same content after each palette/appearance selection.
 */
for(const accent of ['lagoon','ember','moss']){
 for(const mode of ['light','dark']){
  for(const viewport of [
   {name:'compact',width:320,height:812},
   {name:'desktop',width:1440,height:900}
  ]){
   test('accent '+accent+' '+mode+' real gradient text at '+viewport.name,async({page})=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await page.goto('/lab/components.html');
    await page.locator('[data-theme-mode="'+mode+'"]').click();
    const swatch=page.locator('[data-theme-accent="'+accent+'"]');
    await swatch.click();
    await expect(swatch).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('html')).toHaveAttribute('data-gc-mode',mode);
    await expect(page.locator('html')).toHaveAttribute('data-gc-accent',accent);
    await expect(page.locator('.environment')).not.toHaveCSS('background-image','none');
    const overflow=await page.evaluate(()=>
      document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,accent+' '+mode+' '+viewport.name+' reflow').toBeLessThanOrEqual(1);
    for(const selector of ['.intro > .eyebrow','.intro > .summary','#components-title']){
     const result=await sampleBackdrop(page,selector);
     console.log('ACCENT-PIXEL-CONTRAST '+JSON.stringify({accent,mode,
      viewport:viewport.name,width:viewport.width,selector,...result}));
     expect(result.samples).toBeGreaterThan(20);
     expect(result.min,accent+' '+mode+' '+viewport.name+' '+selector).toBeGreaterThanOrEqual(4.5);
    }
   });
  }
 }
}
