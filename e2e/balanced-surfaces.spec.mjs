import {test,expect} from '@playwright/test';

test('foundations demonstrate distinct readable light material planes across widths',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/lab/v1.html');
 const samples=page.locator('.tone-sample');
 await expect(samples).toHaveCount(4);
 await expect(page.getByRole('heading',{name:'Balanced, not blank.'})).toBeVisible();
 const planeColors=await samples.evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).backgroundColor));
 expect(new Set(planeColors).size).toBe(4);
 for(const width of [375,320]){
  await page.setViewportSize({width,height:812});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 }
});

test('adaptive shell uses complementary tonal regions without losing accessible navigation',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/lab/adaptive.html');
 const scheme=await page.evaluate(()=>{
  const color=s=>getComputedStyle(document.querySelector(s)).backgroundColor;
  return {canvas:getComputedStyle(document.body).backgroundColor,
   bar:color('.gc-app-bar'),sidebar:color('.gc-nav-sidebar'),
   metrics:[...document.querySelectorAll('.gc-metric-card')].map(el=>getComputedStyle(el).backgroundColor)};
 });
 expect(scheme.canvas).not.toBe(scheme.bar);
 expect(scheme.bar).not.toBe(scheme.sidebar);
 expect(new Set(scheme.metrics).size).toBe(3);
 await page.setViewportSize({width:375,height:812});
 await expect(page.getByRole('navigation',{name:'Primary navigation, mobile'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('Neutral containers resolve to readable slate and stone colors on live reference surfaces',async({page})=>{
 await page.goto('/lab/v1.html');
 const expected={
  light:{secondary:['rgb(226, 232, 240)','rgb(30, 41, 59)'],tertiary:['rgb(231, 229, 228)','rgb(41, 37, 36)']},
  dark:{secondary:['rgb(51, 65, 85)','rgb(241, 245, 249)'],tertiary:['rgb(68, 64, 60)','rgb(250, 250, 249)']}
 };
 for(const mode of ['light','dark']){
  await page.locator('[data-mode="'+mode+'"]').click();
  await page.locator('[data-accent="neutral"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-gc-mode',mode);
  const colors=await page.evaluate(()=>{
   const result={};
   for(const role of ['secondary','tertiary']){
    const surface=document.querySelector('.'+role+'-role');
    surface.style.backgroundColor='var(--gc-v1-color-'+role+'-container)';
    surface.style.color='var(--gc-v1-color-on-'+role+'-container)';
    const computed=getComputedStyle(surface);
    result[role]=[computed.backgroundColor,computed.color];
   }
   return result;
  });
  expect(colors).toEqual(expected[mode]);
 }
 await page.locator('[data-accent="iris"]').click();
 await expect(page.locator('html')).toHaveAttribute('data-gc-accent','iris');
 const selected=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--gc-v1-color-secondary-container').trim());
 expect(selected.toUpperCase()).not.toBe('#334155');
});
