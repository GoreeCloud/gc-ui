import {test,expect} from '@playwright/test';

test('component lab renders navigation and native controls',async({page})=>{
  await page.goto('/lab/components.html');
  await expect(page.getByRole('heading',{name:/Made to feel/i})).toBeVisible();
  await expect(page.getByRole('checkbox',{name:'Show helpful tips'})).toBeChecked();
  await page.getByRole('radio',{name:'Team'}).check();
  await expect(page.getByRole('radio',{name:'Team'})).toBeChecked();
  const favorite=page.getByRole('button',{name:'Favorite workspace'});
  await favorite.click();
  await expect(favorite).toHaveAttribute('aria-pressed','true');
  await expect(favorite).toHaveAttribute('aria-label','Favorite workspace');
});
test('tabs maintain visible panels and keyboard focus',async({page})=>{
  await page.goto('/lab/components.html');
  const activity=page.getByRole('tab',{name:'Activity'});
  await activity.click();
  await expect(activity).toHaveAttribute('aria-selected','true');
  await expect(page.getByRole('tabpanel',{name:'Activity'})).toBeVisible();
  await activity.press('ArrowRight');
  await expect(page.getByRole('tab',{name:'Details'})).toHaveAttribute('aria-selected','true');
  await expect(page.getByRole('tabpanel',{name:'Details'})).toBeVisible();
});
test('action menu skips disabled items, closes with Escape, restores trigger focus',async({page})=>{
  await page.goto('/lab/components.html');
  const trigger=page.getByRole('button',{name:/Workspace actions/});
  await trigger.click();
  const menu=page.getByRole('menu',{name:/Workspace actions/});
  await expect(menu).toHaveAttribute('id',await trigger.getAttribute('aria-controls'));
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem',{name:/Duplicate/})).toBeFocused();
  await menu.getByRole('menuitem',{name:/Duplicate/}).press('ArrowDown');
  await expect(menu.getByRole('menuitem',{name:/Share/})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});
test('high contrast and OS accessibility force solid material',async({page})=>{
  await page.goto('/lab/components.html');
  await page.locator('label:has(#contrast-switch)').click();
  await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','high');
  await expect(page.locator('html')).toHaveAttribute('data-gc-material','solid');
  await page.locator('label:has(#contrast-switch)').click();
  await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark',forcedColors:'active'});
  await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
  await expect(page.locator('html')).toHaveAttribute('data-gc-material','solid');
});
test('slider drives native progress and disclosure works with keyboard',async({page})=>{
  await page.goto('/lab/components.html');
  const slider=page.getByRole('slider',{name:/Completion/});
  await slider.focus();
  await slider.press('ArrowRight');
  await expect(page.locator('#gc-completion-value')).toHaveText('65%');
  await expect(page.locator('#gc-completion-progress')).toHaveAttribute('value','65');
  const summary=page.locator('.gc-accordion > summary').first();
  await summary.focus();
  await summary.press('Enter');
  await expect(page.locator('.gc-accordion').first()).toHaveAttribute('open','');
});
test('catalog separates 32 experimental components from 31 specified patterns',async({page})=>{
  await page.goto('/lab/catalog.html');
  await expect(page.locator('#result-message')).toHaveText('63 of 63 patterns shown');
  await page.getByRole('button',{name:'Experimental',exact:true}).click();
  await expect(page.locator('#result-message')).toHaveText('32 of 63 patterns shown');
  await page.getByRole('button',{name:'Specification only'}).click();
  await expect(page.locator('#result-message')).toHaveText('31 of 63 patterns shown');
});
test('custom palette seed is applied in the foundation lab',async({page})=>{
  await page.goto('/lab/v1.html');
  await page.locator('#custom-seed').evaluate(input=>{
    input.value='#2079a9';
    input.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expect(page.locator('html')).toHaveAttribute('data-gc-accent','custom');
  await expect(page.locator('html')).toHaveAttribute('data-gc-mode',/light|dark/);
});

test('high-contrast dark semantic color wins over curated accent',async({page})=>{
  await page.goto('/lab/components.html');
  await page.locator('label:has(#contrast-switch)').click();
  await page.locator('[data-theme-mode="dark"]').click();
  await page.locator('[data-theme-accent="lagoon"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','high');
  const primary=await page.locator('html').evaluate(node=>
    getComputedStyle(node).getPropertyValue('--gc-v1-color-primary').trim().toUpperCase()
  );
  expect(primary).toBe('#E1DAFF');
});
test('responsive labs retain accessible primary controls on narrow screens',async({page})=>{
  await page.setViewportSize({width:320,height:740});
  await page.goto('/lab/components.html');
  await expect(page.getByRole('heading',{name:/Made to feel/i})).toBeVisible();
  await expect(page.getByRole('button',{name:/Save changes/i})).toBeVisible();
  await page.goto('/lab/catalog.html');
  await expect(page.getByRole('heading',{name:/Every detail/i})).toBeVisible();
  await expect(page.getByRole('searchbox',{name:'Search components'})).toBeVisible();
});

test('both labs share preference persistence and accessibility overrides',async({page})=>{
  await page.goto('/lab/components.html');
  await page.locator('[data-theme-mode="dark"]').click();
  await page.locator('label:has(#contrast-switch)').click();
  await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','high');

  await page.goto('/lab/v1.html');
  await expect(page.locator('html')).toHaveAttribute('data-gc-mode','dark');
  await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','high');
  await expect(page.locator('#material-effective')).toContainText('Solid');
  await page.locator('#custom-seed').evaluate(input=>{
    input.value='#14a37c';
    input.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await expect(page.locator('html')).toHaveAttribute('data-gc-accent','custom');
  const overriddenDuringHigh=await page.locator('html').evaluate(root=>
    root.style.getPropertyValue('--gc-v1-color-primary')
  );
  expect(overriddenDuringHigh).toBe('');

  await page.goto('/lab/components.html');
  await page.locator('label:has(#contrast-switch)').click();
  await page.goto('/lab/v1.html');
  await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','standard');
  await expect(page.locator('html')).toHaveAttribute('data-gc-accent','custom');
  const generated=await page.locator('html').evaluate(root=>
    root.style.getPropertyValue('--gc-v1-color-primary')
  );
  expect(generated).toMatch(/^#[0-9a-fA-F]{6}$/);
});
test('keyboard menu activation performs the action and returns focus',async({page})=>{
  await page.goto('/lab/components.html');
  const trigger=page.getByRole('button',{name:/Workspace actions/});
  await trigger.focus();
  await trigger.press('ArrowDown');
  await expect(page.getByRole('menuitem',{name:/Duplicate workspace/})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu',{name:/Workspace actions/})).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('#toast-region')).toContainText('Duplicate workspace');
});

test('native Tab and Shift+Tab leave the action menu without trapping focus',async({page})=>{
  await page.goto('/lab/components.html');
  const trigger=page.getByRole('button',{name:/Workspace actions/});
  await trigger.click();
  const menu=page.getByRole('menu',{name:/Workspace actions/});
  await expect(menu).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(menu).toBeHidden();
  await expect(page.locator('#favorite-workspace')).toBeFocused();
  await trigger.focus();
  await trigger.press('ArrowUp');
  await expect(menu).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('disabled tab states cannot become the active panel',async({page})=>{
  await page.goto('/lab/components.html');
  const overview=page.getByRole('tab',{name:'Overview'});
  const activity=page.getByRole('tab',{name:'Activity'});
  const details=page.getByRole('tab',{name:'Details'});
  await activity.evaluate(tab=>tab.setAttribute('aria-disabled','true'));
  await overview.focus();
  await overview.press('ArrowRight');
  await expect(details).toHaveAttribute('aria-selected','true');
  await expect(page.getByRole('tabpanel',{name:'Details'})).toBeVisible();
  // aria-disabled is also recognized by Playwright, so dispatch the hostile
  // programmatic click that the controller must ignore.
  await activity.evaluate(tab=>tab.click());
  await expect(details).toHaveAttribute('aria-selected','true');
  await activity.evaluate(tab=>tab.removeAttribute('aria-disabled'));
  await details.focus();
  await details.press('Home');
  await expect(overview).toHaveAttribute('aria-selected','true');
  await overview.press('ArrowRight');
  await expect(activity).toHaveAttribute('aria-selected','true');
});
