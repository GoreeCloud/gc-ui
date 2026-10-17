import {test,expect} from '@playwright/test';

/** Experimental 200% text scaling + RTL reflow gate.
 * CSS widths 320 and 375 represent the narrow display/reflow contracts.
 * It does not replace manual zoom, translation, or native browser font scaling.
 */
for(const lab of ['v1','components','catalog','adaptive','forms','environment','icon-atlas','motion-gallery']){
 test('reflow with larger text and RTL — '+lab,async({page})=>{
  for(const width of [320,375,600,768]){
   await page.setViewportSize({width,height:700});
   await page.goto('/lab/'+lab+'.html');
   await page.evaluate(()=>{
    document.documentElement.dir='rtl';
    document.documentElement.style.fontSize='32px';
    document.body.style.fontSize='32px';
   });
   const layout=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    width:document.documentElement.clientWidth,
    direction:document.documentElement.dir
   }));
   expect(layout.direction).toBe('rtl');
   expect(layout.overflow,'Unexpected horizontal overflow at '+width+'px, '+lab).toBeLessThanOrEqual(1);
  }
 });
}
