import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';

/** Real browser QA of the offline-installed tarball; NOT lifecycle Seal approval. */
const prefix='/dist/seal-web-verify/consumer/node_modules/@goreecloud/gc-ui/';
const scenarios=[
 {id:'seal-web-desktop-light',width:1280,height:800,mode:'light',rtl:false,forced:false},
 {id:'seal-web-mobile-dark',width:375,height:812,mode:'dark',rtl:false,forced:false},
 {id:'seal-web-mobile-rtl-320',width:320,height:720,mode:'light',rtl:true,forced:false},
 {id:'seal-web-mobile-forced-colors',width:375,height:812,mode:'light',rtl:false,forced:true}
];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

for(const scenario of scenarios){
 test('installed candidate acceptance matrix — '+scenario.id,async({page},testInfo)=>{
  await page.setViewportSize({width:scenario.width,height:scenario.height});
  await page.emulateMedia({forcedColors:scenario.forced?'active':'none',reducedMotion:'reduce'});
  await page.goto('/e2e/seal-consumer-fixture.html');
  if(scenario.rtl)await page.evaluate(()=>document.documentElement.dir='rtl');
  const setup=await page.evaluate(async({prefix,scenario})=>{
   const gc=await import(prefix+'src/index.mjs');
   const root=document.documentElement;
   const theme=gc.createThemeController({root,storage:null,media:()=>null});
   theme.set({mode:scenario.mode,accent:'neutral',material:'solid'});
   const status=document.getElementById('status');
   const choices=gc.initChoiceChips(document.getElementById('choices'),{
    onChange:value=>{status.textContent='Showing '+value+' items.';}
   });
   const tabs=gc.initTabs(document.querySelector('[role=tablist]'),{rtl:scenario.rtl});
   const menu=gc.initMenu(document.getElementById('actions'),document.getElementById('actions-menu'),{
    onSelect:()=>{status.textContent='Duplicated preview.';}
   });
   const disclosure=gc.initDisclosureGroup(document.querySelector('main'));
   const toast=gc.createToast(document.getElementById('notifications'));
   document.getElementById('save').addEventListener('click',()=>{
    status.textContent='Preview saved locally.';
    toast.show('Preview saved locally.',{duration:0});
   });
   window.__sealControllers=[theme,choices,tabs,menu,disclosure,toast];
   const computed=getComputedStyle(root);
   return {
    version:gc.GC_UI_VERSION,
    primaryContrast:scenario.forced?null:gc.contrastRatio(
     computed.getPropertyValue('--gc-v1-color-primary').trim(),
     computed.getPropertyValue('--gc-v1-color-on-primary').trim()
    ),
    forcedActive:matchMedia('(forced-colors: active)').matches
   };
  },{prefix,scenario});
  expect(setup.version).toBe('0.2.0-seal.0');
  if(scenario.forced)expect(setup.forcedActive).toBe(true);
  else expect(setup.primaryContrast).toBeGreaterThanOrEqual(4.5);

  await expect(page.locator('#save')).toHaveCSS('min-height','44px');
  await page.locator('#save').click();
  await expect(page.locator('#status')).toContainText('Preview saved locally.');
  await expect(page.locator('#notifications .gc-toast')).toContainText('Preview saved locally.');
  await page.getByRole('button',{name:'Dismiss notification'}).click();
  await expect(page.locator('#notifications .gc-toast')).toHaveCount(0);
  await page.getByRole('button',{name:'Pinned'}).click();
  await expect(page.getByRole('button',{name:'Pinned'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('tab',{name:'Accessibility'}).click();
  await expect(page.getByRole('tabpanel',{name:'Accessibility'})).toBeVisible();
  await page.locator('#actions').focus();
  await page.locator('#actions').press('ArrowDown');
  await expect(page.locator('#duplicate')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#actions')).toBeFocused();
  await expect(page.locator('#actions')).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('#actions')).toHaveAttribute('aria-controls','actions-menu');
  await expect(page.locator('#actions-menu')).toHaveAttribute('role','menu');
  await expect(page.locator('#actions-menu')).toBeHidden();
  await expect(page.locator('#details')).not.toHaveAttribute('open','');
  await page.locator('#details summary').click();
  await expect(page.locator('#details')).toHaveAttribute('open','');

  const overflow=await page.evaluate(()=>({
   content:document.documentElement.scrollWidth,
   viewport:document.documentElement.clientWidth,
   mode:document.documentElement.dataset.gcMode,
   rtl:document.documentElement.dir==='rtl'
  }));
  expect(overflow.content).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.mode).toBe(scenario.mode);
  expect(overflow.rtl).toBe(scenario.rtl);

  await page.addScriptTag({path:resolve('node_modules/axe-core/axe.min.js')});
  const axe=await page.evaluate(async()=>{
   const data=await window.axe.run(document,{
    runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}
   });
   const compact=x=>({id:x.id,impact:x.impact,
    nodes:x.nodes.map(n=>({target:n.target,summary:n.failureSummary}))});
   return {violations:data.violations.map(compact),
    incomplete:data.incomplete.map(compact),passes:data.passes.length};
  });
  expect(axe.violations,'Confirmed installed-package violations: '+scenario.id).toEqual([]);

  await page.evaluate(()=>document.fonts?.ready);
  const png=await page.screenshot({fullPage:true,animations:'disabled'});
  const dir=resolve(testInfo.project.outputDir,'seal-review');
  await mkdir(dir,{recursive:true});
  await writeFile(join(dir,scenario.id+'.png'),png);
  const report={
   schema:'gc-ui-seal-web-browser-evidence.v1',revision:process.env.GITHUB_SHA??null,
   scenario:scenario.id,width:scenario.width,height:scenario.height,
   candidateVersion:setup.version,mode:scenario.mode,rtl:scenario.rtl,
   forcedColors:scenario.forced,primaryContrast:setup.primaryContrast,overflow,axe,
   screenshotSha256:sha(png),screenshotBytes:png.length,
   limitations:'Browser QA of an installed candidate fixture; not production-consumer, manual visual, or human AT certification.'
  };
  await writeFile(join(dir,scenario.id+'.json'),JSON.stringify(report,null,2)+'\n');
  await testInfo.attach(scenario.id,{path:join(dir,scenario.id+'.png'),contentType:'image/png'});
  await page.evaluate(()=>{for(const c of window.__sealControllers)c.destroy();});
 });
}
