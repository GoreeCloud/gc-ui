import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';

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
   const name=target.id+'-'+variant.id;
   const folder=resolve(testInfo.project.outputDir,'acceptance-matrix');
   await mkdir(folder,{recursive:true});
   const pngPath=join(folder,name+'.png');
   const jsonPath=join(folder,name+'.json');
   await writeFile(pngPath,await page.screenshot({animations:'disabled'}));
   await writeFile(jsonPath,JSON.stringify({path:target.path,variant,geometry,
    scope:'Browser reflow and screenshot evidence; manual appearance and human AT acceptance remain separate.'},null,2)+'\n');
   await testInfo.attach(name+'.png',{path:pngPath,contentType:'image/png'});
   await testInfo.attach(name+'.json',{path:jsonPath,contentType:'application/json'});
  });
 }
}


// Screenshot-led regression: 375px dark mode used to orphan the final "s" in
// "Components"; 320px worked only because a narrower breakpoint reduced text.
// Preserve complete navigation labels at both standard and zoom-narrow sizes.
for(const width of [280,319,320,340,341,375,430,440]){
 test('Forms Lab: floating phone navigation does not wrap or clip '+width,async({page})=>{
  await page.setViewportSize({width,height:812});
  await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
  await page.goto('/lab/forms.html');
  const nav=page.locator('.gc-form-header nav');
  await expect(nav.getByRole('link')).toHaveCount(3);
  const geometry=await nav.getByRole('link').evaluateAll(links=>links.map(link=>{
   const textRange=document.createRange();textRange.selectNodeContents(link);
   const linkRect=link.getBoundingClientRect();
   const textRects=Array.from(textRange.getClientRects());
   return {
    text:link.textContent.trim(),lines:textRects.length,
    left:linkRect.left,right:linkRect.right,
    textLeft:Math.min(...textRects.map(r=>r.left)),
    textRight:Math.max(...textRects.map(r=>r.right)),
    clientWidth:link.clientWidth,scrollWidth:link.scrollWidth,
    height:linkRect.height
   };
  }));
  expect(geometry.map(item=>item.text)).toEqual(['Components','Adaptive','Registry']);
  for(const link of geometry){
   expect(link.lines,link.text+' single visual line').toBe(1);
   expect(link.scrollWidth,link.text+' not clipped').toBeLessThanOrEqual(link.clientWidth+1);
   expect(link.textLeft,link.text+' left visible').toBeGreaterThanOrEqual(link.left-1);
   expect(link.textRight,link.text+' right visible').toBeLessThanOrEqual(link.right+1);
   expect(link.height,link.text+' touch size').toBeGreaterThanOrEqual(44);
   expect(link.left,link.text+' on screen').toBeGreaterThanOrEqual(-1);
   expect(link.right,link.text+' on screen').toBeLessThanOrEqual(width+1);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+2);
 });
}

// The 320px Experience Studio screenshot originally clipped "environments."
// inside an otherwise in-bounds h1 container. Measure actual rendered text.
for(const width of [280,320,375,440]){
 test('Experience Studio: full hero text visible at '+width,async({page})=>{
  await page.setViewportSize({width,height:812});
  await page.emulateMedia({colorScheme:width===375?'dark':'light',reducedMotion:'reduce'});
  await page.goto('/lab/experience-studio.html');
  await page.evaluate(()=>document.fonts.ready);
  const segments=await page.locator('#studio-title bdi').evaluateAll(nodes=>nodes.map(node=>{
   const range=document.createRange();range.selectNodeContents(node);
   const spans=Array.from(range.getClientRects());
   return {text:node.textContent.trim(),spans:spans.map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom}))};
  }));
  expect(segments.map(s=>s.text)).toEqual(['One language.','Many environments.']);
  for(const segment of segments){
   expect(segment.spans.length,segment.text+' rendered span exists').toBeGreaterThan(0);
   for(const span of segment.spans){
    expect(span.left,segment.text+' clipped left').toBeGreaterThanOrEqual(-1);
    expect(span.right,segment.text+' clipped right').toBeLessThanOrEqual(width+1);
    expect(span.bottom,segment.text+' visible layout height').toBeGreaterThan(span.top);
   }
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth);
  expect(overflow).toBeLessThanOrEqual(width+2);
 });
}
