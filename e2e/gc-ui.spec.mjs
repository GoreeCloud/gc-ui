import {test,expect} from '@playwright/test';
import {contrastRatio} from '../src/gc-color-engine.mjs';

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


test('toast does not time out while focused after pointer exit',async({page})=>{
 await page.goto('/lab/components.html');
 await page.evaluate(async()=>{
  const {createToast}=await import('/src/gc-interactions.mjs');
  const region=document.querySelector('#toast-region');
  window.__gcToastTest=createToast(region);
  window.__gcToastTest.show('Keyboard readable toast',{duration:120});
  const notice=region.querySelector('.gc-toast');
  notice.tabIndex=0;
  // Establish focus in the same event-loop turn as the short timer so
  // Firefox cannot legitimately expire it before a remote locator action.
  notice.focus();
 });
 const message=page.locator('#toast-region .gc-toast');
 await message.hover();
 await page.mouse.move(0,0);
 await page.waitForTimeout(250);
 await expect(message).toBeVisible();
 await message.evaluate(el=>el.blur());
 await expect(message).toHaveCount(0,{timeout:1000});
});


test('destroyed toast controller cannot announce after teardown or erase a replacement',async({page})=>{
 await page.goto('/lab/components.html');
 const state=await page.evaluate(async()=>{
  const {createToast}=await import('/src/gc-interactions.mjs');
  const region=document.createElement('div');
  document.body.append(region);
  const old=createToast(region);
  const dismissOld=old.show('Temporary',{duration:0});
  old.destroy();
  let rejected=false;
  try{old.show('Must not render',{duration:0})}
  catch(error){rejected=/destroyed/.test(error.message)}
  const fresh=createToast(region);
  fresh.show('Replacement',{duration:0});
  dismissOld();
  old.dismiss();
  old.destroy();
  const content=region.querySelector('.gc-toast-message')?.textContent;
  fresh.destroy();
  const cleared=region.childElementCount===0;
  region.remove();
  return {rejected,content,cleared};
 });
 expect(state).toEqual({rejected:true,content:'Replacement',cleared:true});
});


test('toast has a keyboard dismiss control and pauses its timeout during focus',async({page})=>{
 await page.goto('/lab/components.html');
 const trigger=page.getByRole('button',{name:'Show notification'});
 await trigger.focus();
 await page.evaluate(async()=>{
  const {createToast}=await import('/src/gc-interactions.mjs');
  const region=document.createElement('div');
  region.id='gc-toast-keyboard-test';
  document.body.append(region);
  window.__gcToastKeyboardTest=createToast(region);
  window.__gcToastKeyboardTest.show('Keyboard dismissal check',{duration:150});
  // Focus in the same event-loop turn, before the short timer can expire.
  region.querySelector('.gc-toast-dismiss').focus();
 });
 const toast=page.locator('#gc-toast-keyboard-test .gc-toast');
 const close=toast.getByRole('button',{name:'Dismiss notification'});
 await expect(close).toBeFocused();
 await expect(toast).toContainText('Keyboard dismissal check');
 await page.waitForTimeout(325);
 await expect(toast).toBeVisible();
 await close.press('Enter');
 await expect(toast).toHaveCount(0);
 await expect(trigger).toBeFocused();
});

test('toast expiry resumes only after both keyboard focus and hover have left',async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.goto('/lab/components.html');
 const trigger=page.getByRole('button',{name:'Show notification'});
 const toast=page.locator('#toast-region .gc-toast');
 await trigger.focus();
 await page.evaluate(async()=>{
  const {createToast}=await import('/src/gc-interactions.mjs');
  window.__dualPauseToast=createToast(document.querySelector('#toast-region'));
  window.__dualPauseToast.show('Focus protects toast after pointer exit',{duration:900});
 });
 await toast.hover();
 await toast.getByRole('button',{name:'Dismiss notification'}).focus();
 await page.mouse.move(0,0);
 await page.waitForTimeout(1100);
 await expect(toast).toBeVisible();
 await trigger.focus();
 await expect(toast).toHaveCount(0,{timeout:2000});

 await page.evaluate(()=>window.__dualPauseToast.show('Hover protects toast after focus exit',{duration:900}));
 await toast.getByRole('button',{name:'Dismiss notification'}).focus();
 await toast.hover();
 await trigger.focus();
 await page.waitForTimeout(1100);
 await expect(toast).toBeVisible();
 await page.mouse.move(0,0);
 await expect(toast).toHaveCount(0,{timeout:2000});
});

test('programmatic toast dismissal and destroy restore focus to its opener',async({page})=>{
 await page.goto('/lab/components.html');
 const trigger=page.getByRole('button',{name:'Show notification'});
 await trigger.focus();
 await page.evaluate(async()=>{
  const {createToast}=await import('/src/gc-interactions.mjs');
  window.__programmaticToast=createToast(document.querySelector('#toast-region'));
  window.__programmaticToast.show('Programmatic dismissal',{duration:0});
 });
 const toast=page.locator('#toast-region .gc-toast');
 const close=toast.getByRole('button',{name:'Dismiss notification'});
 await close.focus();
 await expect(close).toBeFocused();
 await page.evaluate(()=>window.__programmaticToast.dismiss());
 await expect(toast).toHaveCount(0);
 await expect(trigger).toBeFocused();
 await page.evaluate(()=>window.__programmaticToast.show('Controller teardown',{duration:0}));
 await close.focus();
 await expect(close).toBeFocused();
 await page.evaluate(()=>window.__programmaticToast.destroy());
 await expect(toast).toHaveCount(0);
 await expect(trigger).toBeFocused();
});


test('real CSSOM restores existing color overrides and leaves newer app changes alone',async({page})=>{
 await page.goto('/lab/components.html');
 const observed=await page.evaluate(async()=>{
  const {createThemeController}=await import('/src/gc-theme-runtime.mjs');
  const root=document.createElement('section');
  document.body.append(root);
  const property='--gc-v1-color-primary';
  root.style.setProperty(property,'#13579B','important');
  const controller=createThemeController({root,storage:null,media:()=>null});
  controller.set({accent:'custom',seed:'#2A78B9'});
  const customApplied=root.style.getPropertyValue(property).trim().toUpperCase()!=='#13579B';
  controller.set({accent:'iris'});
  const restored=root.style.getPropertyValue(property).trim().toUpperCase();
  const restoredPriority=root.style.getPropertyPriority(property);
  controller.set({accent:'custom',seed:'#2A78B9'});
  root.style.setProperty(property,'#334455','important');
  controller.destroy();
  const external=root.style.getPropertyValue(property).trim().toUpperCase();
  const externalPriority=root.style.getPropertyPriority(property);
  const generatedRemoved=root.style.getPropertyValue('--gc-v1-color-on-primary')==='';
  root.remove();
  return {customApplied,restored,restoredPriority,external,externalPriority,generatedRemoved};
 });
 expect(observed).toEqual({
  customApplied:true,restored:'#13579B',restoredPriority:'important',
  external:'#334455',externalPriority:'important',generatedRemoved:true
 });
});

test('real CSSOM keeps an externally added important declaration',async({page})=>{
 await page.goto('/lab/components.html');
 const observed=await page.evaluate(async()=>{
  const {createThemeController}=await import('/src/gc-theme-runtime.mjs');
  const root=document.createElement('section');
  document.body.append(root);
  const property='--gc-v1-color-primary';
  const controller=createThemeController({root,storage:null,media:()=>null});
  controller.set({accent:'custom',seed:'#2A78B9'});
  const value=root.style.getPropertyValue(property);
  root.style.setProperty(property,value,'important');
  controller.destroy();
  const result={value:root.style.getPropertyValue(property),
   priority:root.style.getPropertyPriority(property)};
  root.remove();
  return result;
 });
 expect(observed.priority).toBe('important');
 expect(observed.value).toMatch(/^#[0-9a-fA-F]{6}$/);
});

test('real DOM menu disposal restores original ARIA, hidden state, and keyboard focus',async({page})=>{
 await page.goto('/lab/components.html');
 const observed=await page.evaluate(async()=>{
  const {initMenu}=await import('/src/gc-menu.mjs');
  const trigger=document.createElement('button');
  trigger.textContent='Open separate menu';
  trigger.setAttribute('aria-haspopup','dialog');
  const menu=document.createElement('div');
  menu.id='gc-menu-lifecycle-probe';
  menu.setAttribute('role','menu');
  menu.hidden=true;
  const item=document.createElement('button');
  item.setAttribute('role','menuitem');
  item.textContent='Action';
  item.tabIndex=3;
  menu.append(item);
  document.body.append(trigger,menu);
  const api=initMenu(trigger,menu);
  api.open();
  const focusedWhileOpen=document.activeElement===item;
  api.destroy();
  const result={
   focusedWhileOpen,
   focusReturned:document.activeElement===trigger,
   hidden:menu.hidden,
   haspopup:trigger.getAttribute('aria-haspopup'),
   controls:trigger.getAttribute('aria-controls'),
   expanded:trigger.getAttribute('aria-expanded'),
   tabindex:item.getAttribute('tabindex'),
   canReopen:api.open()
  };
  menu.remove();trigger.remove();
  return result;
 });
 expect(observed).toEqual({
  focusedWhileOpen:true,focusReturned:true,hidden:true,
  haspopup:'dialog',controls:null,expanded:null,tabindex:'3',canReopen:false
 });
});

test('host-hide menu focusout preserves host visibility during teardown',async({page})=>{
 await page.goto('/lab/components.html');
 const observed=await page.evaluate(async()=>{
  const {initMenu}=await import('/src/gc-menu.mjs');
  const trigger=document.createElement('button');
  trigger.type='button';trigger.textContent='Menu';
  const menu=document.createElement('div');
  menu.id='gc-menu-host-visibility-probe';
  menu.setAttribute('role','menu');
  const item=document.createElement('button');
  item.type='button';item.textContent='Action';item.setAttribute('role','menuitem');
  menu.append(item);document.body.append(trigger,menu);
  const api=initMenu(trigger,menu);
  api.open();
  menu.hidden=true;
  menu.dispatchEvent(new FocusEvent('focusout',{bubbles:true,relatedTarget:trigger}));
  const dismissed=!api.isOpen();
  api.destroy();
  const result={dismissed,hidden:menu.hidden,expanded:trigger.getAttribute('aria-expanded')};
  trigger.remove();menu.remove();
  return result;
 });
 expect(observed).toEqual({dismissed:true,hidden:true,expanded:null});
});

test('tab controller teardown restores actual host ARIA, tab stops, and panel visibility',async({page})=>{
 await page.goto('/lab/components.html');
 const result=await page.evaluate(async()=>{
  const {initTabs}=await import('/src/gc-interactions.mjs');
  const host=document.createElement('section');
  const list=document.createElement('div');list.setAttribute('role','tablist');
  const one=document.createElement('button'),two=document.createElement('button');
  for(const [tab,id] of [[one,'tab-probe-one'],[two,'tab-probe-two']]){
   tab.type='button';tab.setAttribute('role','tab');tab.setAttribute('aria-controls',id);list.append(tab);
  }
  one.setAttribute('aria-selected','false');one.setAttribute('tabindex','4');
  two.setAttribute('aria-selected','true');two.setAttribute('tabindex','2');
  const first=document.createElement('section'),second=document.createElement('section');
  for(const [panel,id] of [[first,'tab-probe-one'],[second,'tab-probe-two']]){
   panel.id=id;panel.setAttribute('role','tabpanel');host.append(panel);
  }
  first.hidden=true;second.hidden=false;
  host.prepend(list);document.body.append(host);
  const ctl=initTabs(list);
  ctl.select(one,{focus:true});
  const changed=first.hidden===false&&second.hidden===true&&document.activeElement===one;
  ctl.destroy();
  const restored={
   changed,selected:[one.getAttribute('aria-selected'),two.getAttribute('aria-selected')],
   tabStop:[one.getAttribute('tabindex'),two.getAttribute('tabindex')],
   panels:[first.hidden,second.hidden]
  };
  ctl.destroy();host.remove();
  return restored;
 });
 expect(result).toEqual({changed:true,selected:['false','true'],tabStop:['4','2'],panels:[true,false]});
});

test('tab teardown retains newer consumer DOM changes and drops GC-only attributes',async({page})=>{
 await page.goto('/lab/components.html');
 const result=await page.evaluate(async()=>{
  const {initTabs}=await import('/src/gc-interactions.mjs');
  const list=document.createElement('div');list.setAttribute('role','tablist');
  const tabs=[0,1].map(i=>{
   const el=document.createElement('button');el.type='button';el.setAttribute('role','tab');
   el.setAttribute('aria-controls','gc-tabs-own-'+i);list.append(el);return el;
  });
  const panels=tabs.map((_,i)=>{
   const el=document.createElement('section');el.id='gc-tabs-own-'+i;el.setAttribute('role','tabpanel');document.body.append(el);return el;
  });
  document.body.append(list);
  panels[1].hidden=true;
  const ctl=initTabs(list);
  tabs[0].setAttribute('aria-selected','app-controlled');
  tabs[1].tabIndex=5;
  panels[1].hidden=false;
  ctl.destroy();
  const observed={
   aria:[tabs[0].getAttribute('aria-selected'),tabs[1].getAttribute('aria-selected')],
   tabStop:[tabs[0].hasAttribute('tabindex'),tabs[1].tabIndex],
   secondVisible:!panels[1].hidden
  };
  list.remove();for(const panel of panels)panel.remove();
  return observed;
 });
 expect(result).toEqual({aria:['app-controlled',null],tabStop:[false,5],secondVisible:true});
});

test('foundation secondary actions remain readable throughout light and dark palette switches',async({page})=>{
 await page.goto('/lab/v1.html');
 await page.locator('[data-mode="light"]').click();
 const hex=rgb=>{
  const channels=/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/.exec(rgb);
  if(!channels)throw new Error('Unexpected opaque RGB computed color: '+rgb);
  return '#'+channels.slice(1).map(x=>Number(x).toString(16).padStart(2,'0')).join('');
 };
 for(const mode of ['dark','light']){
  await page.locator('[data-mode="'+mode+'"]').click();
  const samples=await page.evaluate(()=>
   ['#reset','.secondary.button[href$="#tokens"]'].map(selector=>{
    const s=getComputedStyle(document.querySelector(selector));
    return {selector,foreground:s.color,background:s.backgroundColor};
   })
  );
  for(const {selector,foreground,background} of samples)
   expect(contrastRatio(hex(foreground),hex(background)),mode+' '+selector).toBeGreaterThanOrEqual(4.5);
 }
});

test('borrowed toast live-region semantics survive overlapping controllers and host changes',async({page})=>{
 await page.goto('/lab/components.html');
 const result=await page.evaluate(async()=>{
  const {createToast,runAsyncAction}=await import('/src/gc-interactions.mjs');
  const region=document.createElement('section');
  region.setAttribute('role','alert');
  region.setAttribute('aria-live','assertive');
  region.setAttribute('aria-atomic','false');
  document.body.append(region);
  const old=createToast(region),newer=createToast(region);
  old.destroy();
  const shared={role:region.getAttribute('role'),live:region.getAttribute('aria-live')};
  newer.destroy();
  const restored={role:region.getAttribute('role'),live:region.getAttribute('aria-live'),
   atomic:region.getAttribute('aria-atomic')};
  const external=createToast(region);
  region.setAttribute('aria-live','off');
  external.destroy();
  const preserved=region.getAttribute('aria-live');
  region.remove();

  const button=document.createElement('button');
  button.setAttribute('aria-busy','false');
  document.body.append(button);
  await runAsyncAction(button,async()=>{});
  const afterAction=button.getAttribute('aria-busy');
  let done;
  const running=runAsyncAction(button,()=>new Promise(resolve=>done=resolve));
  button.setAttribute('aria-busy','host-managed');
  done();
  await running;
  const afterHostChange=button.getAttribute('aria-busy');
  button.remove();
  return {shared,restored,preserved,afterAction,afterHostChange};
 });
 expect(result).toEqual({
  shared:{role:'status',live:'polite'},
  restored:{role:'alert',live:'assertive',atomic:'false'},
  preserved:'off',afterAction:'false',afterHostChange:'host-managed'
 });
});

test('dialog teardown preserves native modals opened by the host app',async({page})=>{
 await page.goto('/lab/components.html');
 const result=await page.evaluate(async()=>{
  const {initDialog}=await import('/src/gc-interactions.mjs');
  const dialog=document.createElement('dialog');
  dialog.id='host-owned-dialog-test';
  dialog.innerHTML='<p>Host-owned content</p>';
  document.body.append(dialog);
  dialog.showModal();
  const first=initDialog(dialog);
  first.destroy();
  const alreadyOpen={open:dialog.open,modal:dialog.matches(':modal')};
  dialog.close();

  const second=initDialog(dialog);
  dialog.showModal();
  second.destroy();
  const laterOpen={open:dialog.open,modal:dialog.matches(':modal')};
  dialog.close();

  const third=initDialog(dialog);
  third.open();
  const controllerOpened=dialog.open;
  third.destroy();
  const controllerRetired=!dialog.open;
  dialog.remove();
  return {alreadyOpen,laterOpen,controllerOpened,controllerRetired};
 });
 expect(result).toEqual({
  alreadyOpen:{open:true,modal:true},
  laterOpen:{open:true,modal:true},
  controllerOpened:true,controllerRetired:true
 });
});

test('programmatic menu close does not reopen a host-hidden menu on teardown',async({page})=>{
 await page.goto('/lab/components.html');
 const result=await page.evaluate(async()=>{
  const {initMenu}=await import('/src/gc-menu.mjs');
  const trigger=document.createElement('button');
  trigger.type='button';trigger.textContent='Open menu';
  const menu=document.createElement('div');
  menu.id='host-menu-close-probe';menu.setAttribute('role','menu');
  const item=document.createElement('button');
  item.type='button';item.setAttribute('role','menuitem');item.textContent='Action';
  menu.append(item);document.body.append(trigger,menu);
  const api=initMenu(trigger,menu);
  api.open();
  menu.hidden=true; // A separate application controller hides its own menu.
  api.close({returnFocus:false});
  api.destroy();
  const state={hidden:menu.hidden,expanded:trigger.getAttribute('aria-expanded')};
  menu.remove();trigger.remove();
  return state;
 });
 expect(result).toEqual({hidden:true,expanded:null});
});

test('ARIA-disabled action-menu triggers stay closed until the host enables them',async({page})=>{
 await page.goto('/lab/components.html');
 const result=await page.evaluate(async()=>{
  const {initMenu}=await import('/src/gc-menu.mjs');
  const trigger=document.createElement('button'),menu=document.createElement('div');
  const item=document.createElement('button');
  trigger.type='button';trigger.textContent='Focusable disabled menu';
  trigger.setAttribute('aria-disabled','true');
  menu.id='aria-disabled-menu-probe';menu.setAttribute('role','menu');
  item.type='button';item.setAttribute('role','menuitem');item.textContent='Do action';
  menu.append(item);document.body.append(trigger,menu);
  const api=initMenu(trigger,menu);
  trigger.click();
  const blocked={open:api.isOpen(),hidden:menu.hidden,expanded:trigger.getAttribute('aria-expanded')};
  trigger.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));
  const blockedKey=!api.isOpen();
  trigger.setAttribute('aria-disabled','false');
  trigger.click();
  const enabled={open:api.isOpen(),hidden:menu.hidden,expanded:trigger.getAttribute('aria-expanded')};
  api.destroy();menu.remove();trigger.remove();
  return {blocked,blockedKey,enabled};
 });
 expect(result).toEqual({
  blocked:{open:false,hidden:true,expanded:'false'},blockedKey:true,
  enabled:{open:true,hidden:false,expanded:'true'}
 });
});

test('ARIA-disabled async button remains focusable and is not reenabled after a host policy change',async({page})=>{
 await page.goto('/lab/components.html');
 const result=await page.evaluate(async()=>{
  const {runAsyncAction}=await import('/src/gc-interactions.mjs');
  const button=document.createElement('button');
  button.type='button';button.textContent='Host policy action';
  button.setAttribute('aria-disabled','true');document.body.append(button);
  button.focus();
  let called=0;
  const blocked=await runAsyncAction(button,()=>{called++;return 'not allowed'});
  const stillFocusable=document.activeElement===button&&!button.disabled;
  button.setAttribute('aria-disabled','false');
  let done;
  const pending=runAsyncAction(button,()=>new Promise(resolve=>{called++;done=resolve}));
  const pendingState={busy:button.getAttribute('aria-busy'),disabled:button.disabled};
  button.setAttribute('aria-disabled','true');
  done('saved');
  const saved=await pending;
  const finished={disabled:button.disabled,busy:button.getAttribute('aria-busy'),ariaDisabled:button.getAttribute('aria-disabled')};
  button.remove();
  return {blocked,stillFocusable,called,saved,pendingState,finished};
 });
 expect(result).toEqual({
  blocked:null,stillFocusable:true,called:1,saved:'saved',
  pendingState:{busy:'true',disabled:true},
  finished:{disabled:true,busy:null,ariaDisabled:'true'}
 });
});

test('component ambient background respects manual high contrast and OS forced colors',async({page})=>{
 await page.goto('/lab/components.html');
 const scene=page.locator('.material-scene');
 const environment=page.locator('.environment');
 await expect(scene).not.toHaveCSS('background-image','none');
 await expect(environment).not.toHaveCSS('background-image','none');
 const highContrast=page.locator('label:has(#contrast-switch)');
 await highContrast.click();
 await expect(page.locator('html')).toHaveAttribute('data-gc-contrast','high');
 await expect(scene).toHaveCSS('background-image','none');
 await expect(environment).toHaveCSS('background-image','none');
 await highContrast.click();
 await expect(scene).not.toHaveCSS('background-image','none');
 await page.emulateMedia({forcedColors:'active'});
 await expect(scene).toHaveCSS('background-image','none');
 await expect(environment).toHaveCSS('background-image','none');
 await expect(scene).toHaveCSS('background-color','rgb(255, 255, 255)');
});
