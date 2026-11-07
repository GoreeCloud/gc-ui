import {test,expect} from '@playwright/test';

const pages=[
 {name:'Components',url:'/lab/components.html',board:true},
 {name:'Experience Studio',url:'/lab/experience-studio.html',board:false}
];
const cases=[
 {id:'phone-light',width:320,height:812,dark:false,forced:false,reduced:false},
 {id:'phone-dark',width:375,height:812,dark:true,forced:false,reduced:true},
 {id:'tablet-light',width:768,height:900,dark:false,forced:false,reduced:false},
 {id:'desktop-dark',width:1440,height:900,dark:true,forced:false,reduced:false},
 {id:'desktop-forced',width:1440,height:900,dark:false,forced:true,reduced:true}
];
for(const target of pages){
 for(const variant of cases){
  test(target.name+' founder-approved identity: '+variant.id,async({page},testInfo)=>{
   const errors=[];
   page.on('pageerror',error=>errors.push(String(error)));
   await page.setViewportSize({width:variant.width,height:variant.height});
   await page.emulateMedia({
    colorScheme:variant.dark?'dark':'light',
    reducedMotion:variant.reduced?'reduce':'no-preference',
    forcedColors:variant.forced?'active':'none'
   });
   await page.goto(target.url,{waitUntil:'domcontentloaded'});
   await page.evaluate(dark=>{document.documentElement.dataset.gcMode=dark?'dark':'light'},variant.dark);
   await page.evaluate(()=>document.fonts.ready);
   const hero=page.locator('.gc-premium-intro');
   const figure=hero.locator('.gc-premium-visual');
   await expect(hero.locator('h1')).toBeVisible();
   await expect(figure).toBeVisible();
   const candidateImages=page.locator('img[src*="/assets/candidates/"]');
   await expect(candidateImages).toHaveCount(target.board?3:1);
   const loaded=await candidateImages.evaluateAll(async imgs=>{
    await Promise.all(imgs.map(img=>img.decode()));
    return imgs.map(img=>({
     src:new URL(img.src).pathname,
     loaded:img.complete&&img.naturalWidth>0&&img.naturalHeight>0
    }));
   });
   for(const img of loaded){
    expect(img.loaded,img.src+' candidate asset loaded').toBe(true);
    expect(img.src.startsWith('/assets/candidates/')).toBe(true);
   }
   expect(await page.locator('link[rel=icon]').getAttribute('href')).toBe('../assets/gc-mark.svg');
   await expect(page.locator('header img[src="../assets/gc-mark.svg"]')).toBeVisible();
   const geo=await page.evaluate(()=>{
    const root=document.documentElement,art=document.querySelector('.gc-premium-visual');
    const hero=document.querySelector('.gc-premium-intro h1');
    const pieces=[];
    for(const bdi of hero.querySelectorAll('bdi')){
     const range=document.createRange();
     range.selectNodeContents(bdi);
     for(const box of range.getClientRects())pieces.push({left:box.left,right:box.right,top:box.top,bottom:box.bottom});
    }
    const rect=art.getBoundingClientRect();
    return{
     width:innerWidth,rootWidth:root.scrollWidth,bodyWidth:document.body.scrollWidth,
     heroText:pieces,
     art:{left:rect.left,right:rect.right,top:rect.top,height:rect.height}
    };
   });
   expect(geo.rootWidth,'root horizontal overflow').toBeLessThanOrEqual(geo.width+2);
   expect(geo.bodyWidth,'body horizontal overflow').toBeLessThanOrEqual(geo.width+2);
   expect(geo.heroText.length).toBeGreaterThan(0);
   for(const segment of geo.heroText){
    expect(segment.left,'headline clipping left').toBeGreaterThanOrEqual(-2);
    expect(segment.right,'headline clipping right').toBeLessThanOrEqual(geo.width+2);
    expect(segment.bottom).toBeGreaterThan(segment.top);
   }
   expect(geo.art.left,'artwork clipping left').toBeGreaterThanOrEqual(-2);
   expect(geo.art.right,'artwork clipping right').toBeLessThanOrEqual(geo.width+2);
   expect(geo.art.height).toBeGreaterThan(170);
   if(target.board){
    await expect(page.locator('.gc-premium-identity-panel .eyebrow')).toHaveText('FOUNDER-APPROVED IDENTITY / APERTURE WEAVE');
    await expect(page.getByText('App distribution requires platform validation')).toBeVisible();
    const boards=page.locator('.gc-premium-logo-board');
    await expect(boards).toHaveCount(2);
    const s=await boards.evaluateAll(nodes=>nodes.map(x=>({left:x.getBoundingClientRect().left,right:x.getBoundingClientRect().right})));
    for(const b of s){
     expect(b.left,'logo board left').toBeGreaterThanOrEqual(-2);
     expect(b.right,'logo board right').toBeLessThanOrEqual(variant.width+2);
    }
   }
   expect(errors,'uncaught page exceptions').toEqual([]);
   const path=testInfo.outputPath(target.name.replaceAll(' ','-')+'-'+variant.id+'.png');
   await page.screenshot({path,fullPage:true,animations:'disabled'});
  });
 }
}
