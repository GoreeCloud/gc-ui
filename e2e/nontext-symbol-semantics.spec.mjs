import {test,expect} from '@playwright/test';

// Non-text axe incompletes are not automatic violations or waivers. Verify
// semantic redundancy/ARIA in actual browsers without inferring pixel contrast.
const variants=[
 {name:'320-light',width:320,dark:false,forced:false,rtl:false},
 {name:'375-dark',width:375,dark:true,forced:false,rtl:false},
 {name:'768-rtl',width:768,dark:false,forced:false,rtl:true},
 {name:'1440-forced',width:1440,dark:false,forced:true,rtl:false}
];
for(const variant of variants){
 test('decorative and explicitly named symbols '+variant.name,async({page})=>{
  await page.setViewportSize({width:variant.width,height:812});
  await page.emulateMedia({colorScheme:variant.dark?'dark':'light',
   forcedColors:variant.forced?'active':'none'});
  const open=async(path)=>{
   await page.goto('/lab/'+path+'.html');
   await page.evaluate(rtl=>{document.documentElement.dir=rtl?'rtl':'ltr'},variant.rtl);
  };
  await open('v1');
  const lens=page.locator('.material-lens');
  await expect(lens).toContainText('LENS');
  await expect(lens.locator('span').first()).toHaveAttribute('aria-hidden','true');
  await expect(page.getByRole('button',{name:'Apply'})).toBeVisible();

  await open('components');
  const trigger=page.getByRole('button',{name:'Workspace actions'});
  await expect(trigger).toBeVisible();
  await expect(trigger.locator('span[aria-hidden=true]')).toHaveCount(1);
  await expect(page.locator('.floating-control > span[aria-hidden=true]')).toHaveCount(1);
  await expect(page.locator('.floating-control')).toContainText('Lens controls');

  await open('forms');
  await expect(page.getByRole('button',{name:'Remove one collaborator'})).toHaveCount(1);
  await expect(page.locator('.gc-recovery-preview')).toHaveAttribute('aria-hidden','true');
  await expect(page.locator('.gc-recovery-symbol')).toHaveText('↻');

  await open('adaptive');
  for(const [route,label] of Object.entries({overview:'Overview',activity:'Activity',library:'Library'})){
   const desktop=page.locator('.gc-nav-link[data-gc-route="'+route+'"]');
   const compact=page.locator('.gc-bottom-link[data-gc-route="'+route+'"]');
   await expect(desktop).toContainText(label);
   await expect(compact).toContainText(label);
   await expect(desktop.locator('[aria-hidden=true]')).toHaveCount(1);
   await expect(compact.locator('[aria-hidden=true]')).toHaveCount(1);
  }
  await expect(page.locator('.gc-metric-icon[aria-hidden=true]')).toHaveCount(3);
  await expect(page.locator('.gc-activity-symbol[aria-hidden=true]')).toHaveCount(3);
 });
}
