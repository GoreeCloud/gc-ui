import {test,expect} from '@playwright/test';
import {sampleBackdrop} from './support/sample-backdrop.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';

// Reproduce a real 1440px light-mode problem: an absolutely positioned Cloud
// Lens obscured the Ambient description and yielded 1.44:1 sampled contrast.
// This checks spatial separation AND actual rendered text backdrop rather
// than mistaking axe's overlapping-background inconclusive for certification.
const variants=[
 {id:'phone-light',width:320,mode:'light'},
 {id:'phone-dark',width:375,mode:'dark'},
 {id:'tablet-rtl',width:768,mode:'light',rtl:true},
 {id:'desktop-boundary',width:901,mode:'light'},
 {id:'desktop-dark',width:1024,mode:'dark'},
 {id:'desktop-light',width:1440,mode:'light'},
 {id:'desktop-dark-wide',width:1440,mode:'dark'},
 {id:'desktop-forced-colors',width:1440,mode:'light',forced:true}
];

for(const variant of variants)test('Material Lens does not obscure sibling content — '+variant.id,async({page},testInfo)=>{
 await page.setViewportSize({width:variant.width,height:900});
 await page.emulateMedia({colorScheme:variant.mode,reducedMotion:'reduce',forcedColors:variant.forced?'active':'none'});
 await page.goto('/lab/environment.html');
 if(variant.rtl)await page.evaluate(()=>{document.documentElement.dir='rtl'});
 await expect(page.locator('html')).toHaveAttribute('data-gc-mode',variant.mode);
 const ambient=page.locator('.side-cards [data-gc-treatment="ambient"] > p');
 const lens=page.locator('.preview > .lens');
 await expect(ambient).toBeVisible();
 await expect(lens).toBeVisible();
 await expect(lens).toContainText('Temporary lens');
 const layout=await page.locator('.preview').evaluate(root=>{
  const target=selector=>{
   const r=root.querySelector(selector)?.getBoundingClientRect();
   if(!r)throw new Error('Missing material layout target '+selector);
   return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
  };
  const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
  const bounds=root.getBoundingClientRect();
  const hero=target('.hero-card'),cards=target('.side-cards'),ambient=target('.side-cards [data-gc-treatment="ambient"] > p'),lens=target('.lens');
  return {
   preview:{left:bounds.left,top:bounds.top,right:bounds.right,bottom:bounds.bottom},
   viewport:document.documentElement.clientWidth,
   scrollWidth:document.documentElement.scrollWidth,
   lensLayoutPosition:getComputedStyle(root.querySelector('.lens')).position,
   lensBelowBoth: lens.top>=Math.max(hero.bottom,cards.bottom)+8,
   lensOverlapsText:intersects(lens,ambient),
   lensOverlapsCard:intersects(lens,cards),
   lensOverlapsHero:intersects(lens,hero),
   hero,cards,ambient,lens
  };
 });
 expect(layout.lensLayoutPosition).toBe('static');
 expect(layout.lensBelowBoth,'Lens must reserve its own row below both card columns').toBe(true);
 expect(layout.lensOverlapsText,'Ambient text must never sit under the lens').toBe(false);
 expect(layout.lensOverlapsCard).toBe(false);
 expect(layout.lensOverlapsHero).toBe(false);
 expect(layout.lens.left).toBeGreaterThanOrEqual(layout.preview.left-1);
 expect(layout.lens.right).toBeLessThanOrEqual(layout.preview.right+1);
 expect(layout.lens.bottom).toBeLessThanOrEqual(layout.preview.bottom+1);
 expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewport+1);
 // Forced-colors browsers can ignore the temporary transparent CSS ink used
 // by the sampler, which produces a false 1:1 result. In that OS mode verify
 // separation and browser media state, not an invented pixel contrast ratio.
 let backdrop=null;
 if(variant.forced){
  await expect.poll(()=>page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);
 }else{
  backdrop=await sampleBackdrop(page,'.side-cards [data-gc-treatment="ambient"] > p');
  expect(backdrop.samples).toBeGreaterThan(30);
  expect(backdrop.min,'Ambient descriptive text real-pixel backdrop in '+variant.id).toBeGreaterThanOrEqual(4.5);
 }
 const folder=resolve(testInfo.project.outputDir,'material-lens-review');
 await mkdir(folder,{recursive:true});
 const png=join(folder,variant.id+'.png'),json=join(folder,variant.id+'.json');
 await writeFile(png,await page.locator('.preview').screenshot({animations:'disabled',scale:'css'}));
 await writeFile(json,JSON.stringify({variant,layout,backdrop,
  caveat:'Selected non-forced text/backdrop pixel sample and browser box geometry; forced-colors CSS ink cannot be hidden reliably by this sampler. No entire-page WCAG, AT or native-device acceptance.'},null,2)+'\n');
 await testInfo.attach('material-lens-'+variant.id+'.png',{path:png,contentType:'image/png'});
 await testInfo.attach('material-lens-'+variant.id+'.json',{path:json,contentType:'application/json'});
});
