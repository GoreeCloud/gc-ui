import {test,expect} from '@playwright/test';

// Browser accessibility contracts complement, but do not replace, actual
// screen-reader announcements from the isolated Orca/AT-SPI diagnostic.
test('Components menu skips disabled command and returns focus to trigger',async({page})=>{
 await page.goto('/lab/components.html');
 const trigger=page.getByRole('button',{name:'Workspace actions'});
 await trigger.focus();
 await trigger.press('ArrowDown');
 const menu=page.getByRole('menu',{name:'Workspace actions'});
 const first=menu.getByRole('menuitem',{name:'Duplicate workspace'});
 const disabled=menu.getByRole('menuitem',{name:'Archive (unavailable)'});
 await expect(trigger).toHaveAttribute('aria-expanded','true');
 await expect(trigger).toHaveAttribute('aria-controls','gc-file-actions');
 await expect(disabled).toHaveAttribute('aria-disabled','true');
 await expect(first).toBeFocused();
 await page.keyboard.press('End');
 await expect(menu.getByRole('menuitem',{name:'Rename workspace'})).toBeFocused();
 await page.keyboard.press('ArrowDown');
 await expect(first).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(trigger).toBeFocused();
 await expect(trigger).toHaveAttribute('aria-expanded','false');
});

test('Forms suggestions and invalid summary restore focus to usable field',async({page})=>{
 await page.goto('/lab/forms.html');
 const input=page.getByRole('combobox',{name:'Search projects'});
 await input.fill('d');
 await input.press('ArrowDown');
 await expect(input).toHaveAttribute('aria-expanded','true');
 await expect(input).toHaveAttribute('aria-activedescendant','project-suggestion-0');
 await expect(page.getByRole('option',{name:'Studio refresh'})).toBeVisible();
 await input.press('Escape');
 await expect(input).toBeFocused();
 await expect(input).toHaveAttribute('aria-expanded','false');
 await page.getByRole('button',{name:'Check brief'}).click();
 await expect(page.locator('#brief-errors')).toBeVisible();
 await expect(page.locator('#brief-errors')).toBeFocused();
 await page.locator('#brief-errors-list a').first().click();
 const field=page.locator('#brief-name');
 await expect(field).toBeFocused();
 await expect(field).toHaveAttribute('aria-invalid','true');
 await expect(field).toHaveAttribute('aria-describedby',/brief-name-error/);
});
