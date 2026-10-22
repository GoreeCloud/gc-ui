import {test,expect} from '@playwright/test';

test('density preview changes real layout whitespace and preserves native target sizes',async({page})=>{
 await page.goto('/lab/forms.html');
 const select=page.locator('#demo-density');
 await expect(select).toHaveValue('comfortable');
 const card=page.locator('.gc-form-panel').first();
 const field=page.locator('#demo-density');
 async function measures(){
  return page.evaluate(()=>{
   const card=document.querySelector('.gc-form-panel');
   const decrease=document.querySelector('#demo-decrease');
   const input=document.querySelector('#demo-density');
   return {
    density:document.documentElement.dataset.gcDensity,
    padding:parseFloat(getComputedStyle(card).paddingInlineStart),
    minButton:parseFloat(getComputedStyle(decrease).minBlockSize),
    inputHeight:input.getBoundingClientRect().height,
    result:document.querySelector('#preference-state').textContent
   };
  });
 }
 const comfortable=await measures();
 expect(comfortable.density).toBe('comfortable');
 await select.selectOption('compact');
 const compact=await measures();
 expect(compact.density).toBe('compact');
 expect(compact.padding).toBeLessThan(comfortable.padding);
 expect(compact.result).toContain('Compact density');
 await select.selectOption('spacious');
 const spacious=await measures();
 expect(spacious.density).toBe('spacious');
 expect(spacious.padding).toBeGreaterThan(compact.padding);
 expect(spacious.result).toContain('Spacious density');
 for(const state of [comfortable,compact,spacious]){
  expect(state.minButton).toBeGreaterThanOrEqual(44);
  expect(state.inputHeight).toBeGreaterThanOrEqual(44);
 }
 await expect(field).toBeEnabled();
});
