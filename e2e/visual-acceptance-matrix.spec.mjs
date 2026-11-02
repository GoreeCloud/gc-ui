import {test,expect} from '@playwright/test';

// Browser geometry and screen-state evidence, not pixel-level design signoff.
const pages=[
 {id:'components',path:'/lab/components.html'},
 {id:'catalog',path:'/lab/catalog.html'},
 {id:'adaptive',path:'/lab/adaptive.html'},
 {id:'forms',path:'/lab/forms.html'},
 {id:'environment',path:'/lab/environment.html'},
 {id:'experience',path:'/lab/experience-studio.html'}
];
const environments=[
 {id:'320-light',width:320,height:812,dark:false,rtl:false,forced:false,reduced:false},
 {id:'375-dark',width:375,height:812,dark:true,rtl:false,forced:false,reduced:true},
 {id:'768-rtl',width:768,height:900,dark:false,rtl:true,forced:false,reduced:false},
 {id:'1440-forced',width:1440,height:900,dark:false,rtl:false,forced:true,reduced:false}
];
for(const target of pages){
 for(const variant of environments){
  test(target.id+': visual acceptance geometry '+variant.id,async({page},testInfo)=>{
   await page.setViewportSize({width:variant.width,height:variant.height});
   await page.emulateMedia({colorScheme:variant.dark?'dark':'light',
    reducedMotion:variant.reduced?'reduce':'no-preference',
    forcedColors:variant.forced?'active':'none'});
   await page.goto(target.path);
   await page.evaluate(({dark,rtl})=>{
    document.documentElement.setAttribute('dir',rtl?'rtl':'ltr');
    document.documentElement.dataset.gcMode=dark?'dark':'light';
    window.scrollTo(0,0);
   },variant);
   await page.evaluate(()=>document.fonts?.ready);
   const heading=page.locator('h1').first();
   await expect(heading).toBeVisible();
   const geometry=await page.evaluate(()=>{
    const root=document.documentElement;
    const headline=document.querySelector('h1');
    const box=headline.getBoundingClientRect();
    const computed=getComputedStyle(headline);
    return {
     viewport:innerWidth,
     rootScrollWidth:root.scrollWidth,
     bodyScrollWidth:document.body.scrollWidth,
     heading:{left:box.left,right:box.right,width:box.width,
      fontSize:computed.fontSize,lineHeight:computed.lineHeight},
     visibleHeading:box.bottom>0&&box.top<innerHeight
    };
   });
   expect(geometry.rootScrollWidth,target.id+' root horizontal overflow').toBeLessThanOrEqual(variant.width+2);
   expect(geometry.bodyScrollWidth,target.id+' body horizontal overflow').toBeLessThanOrEqual(variant.width+2);
   expect(geometry.heading.left,target.id+' heading clipped left').toBeGreaterThanOrEqual(-2);
   expect(geometry.heading.right,target.id+' heading clipped right').toBeLessThanOrEqual(variant.width+2);
   expect(geometry.visibleHeading).toBe(true);
   const png=await page.screenshot({animations:'disabled'});
   await testInfo.attach(target.id+'-'+variant.id+'.png',{body:png,contentType:'image/png'});
   await testInfo.attach(target.id+'-'+variant.id+'.json',{
    body:Buffer.from(JSON.stringify({path:target.path,variant,geometry,
     scope:'Browser reflow and screenshot evidence; manual appearance and human AT acceptance remain separate.'},null,2)),
    contentType:'application/json'
   });
  });
 }
}
