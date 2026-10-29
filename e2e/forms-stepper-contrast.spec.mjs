import {test,expect} from '@playwright/test';

/** Axe marks a stepper's “−” as non-text/indeterminate.
 * A named, enabled icon control still needs identifiable 3:1 visible ink.
 * Compare live browser-computed opaque foreground and control background; this
 * is not a photographic/composited pixel or optical glyph-rasterization audit.
 */
for(const appearance of ['light','dark','high-contrast','forced-colors']){
 test('active collaborator glyphs are named, reachable and at least 3:1 in '+appearance,async({page})=>{
  await page.setViewportSize({width:375,height:812});
  if(appearance==='forced-colors')await page.emulateMedia({forcedColors:'active'});
  else if(appearance!=='light'){
   await page.goto('/lab/components.html');
   await page.locator('[data-theme-mode="dark"]').click();
   if(appearance==='high-contrast')await page.locator('label:has(#contrast-switch)').click();
  }
  await page.goto('/lab/forms.html');
  if(appearance==='high-contrast')
   await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','high');
  if(appearance==='forced-colors')
   await expect.poll(()=>page.evaluate(()=>matchMedia('(forced-colors: active)').matches)).toBe(true);
  const buttons=[
   page.getByRole('button',{name:'Remove one collaborator'}),
   page.getByRole('button',{name:'Add one collaborator'})
  ];
  for(const button of buttons){
   await expect(button).toBeEnabled();
   await expect(button).toBeVisible();
   const result=await button.evaluate(el=>{
    const style=getComputedStyle(el),box=el.getBoundingClientRect();
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=1;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)throw new Error('Canvas not available for color measurement');
    const rgb=color=>{
     ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);
     const [r,g,b,a]=ctx.getImageData(0,0,1,1).data;
     if(a!==255)throw new Error('Stepper colors must be opaque: '+color);
     return [r,g,b];
    };
    const l=channels=>channels.reduce((total,value,i)=>{
     const x=value/255;
     return total+(x<=.04045?x/12.92:((x+.055)/1.055)**2.4)*[.2126,.7152,.0722][i];
    },0);
    const a=l(rgb(style.color)),b=l(rgb(style.backgroundColor));
    return {width:box.width,height:box.height,
     ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),
     foreground:style.color,background:style.backgroundColor};
   });
   expect(result.width).toBeGreaterThanOrEqual(44);
   expect(result.height).toBeGreaterThanOrEqual(44);
   expect(result.ratio,appearance+' '+await button.getAttribute('aria-label')+
    ' '+result.foreground+' on '+result.background).toBeGreaterThanOrEqual(3);
  }
  // Disabled boundary states may legitimately be lower contrast: ensure
  // the control state is exposed rather than applying enabled requirements.
  const count=page.getByRole('spinbutton',{name:'Collaborators'});
  await count.fill('1');
  await count.dispatchEvent('change'); // Controller commits native number editing on change.
  await expect(buttons[0]).toBeDisabled();
  await count.fill('12');
  await count.dispatchEvent('change');
  await expect(buttons[1]).toBeDisabled();
 });
}
