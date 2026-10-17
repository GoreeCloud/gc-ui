import {test,expect} from '@playwright/test';
test('experience studio adapts illustration, depth, and platform without viewport inference',async({page})=>{
 await page.goto('/lab/experience-studio.html');
 const root=page.locator('html');
 await expect(page.getByRole('heading',{name:/One language/i})).toBeVisible();
 await expect(root).toHaveAttribute('data-gc-platform','web');
 await expect(page.locator('#feature')).toHaveAttribute('data-gc-depth','e2');
 await page.locator('#scene').selectOption('reading');
 await expect(page.locator('#scene-title')).toHaveText('Make clarity the centerpiece.');
 await expect(page.locator('#scene-use')).toHaveAttribute('href',/gc-scene-reading$/);
 await expect(page.locator('#feature')).toHaveAttribute('data-gc-depth','e1');
 await page.locator('#platform').selectOption('tv');
 await expect(root).toHaveAttribute('data-gc-platform','tv');
 await expect(page.locator('#feature')).toHaveAttribute('data-gc-depth','e1');
 await expect(page.locator('#profile-status')).toContainText('targets: 64px');
 await page.locator('#scene').selectOption('analysis');
 await expect(page.locator('#scene-use')).toHaveAttribute('href',/gc-scene-analysis$/);
 await expect(page.locator('#feature')).toHaveAttribute('data-gc-depth','e1');
 await page.locator('#platform').selectOption('desktop');
 await expect(page.locator('#feature')).toHaveAttribute('data-gc-depth','e2');
 await page.locator('#detail').selectOption('overlay');
 await expect(page.locator('#feature')).toHaveAttribute('data-gc-depth','e2');
 await page.locator('#scene').selectOption('workspace');
 await expect(page.locator('#feature')).toHaveAttribute('data-gc-depth','e3');
});
test('studio keeps semantics at 320px, supports motion skip and forced-colors',async({page})=>{
 await page.setViewportSize({width:320,height:720});
 await page.goto('/lab/experience-studio.html');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
 await page.locator('#reduced').check();
 await page.locator('#animate').click();
 await expect(page.locator('#profile-status')).toContainText('Motion skipped');
 await page.locator('#cancel').click();
 await expect(page.locator('#profile-status')).toContainText('stopped');
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
 await page.locator('#scene').selectOption('workspace');
 await expect(page.locator('#feature')).toHaveAttribute('data-gc-depth','e0');
 await expect(page.locator('#feature')).toHaveCSS('box-shadow','none');
 await page.locator('#animate').click();
 await expect(page.locator('#profile-status')).toContainText('Motion skipped');
});

test('browser-only platform profiles never unlock native host controls',async({page})=>{
 await page.addInitScript(()=>{
  delete window.GCNativeHost;
  delete window.GCAndroidHost;
 });
 await page.setViewportSize({width:320,height:720});
 await page.goto('/lab/experience-studio.html');
 const feedback=page.getByRole('button',{name:'Test native selection feedback'});
 const status=page.locator('#profile-status');
 const hostStatus=page.locator('#host-status');
 const root=page.locator('html');
 await expect(hostStatus).toHaveText('Browser preview · no native host connected.');
 await expect(feedback).toBeDisabled();
 for(const [platform,nav,target] of [
  ['tv','directional','64'],
  ['wearable','single-task','48'],
  ['spatial','host-managed','48']
 ]){
  await page.locator('#platform').selectOption(platform);
  await expect(root).toHaveAttribute('data-gc-platform',platform);
  await expect(status).toContainText('navigation: '+nav);
  await expect(status).toContainText('targets: '+target+'px');
  await expect(hostStatus).toHaveText('Browser preview · no native host connected.');
  await expect(feedback).toBeDisabled();
  expect(await root.getAttribute('data-gc-native-host')).toBeNull();
 }
 await page.locator('#conserve').check();
 await expect(root).toHaveAttribute('data-gc-resource-mode','conserve');
 await page.locator('#animate').focus();
 await page.locator('#animate').press('Enter');
 await expect(status).toHaveText('Motion skipped; content remains visible.');
 await expect(page.locator('#scene-title')).toBeVisible();
 await expect(feedback).toBeDisabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('native bridge failures and unverified capabilities preserve the browser fallback',async({page})=>{
 await page.setViewportSize({width:320,height:720});
 await page.addInitScript(()=>{
  let subscriber=null;
  window.GCNativeHost={
   subscribe(fn){subscriber=fn;return ()=>{subscriber=null}},
   postMessage(request){
    const envelope=JSON.parse(request);
    queueMicrotask(()=>subscriber?.(JSON.stringify({
     v:1,type:'gc-host/response',id:envelope.id,ok:true,
     result:{protocol:2,host:'electron',platform:'desktop',
      nativeAdapterInstalled:true,selectionFeedback:true,appearanceControl:true}
    })));
   }
  };
 });
 await page.goto('/lab/experience-studio.html');
 const root=page.locator('html');
 await expect(page.locator('#host-status')).toHaveText('Native bridge unavailable; browser preview remains usable.');
 await expect(page.locator('#host-feedback')).toBeDisabled();
 await expect(root).not.toHaveAttribute('data-gc-native-host',/./);
 await expect(root).toHaveAttribute('data-gc-platform','web');
 await page.locator('#scene').selectOption('reading');
 await expect(page.locator('#scene-title')).toHaveText('Make clarity the centerpiece.');
 await page.locator('#conserve').check();
 await expect(root).toHaveAttribute('data-gc-resource-mode','conserve');
 const play=page.getByRole('button',{name:'Show coordinated transition'});
 await play.focus();
 await play.press('Enter');
 await expect(page.locator('#profile-status')).toHaveText('Motion skipped; content remains visible.');
 await expect(play).toBeFocused();
 await expect(page.locator('#scene-title')).toBeVisible();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(1);
});
