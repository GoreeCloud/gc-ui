import {test,expect} from '@playwright/test';

/**
 * Browser-level 200%/400% zoom *equivalent* CSS viewports for a 1280x800 window.
 * At browser zoom Z, the layout viewport is approximately 1280/Z by 800/Z
 * CSS pixels. Playwright cannot control actual toolbar zoom in headless browsers.
 * This covers responsive layout/focus at the resulting viewport, NOT native
 * browser zoom rendering, OS text scaling, or magnified pixel quality.
 */
const equivalents=[
 {label:'200%',width:640,height:400},
 {label:'400%',width:320,height:200}
];
const labs=['v1','components','catalog','adaptive','forms'];

for(const lab of labs){
 test('effective zoom viewport reflow — '+lab,async({page})=>{
  for(const viewport of equivalents){
   await page.setViewportSize({width:viewport.width,height:viewport.height});
   await page.goto('/lab/'+lab+'.html');
   for(const dir of ['ltr','rtl']){
    await page.evaluate(direction=>document.documentElement.dir=direction,dir);
    const result=await page.evaluate(()=>{
     const root=document.documentElement;
     return {
      direction:root.dir,
      cssViewport:window.innerWidth,
      rootOverflow:root.scrollWidth-root.clientWidth,
      bodyOverflow:document.body.scrollWidth-document.body.clientWidth
     };
    });
    const caseName=lab+' at '+viewport.label+', '+dir;
    expect(result.direction,caseName).toBe(dir);
    expect(result.cssViewport,caseName).toBe(viewport.width);
    expect(result.rootOverflow,'Document horizontal overflow in '+caseName).toBeLessThanOrEqual(1);
    expect(result.bodyOverflow,'Body horizontal overflow in '+caseName).toBeLessThanOrEqual(1);
   }
  }
 });
}

test('400%-equivalent compact navigation, modal and footer remain operable',async({page})=>{
 await page.setViewportSize({width:320,height:200});
 await page.goto('/lab/adaptive.html');
 await expect(page.locator('.gc-nav-bottom')).toBeVisible();
 await page.locator('.gc-nav-bottom [data-gc-route="library"]').click();
 await expect(page).toHaveURL(/#library$/);
 const trigger=page.getByRole('button',{name:'Details',exact:true});
 await trigger.click();
 const dialog=page.getByRole('dialog',{name:'Designed to adapt.'});
 await expect(dialog).toBeVisible();
 await dialog.getByRole('button',{name:'Done'}).click();
 await expect(dialog).toBeHidden();
 await expect(trigger).toBeFocused();
 const footerLink=page.locator('.gc-shell-footer a[href="./forms.html"]');
 // Scroll directly to the target: at only 200px tall, maximum scroll can
 // leave a footer link above the viewport because of safe-bottom padding.
 await footerLink.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
 const footer=await footerLink.evaluate(link=>{
  const nav=document.querySelector('.gc-nav-bottom');
  const rect=link.getBoundingClientRect();
  const overlay=nav.getBoundingClientRect();
  return {
   gap:overlay.top-rect.bottom,
   hit:document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2)===link
  };
 });
 expect(footer.hit,'Scrolled footer link must be hit-testable').toBe(true);
 expect(footer.gap,'Footer must clear fixed navigation').toBeGreaterThanOrEqual(0);
 await footerLink.click();
 await expect(page).toHaveURL(/\/lab\/forms\.html$/);
});

test('400%-equivalent native form errors and stepper remain keyboard reachable',async({page})=>{
 await page.setViewportSize({width:320,height:200});
 await page.goto('/lab/forms.html');
 const field=page.getByRole('spinbutton',{name:'Collaborators'});
 await page.getByRole('button',{name:'Add one collaborator'}).click();
 await expect(field).toHaveValue('4');
 await expect(field).toBeFocused();
 await page.getByRole('button',{name:'Create brief'}).click();
 const summary=page.locator('#brief-errors');
 await expect(summary).toBeVisible();
 await expect(summary).toBeFocused();
 await summary.getByRole('link',{name:/Project name/}).click();
 await expect(page.getByLabel('Project name')).toBeFocused();
});

test('400%-equivalent component actions and catalog search remain usable',async({page})=>{
 await page.setViewportSize({width:320,height:200});
 await page.goto('/lab/components.html');
 const activity=page.getByRole('tab',{name:'Activity'});
 await activity.click();
 await expect(activity).toHaveAttribute('aria-selected','true');
 await page.getByRole('button',{name:/Workspace actions/}).click();
 await expect(page.getByRole('menu',{name:/Workspace actions/})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('menu',{name:/Workspace actions/})).toBeHidden();
 await page.goto('/lab/catalog.html');
 await page.getByRole('searchbox',{name:'Search components'}).fill('button');
 await expect(page.locator('#result-message')).not.toHaveText('63 of 63 patterns shown');
});
