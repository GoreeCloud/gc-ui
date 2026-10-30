import {test,expect} from '@playwright/test';

/** Inspect the installed QA tarball in a real browser, not workspace imports. */
test('installed Seal web candidate preserves focus, ARIA and toast state',async({page})=>{
 await page.goto('/lab/pattern-workbench.html');
 const result=await page.evaluate(async()=>{
  const prefix='/dist/seal-web-verify/consumer/node_modules/@goreecloud/gc-ui/';
  const gc=await import(prefix+'src/index.mjs');
  const [componentCss,paletteCss,tokens]=await Promise.all([
   fetch(prefix+'styles/gc.v1.components.css'),
   fetch(prefix+'styles/gc.v1.product-palettes.css'),
   fetch(prefix+'tokens/gc.v1.tokens.json')
  ]);
  if(!componentCss.ok||!paletteCss.ok||!tokens.ok)
   throw Error('Installed web candidate resources unavailable');
  const css=await componentCss.text();
  const palette=await paletteCss.text();
  const roles=await tokens.json();

  const anchor=document.createElement('button');
  anchor.textContent='Focus anchor';
  const group=document.createElement('div');
  const all=document.createElement('button'),next=document.createElement('button');
  for(const [button,name] of [[all,'all'],[next,'next']]){
   button.type='button';button.textContent=name;
   button.setAttribute('data-gc-choice',name);
   group.append(button);
  }
  document.body.append(anchor,group);
  anchor.focus();
  let reject=true;
  const choices=gc.initChoiceChips(group,{onChange:()=>{
   if(reject)throw Error('Selection rejected');
  }});
  let didReject=false;
  try{choices.select('next',{focus:true})}catch(error){
   didReject=error.message==='Selection rejected';
  }
  const rejectedFocusPreserved=document.activeElement===anchor;
  const rejectedSelection=choices.get();
  reject=false;
  const committed=choices.select('next',{focus:true});
  const acceptedFocus=document.activeElement===next;
  const selectedAria=next.getAttribute('aria-pressed');
  choices.destroy();
  const restoredAria=next.getAttribute('aria-pressed');

  const region=document.createElement('div');
  document.body.append(region);
  const toast=gc.createToast(region);
  toast.show('Original notification',{duration:0});
  const original=region.firstElementChild;
  let invalidRejected=false;
  try{toast.show('Malformed',{duration:Infinity})}catch(error){
   invalidRejected=error instanceof RangeError;
  }
  const originalRetained=region.firstElementChild===original;
  toast.destroy();
  const destroyedRegionEmpty=region.children.length===0;
  anchor.remove();group.remove();region.remove();
  return {
   version:gc.GC_UI_VERSION,exports:Object.keys(gc).sort(),
   styles:css.includes('gc-toast')&&css.includes('forced-colors:active'),
   palette:palette.includes('--gc-v1-color-secondary-container'),
   tokenCanvas:typeof roles.color.light.canvas.$value,
   didReject,rejectedFocusPreserved,rejectedSelection,committed,
   acceptedFocus,selectedAria,restoredAria,
   invalidRejected,originalRetained,destroyedRegionEmpty
  };
 });
 expect(result.version).toBe('0.2.0-seal.0');
 expect(result.exports).toEqual([
  'GC_THEME_DEFAULTS','GC_UI_VERSION','contrastRatio','createThemeController',
  'createToast','generateTheme','initChoiceChips','initDialog',
  'initDisclosureGroup','initMenu','initTabs','nextMenuIndex',
  'nextTabIndex','normalizeTheme','resolveTheme','runAsyncAction'
 ]);
 expect(result.styles).toBe(true);
 expect(result.palette).toBe(true);
 expect(result.tokenCanvas).toBe('string');
 expect(result.didReject).toBe(true);
 expect(result.rejectedFocusPreserved).toBe(true);
 expect(result.rejectedSelection).toBe('all');
 expect(result.committed).toBe(true);
 expect(result.acceptedFocus).toBe(true);
 expect(result.selectedAria).toBe('true');
 expect(result.restoredAria).toBeNull();
 expect(result.invalidRejected).toBe(true);
 expect(result.originalRetained).toBe(true);
 expect(result.destroyedRegionEmpty).toBe(true);
});
