import {test,expect} from '@playwright/test';

// Canvas composes the browser's resolved color-mix() just as a uniformly
// colored underlay would. Black and white bound any opaque sRGB backdrop;
// this does not sample real photographs, text antialiasing or OS compositors.
test('translucent Lens copy retains 4.5:1 over extreme backdrops and custom seeds',async({page})=>{
 await page.goto('/lab/environment.html');
 const samples=await page.evaluate(async()=>{
  const {generateTheme}=await import('/src/gc-color-engine.mjs');
  const root=document.documentElement;
  const lens=document.querySelector('.gc-material-surface[data-gc-treatment="lens"]');
  const primary=lens.querySelector('strong'),secondary=lens.querySelector('.lens-state');
  const previousStyle=root.getAttribute('style'),previousMode=root.dataset.gcMode;
  const failures=[],results=[];
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw new Error('Canvas pixel sampling unavailable');
  const sampledColor=color=>{
   ctx.clearRect(0,0,1,1);
   ctx.fillStyle='#ff00ff';
   ctx.fillStyle=color;
   if(ctx.fillStyle.toLowerCase()==='#ff00ff')throw new Error('Canvas did not parse '+color);
   ctx.fillRect(0,0,1,1);
   return [...ctx.getImageData(0,0,1,1).data].slice(0,3);
  };
  const compositedColor=(underlay,overlay)=>{
   ctx.clearRect(0,0,1,1);
   ctx.fillStyle=underlay;ctx.fillRect(0,0,1,1);
   ctx.fillStyle=overlay;ctx.fillRect(0,0,1,1);
   return [...ctx.getImageData(0,0,1,1).data].slice(0,3);
  };
  const luminance=channels=>channels.reduce((sum,value,i)=>{
   const s=value/255,linear=s<=.04045?s/12.92:((s+.055)/1.055)**2.4;
   return sum+linear*[.2126,.7152,.0722][i];
  },0);
  const contrast=(a,b)=>{
   const [lo,hi]=[luminance(a),luminance(b)].sort((x,y)=>x-y);
   return (hi+.05)/(lo+.05);
  };
  try{
   for(const seed of ['#5145D9','#000000','#FFFFFF','#087C8D','#FF00FF']){
    for(const mode of ['light','dark']){
     root.dataset.gcMode=mode;
     const roles=generateTheme(seed,mode).roles;
     for(const [key,value] of Object.entries(roles)){
      const name=key.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();
      root.style.setProperty('--gc-v1-color-'+name,value);
     }
     const bg=getComputedStyle(lens).backgroundColor;
     const backFilter=getComputedStyle(lens).backdropFilter;
     if(bg==='transparent'||backFilter==='none')throw new Error('Translucent Lens was not rendered');
     for(const [name,element] of [['primary',primary],['secondary',secondary]]){
      const fg=sampledColor(getComputedStyle(element).color);
      for(const underlay of ['#000000','#ffffff']){
       const rendered=compositedColor(underlay,bg);
       const ratio=contrast(fg,rendered);
       const result={seed,mode,name,underlay,ratio};
       results.push(result);
       if(ratio<4.5)failures.push(result);
      }
     }
    }
   }
  }finally{
   if(previousStyle===null)root.removeAttribute('style');else root.setAttribute('style',previousStyle);
   if(previousMode===undefined)delete root.dataset.gcMode;else root.dataset.gcMode=previousMode;
  }
  return {results,failures};
 });
 expect(samples.results).toHaveLength(40);
 expect(samples.failures).toEqual([]);
});

test('Lens resolves to an opaque blur-free plane when solid surface is requested',async({page})=>{
 await page.goto('/lab/environment.html');
 const lens=page.locator('.gc-material-surface[data-gc-treatment=lens]');
 await page.evaluate(()=>document.documentElement.dataset.gcSurfaceLens='solid');
 await expect(lens).toHaveCSS('backdrop-filter','none');
 const bg=await lens.evaluate(el=>getComputedStyle(el).backgroundColor);
 const alpha=await lens.evaluate((el,color)=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
  const context=canvas.getContext('2d');
  context.clearRect(0,0,1,1);
  context.fillStyle=color;context.fillRect(0,0,1,1);
  return context.getImageData(0,0,1,1).data[3];
 },bg);
 expect(alpha).toBe(255);
});
