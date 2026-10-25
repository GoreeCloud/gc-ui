import {test,expect} from '@playwright/test';
import {captureFullPageVisualEvidence} from '../scripts/retain-visual-evidence.mjs';
import {readFileSync} from 'node:fs';
const iconInventory=JSON.parse(readFileSync(new URL('../registry/third-party-assets.v1.json',import.meta.url),'utf8'));
for(const variant of [
 {name:'workspace-light',width:1440,height:900},
 {name:'reading-dark',width:1440,height:900,context:'reading',dark:true},
 {name:'compact',width:375,height:812},
 {name:'compact-320',width:320,height:740}
]){
 test('capture material environment '+variant.name,async({page},testInfo)=>{
  await page.setViewportSize({width:variant.width,height:variant.height});
  await page.goto('/lab/environment.html');
  if(variant.context)await page.locator('#context').selectOption(variant.context);
  if(variant.dark)await page.getByRole('button',{name:'Switch to dark appearance'}).click();
  await expect(page.locator('.provider')).toHaveCount(iconInventory.providers.length);
  await page.evaluate(()=>document.fonts?.ready);
  await captureFullPageVisualEvidence(page,testInfo,'environment-'+variant.name);
 });
}
