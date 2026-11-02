import {test,expect} from '@playwright/test';

const inspect=async (page,selector)=>page.locator(selector).evaluate(popup=>{
 const c=document.createElement('canvas');c.width=c.height=1;
 const ctx=c.getContext('2d',{willReadFrequently:true});
 const rgba=color=>{
  ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);
  return Array.from(ctx.getImageData(0,0,1,1).data);
 };
 const over=(under,upper)=>{
  const alpha=upper[3]/255;
  return under.slice(0,3).map((v,i)=>Math.round(v*(1-alpha)+upper[i]*alpha)).concat(255);
 };
 const lum=x=>x.slice(0,3).reduce((sum,v,i)=>{
  const s=v/255;return sum+(s<=.04045?s/12.92:((s+.055)/1.055)**2.4)*[.2126,.7152,.0722][i];
 },0);
 const ratio=(a,b)=>{
  const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
 };
 const surface=rgba(getComputedStyle(popup).backgroundColor);
 return [...popup.querySelectorAll('[role=option],[role=menuitem]')].map(item=>{
  const style=getComputedStyle(item),fg=rgba(style.color),bg=rgba(style.backgroundColor);
  const candidates=['#000','#fff'].map(base=>ratio(fg,over(over(rgba(base),surface),bg)));
  return {label:item.textContent.trim(),disabled:item.getAttribute('aria-disabled')==='true',
   minRatio:Math.min(...candidates),ratios:candidates,surfaceAlpha:surface[3],itemAlpha:bg[3]};
 });
});

for(const mode of ['light','dark']){
 test('Forms effective text contrast '+mode,async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto('/lab/forms.html');
  await page.evaluate(v=>document.documentElement.dataset.gcMode=v,mode);
  const input=page.getByRole('combobox',{name:'Search projects'});
  await input.fill('d');await input.press('ArrowDown');
  const popup=page.locator('#project-suggestions');
  await popup.scrollIntoViewIfNeeded();
  const metrics=await inspect(page,'#project-suggestions');
  console.log('FORMS_EFFECTIVE_CONTRAST',mode,JSON.stringify(metrics));
  expect(metrics).toHaveLength(3);
  for(const item of metrics)if(!item.disabled)
   expect(item.minRatio,'option '+item.label).toBeGreaterThanOrEqual(4.5);
 });
 test('Components action-menu effective text contrast '+mode,async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto('/lab/components.html');
  if(mode==='dark')await page.locator('[data-theme-mode=dark]').click();
  await page.locator('#gc-file-action-trigger').press('ArrowDown');
  await page.locator('#gc-file-actions').scrollIntoViewIfNeeded();
  const metrics=await inspect(page,'#gc-file-actions');
  console.log('MENU_EFFECTIVE_CONTRAST',mode,JSON.stringify(metrics));
  expect(metrics).toHaveLength(4);
  for(const item of metrics)if(!item.disabled)
   expect(item.minRatio,'menu '+item.label).toBeGreaterThanOrEqual(4.5);
 });
}

for(const control of ['forms','menu']){
 test('Forced-colors popup text contrast '+control,async({page},testInfo)=>{
  await page.emulateMedia({forcedColors:'active'});
  await page.setViewportSize({width:375,height:812});
  if(control==='forms'){
   await page.goto('/lab/forms.html');
   const input=page.getByRole('combobox',{name:'Search projects'});
   await input.fill('d');await input.press('ArrowDown');
   await page.locator('#project-suggestions').scrollIntoViewIfNeeded();
  }else{
   await page.goto('/lab/components.html');
   await page.locator('#gc-file-action-trigger').press('ArrowDown');
   await page.locator('#gc-file-actions').scrollIntoViewIfNeeded();
  }
  const selector=control==='forms'?'#project-suggestions':'#gc-file-actions';
  const metrics=await inspect(page,selector);
  if(control==='forms'){
   const outline=await page.locator('#project-suggestions [aria-selected=true]').evaluate(el=>{
    const css=getComputedStyle(el);
    return {width:parseFloat(css.outlineWidth),style:css.outlineStyle};
   });
   expect(outline.style).toBe('solid');
   expect(outline.width).toBeGreaterThanOrEqual(3);
  }
  console.log('FORCED_EFFECTIVE_CONTRAST',control,JSON.stringify(metrics));
  expect(metrics).toHaveLength(control==='forms'?3:4);
  for(const item of metrics)if(!item.disabled)
   expect(item.minRatio,'forced '+item.label).toBeGreaterThanOrEqual(4.5);
  await testInfo.attach(control+'-forced-popup.png',{
   body:await page.screenshot({animations:'disabled'}),contentType:'image/png'
  });
 });
}
