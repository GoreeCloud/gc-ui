import {test,expect} from '@playwright/test';

test('environmental controls adjust content context, tonal intensity and lighting',async({page})=>{
 await page.goto('/lab/environment.html');
 await expect(page.getByRole('heading',{name:/A richer language/i})).toBeVisible();
 const root=page.locator('html');
 await expect(root).toHaveAttribute('data-gc-surface-context','workspace');
 await page.locator('#context').selectOption('reading');
 await expect(root).toHaveAttribute('data-gc-surface-context','reading');
 await expect(root).toHaveAttribute('data-gc-surface-intensity','quiet');
 await page.locator('#intensity').selectOption('expressive');
 await expect(root).toHaveAttribute('data-gc-surface-intensity','expressive');
 await page.locator('#illumination').selectOption('off');
 await expect(root).toHaveAttribute('data-gc-illumination','off');
 await expect(page.locator('.gc-environment')).toHaveCSS('background-image','none');
 await page.getByRole('button',{name:'Switch to dark appearance'}).click();
 await expect(root).toHaveAttribute('data-gc-mode','dark');
 await expect(page.locator('#effective')).toContainText('reading context');
 await expect(page.locator('.provider')).toHaveCount(7);
 await expect(page.locator('.provider .icons svg')).toHaveCount(21);
});
test('environment lab responsive and comfortable in reduced/forced settings',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.goto('/lab/environment.html');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});
 await expect(page.locator('.gc-environment')).toHaveCSS('background-image','none');
 await expect(page.locator('.gc-material-surface[data-gc-treatment=lens]')).toHaveCSS('backdrop-filter','none');
 await expect(page.locator('html')).toHaveAttribute('data-gc-surface-lens','solid');
 await page.locator('#context').selectOption('analysis');
 await expect(page.locator('html')).toHaveAttribute('data-gc-surface-context','analysis');
 await page.locator('#replay').click();
 await expect(page.getByRole('heading',{name:/Make room for/i})).toBeVisible();
});


test('adaptive shell switches material context with route changes',async({page})=>{
 await page.goto('/lab/adaptive.html');
 await expect(page.locator('html')).toHaveAttribute('data-gc-surface-context','workspace');
 await page.locator('.gc-nav-sidebar [data-gc-route="activity"]').click();
 await expect(page.locator('html')).toHaveAttribute('data-gc-surface-context','analysis');
 await page.locator('.gc-nav-sidebar [data-gc-route="library"]').click();
 await expect(page.locator('html')).toHaveAttribute('data-gc-surface-context','reading');
});
