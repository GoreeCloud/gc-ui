import {test,expect} from '@playwright/test';
const cases=[
 {id:'light',forced:false,dark:false,open:false},
 {id:'forced',forced:true,dark:false,open:false},
 {id:'menu-open',forced:false,dark:false,open:true},
 {id:'menu-forced',forced:true,dark:false,open:true},
 {id:'dark',forced:false,dark:true,open:false}
];
for(const variant of cases)test('menu ARIA reference '+variant.id,async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.emulateMedia({forcedColors:variant.forced?'active':'none'});
 await page.goto('/lab/components.html');
 if(variant.dark)await page.locator('[data-theme-mode=dark]').click();
 const trigger=page.getByRole('button',{name:'Workspace actions'});
 await expect(trigger).toHaveAttribute('aria-haspopup','menu');
 await expect(trigger).toHaveAttribute('aria-controls','gc-file-actions');
 const relation=await trigger.evaluate(el=>{
  const id=el.getAttribute('aria-controls');
  const nodes=[...document.querySelectorAll('[id]')].filter(x=>x.id===id);
  return {count:nodes.length,role:nodes[0]?.getAttribute('role'),
   label:nodes[0]?.getAttribute('aria-labelledby'),trigger:el.id,
   connected:nodes[0]?.isConnected};
 });
 expect(relation.count).toBe(1);
 expect(relation.role).toBe('menu');
 expect(relation.label).toBe(relation.trigger);
 expect(relation.connected).toBe(true);
 if(variant.open){
  await trigger.press('ArrowDown');
  await expect(trigger).toHaveAttribute('aria-expanded','true');
  const menu=page.getByRole('menu',{name:'Workspace actions'});
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem',{name:'Duplicate workspace'})).toBeFocused();
  await expect(menu.getByRole('menuitem',{name:'Archive (unavailable)'})).toHaveAttribute('aria-disabled','true');
  expect(await menu.ariaSnapshot()).toContain('Duplicate workspace');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
 }
 await expect(trigger).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('#gc-file-actions')).toBeHidden();
});