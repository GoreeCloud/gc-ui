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

test('skip navigation is keyboard-discoverable but visually hidden at rest',async({page})=>{
 await page.goto('/lab/forms.html');
 const skip=page.getByRole('link',{name:'Skip to forms'});
 const initial=await skip.boundingBox();
 expect(initial.y).toBeLessThan(0);
 await page.keyboard.press('Tab');
 await expect(skip).toBeFocused();
 const visible=await skip.boundingBox();
 expect(visible.y).toBeGreaterThanOrEqual(0);
 await skip.press('Enter');
 await expect(page).toHaveURL(/#content$/);
});

test('passphrase reveal is a named toggle that does not alter the value',async({page})=>{
 await page.goto('/lab/forms.html');
 const phrase=page.getByRole('textbox',{name:'Sample passphrase',includeHidden:true});
 const input=page.locator('#demo-passphrase');
 const reveal=page.getByRole('button',{name:'Reveal sample passphrase'});
 await input.fill('invented-demo-only');
 await expect(input).toHaveAttribute('type','password');
 await expect(reveal).toHaveAttribute('aria-pressed','false');
 await reveal.click();
 await expect(input).toHaveAttribute('type','text');
 await expect(input).toHaveValue('invented-demo-only');
 await expect(reveal).toHaveAttribute('aria-pressed','true');
 await expect(reveal).toHaveText('Hide');
 await reveal.press('Enter');
 await expect(input).toHaveAttribute('type','password');
 await expect(reveal).toHaveAttribute('aria-pressed','false');
 await expect(reveal).toHaveAccessibleName('Reveal sample passphrase');
 await page.reload();
 await expect(page.locator('#demo-passphrase')).toHaveValue('');
});
test('native select retains typeahead and updates the local preference status',async({page})=>{
 await page.goto('/lab/forms.html');
 const select=page.getByRole('combobox',{name:'Workspace density'});
 await expect(select).toHaveValue('comfortable');
 await select.selectOption('spacious');
 await expect(page.locator('#preference-state')).toHaveText('Spacious density · 3 collaborators');
 await select.selectOption('compact');
 await expect(page.locator('#preference-state')).toHaveText('Compact density · 3 collaborators');
});
test('bounded number stepper works with keyboard, manual edits and disabled ends',async({page})=>{
 await page.goto('/lab/forms.html');
 const quantity=page.getByRole('spinbutton',{name:'Collaborators'});
 const less=page.getByRole('button',{name:'Remove one collaborator'});
 const more=page.getByRole('button',{name:'Add one collaborator'});
 await expect(quantity).toHaveValue('3');
 await more.click();
 await expect(quantity).toHaveValue('4');
 await expect(quantity).toBeFocused();
 await quantity.fill('12');
 await quantity.press('Tab');
 await expect(more).toBeDisabled();
 await expect(page.locator('#preference-state')).toHaveText('Comfortable density · 12 collaborators');
 await less.click();
 await expect(quantity).toHaveValue('11');
 await quantity.fill('0');
 await quantity.press('Tab');
 await expect(quantity).toHaveValue('1');
 await expect(less).toBeDisabled();
 await expect(page.locator('#preference-state')).toHaveText('Comfortable density · 1 collaborator');
});
test('recovery state announces failure and returns focus after retry without losing form entries',async({page})=>{
 await page.goto('/lab/forms.html');
 await page.locator('#brief-name').fill('Preserved example');
 const simulate=page.getByRole('button',{name:'Simulate a temporary error'});
 await simulate.click();
 await expect(page.getByRole('alert',{name:'Temporary connection problem'})).toBeVisible();
 await expect(page.locator('#recovery-success')).toBeHidden();
 await page.getByRole('button',{name:'Retry demo action'}).click();
 await expect(page.locator('#recovery-error')).toBeHidden();
 await expect(page.locator('#recovery-success')).toBeVisible();
 await expect(simulate).toBeFocused();
 await expect(page.locator('#brief-name')).toHaveValue('Preserved example');
});
test('IME composition does not select search suggestions or cancel Enter',async({page})=>{
 await page.goto('/lab/forms.html');
 const input=page.locator('#project-search');
 await input.focus();
 const result=await input.evaluate(el=>{
  el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true,data:''}));
  el.value='team';
  el.dispatchEvent(new InputEvent('input',{bubbles:true,data:'team',inputType:'insertCompositionText',isComposing:true}));
  const key=new KeyboardEvent('keydown',{key:'Enter',isComposing:true,cancelable:true,bubbles:true});
  const notCancelled=el.dispatchEvent(key);
  return {notCancelled,expanded:el.getAttribute('aria-expanded'),status:document.querySelector('#project-result-count').textContent};
 });
 expect(result).toEqual({notCancelled:true,expanded:'false',status:'6 projects found'});
 await input.evaluate(el=>el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'team'})));
 await expect(input).toHaveAttribute('aria-expanded','true');
 await expect(page.locator('#project-result-count')).toHaveText('1 project found');
});
test('extended native form specimens fit 320px and preserve native semantics',async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.goto('/lab/forms.html');
 await expect(page.locator('#demo-density')).toBeVisible();
 await expect(page.locator('#demo-collaborators')).toBeVisible();
 await expect(page.locator('#recovery-error')).toBeHidden();
 const v=await page.evaluate(()=>({
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  input:document.getElementById('demo-passphrase').getBoundingClientRect().width
 }));
 expect(v.overflow).toBeLessThanOrEqual(1);
 expect(v.input).toBeGreaterThan(130);
});
