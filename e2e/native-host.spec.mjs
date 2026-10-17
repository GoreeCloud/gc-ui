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
