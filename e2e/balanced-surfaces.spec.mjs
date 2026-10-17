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
