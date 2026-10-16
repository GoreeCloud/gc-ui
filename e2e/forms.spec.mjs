import {test,expect} from '@playwright/test';

test('brief validation focuses a linked summary and preserves entered values',async({page})=>{
 await page.goto('/lab/forms.html');
 await page.getByLabel('Project name').fill('Studio refresh');
 await page.getByRole('button',{name:'Create brief'}).click();
 const summary=page.locator('#brief-errors');
 await expect(summary).toBeVisible();
 await expect(summary).toBeFocused();
 await expect(summary.locator('a')).toHaveCount(2);
 await expect(page.getByLabel('Project name')).toHaveValue('Studio refresh');
 await expect(page.locator('#brief-email')).toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#brief-notes')).toHaveAttribute('aria-invalid','true');
 await summary.getByRole('link',{name:/Contact email/}).click();
 await expect(page.locator('#brief-email')).toBeFocused();
 await page.locator('#brief-email').fill('editor@example.org');
 await page.locator('#brief-notes').fill('A thoughtful responsive project');
 await expect(summary).toBeHidden();
 await page.getByRole('button',{name:'Create brief'}).click();
 await expect(page.getByText('Brief ready')).toBeVisible();
 await expect(page.locator('#brief-email')).not.toHaveAttribute('aria-invalid','true');
});
test('textarea count, invalid email and minimum length are fully recoverable',async({page})=>{
 await page.goto('/lab/forms.html');
 const notes=page.locator('#brief-notes');
 await notes.fill('short');
 await expect(page.locator('#brief-notes-count')).toHaveText('5 / 280');
 await page.locator('#brief-name').fill('Example brief');
 await page.locator('#brief-email').fill('invalid@');
 await page.getByRole('button',{name:'Create brief'}).click();
 await expect(page.locator('#brief-errors-list a')).toHaveCount(2);
 await expect(page.locator('#brief-email-error')).toBeVisible();
 await expect(page.locator('#brief-notes-error')).toBeVisible();
 await page.locator('#brief-email').fill('team@example.com');
 await notes.fill('This is a long enough note.');
 await expect(page.locator('#brief-errors')).toBeHidden();
 await expect(page.locator('#brief-notes-count')).toHaveText('27 / 280');
});
test('search keyboard suggestions select with Enter, Escape closes first',async({page})=>{
 await page.goto('/lab/forms.html');
 const search=page.getByRole('combobox',{name:'Search projects'});
 await expect(page.locator('#project-result-count')).toHaveText('6 projects found');
 await search.fill('d');
 await expect(search).toHaveAttribute('aria-expanded','true');
 await expect(page.getByRole('option')).toHaveCount(3);
 await search.press('ArrowDown');
 await expect(search).toHaveAttribute('aria-activedescendant','project-suggestion-0');
 await search.press('ArrowDown');
 await expect(search).toHaveAttribute('aria-activedescendant','project-suggestion-1');
 await search.press('ArrowDown');
 await expect(search).toHaveAttribute('aria-activedescendant','project-suggestion-2');
 await search.press('Enter');
 await expect(search).toHaveValue('Design tokens');
 await expect(search).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('#project-result-count')).toHaveText('1 project found');
 await search.fill('team');
 await expect(search).toHaveAttribute('aria-expanded','true');
 await search.press('Escape');
 await expect(search).toHaveValue('team');
 await expect(search).toHaveAttribute('aria-expanded','false');
 await search.press('Escape');
 await expect(search).toHaveValue('');
 await expect(page.locator('#project-result-count')).toHaveText('6 projects found');
});
test('zero-match empty state has one effective reset action',async({page})=>{
 await page.goto('/lab/forms.html');
 const search=page.getByRole('combobox',{name:'Search projects'});
 await search.fill('not-a-project');
 await expect(page.locator('#project-result-count')).toHaveText('0 projects found');
 await expect(page.locator('#project-empty')).toBeVisible();
 await expect(page.locator('#project-results li')).toHaveCount(0);
 await page.locator('#empty-reset').click();
 await expect(search).toBeFocused();
 await expect(page.locator('#project-empty')).toBeHidden();
 await expect(page.locator('#project-results li')).toHaveCount(6);
});
test('forms lab remains in bounds at 320px and under dark theme',async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.goto('/lab/components.html');
 await page.locator('[data-theme-mode="dark"]').click();
 await page.goto('/lab/forms.html');
 await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
 await expect(page.getByRole('heading',{name:'Every detail matters.'})).toBeVisible();
 const size=await page.evaluate(()=>({
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  textarea:document.getElementById('brief-notes').getBoundingClientRect().width
 }));
 expect(size.overflow).toBeLessThanOrEqual(1);
 expect(size.textarea).toBeGreaterThan(200);
});
