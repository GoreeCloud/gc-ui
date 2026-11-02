import {test,expect} from '@playwright/test';

// Axe reports #brief-notes contrast as inconclusive when an overlap could
// obscure its background. Verify the real editing surface is reachable after
// scrolling; a passing hit-test is not composited pixel contrast certification.
for(const variant of [
 {width:320,dark:false,rtl:false},
 {width:375,dark:true,rtl:false},
 {width:768,dark:false,rtl:true},
 {width:1440,dark:false,rtl:false}
]){
 test('Forms notes textarea remains unobstructed '+JSON.stringify(variant),async({page},testInfo)=>{
  await page.setViewportSize({width:variant.width,height:812});
  await page.goto('/lab/forms.html');
  if(variant.rtl)await page.evaluate(()=>document.documentElement.dir='rtl');
  if(variant.dark)await page.evaluate(()=>document.documentElement.dataset.gcMode='dark');
  const notes=page.locator('#brief-notes');
  await notes.scrollIntoViewIfNeeded();
  await expect(notes).toBeVisible();
  const evidence=await notes.evaluate(el=>{
   const r=el.getBoundingClientRect();
   const rect={left:r.left,right:r.right,top:r.top,bottom:r.bottom};
   const samples=[.3,.5,.7].map(f=>{
    const x=Math.round(r.left+r.width*f),y=Math.round(r.top+r.height*f);
    const top=document.elementFromPoint(x,y);
    return {x,y,hit:top===el||el.contains(top),topTag:top?.tagName||null,
     topId:top?.id||null};
   });
   return {rect,samples};
  });
  for(const s of evidence.samples){
   expect(s.hit,JSON.stringify(evidence)).toBe(true);
   expect(s.y).toBeGreaterThan(0);
   expect(s.y).toBeLessThan(812);
  }
  await notes.fill('Draft notes for accessible project recovery.');
  await expect(notes).toHaveValue('Draft notes for accessible project recovery.');
  await testInfo.attach('textarea-occlusion-review.json',{
   body:Buffer.from(JSON.stringify({variant,evidence,limitation:'Hit-testing only, not color-contrast certification.'},null,2)),
   contentType:'application/json'
  });
 });
}
