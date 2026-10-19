import {test,expect} from '@playwright/test';
test('local icon atlas provides searchable attributed glyphs with semantic controls',async({page})=>{
 await page.goto('/lab/icon-atlas.html');
 await expect(page.locator('.icon-card')).toHaveCount(51);
 await expect(page.locator('#result-count')).toContainText('51 of 51');
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

test('clipboard write rejection preserves copy button focus and exposes the symbol ID',async({page})=>{
 await page.addInitScript(()=>{
  Object.defineProperty(navigator,'clipboard',{
   configurable:true,
   value:{writeText:()=>Promise.reject(new DOMException('Clipboard permission denied','NotAllowedError'))}
  });
 });
 await page.setViewportSize({width:320,height:720});
 await page.goto('/lab/icon-atlas.html');
 await page.locator('#family').selectOption('fluent');
 await page.locator('#icon-search').fill('weather');
 await expect(page.locator('.icon-card')).toHaveCount(2);
 const copy=page.getByRole('button',{name:'Copy symbol ID for weather sunny'});
 await copy.focus();
 await copy.press('Enter');
 await expect(page.locator('#result-count')).toHaveText('Symbol: gc-ext-fluent-weather-sunny');
 await expect(copy).toBeFocused();
 await expect(page.locator('#empty')).toBeHidden();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(1);
});

test('new opt-in glyphs are searchable within their licensed families',async({page})=>{
 await page.goto('/lab/icon-atlas.html');
 await page.locator('#family').selectOption('lucide');
 await expect(page.locator('.icon-card')).toHaveCount(9);
 await page.locator('#icon-search').fill('shield-check');
 await expect(page.locator('.icon-card')).toHaveCount(1);
 await expect(page.locator('.icon-card use')).toHaveAttribute('href',/gc-ext-lucide-shield-check$/);
 await page.locator('#icon-search').fill('');
 await page.locator('#family').selectOption('heroicons');
 await expect(page.locator('.icon-card')).toHaveCount(9);
});
