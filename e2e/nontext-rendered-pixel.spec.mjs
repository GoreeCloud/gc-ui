import {test,expect} from '@playwright/test';
import {sampleBackdrop} from './support/sample-backdrop.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';

// Focused, non-text glyph-background pixels for representative axe
// inconclusives. Conservative 3:1 review threshold; no axe suppression.
const labs=[
 // Decorative symbols paired with visible labels, selected from the
 // unresolved axe non-text inventory; sampled ratios are bounded evidence.
 {name:'v1',selectors:['.status-pill span[aria-hidden=true]']},
 {name:'environment',selectors:['.lens.gc-material-surface[data-gc-treatment="lens"] > span[aria-hidden=true]']},
 {name:'components',selectors:['.floating-control > span[aria-hidden=true]','#gc-file-action-trigger > span[aria-hidden=true]']},
 {name:'adaptive',selectors:['.gc-metric-card:nth-child(1) .gc-metric-icon','.gc-metric-card:nth-child(3) .gc-metric-icon','.gc-activity-list li:nth-child(1) .gc-activity-symbol','.gc-activity-list li:nth-child(2) .gc-activity-symbol']},
 {name:'forms',selectors:['.gc-recovery-symbol']}
];
const variants=[
 {width:320,mode:'light',rtl:false},
 {width:320,mode:'dark',rtl:false},
 {width:1440,mode:'light',rtl:false},
 {width:1440,mode:'dark',rtl:false},
 {width:768,mode:'light',rtl:true}
];
for(const {width,mode,rtl} of variants){
 test('non-text glyph rendered-pixel review '+width+' '+mode+(rtl?' rtl':''),async({page},testInfo)=>{
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({colorScheme:mode,reducedMotion:'reduce'});
  const measures=[];
  for(const lab of labs){
   await page.goto('/lab/'+lab.name+'.html');
   if(rtl)await page.evaluate(()=>document.documentElement.dir='rtl');
   await expect(page.locator('html')).toHaveAttribute('data-gc-mode',mode);
   for(const selector of lab.selectors){
    const element=page.locator(selector);
    await expect(element).toHaveCount(1);
    await element.scrollIntoViewIfNeeded();
    const before=await element.evaluate(el=>({
     value:el.style.getPropertyValue('color'),
     priority:el.style.getPropertyPriority('color'),
     decorative:el.getAttribute('aria-hidden')==='true'||el.closest('[aria-hidden=true]')!==null
    }));
    const result=await sampleBackdrop(page,selector);
    const after=await element.evaluate(el=>({
     value:el.style.getPropertyValue('color'),
     priority:el.style.getPropertyPriority('color')
    }));
    expect(after,selector+' restores original color').toEqual({value:before.value,priority:before.priority});
    expect(result.samples,selector+' actual pixels').toBeGreaterThan(30);
    expect(result.min,lab.name+' '+selector+' '+width+' '+mode+' composited pixel ratio').toBeGreaterThanOrEqual(3);
    measures.push({lab:lab.name,selector,decorative:before.decorative,...result});
   }
   const key=lab.name+'-'+width+'-'+mode+(rtl?'-rtl':'');
   const folder=resolve(testInfo.project.outputDir,'nontext-visual');
   await mkdir(folder,{recursive:true});
   const png=join(folder,key+'.png'),json=join(folder,key+'.json');
   await writeFile(png,await page.screenshot({fullPage:true,animations:'disabled'}));
   await writeFile(json,JSON.stringify({schema:'gc-ui-nontext-visual.v1',lab:lab.name,
    width,mode,rtl,measurements:measures.filter(x=>x.lab===lab.name),
    scope:'Selected non-text pixel samples; not universal WCAG or human visual signoff'},null,2)+'\n');
   await testInfo.attach(key+'.png',{path:png,contentType:'image/png'});
   await testInfo.attach(key+'.json',{path:json,contentType:'application/json'});
  }
  console.log('NONTEXT_PIXEL_CHECK',JSON.stringify({width,mode,minimum:Math.min(...measures.map(x=>x.min))}));
  await testInfo.attach('nontext-pixels.json',{
   body:Buffer.from(JSON.stringify({width,mode,measurements:measures,scope:'Selected rendered glyph backdrops, not all non-text 1.4.11 conformance'},null,2)),
   contentType:'application/json'});
 });
}
