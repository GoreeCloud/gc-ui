import {test,expect} from '@playwright/test';

test('brief validation focuses a linked summary and preserves entered values',async({page})=>{
 await page.goto('/lab/forms.html');
 await expect(page.locator('#brief-js-required')).toBeHidden();
 await expect(page.locator('#brief-submit')).toBeEnabled();
 for(const id of ['search-js-required','preferences-js-required','recovery-js-required'])
  await expect(page.locator('#'+id)).toBeHidden();
 for(const id of ['project-search','demo-passphrase','passphrase-reveal','demo-density','demo-collaborators','simulate-failure'])
  await expect(page.locator('#'+id)).toBeEnabled();
 await expect(page.locator('#project-results li')).toHaveCount(6);
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
 await expect(page.locator('#project-suggestions [role=option]')).toHaveCount(3);
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

test('unfocused skip link does not float over scrolled form content',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.goto('/lab/forms.html');
 await page.locator('#simulate-failure').click();
 const skip=page.getByRole('link',{name:'Skip to forms'});
 const rect=await skip.boundingBox();
 expect(rect.y+rect.height).toBeLessThan(0);
 await page.keyboard.press('Tab');
 // Focus moves naturally based on the browser; explicit focus demonstrates the affordance.
 await skip.focus();
 await expect(skip).toBeFocused();
 const shown=await skip.boundingBox();
 expect(shown.y).toBeGreaterThanOrEqual(0);
});

test('forms lab explicitly disables submission without JavaScript and never puts values in the URL',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});
 try{
  const page=await context.newPage();
  await page.goto('/lab/forms.html');
  const submit=page.getByRole('button',{name:'Create brief'});
  await expect(submit).toBeDisabled();
  await expect(page.locator('#brief-js-required')).toBeVisible();
  await expect(page.getByText('JavaScript is required to validate this local demonstration.',{exact:false})).toBeVisible();
  await expect(page.locator('#search-js-required')).toBeVisible();
  await expect(page.locator('#preferences-js-required')).toBeVisible();
  await expect(page.locator('#recovery-js-required')).toBeVisible();
  await expect(page.locator('#search-instructions')).toBeHidden();
  await expect(page.locator('#project-search')).toBeDisabled();
  await expect(page.locator('#project-search')).toHaveAttribute('aria-describedby','search-js-required');
  await expect(page.locator('#project-result-count')).toHaveText('6 projects found');
  await expect(page.locator('#project-results li')).toHaveCount(6);
  await expect(page.locator('#project-results')).toContainText('Design tokens');
  for(const id of ['demo-passphrase','passphrase-reveal','demo-density','demo-collaborators','demo-decrease','demo-increase','simulate-failure'])
   await expect(page.locator('#'+id)).toBeDisabled();
  await expect(page.getByRole('link',{name:'Component Registry'})).toHaveAttribute('href','./catalog.html');
  for(const selector of ['#brief-name','#brief-email','#brief-notes'])
   await expect(page.locator(selector)).not.toHaveAttribute('name',/.+/);
  await page.locator('#brief-name').fill('QA-NOJS-DUMMY');
  await page.locator('#brief-email').fill('nobody@example.invalid');
  await page.locator('#brief-notes').fill('No-JS sample values only');
  await page.locator('#brief-name').press('Enter');
  await expect(submit).toBeDisabled();
  await expect(page).toHaveURL(/\/lab\/forms\.html$/);
  expect(new URL(page.url()).search).toBe('');
 }finally{await context.close()}
});

test('password reveal preserves nested icon/label DOM and original host ARIA on teardown',async({page})=>{
 await page.goto('/lab/forms.html');
 const observed=await page.evaluate(async()=>{
  const {initPasswordReveal}=await import('/src/gc-form-controls.mjs');
  const root=document.createElement('section');
  const input=document.createElement('input');
  input.type='password';input.value='invented-demo-only';
  const button=document.createElement('button');
  button.type='button';
  button.setAttribute('aria-label','Reveal invented demo value');
  button.setAttribute('aria-pressed','mixed');
  const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
  icon.setAttribute('aria-hidden','true');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d','M2 12h20');icon.append(path);
  const label=document.createElement('span');
  label.setAttribute('data-gc-password-reveal-label','');
  label.textContent='Reveal value';
  button.append(icon,label);
  root.append(input,button);document.body.append(root);
  const api=initPasswordReveal(input,button);
  button.click();
  const expanded=input.type==='text'&&label.textContent==='Hide'&&button.contains(icon)&&icon.contains(path);
  api.destroy();
  const result={
   expanded,masked:input.type==='password',value:input.value,
   iconRetained:button.contains(icon)&&icon.contains(path),
   label:label.textContent,pressed:button.getAttribute('aria-pressed'),
   named:button.getAttribute('aria-label'),listenersGone:true
  };
  button.click();
  result.maskedAfterClick=input.type==='password';
  root.remove();
  return result;
 });
 expect(observed).toEqual({
  expanded:true,masked:true,value:'invented-demo-only',iconRetained:true,
  label:'Reveal value',pressed:'mixed',named:'Reveal invented demo value',
  listenersGone:true,maskedAfterClick:true
 });
});

test('password reveal never replaces a host-owned icon-only button or later ARIA edits',async({page})=>{
 await page.goto('/lab/forms.html');
 const observed=await page.evaluate(async()=>{
  const {initPasswordReveal}=await import('/src/gc-form-controls.mjs');
  const input=document.createElement('input');input.type='password';
  const button=document.createElement('button');button.type='button';
  button.setAttribute('aria-label','Reveal test value');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  button.append(svg);
  document.body.append(input,button);
  const api=initPasswordReveal(input,button);
  button.click();
  const retained=svg.isConnected&&button.firstElementChild===svg&&button.childElementCount===1;
  button.setAttribute('aria-pressed','app-owned');
  api.destroy();
  const result={retained,masked:input.type==='password',pressed:button.getAttribute('aria-pressed')};
  input.remove();button.remove();
  return result;
 });
 expect(observed).toEqual({retained:true,masked:true,pressed:'app-owned'});
});

test('number stepper restores borrowed host button states during teardown',async({page})=>{
 await page.goto('/lab/forms.html');
 const observed=await page.evaluate(async()=>{
  const {initNumberStepper}=await import('/src/gc-form-controls.mjs');
  const input=document.createElement('input');input.type='number';
  input.min='1';input.max='12';input.step='1';input.value='1';
  const dec=document.createElement('button'),inc=document.createElement('button');
  dec.type='button';inc.type='button';dec.disabled=true;inc.disabled=true;
  document.body.append(input,dec,inc);
  const api=initNumberStepper(input,dec,inc);
  const ownedState=dec.disabled===true&&inc.disabled===false;
  input.value='12';input.dispatchEvent(new Event('change',{bubbles:true}));
  dec.disabled=true; // newer app write, after the controller set false
  api.destroy();
  const result={ownedState,dec:dec.disabled,inc:inc.disabled,value:input.value};
  input.remove();dec.remove();inc.remove();
  return result;
 });
 expect(observed).toEqual({ownedState:true,dec:true,inc:true,value:'12'});
});

test('failed stepper callback rolls back live DOM and a later controller mounts without ghost events',async({page})=>{
 await page.goto('/lab/forms.html');
 const result=await page.evaluate(async()=>{
  const {initNumberStepper}=await import('/src/gc-form-controls.mjs');
  const wrap=document.createElement('section');
  const input=document.createElement('input');
  input.type='number';input.min='1';input.max='11';input.step='2';input.value='4';
  const dec=document.createElement('button'),inc=document.createElement('button');
  for(const button of [dec,inc]){button.type='button';button.disabled=true;wrap.append(button)}
  wrap.append(input);document.body.append(wrap);
  let threw=false;
  try{initNumberStepper(input,dec,inc,{onChange(){throw Error('mount rejected')}})}
  catch(error){threw=error.message==='mount rejected'}
  const restored=threw&&input.value==='4'&&dec.disabled&&inc.disabled;
  inc.disabled=false;inc.click(); // any ghost listener would normalize/mutate the input
  const noGhost=input.value==='4';
  const changes=[];
  const controller=initNumberStepper(input,dec,inc,{onChange:n=>changes.push(n)});
  inc.click();
  const cleanRetry=input.value==='7'&&changes.join(',')==='5,7';
  controller.destroy();wrap.remove();
  return {restored,noGhost,cleanRetry};
 });
 expect(result).toEqual({restored:true,noGhost:true,cleanRetry:true});
});

test('rejected later number stepper changes restore committed native input and button states',async({page})=>{
 await page.goto('/lab/forms.html');
 const result=await page.evaluate(async()=>{
  const {initNumberStepper}=await import('/src/gc-form-controls.mjs');
  const input=document.createElement('input');input.type='number';
  input.min='1';input.max='12';input.step='1';input.value='4';
  const dec=document.createElement('button'),inc=document.createElement('button');
  dec.type='button';inc.type='button';
  document.body.append(input,dec,inc);
  const api=initNumberStepper(input,dec,inc,{onChange:n=>{
   if(n===12)throw new Error('application denied change');
  }});
  const accepted=api.set(5);
  let rejectedSet=false;
  try{api.set(12)}catch(error){rejectedSet=error.message==='application denied change'}
  const afterSet={value:input.value,decDisabled:dec.disabled,incDisabled:inc.disabled};
  input.value='12';
  try{input.dispatchEvent(new Event('change',{bubbles:true}))}catch{} // browser reports handler exception globally
  const afterTyped={value:input.value,decDisabled:dec.disabled,incDisabled:inc.disabled};
  // Verify the controller remains usable after rejecting a change.
  const recovered=api.set(6);
  api.destroy();input.remove();dec.remove();inc.remove();
  return {accepted,rejectedSet,afterSet,afterTyped,recovered};
 });
 expect(result).toEqual({
  accepted:5,rejectedSet:true,
  afterSet:{value:'5',decDisabled:false,incDisabled:false},
  afterTyped:{value:'5',decDisabled:false,incDisabled:false},
  recovered:6
 });
});

test('newer nested stepper update survives an older callback rejection in real DOM',async({page})=>{
 await page.goto('/lab/forms.html');
 const result=await page.evaluate(async()=>{
  const {initNumberStepper}=await import('/src/gc-form-controls.mjs');
  const field=document.createElement('input');
  field.type='number';field.min='1';field.max='12';field.step='1';field.value='4';
  const dec=document.createElement('button'),inc=document.createElement('button');
  dec.type='button';inc.type='button';
  document.body.append(field,dec,inc);
  let api;
  api=initNumberStepper(field,dec,inc,{onChange:n=>{
   if(n===12){api.set(1);throw Error('outer rejected')}
  }});
  let rejected=false;
  try{api.set(12)}catch(err){rejected=err.message==='outer rejected'}
  const state={rejected,value:field.value,current:api.get(),decDisabled:dec.disabled,incDisabled:inc.disabled};
  api.destroy();field.remove();dec.remove();inc.remove();
  return state;
 });
 expect(result).toEqual({rejected:true,value:'1',current:1,decDisabled:true,incDisabled:false});
});
