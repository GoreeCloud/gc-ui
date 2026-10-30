import {test,expect} from '@playwright/test';

async function fillBasics(page){
 await page.getByLabel('Workspace name (required)').fill('Family archive');
 await page.getByLabel('Sample owner label (required)').fill('Home team');
 await page.getByLabel('Workspace type (required)').selectOption('family');
}
async function fillPreferences(page){
 await page.getByLabel('Organization goal (required)').fill('Organize fictional letters and sample photos');
 await page.getByLabel('Example reminders (required)').selectOption('important');
 await page.getByLabel('Example backup frequency (required)').selectOption('weekly');
}
async function fillSchedule(page){
 await page.getByLabel('Sample review date (required)').fill('2031-12-10');
 await page.getByLabel('Example layout density (required)').selectOption('comfortable');
}
async function advanceToReview(page){
 await fillBasics(page);
 await page.getByRole('button',{name:'Next: Preferences'}).click();
 await fillPreferences(page);
 await page.getByRole('button',{name:'Next: Schedule'}).click();
 await fillSchedule(page);
 await page.getByRole('button',{name:'Review answers'}).click();
}

test('workflow keeps grouped steps, focus and answer values through backward navigation',async({page})=>{
 await page.goto('/lab/workflow.html');
 await expect(page.getByRole('status',{name:''}).filter({hasText:'Step 1 of 4'})).toBeVisible();
 await fillBasics(page);
 await page.getByRole('button',{name:'Next: Preferences'}).click();
 await expect(page.getByRole('heading',{name:'2. Organize your preferences'})).toBeFocused();
 await expect(page.locator('.gc-workflow-steps [aria-current=step]')).toHaveText('Preferences');
 await fillPreferences(page);
 await page.getByRole('button',{name:'Back'}).click();
 await expect(page.getByRole('heading',{name:'1. Workspace basics'})).toBeFocused();
 await expect(page.locator('#workspace-name')).toHaveValue('Family archive');
 await expect(page.locator('#workspace-purpose')).toHaveValue('family');
 await page.getByRole('button',{name:'Next: Preferences'}).click();
 await expect(page.locator('#workspace-goal')).toHaveValue('Organize fictional letters and sample photos');
 await page.getByRole('button',{name:'Next: Schedule'}).click();
 await fillSchedule(page);
 await page.getByRole('button',{name:'Review answers'}).click();
 await expect(page.getByRole('heading',{name:'4. Review your example'})).toBeFocused();
 await expect(page.locator('#review-name')).toHaveText('Family archive');
 await expect(page.locator('#review-goal')).toHaveText('Organize fictional letters and sample photos');
 await page.getByRole('button',{name:'Back'}).click();
 await expect(page.locator('#workspace-date')).toHaveValue('2031-12-10');
});

test('invalid values are explained and corrected without losing other fields',async({page})=>{
 await page.goto('/lab/workflow.html');
 await page.getByRole('button',{name:'Next: Preferences'}).click();
 await expect(page.locator('#workspace-name')).toBeFocused();
 await expect(page.locator('#workspace-name')).toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#workspace-name-error')).toBeVisible();
 await expect(page.locator('#workflow-alert')).toBeVisible();
 await page.getByLabel('Workspace name (required)').fill('X');
 await expect(page.locator('#workspace-name')).toHaveAttribute('aria-invalid','true');
 await page.getByLabel('Workspace name (required)').fill('Sample workspace');
 await expect(page.locator('#workspace-name')).not.toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#workspace-name-error')).toBeHidden();
 await page.getByLabel('Sample owner label (required)').fill('Team');
 await page.getByRole('button',{name:'Next: Preferences'}).click();
 await expect(page.locator('#workspace-purpose')).toBeFocused();
 await expect(page.locator('#workspace-name')).toHaveValue('Sample workspace');
 await page.getByLabel('Workspace type (required)').selectOption('team');
 await page.getByRole('button',{name:'Next: Preferences'}).click();
 await expect(page.locator('#workflow-progress')).toHaveText('Step 2 of 4: Preferences');
});

test('date is a calendar day and review uses actual browser locale',async({browser})=>{
 for(const locale of ['en-US','fr-FR']){
  const context=await browser.newContext({locale});
  try{
   const page=await context.newPage();
   await page.goto('/lab/workflow.html');
   await advanceToReview(page);
   const expected=await page.evaluate(()=>{
    const day=new Date('2031-12-10T12:00:00Z');
    return new Intl.DateTimeFormat(navigator.language,{dateStyle:'long',timeZone:'UTC'}).format(day);
   });
   await expect(page.locator('#review-date')).toHaveText(expected);
   await expect(page.locator('#review-backups')).toHaveText('Weekly');
   const writes=[];
   page.on('request',request=>{if(request.method()!=='GET')writes.push(request.method()+' '+request.url())});
   await page.getByRole('button',{name:'Check example'}).click();
   await expect(page.locator('#workflow-success')).toBeVisible();
   await expect(page.locator('#workflow-success')).toContainText('Nothing was sent or saved.');
   expect(writes).toEqual([]);
   await expect(page).toHaveURL(/\/lab\/workflow\.html$/);
  }finally{await context.close()}
 }
});

test('invalid schedule can be recovered and review respects later edits',async({page})=>{
 await page.goto('/lab/workflow.html');
 await fillBasics(page);
 await page.getByRole('button',{name:'Next: Preferences'}).click();
 await fillPreferences(page);
 await page.getByRole('button',{name:'Next: Schedule'}).click();
 await page.getByRole('button',{name:'Review answers'}).click();
 await expect(page.locator('#workspace-date')).toBeFocused();
 await expect(page.locator('#workspace-date')).toHaveAttribute('aria-invalid','true');
 await fillSchedule(page);
 await page.getByRole('button',{name:'Review answers'}).click();
 await expect(page.locator('#review-density')).toHaveText('Comfortable');
 await page.getByRole('button',{name:'Back'}).click();
 await page.getByLabel('Example layout density (required)').selectOption('spacious');
 await page.getByRole('button',{name:'Review answers'}).click();
 await expect(page.locator('#review-density')).toHaveText('Spacious');
});

test('workflow remains usable at 320px and in forced-colors mode',async({page})=>{
 await page.setViewportSize({width:320,height:700});
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
 await page.goto('/lab/workflow.html');
 const bounds=await page.evaluate(()=>({
  overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  navigation:[...document.querySelectorAll('.gc-workflow-header nav a')].map(e=>e.getBoundingClientRect().height),
  current:document.querySelectorAll('.gc-workflow-steps [aria-current=step]').length
 }));
 expect(bounds.overflow).toBeLessThanOrEqual(1);
 expect(bounds.current).toBe(1);
 expect(bounds.navigation.every(height=>height>=44)).toBe(true);
 await page.getByLabel('Workspace name (required)').focus();
 await expect(page.getByLabel('Workspace name (required)')).toBeFocused();
 await expect(page.getByRole('button',{name:'Next: Preferences'})).toBeEnabled();
});

test('without JavaScript navigation is disabled, and no form submission is possible',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});
 try{
  const page=await context.newPage();
  await page.goto('/lab/workflow.html');
  await expect(page.locator('#workflow-fallback')).toBeVisible();
  await expect(page.getByRole('button',{name:'Next: Preferences'})).toBeDisabled();
  await expect(page.locator('#workspace-name')).toBeVisible();
  await expect(page.locator('[data-workflow-step]').nth(1)).toBeHidden();
  for(const id of ['workspace-name','workspace-owner','workspace-purpose'])
   await expect(page.locator('#'+id)).not.toHaveAttribute('name',/.+/);
  await page.locator('#workspace-name').fill('NO-JS-DUMMY');
  await page.locator('#workspace-name').press('Enter');
  await expect(page).toHaveURL(/\/lab\/workflow\.html$/);
 }finally{await context.close()}
});
