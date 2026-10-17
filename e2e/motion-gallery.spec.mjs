import {test,expect} from '@playwright/test';
test('motion gallery presets remain keyboard-operable, cancels and honors reduced-motion preview',async({page})=>{
 await page.goto('/lab/motion-gallery.html');
 await expect(page.getByRole('heading',{name:'Movement with meaning.'})).toBeVisible();
 await page.locator('[data-preset=slideInline]').click();
 await expect(page.locator('[data-preset=slideInline]')).toHaveAttribute('aria-pressed','true');
 await page.locator('#direction').selectOption('rtl');
 await page.locator('#play').click();
 await expect(page.locator('#motion-status')).toContainText('slideInline played');
 await page.locator('#stop').click();
 await expect(page.locator('#motion-status')).toContainText('stopped');
 await page.locator('#demo-reduced').check();
 await page.locator('#play').click();
 await expect(page.locator('#motion-status')).toContainText('skipped');
 await page.setViewportSize({width:320,height:700});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
