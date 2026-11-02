import {test,expect} from '@playwright/test';
import {sampleBackdrop} from './support/sample-backdrop.mjs';

const variants=[
 {id:'375-light',width:375,dark:false,rtl:false},
 {id:'375-dark',width:375,dark:true,rtl:false},
 {id:'768-rtl',width:768,dark:false,rtl:true}
];

for(const variant of variants)for(const surface of ['menu','suggestions']){
 test('actual popup backdrop pixel contrast '+surface+' '+variant.id,async({page})=>{
  await page.setViewportSize({width:variant.width,height:812});
  await page.goto(surface==='menu'?'/lab/components.html':'/lab/forms.html');
  await page.evaluate(v=>{document.documentElement.dir=v.rtl?'rtl':'ltr'},variant);
  if(surface==='menu'){
   if(variant.dark)await page.locator('[data-theme-mode=dark]').click();
   await page.locator('#gc-file-action-trigger').press('ArrowDown');
  }else{
   await page.evaluate(v=>{document.documentElement.dataset.gcMode=v.dark?'dark':'light'},variant);
   const input=page.getByRole('combobox',{name:'Search projects'});
   await input.fill('d');await input.press('ArrowDown');
  }
  const items=surface==='menu'
   ? ['#gc-file-actions [role=menuitem]:nth-of-type(2)','#gc-file-actions [role=menuitem]:nth-of-type(3)']
   : ['#project-suggestions [role=option]:nth-of-type(3)'];
  const metrics=[];
  for(const selector of items){
   const item=page.locator(selector);
   await expect(item).toHaveCount(1);
   const value=await sampleBackdrop(page,selector);
   metrics.push({selector,...value});
  }
  console.log('POPUP_REAL_PIXEL',surface,variant.id,JSON.stringify(metrics));
  expect(metrics).toHaveLength(surface==='menu'?2:1);
  for(const m of metrics){
   expect(m.samples,m.selector).toBeGreaterThan(20);
   expect(m.min,m.selector+' contrast over actual composited popup').toBeGreaterThanOrEqual(4.5);
  }
 });
}
