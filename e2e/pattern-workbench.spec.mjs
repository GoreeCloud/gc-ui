import {test,expect} from '@playwright/test';

test('filter chips and progress are keyboard-operable and remain local',async({page})=>{
 await page.goto('/lab/pattern-workbench.html');
 await expect(page.getByRole('heading',{name:'Clear by default. Expressive by choice.'})).toBeVisible();
 await expect(page.locator('.gc-pattern-tile:visible')).toHaveCount(4);
 const system=page.getByRole('button',{name:'System',exact:true});
 await system.focus();await system.press('Enter');
 await expect(system).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.gc-pattern-tile:visible')).toHaveCount(2);
 await expect(page.locator('#pattern-results')).toHaveText('2 example surfaces shown.');
 await page.getByRole('button',{name:'All surfaces'}).click();
 await expect(page.locator('.gc-pattern-tile:visible')).toHaveCount(4);
 const advance=page.getByRole('button',{name:'Advance progress'});
 await advance.press('Enter');
 await expect(page.locator('#pattern-progress-value')).toHaveText('50% complete');
 await expect(page.locator('#pattern-progress')).toHaveJSProperty('value',50);
 for(let i=0;i<3;i++)await advance.click();
 await expect(page.locator('#pattern-progress-value')).toHaveText('0% complete');
});

test('native disclosures enforce single expanded state and preserve summary semantics',async({page})=>{
 await page.goto('/lab/pattern-workbench.html');
 const all=page.locator('#pattern-disclosures details');
 await expect(all.nth(0)).toHaveAttribute('open','');
 const summary=page.getByText('Are third-party glyphs required?',{exact:true});
 await summary.focus();await summary.press('Enter');
 await expect(all.nth(1)).toHaveAttribute('open','');
 await expect(all.nth(0)).not.toHaveAttribute('open','');
 await expect(page.getByText('These independently licensed sources are optional.',{exact:false})).toBeVisible();
});

test('responsive, RTL and reduced motion preserve content without overflow',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:320,height:700});
 await page.goto('/lab/pattern-workbench.html');
 await page.evaluate(()=>{document.documentElement.dir='rtl'});
 await page.getByRole('button',{name:'Workspace',exact:true}).click();
 await expect(page.locator('.gc-pattern-tile:visible')).toHaveCount(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
 expect(await page.locator('#pattern-card-grid').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
});
