import {test,expect} from '@playwright/test';

test('host-removal of menu actions cannot move keyboard focus into detached DOM',async({page})=>{
 await page.goto('/lab/components.html');
 const trigger=page.getByRole('button',{name:/Workspace actions/});
 const first=page.locator('[data-command="duplicate"]');
 const detached=await first.elementHandle();
 await first.evaluate(element=>element.remove());
 await trigger.focus();
 await trigger.press('ArrowDown');
 const remaining=page.getByRole('menuitem',{name:'Share a link'});
 await expect(trigger).toHaveAttribute('aria-expanded','true');
 await expect(remaining).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(trigger).toHaveAttribute('aria-expanded','false');
 await page.locator('#gc-file-actions [role="menuitem"]').evaluateAll(items=>items.forEach(item=>item.remove()));
 await trigger.press('ArrowDown');
 await expect(trigger).toHaveAttribute('aria-expanded','false');
 await expect(page.getByRole('menu',{name:/Workspace actions/})).toHaveCount(0);
 await detached.evaluate(element=>document.querySelector('#gc-file-actions').prepend(element));
 await trigger.press('ArrowDown');
 await expect(trigger).toHaveAttribute('aria-expanded','true');
 await expect(page.getByRole('menuitem',{name:'Duplicate workspace'})).toBeFocused();
});
