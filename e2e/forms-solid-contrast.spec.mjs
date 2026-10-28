import {test,expect} from '@playwright/test';

/** Browser-resolved text contrast against actual opaque GC UI solid surfaces.
 * Gradient/photo/backdrop, antialiasing and OS-specific rendering remain manual.
 */
for(const scenario of [
 {name:'desktop light',width:1440,mode:'light',high:false},
 {name:'compact dark',width:320,mode:'dark',high:false},
 {name:'compact high contrast',width:375,mode:'dark',high:true}
]){
 test('Forms solid-surface text keeps 4.5:1 contrast — '+scenario.name,async({page})=>{
  await page.setViewportSize({width:scenario.width,height:812});
  if(scenario.mode==='dark'||scenario.high){
   await page.goto('/lab/components.html');
   if(scenario.mode==='dark')await page.locator('[data-theme-mode="dark"]').click();
   if(scenario.high)await page.locator('label:has(#contrast-switch)').click();
  }
  await page.goto('/lab/forms.html');
  await expect(page.locator('html')).toHaveAttribute('data-gc-mode',scenario.mode);
  if(scenario.high)await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','high');
  const contrasts=await page.evaluate(()=>{
   const pairs=[
    ['navigation link','.gc-form-header nav a:first-child','.gc-form-header nav a:first-child'],
    ['header brand','.gc-form-brand','.gc-form-header'],
    ['project field label','label[for="brief-name"]','.gc-form-panel:first-child'],
    ['project title','#draft-title','.gc-form-panel:first-child'],
    ['primary submit','#brief-submit','#brief-submit'],
    ['project result metadata','.gc-search-results li span','.gc-search-results li']
   ];
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
   const context=canvas.getContext('2d',{willReadFrequently:true});
   if(!context)throw new Error('Canvas color sampling unavailable');
   const sample=color=>{
    context.clearRect(0,0,1,1);
    context.fillStyle='#fedcba';context.fillStyle=color;
    if(context.fillStyle==='#fedcba'&&color.toLowerCase()!=='#fedcba')
     throw new Error('Cannot parse CSS color '+color);
    context.fillRect(0,0,1,1);
    const rgba=Array.from(context.getImageData(0,0,1,1).data);
    if(rgba[3]!==255)throw new Error('Expected an opaque solid color: '+color);
    return rgba.slice(0,3);
   };
   const luminance=rgb=>rgb.reduce((sum,value,i)=>{
    const srgb=value/255;
    const linear=srgb<=.04045?srgb/12.92:((srgb+.055)/1.055)**2.4;
    return sum+linear*[.2126,.7152,.0722][i];
   },0);
   return pairs.map(([name,foreground,background])=>{
    const f=document.querySelector(foreground),b=document.querySelector(background);
    if(!f||!b)throw new Error('Missing contrast fixture: '+name);
    const fg=getComputedStyle(f).color,bg=getComputedStyle(b).backgroundColor;
    const a=luminance(sample(fg)),c=luminance(sample(bg));
    return {name,foreground:fg,background:bg,ratio:(Math.max(a,c)+.05)/(Math.min(a,c)+.05)};
   });
  });
  expect(contrasts).toHaveLength(6);
  for(const entry of contrasts)
   expect(entry.ratio,scenario.name+' / '+entry.name+' '+entry.foreground+' on '+entry.background)
    .toBeGreaterThanOrEqual(4.5);
 });
}
