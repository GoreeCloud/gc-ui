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

for(const mode of ['light','dark']){
 test('actual Components gradient keeps text readable in '+mode,async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/lab/components.html');
  if(mode==='dark')await page.locator('[data-theme-mode=dark]').click();
  await expect(page.locator('.environment')).not.toHaveCSS('background-image','none');
  for(const selector of ['.intro > .eyebrow','.intro > .summary','#components-title']){
   const result=await sampleBackdrop(page,selector);
   console.log('PIXEL-CONTRAST '+JSON.stringify({mode,selector,...result}));
   expect(result.samples).toBeGreaterThan(20);
   expect(result.min,mode+' '+selector).toBeGreaterThanOrEqual(4.5);
  }
 });
}
