import {test,expect} from '@playwright/test';

// Bounded actual-browser focus and footer hit-test coverage for floating compact
// navigation. A screenshot or top-of-page geometry pass alone is insufficient.
const cases=[
 {width:320,height:568,dir:'ltr',motion:'reduce'},
 {width:320,height:812,dir:'rtl',motion:'no-preference'},
 {width:375,height:568,dir:'rtl',motion:'reduce'},
 {width:375,height:812,dir:'ltr',motion:'no-preference'},
 {width:599,height:568,dir:'ltr',motion:'reduce'},
 {width:599,height:812,dir:'rtl',motion:'no-preference'}
];
for(const variant of cases){
 test('compact dock keeps footer actionable and route heading visible '+JSON.stringify(variant),async({page},testInfo)=>{
  await page.setViewportSize({width:variant.width,height:variant.height});
  await page.emulateMedia({reducedMotion:variant.motion});
  await page.goto('/lab/adaptive.html');
  await page.evaluate(direction=>{document.documentElement.dir=direction},variant.dir);
  await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  const footer=page.locator('.gc-shell-footer a[href="./forms.html"]');
  await expect(footer).toBeVisible();
  const before=await footer.evaluate(link=>{
   const r=link.getBoundingClientRect(),nav=document.querySelector('.gc-nav-bottom').getBoundingClientRect();
   const top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
   return {linkTop:r.top,linkBottom:r.bottom,dockTop:nav.top,
    footerHit:top===link,clearance:nav.top-r.bottom};
  });
  expect(before.footerHit,'Footer link must not be obstructed by floating dock').toBe(true);
  expect(before.clearance,'Footer link must retain bottom-dock clearance').toBeGreaterThanOrEqual(80);
  await testInfo.attach('footer-before-navigation.png',{
   body:await page.screenshot({animations:'disabled'}),contentType:'image/png'
  });
  await page.locator('.gc-nav-bottom [data-gc-route=activity]').click();
  const heading=page.locator('#page-title');
  await expect(heading).toHaveText('Your activity.');
  await expect(heading).toBeFocused();
  await expect.poll(async()=>heading.evaluate(el=>{
   const r=el.getBoundingClientRect();
   const header=document.querySelector('.gc-app-bar').getBoundingClientRect();
   return r.top>=header.bottom&&r.bottom<=innerHeight;
  }),{timeout:5000,message:'Focused route heading must become unobscured after navigation scroll'}).toBe(true);
  const after=await heading.evaluate(el=>{
   const rect=el.getBoundingClientRect(),header=document.querySelector('.gc-app-bar').getBoundingClientRect();
   return {headingTop:rect.top,headingBottom:rect.bottom,headerBottom:header.bottom,scrollY};
  });
  await testInfo.attach('focus-after-navigation.json',{
   body:Buffer.from(JSON.stringify({variant,before,after,
    limitation:'Browser hit test and settled focus position, not human listening or all scroll interactions.'},null,2)),
   contentType:'application/json'
  });
 });
}
