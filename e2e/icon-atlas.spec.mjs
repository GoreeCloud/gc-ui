import {test,expect} from '@playwright/test';
test('local icon atlas provides searchable attributed glyphs with semantic controls',async({page})=>{
 await page.goto('/lab/icon-atlas.html');
 await expect(page.locator('.icon-card')).toHaveCount(33);
 await expect(page.locator('#result-count')).toContainText('33 of 33');
 await page.locator('#family').selectOption('fluent');
 await expect(page.locator('.icon-card')).toHaveCount(6);
 await page.locator('#icon-search').fill('weather');
 await expect(page.locator('.icon-card')).toHaveCount(2);
 await page.locator('#icon-search').fill('no-glyph-has-this-name');
 await expect(page.locator('#empty')).toBeVisible();
 await page.locator('#icon-search').fill('');
 await page.locator('#family').selectOption('all');
 await page.setViewportSize({width:320,height:720});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
