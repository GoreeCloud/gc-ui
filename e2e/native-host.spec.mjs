import {test,expect} from '@playwright/test';

test('Experience Studio uses a vetted host profile and sends allowlisted native feedback',async({page})=>{
 await page.addInitScript(()=>{
  const listeners=[];
  window.__gcTestNativeActions=[];
  window.GCNativeHost={
   subscribe:fn=>{listeners.push(fn);return()=>{const i=listeners.indexOf(fn);if(i>=0)listeners.splice(i,1)}},
   postMessage:text=>{
    const request=JSON.parse(text);
    window.__gcTestNativeActions.push(request.action);
    const result=request.action==='getCapabilities'?{
      protocol:1,host:'electron',platform:'desktop',nativeAdapterInstalled:true,
      highContrast:false,reducedMotion:false,reducedTransparency:false,lowPower:false,
      appearanceControl:true,selectionFeedback:true
    }:request.action==='selectionFeedback'?{performed:true}:{mode:request.payload.mode};
    queueMicrotask(()=>listeners.forEach(fn=>fn({data:JSON.stringify({v:1,type:'gc-host/response',
     id:request.id,ok:true,result})})));
   }
  };
 });
 await page.goto('/lab/experience-studio.html');
 await expect(page.locator('#host-status')).toContainText('Native electron host connected');
 await expect(page.locator('html')).toHaveAttribute('data-gc-native-host','electron');
 await expect(page.locator('#platform')).toHaveValue('desktop');
 await expect.poll(()=>page.evaluate(()=>window.__gcTestNativeActions.includes('setAppearance'))).toBe(true);
 await page.locator('#host-feedback').click();
 await expect(page.locator('#host-status')).toContainText('performed');
 await page.getByRole('button',{name:'Switch to dark appearance'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
});
test('unhosted web remains fully functional with native feedback safely disabled',async({page})=>{
 await page.goto('/lab/experience-studio.html');
 await expect(page.locator('#host-status')).toContainText('Browser preview');
 await expect(page.locator('#host-feedback')).toBeDisabled();
 await page.locator('#scene').selectOption('analysis');
 await expect(page.locator('#scene-title')).toContainText('See the signal');
});

test('native energy and accessibility hints affect the actual surfaces, motion, and resume refresh',async({page})=>{
 await page.addInitScript(()=>{
  const listeners=[];
  window.__gcHostState={
   protocol:1,host:'android',platform:'phone',nativeAdapterInstalled:true,
   lowPower:false,highContrast:false,reducedMotion:false,reducedTransparency:false,
   selectionFeedback:true,appearanceControl:true
  };
  window.__gcHostRequests=[];
  window.GCNativeHost={
   subscribe:fn=>{listeners.push(fn);return()=>{const index=listeners.indexOf(fn);if(index>=0)listeners.splice(index,1)}},
   postMessage:json=>{
    const message=JSON.parse(json);
    window.__gcHostRequests.push(message.action);
    const result=message.action==='getCapabilities'?{...window.__gcHostState}:
      message.action==='setAppearance'?{mode:message.payload.mode}:{performed:true};
    queueMicrotask(()=>listeners.forEach(fn=>fn({data:JSON.stringify({
     v:1,type:'gc-host/response',id:message.id,ok:true,result
    })})));
   }
  };
 });
 await page.goto('/lab/experience-studio.html');
 const root=page.locator('html');
 const feature=page.locator('#feature');
 await expect(page.locator('#host-status')).toContainText('Native android host connected');
 await expect(feature).toHaveAttribute('data-gc-depth','e2');
 await expect(root).toHaveAttribute('data-gc-resource-mode','normal');
 const refresh=async()=>{
  const oldCount=await page.evaluate(()=>window.__gcHostRequests.filter(a=>a==='getCapabilities').length);
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect.poll(()=>page.evaluate(()=>window.__gcHostRequests.filter(a=>a==='getCapabilities').length))
   .toBeGreaterThan(oldCount);
 };
 await page.evaluate(()=>window.__gcHostState.lowPower=true);
 await refresh();
 await expect(root).toHaveAttribute('data-gc-resource-mode','conserve');
 await expect(root).toHaveAttribute('data-gc-platform-depth','e0');
 await expect(feature).toHaveAttribute('data-gc-depth','e0');
 await expect(page.locator('.gc-environment')).toHaveCSS('background-image','none');
 await page.locator('#animate').click();
 await expect(page.locator('#profile-status')).toContainText('Motion skipped');
 await page.evaluate(()=>{
  window.__gcHostState.lowPower=false;
  window.__gcHostState.highContrast=true;
  window.__gcHostState.reducedTransparency=true;
 });
 await refresh();
 await expect(root).toHaveAttribute('data-gc-host-contrast','high');
 await expect(root).toHaveAttribute('data-gc-host-transparency','reduce');
 await expect(feature).toHaveAttribute('data-gc-depth','e0');
 await page.evaluate(()=>{
  window.__gcHostState.highContrast=false;
  window.__gcHostState.reducedTransparency=false;
  window.__gcHostState.reducedMotion=true;
 });
 await refresh();
 await expect(root).toHaveAttribute('data-gc-resource-mode','normal');
 await expect(feature).toHaveAttribute('data-gc-depth','e2');
 await expect(page.locator('#profile-status')).toContainText('motion: none');
 await page.locator('#animate').click();
 await expect(page.locator('#profile-status')).toContainText('Motion skipped');
 // Previewing another profile should not be reset by an accessibility refresh.
 await page.locator('#platform').selectOption('desktop');
 await refresh();
 await expect(page.locator('#platform')).toHaveValue('desktop');
 await page.evaluate(()=>window.__gcHostState.reducedMotion=false);
 await refresh();
 await expect(page.locator('#profile-status')).toContainText('motion: standard');
});

test('invalid refresh drops privileged native feedback but leaves the web preview usable',async({page})=>{
 await page.addInitScript(()=>{
  const listeners=[];
  window.__gcHostValid=true;
  window.GCNativeHost={
   subscribe:fn=>{listeners.push(fn);return()=>{}},
   postMessage:text=>{
    const req=JSON.parse(text);
    const result=req.action==='getCapabilities'?{
     protocol:1,host:'android',platform:'phone',nativeAdapterInstalled:true,
     selectionFeedback:window.__gcHostValid,highContrast:window.__gcHostValid?false:'false'
    }:{mode:'light'};
    // Inconsistent typed capability intentionally triggers validation on both startup and refresh.
    if(req.action==='getCapabilities'&&window.__gcHostValid)result.highContrast=false;
    queueMicrotask(()=>listeners.forEach(fn=>fn({data:JSON.stringify({v:1,type:'gc-host/response',id:req.id,ok:true,result})})));
   }
  };
 });
 await page.goto('/lab/experience-studio.html');
 await expect(page.locator('#host-status')).toContainText('Native android host connected');
 await expect(page.locator('#host-feedback')).toBeEnabled();
 await page.evaluate(()=>{
  window.__gcHostValid=false;
  window.dispatchEvent(new Event('focus'));
 });
 await expect(page.locator('#host-status')).toContainText('browser preview remains usable');
 await expect(page.locator('#host-feedback')).toBeDisabled();
 await expect(page.locator('html')).not.toHaveAttribute('data-gc-native-host',/android/);
 await page.locator('#scene').selectOption('reading');
 await expect(page.locator('#scene-title')).toContainText('Make clarity');
});
