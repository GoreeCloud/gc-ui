/* Original real-pixel backdrop sampling shared by gradient QA. */
export async function sampleBackdrop(page,selector){
 const el=page.locator(selector);
 await el.scrollIntoViewIfNeeded();
 await page.evaluate(()=>document.fonts.ready);
 const color=await el.evaluate(node=>getComputedStyle(node).color);
 const old=await el.evaluate(node=>{
  const previous={value:node.style.getPropertyValue('color'),priority:node.style.getPropertyPriority('color')};
  node.style.setProperty('color','transparent','important');
  return previous;
 });
 let png;
 try{png=await el.screenshot({animations:'disabled',scale:'css'})}
 finally{await el.evaluate((node,previous)=>{
  if(previous.value)node.style.setProperty('color',previous.value,previous.priority);
  else node.style.removeProperty('color');
 },old)}
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

/** Real rendered background beneath glyph ink for text-only, fixed-geometry controls.
 * Hiding font ink (not CSS color) works with OS forced-colors; the 8px inset
 * excludes the control border. This does not raster-measure anti-aliased ink.
 * The caller must assert geometryUnchanged and the applicable ratio threshold.
 */
export async function sampleTextControlInteriorBackdrop(page,selector){
 const el=page.locator(selector);
 await el.scrollIntoViewIfNeeded();
 await page.evaluate(()=>document.fonts.ready);
 const before=await el.evaluate(node=>{
  const style=getComputedStyle(node),box=node.getBoundingClientRect();
  return {color:style.color,background:style.backgroundColor,
   font:node.style.getPropertyValue('font-size'),
   priority:node.style.getPropertyPriority('font-size'),
   width:box.width,height:box.height};
 });
 await el.evaluate(node=>node.style.setProperty('font-size','0px','important'));
 let png,hidden;
 try{
  hidden=await el.evaluate(node=>{
   const style=getComputedStyle(node),box=node.getBoundingClientRect();
   return {width:box.width,height:box.height,background:style.backgroundColor};
  });
  png=await el.screenshot({animations:'disabled',scale:'css'});
 } finally{
  await el.evaluate((node,old)=>{
   if(old.font)node.style.setProperty('font-size',old.font,old.priority);
   else node.style.removeProperty('font-size');
  },before);
 }
 return page.evaluate(async({data,color,unchanged})=>{
  const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
  const image=await createImageBitmap(new Blob([bytes],{type:'image/png'}));
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
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
  const inset=8;
  for(let y=inset;y<canvas.height-inset;y+=3){
   for(let x=inset;x<canvas.width-inset;x+=3){
    const i=(y*canvas.width+x)*4,b=lum(pixels[i],pixels[i+1],pixels[i+2]);
    min=Math.min(min,(Math.max(a,b)+.05)/(Math.min(a,b)+.05));samples++;
   }
  }
  return {min,samples,geometryUnchanged:unchanged,foreground:color};
 },{data:png.toString('base64'),color:before.color,
    unchanged:before.width===hidden.width&&before.height===hidden.height&&before.background===hidden.background});
}
