import {test,expect} from '@playwright/test';
import {sampleBackdrop} from './support/sample-backdrop.mjs';

// Browser pixel review of selected axe inconclusive backgrounds.
// Does not waive incomplete axe results or certify all UI surfaces.
const labs=[
 {name:'catalog',selectors:['.hero > .eyebrow','.hero > p:last-of-type','#browse-title','.heading > p','.about > h2','.about > p']},
 {name:'environment',selectors:['.hero > .eyebrow','.hero > .lead','#control-title','#show-title','#providers-title','.showcase > .quiet-note']},
 {name:'experience-studio',selectors:['.intro > .eyebrow','.intro > p:last-of-type','#controls-title','#demo-heading','#scene-index-title','.footnote']}
];
for(const lab of labs){
 for(const width of [320,1440]){
  for(const mode of ['light','dark']){
   test(lab.name+' ambient text pixels '+width+' '+mode,async({page},testInfo)=>{
    await page.setViewportSize({width,height:900});
    // Drive the actual auto-mode theme controller through the OS color scheme.
    // Changing a data attribute alone bypasses its semantic color-role updates.
    await page.emulateMedia({colorScheme:mode});
    await page.goto('/lab/'+lab.name+'.html');
    await expect(page.locator('html')).toHaveAttribute('data-gc-mode',mode);
    const measurements=[];
    for(const selector of lab.selectors){
     const target=page.locator(selector);
     await expect(target).toHaveCount(1);
     await expect(target).toBeVisible();
     const before=await target.evaluate(el=>({
      value:el.style.getPropertyValue('color'),priority:el.style.getPropertyPriority('color')
     }));
     const result=await sampleBackdrop(page,selector);
     const after=await target.evaluate(el=>({
      value:el.style.getPropertyValue('color'),priority:el.style.getPropertyPriority('color')
     }));
     expect(after,selector+' sampler restoration').toEqual(before);
     measurements.push({selector,...result});
     expect(result.samples,selector+' source pixels').toBeGreaterThan(20);
     expect(result.min,lab.name+' '+selector+' '+width+' '+mode).toBeGreaterThanOrEqual(4.5);
    }
    console.log('AMBIENT_PIXEL_MIN '+JSON.stringify({lab:lab.name,width,mode,
     minimum:Math.min(...measurements.map(x=>x.min))}));
    await testInfo.attach('ambient-text-pixels.json',{
     body:Buffer.from(JSON.stringify({lab:lab.name,width,mode,measurements,
      scope:'Selected text-backdrop browser pixels; not all WCAG contrast'},null,2)),
     contentType:'application/json'
    });
   });
  }
 }
}
