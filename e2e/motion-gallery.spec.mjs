import {test,expect} from '@playwright/test';
test('motion gallery presets remain keyboard-operable, cancels and honors reduced-motion preview',async({page})=>{
 await page.goto('/lab/motion-gallery.html');
 await expect(page.getByRole('heading',{name:'Movement with meaning.'})).toBeVisible();
 await page.locator('[data-preset=slideInline]').click();
 await expect(page.locator('[data-preset=slideInline]')).toHaveAttribute('aria-pressed','true');
 await page.locator('#direction').selectOption('rtl');
 await page.locator('#play').click();
 await expect(page.locator('#motion-status')).toContainText('slideInline played');
 await page.locator('#stop').click();
 await expect(page.locator('#motion-status')).toContainText('stopped');
 await page.locator('#demo-reduced').check();
 await page.locator('#play').click();
 await expect(page.locator('#motion-status')).toContainText('skipped');
 await page.setViewportSize({width:320,height:700});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('system reduced motion and high contrast suppress motion without hiding content',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:320,height:700});
 await page.goto('/lab/motion-gallery.html');
 const sample=page.locator('#sample');
 const play=page.getByRole('button',{name:'Play transition'});
 const status=page.locator('#motion-status');
 await expect(page.locator('#demo-reduced')).not.toBeChecked();
 expect(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
 const dismiss=page.getByRole('button',{name:'Dismiss',exact:true});
 await dismiss.focus();
 await dismiss.press('Enter');
 await expect(dismiss).toHaveAttribute('aria-pressed','true');
 await play.focus();
 await play.press('Enter');
 await expect(status).toHaveText('Motion skipped; the content remains available.');
 await expect(sample.getByRole('heading',{name:'An anchored transition.'})).toBeVisible();
 await expect(play).toBeFocused();
 expect(await sample.evaluate(el=>el.getAnimations().length)).toBe(0);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>document.documentElement.dataset.gcContrast='high');
 await play.press('Enter');
 await expect(status).toHaveText('Motion skipped; the content remains available.');
 await expect(sample.getByRole('heading',{name:'An anchored transition.'})).toBeVisible();
 expect(await sample.evaluate(el=>el.getAnimations().length)).toBe(0);
 await page.evaluate(()=>delete document.documentElement.dataset.gcContrast);
 await play.press('Enter');
 await expect(status).toHaveText('dismiss played.');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(1);
});

test('new bounded motion presets are selectable and reduced-motion safe',async({page})=>{
 await page.goto('/lab/motion-gallery.html');
 for(const name of ['surfaceEnter','surfaceExit','press','nudgeInline']){
  await page.locator('[data-preset="'+name+'"]').click();
  await expect(page.locator('[data-preset="'+name+'"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('#play').click();
  await expect(page.locator('#motion-status')).toContainText(name+' played');
 }
 await page.locator('#demo-reduced').check();
 await page.locator('#play').click();
 await expect(page.locator('#motion-status')).toContainText('skipped');
});

test('active native animation stops when reduced motion or high contrast switches on mid-flight',async({page})=>{
 await page.goto('/lab/motion-gallery.html');
 const play=page.getByRole('button',{name:'Play transition'});
 const sample=page.locator('#sample');
 await play.click();
 await expect(page.locator('#motion-status')).toContainText('reveal played');
 expect(await sample.evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect.poll(()=>sample.evaluate(el=>el.getAnimations().length)).toBe(0);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await play.click();
 expect(await sample.evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
 await page.evaluate(()=>{
  document.documentElement.dataset.gcContrast='high';
  document.documentElement.dispatchEvent(new CustomEvent('gc-theme-change'));
 });
 await expect.poll(()=>sample.evaluate(el=>el.getAnimations().length)).toBe(0);
 await expect(sample.getByRole('heading',{name:'An anchored transition.'})).toBeVisible();
});

test('direct WAAPI preset honors increased contrast and remains usable when media queries are unsupported',async({page})=>{
 await page.goto('/lab/motion-gallery.html');
 const result=await page.evaluate(async()=>{
  const {playMotionPreset,motionAllowed}=await import('/src/gc-motion-presets.mjs');
  const element=document.createElement('div');
  element.textContent='Contrast-safe transition sample';
  element.style.cssText='width:120px;height:50px;display:block';
  document.body.append(element);
  const media=q=>({matches:q==='(prefers-contrast: more)'});
  const disabled=motionAllowed({media,root:document.documentElement})===false;
  const skipped=playMotionPreset(element,'surfaceEnter',{media,root:document.documentElement})===null;
  const activeAfterSkip=element.getAnimations().length;
  const unsupported=q=>{if(q.includes('forced-colors'))throw Error('unknown query');return media(q)};
  const unsupportedStillSafe=motionAllowed({media:unsupported,root:document.documentElement})===false;
  const allowed=playMotionPreset(element,'surfaceEnter',{
   media:()=>({matches:false}),root:document.documentElement
  });
  const played=allowed!==null&&element.getAnimations().length===1;
  allowed?.cancel();
  const empty=element.getAnimations().length===0;
  element.remove();
  return {disabled,skipped,activeAfterSkip,unsupportedStillSafe,played,empty};
 });
 expect(result).toEqual({
  disabled:true,skipped:true,activeAfterSkip:0,unsupportedStillSafe:true,
  played:true,empty:true
 });
});

test('throwing native animation cancel does not prevent motion cleanup or newer play',async({page})=>{
 await page.goto('/lab/motion-gallery.html');
 const result=await page.evaluate(async()=>{
  const {createMotionCoordinator}=await import('/src/gc-transition-coordinator.mjs');
  const good={animate(){return {addEventListener(){},cancel(){}}}};
  const broken={animate(){return {addEventListener(){},cancel(){throw Error('native WAAPI cancel failure')}}}};
  const coordinator=createMotionCoordinator({
   media:()=>({matches:false}),root:document.documentElement
  });
  const first=coordinator.play(broken,'reveal')!==null;
  const second=coordinator.play(good,'settle')!==null;
  let cancelledSafely=true;
  try{coordinator.cancelAll()}catch{cancelledSafely=false}
  const activeAfterCancel=coordinator.activeCount();
  const playsAgain=coordinator.play(good,'settle')!==null;
  let disposedSafely=true;
  try{coordinator.destroy()}catch{disposedSafely=false}
  return {first,second,cancelledSafely,activeAfterCancel,playsAgain,disposedSafely,activeAfterDestroy:coordinator.activeCount()};
 });
 expect(result).toEqual({
  first:true,second:true,cancelledSafely:true,activeAfterCancel:0,
  playsAgain:true,disposedSafely:true,activeAfterDestroy:0
 });
});
