import {test,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';

/** Screenshots and axe data for the actual installed private Seal QA tarball.
 * These are a review input, NOT stable status, native-app QA or WCAG approval.
 */
const prefix='/dist/seal-web-verify/consumer/node_modules/@goreecloud/gc-ui/';
const scenarios=[
 {id:'seal-web-desktop-light',width:1280,height:800,mode:'light',rtl:false,forced:false},
 {id:'seal-web-mobile-dark',width:375,height:812,mode:'dark',rtl:false,forced:false},
 {id:'seal-web-mobile-rtl-320',width:320,height:720,mode:'light',rtl:true,forced:false},
 {id:'seal-web-mobile-forced-colors',width:375,height:812,mode:'light',rtl:false,forced:true}
];
const hex=bytes=>createHash('sha256').update(bytes).digest('hex');
const markup=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GC UI • installed candidate QA</title>
<link rel="stylesheet" href="${prefix}styles/gc.v1.generated.css">
<link rel="stylesheet" href="${prefix}styles/gc.v1.components.css">
<link rel="stylesheet" href="${prefix}styles/gc.v1.product-palettes.css">
<style>
*,*::before,*::after{box-sizing:border-box}
html{color-scheme:light dark}
body{margin:0;min-width:0;background:var(--gc-v1-color-canvas);color:var(--gc-v1-color-on-surface);font:16px/1.5 system-ui,-apple-system,sans-serif}
.qa-shell{width:min(1100px,100%);margin:auto;padding:clamp(20px,4vw,56px)}
.qa-top{display:flex;align-items:flex-start;gap:20px;margin:0 0 28px}
.qa-mark{flex:none;display:grid;place-items:center;width:60px;height:60px;border-radius:20px;background:var(--gc-v1-color-primary);color:var(--gc-v1-color-on-primary);font-size:23px;font-weight:800}
.qa-eyebrow{font-size:12px;font-weight:750;letter-spacing:.08em;text-transform:uppercase;color:var(--gc-v1-color-on-surface-muted);margin:0 0 6px}
h1{font-size:clamp(30px,4.3vw,50px);line-height:1.08;letter-spacing:-.045em;margin:0 0 12px}h2{font-size:22px;margin:0 0 10px;letter-spacing:-.02em}
.qa-intro{max-width:55ch;margin:0;color:var(--gc-v1-color-on-surface-muted)}
.qa-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin:0 0 18px}
.gc-card{min-width:0;box-shadow:0 10px 32px rgb(10 20 40 / .05)}
.qa-actions{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin:22px 0}
.qa-caption{font-size:13px;font-weight:700;margin:16px 0 8px}
.qa-choice{display:flex;gap:8px;flex-wrap:wrap}
.qa-choice button{font:inherit;min-height:44px;padding:8px 18px;cursor:pointer;border-radius:999px;border:1px solid var(--gc-v1-color-outline-strong);background:var(--gc-v1-color-surface);color:var(--gc-v1-color-on-surface)}
.qa-choice button[aria-pressed=true]{background:var(--gc-v1-color-primary-container);color:var(--gc-v1-color-on-primary-container);border-color:var(--gc-v1-color-primary)}
.qa-choice button:focus-visible{outline:3px solid var(--gc-v1-color-focus-ring);outline-offset:3px}
.qa-subtle{color:var(--gc-v1-color-on-surface-muted);font-size:14px;margin:0 0 14px}
.qa-note{display:flex;gap:12px;align-items:start;margin:0 0 22px}
.qa-pulse{border-radius:12px;display:grid;place-items:center;flex:none;width:34px;height:34px;background:var(--gc-v1-color-primary-container);color:var(--gc-v1-color-on-primary-container);font-weight:800}
.gc-tabs{margin-top:20px}.gc-tabpanel{min-height:110px;margin-bottom:8px}.gc-tabpanel p{margin:0}
.qa-status{margin-top:12px;font-size:13px;font-weight:700;color:var(--gc-v1-color-on-surface-muted)}
.qa-footer{margin-top:20px;color:var(--gc-v1-color-on-surface-muted);font-size:12px}
@media(max-width:700px){.qa-columns{grid-template-columns:minmax(0,1fr)}.qa-top{gap:12px}.qa-mark{width:48px;height:48px;border-radius:16px;font-size:18px}.qa-shell{padding:20px 16px 36px}.gc-card{padding:18px}}
@media(forced-colors:active){.qa-mark,.qa-pulse,.qa-choice button{forced-color-adjust:auto;background:Canvas!important;color:CanvasText!important;border:2px solid CanvasText!important}.qa-choice button[aria-pressed=true]{border-color:Highlight!important}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{transition:none!important;animation:none!important}}
</style></head>
<body><div class="qa-shell">
<header class="qa-top"><div class="qa-mark" aria-hidden="true">GC</div><div>
<p class="qa-eyebrow">GoreeCloud UI / Packaged browser candidate</p>
<h1>Care in every control.</h1>
<p class="qa-intro">Semantics first. Distinctive surfaces and predictable interactions, even when motion and visual effects are removed.</p>
</div></header>
<main>
<div class="qa-banner gc-banner qa-note" role="note"><div class="qa-pulse" aria-hidden="true">✓</div><div><strong>Focused on what works.</strong><p>Real controls from a locally installed, unpublished package—not a release promise.</p></div></div>
<div class="qa-columns">
<section class="gc-card" aria-labelledby="actions-heading"><h2 id="actions-heading">Everyday actions</h2>
<p class="qa-subtle">Comfortable targets, visible focus and consistent state.</p>
<div class="qa-actions"><button id="save" type="button" class="gc-button" data-variant="primary">Save preview</button>
<div class="gc-menu-anchor"><button id="actions" class="gc-button" data-variant="secondary" type="button">More actions</button>
<div id="actions-menu" class="gc-menu gc-card" role="menu" aria-label="More actions" hidden>
<button type="button" role="menuitem" id="duplicate">Duplicate preview</button>
<button type="button" role="menuitem" disabled>Delete unavailable</button></div></div></div>
<p class="qa-caption">Filter the collection</p>
<div id="choices" class="qa-choice" role="group" aria-label="Collection filter">
<button type="button" data-gc-choice="all" aria-pressed="true">All</button>
<button type="button" data-gc-choice="pinned">Pinned</button></div>
<p class="qa-status" id="status" role="status" aria-live="polite">Ready to preview.</p>
</section>
<section class="gc-card" aria-labelledby="tabs-heading"><h2 id="tabs-heading">Explore the details</h2>
<p class="qa-subtle">Tabs maintain native keyboard and ARIA semantics.</p>
<div class="gc-tabs" role="tablist" aria-label="Details">
<button id="tab-overview" class="gc-tab" role="tab" aria-selected="true" aria-controls="pane-overview">Overview</button>
<button id="tab-access" class="gc-tab" role="tab" aria-selected="false" aria-controls="pane-access">Accessibility</button></div>
<div id="pane-overview" class="gc-tabpanel" role="tabpanel" aria-labelledby="tab-overview"><p>One language, flexible across contexts.</p></div>
<div id="pane-access" class="gc-tabpanel" role="tabpanel" aria-labelledby="tab-access" hidden><p>Readable color, reliable focus and reduced-motion support.</p></div>
<details class="gc-accordion" id="details"><summary>What is included?</summary><div class="gc-accordion-content">Only verified candidate web exports, styles and semantic tokens.</div></details>
</section></div>
<section class="gc-banner" aria-label="Candidate status"><strong>Private candidate / not Seal</strong>
<p>This screen documents a bounded browser interface, not full ecosystem adoption or native production qualification.</p></section>
</main><footer class="qa-footer">GC UI · Candidate acceptance fixture · No external assets or network dependencies</footer>
</div><div id="notifications" class="gc-toast-region" aria-live="polite" aria-label="Notifications"></div></body></html>`;

for(const scenario of scenarios){
 test('installed Seal candidate accessible visual review — '+scenario.id,async({page},testInfo)=>{
  await page.setViewportSize({width:scenario.width,height:scenario.height});
  await page.emulateMedia({forcedColors:scenario.forced?'active':'none',reducedMotion:'reduce'});
  await page.goto('/lab/components.html');
  await page.setContent(markup,{waitUntil:'load'});
  if(scenario.rtl)await page.evaluate(()=>document.documentElement.dir='rtl');
  const result=await page.evaluate(async({prefix,scenario})=>{
   const gc=await import(prefix+'src/index.mjs');
   const theme=gc.createThemeController({root:document.documentElement,storage:null,media:()=>null});
   theme.set({mode:scenario.mode,accent:'neutral',material:'solid'});
   const status=document.getElementById('status');
   const choices=gc.initChoiceChips(document.getElementById('choices'),{onChange:v=>{
    status.textContent='Showing '+v+' items.';
   }});
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
   window.__sealCandidate={theme,choices,tabs,menu,disclosure,toast};
   return {version:gc.GC_UI_VERSION,primaryContrast:gc.contrastRatio(
    getComputedStyle(document.documentElement).getPropertyValue('--gc-v1-color-primary').trim(),
    getComputedStyle(document.documentElement).getPropertyValue('--gc-v1-color-on-primary').trim()
   )};
  },{prefix,scenario});
  expect(result.version).toBe('0.2.0-seal.0');
  expect(result.primaryContrast).toBeGreaterThanOrEqual(4.5);
  await expect(page.getByRole('button',{name:'Save preview'})).toHaveCSS('min-height','44px');
  await page.getByRole('button',{name:'Save preview'}).click();
  await expect(page.getByRole('status',{name:''}).first()).toContainText('Preview saved locally.');
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
  await expect(page.locator('#details')).toHaveAttribute('open',null);
  await page.locator('#details summary').click();
  await expect(page.locator('#details')).toHaveAttribute('open','');
  const overflow=await page.evaluate(()=>({
   content:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,
   mode:document.documentElement.dataset.gcMode,rtl:document.documentElement.dir==='rtl'
  }));
  expect(overflow.content).toBeLessThanOrEqual(overflow.viewport);
  expect(overflow.mode).toBe(scenario.mode);
  expect(overflow.rtl).toBe(scenario.rtl);
  await page.addScriptTag({path:resolve('node_modules/axe-core/axe.min.js')});
  const axe=await page.evaluate(async()=>{
   const data=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
   return {
    violations:data.violations.map(x=>({id:x.id,impact:x.impact,nodes:x.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),
    incomplete:data.incomplete.map(x=>({id:x.id,impact:x.impact,nodes:x.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),
    passes:data.passes.length
   };
  });
  expect(axe.violations,'Confirmed axe violations on installed candidate: '+scenario.id).toEqual([]);
  await page.evaluate(()=>document.fonts?.ready);
  const png=await page.screenshot({fullPage:true,animations:'disabled'});
  const dir=resolve(testInfo.project.outputDir,'seal-review');
  await mkdir(dir,{recursive:true});
  await writeFile(join(dir,scenario.id+'.png'),png);
  const report={
   schema:'gc-ui-seal-web-browser-evidence.v1',revision:process.env.GITHUB_SHA??null,
   scenario:scenario.id,width:scenario.width,height:scenario.height,
   candidateVersion:result.version,mode:scenario.mode,rtl:scenario.rtl,forcedColors:scenario.forced,
   primaryContrast:result.primaryContrast,overflow,axe,
   screenshotSha256:hex(png),screenshotBytes:png.length,
   limitations:'Browser-based sample UI from installed package, not production consumer UI or human assistive-technology certification.'
  };
  await writeFile(join(dir,scenario.id+'.json'),JSON.stringify(report,null,2)+'\n');
  await testInfo.attach(scenario.id,{path:join(dir,scenario.id+'.png'),contentType:'image/png'});
  await page.evaluate(()=>{for(const value of Object.values(window.__sealCandidate))value.destroy();});
 });
}
