import {test,expect} from '@playwright/test';

// This suite must import the *offline-installed tarball*, not repository source.
// The browser CI jobs build and install it before launching Playwright.
test('installed Foundations package supports browser modules, CSS, tokens and teardown',async({page})=>{
 await page.goto('/lab/components.html');
 const observed=await page.evaluate(async()=>{
  const prefix='/dist/foundations-verify/consumer/node_modules/@goreecloud/gc-ui/';
  const gc=await import(prefix+'src/index.mjs');
  const [styleResponse,tokenResponse]=await Promise.all([
   fetch(prefix+'styles/gc.v1.generated.css'),
   fetch(prefix+'tokens/gc.v1.tokens.json')
  ]);
  if(!styleResponse.ok||!tokenResponse.ok)throw Error('Packaged CSS or tokens not served');
  const css=await styleResponse.text();
  const tokens=await tokenResponse.json();
  const root=document.createElement('section');
  root.dataset.gcMode='consumer';
  root.style.setProperty('--gc-v1-color-primary','#13579B','important');
  document.body.append(root);
  const controller=gc.createThemeController({root,media:()=>null,storage:null});
  controller.set({accent:'custom',seed:'#3978D3'});
  const replaced=root.style.getPropertyValue('--gc-v1-color-primary').trim().toUpperCase()!=='#13579B';
  const activeMode=root.dataset.gcMode;
  controller.destroy();
  const result={
   version:gc.GC_UI_VERSION,
   exports:Object.keys(gc).sort(),
   cssHasForcedColors:css.includes('forced-colors: active'),
   tokenCanvas:typeof tokens.color.light.canvas.$value,
   contrast:gc.contrastRatio(gc.generateTheme('#3978D3','light').roles.primary,
                              gc.generateTheme('#3978D3','light').roles.onPrimary),
   replaced,activeMode,
   restoredValue:root.style.getPropertyValue('--gc-v1-color-primary').trim().toUpperCase(),
   restoredPriority:root.style.getPropertyPriority('--gc-v1-color-primary'),
   restoredDataset:root.dataset.gcMode,
   addedDatasetRemoved:!root.hasAttribute('data-gc-contrast')
  };
  root.remove();
  return result;
 });
 expect(observed.version).toBe('1.0.0-rc.1');
 expect(observed.exports).toEqual([
  'GC_THEME_DEFAULTS','GC_UI_VERSION','contrastRatio','createThemeController',
  'generateTheme','normalizeTheme','resolveTheme'
 ]);
 expect(observed.cssHasForcedColors).toBe(true);
 expect(observed.tokenCanvas).toBe('string');
 expect(observed.contrast).toBeGreaterThanOrEqual(4.5);
 expect(observed.replaced).toBe(true);
 expect(observed.activeMode).toBe('light');
 expect(observed.restoredValue).toBe('#13579B');
 expect(observed.restoredPriority).toBe('important');
 expect(observed.restoredDataset).toBe('consumer');
 expect(observed.addedDatasetRemoved).toBe(true);
});
