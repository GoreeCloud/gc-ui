import {test,expect} from '@playwright/test';

async function sampleBackdrop(page,selector){
 const el=page.locator(selector);
 await el.scrollIntoViewIfNeeded();
 await page.evaluate(()=>document.fonts.ready);
 const color=await el.evaluate(node=>getComputedStyle(node).color);
 const old=await el.evaluate(node=>{
  const old=node.style.color;
  node.style.setProperty('color','transparent','important');
  return old;
 });
 let png;
 try{png=await el.screenshot({animations:'disabled',scale:'css'})}
 finally{await el.evaluate((node,old)=>{node.style.color=old},old)}
 return page.evaluate(async({data,color})=>{
  const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
  const image=await createImageBitmap(new Blob([bytes],{type:'image/png'}));
  const canvas=document.createElement('canvas');
  canvas.width=image.width;canvas.height=image.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(image,0,0);image.close();
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  ctx.fillStyle=color;ctx.fillRect(0,0,1,1);
  const fg=ctx.getImageData(0,0,1,1).data;
  const lum=(r,g,b)=>[r,g,b].reduce((sum,v,i)=>{
   const s=v/255,x=s<=.04045?s/12.92:((s+.055)/1.055)**2.4;
   return sum+x*[.2126,.7152,.0722][i];
  },0);
  const a=lum(fg[0],fg[1],fg[2]);
  let min=Infinity,samples=0;
  for(let i=0;i<pixels.length;i+=12){
   const b=lum(pixels[i],pixels[i+1],pixels[i+2]);
   min=Math.min(min,(Math.max(a,b)+.05)/(Math.min(a,b)+.05));
   samples++;
  }
  return {min,samples,foreground:color};
 },{data:png.toString('base64'),color});
}

for(const viewport of [
 {name:'desktop',width:1440,height:900},
 {name:'compact',width:320,height:812},
 {name:'mobile',width:375,height:812}
])for(const mode of ['light','dark']){
 test('actual Components gradient keeps text readable in '+mode+' at '+viewport.name,async({page})=>{
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await page.goto('/lab/components.html');
  if(mode==='dark')await page.locator('[data-theme-mode=dark]').click();
  await expect(page.locator('.environment')).not.toHaveCSS('background-image','none');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow,viewport.name+' horizontal reflow').toBeLessThanOrEqual(1);
  for(const selector of ['.intro > .eyebrow','.intro > .summary','#components-title']){
   const result=await sampleBackdrop(page,selector);
   console.log('PIXEL-CONTRAST '+JSON.stringify({mode,viewport:viewport.name,width:viewport.width,selector,...result}));
   expect(result.samples).toBeGreaterThan(20);
   expect(result.min,mode+' '+selector).toBeGreaterThanOrEqual(4.5);
  }
 });
}

/* A custom accent changes both semantic roles and the ambient gradient. Do
 * not infer readability from the default Iris screenshots: sample the actual
 * pixels beneath the same content after each palette/appearance selection.
 */
for(const accent of ['lagoon','ember','moss']){
 for(const mode of ['light','dark']){
  for(const viewport of [
   {name:'compact',width:320,height:812},
   {name:'desktop',width:1440,height:900}
  ]){
   test('accent '+accent+' '+mode+' real gradient text at '+viewport.name,async({page})=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    await page.goto('/lab/components.html');
    await page.locator('[data-theme-mode="'+mode+'"]').click();
    const swatch=page.locator('[data-theme-accent="'+accent+'"]');
    await swatch.click();
    await expect(swatch).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('html')).toHaveAttribute('data-gc-mode',mode);
    await expect(page.locator('html')).toHaveAttribute('data-gc-accent',accent);
    await expect(page.locator('.environment')).not.toHaveCSS('background-image','none');
    const overflow=await page.evaluate(()=>
      document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,accent+' '+mode+' '+viewport.name+' reflow').toBeLessThanOrEqual(1);
    for(const selector of ['.intro > .eyebrow','.intro > .summary','#components-title']){
     const result=await sampleBackdrop(page,selector);
     console.log('ACCENT-PIXEL-CONTRAST '+JSON.stringify({accent,mode,
      viewport:viewport.name,width:viewport.width,selector,...result}));
     expect(result.samples).toBeGreaterThan(20);
     expect(result.min,accent+' '+mode+' '+viewport.name+' '+selector).toBeGreaterThanOrEqual(4.5);
    }
   });
  }
 }
}
