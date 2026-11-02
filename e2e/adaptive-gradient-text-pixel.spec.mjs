import {test,expect} from '@playwright/test';
import {sampleBackdrop} from './support/sample-backdrop.mjs';

// Direct pixel evidence for Adaptive text on a background axe cannot
// automatically resolve. Do not generalize to photos or unrelated consumers.
const selectors=[
 '#page-title','#page-subtitle',
 '.gc-page-header .gc-eyebrow',
 '#content-title','#feed-title','.gc-shell-note'
];
for(const size of [{name:'compact',width:320},{name:'desktop',width:1440}]){
 for(const mode of ['light','dark']){
  test('Adaptive actual gradient text contrast '+size.name+' '+mode,async({page},testInfo)=>{
   await page.setViewportSize({width:size.width,height:812});
   await page.goto('/lab/adaptive.html');
   if(mode==='dark'){
    await page.locator('#appearance-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
   }
   const results=[];
   for(const selector of selectors){
    const before=await page.locator(selector).evaluate(el=>({value:el.style.getPropertyValue('color'),priority:el.style.getPropertyPriority('color')}));
    const result=await sampleBackdrop(page,selector);
    const after=await page.locator(selector).evaluate(el=>({value:el.style.getPropertyValue('color'),priority:el.style.getPropertyPriority('color')}));
    expect(after,selector+' inline color restored after sampling').toEqual(before);
    results.push({selector,...result});
    expect(result.samples,selector+' screenshot sample pixels').toBeGreaterThan(20);
    expect(result.min,selector+' mode='+mode+' width='+size.width).toBeGreaterThanOrEqual(4.5);
   }
   console.log('ADAPTIVE_PIXEL_CONTRAST '+JSON.stringify({mode,width:size.width,lowestRatio:Math.min(...results.map(x=>x.min)),selectors:results.length}));
   await testInfo.attach('adaptive-pixel-contrast.json',{
    body:Buffer.from(JSON.stringify({size,mode,results,scope:'Rendered pixel backdrop for selected six text elements; not all WCAG contrast nodes.'},null,2)),
    contentType:'application/json'
   });
  });
 }
}
