import {test,expect} from '@playwright/test';

test('native validation summary links errors, focuses inputs and restores original descriptions',async({page})=>{
 await page.goto('/lab/forms.html');
 const state=await page.evaluate(async()=>{
  const {initValidationSummary}=await import('/src/index.mjs');
  const doc=document;
  const form=doc.createElement('form');
  const summary=doc.createElement('section');
  summary.setAttribute('role','group');summary.tabIndex=-1;summary.hidden=true;
  const list=doc.createElement('ul');summary.append(list);
  const input=doc.createElement('input');
  input.id='validation-probe';input.setAttribute('aria-describedby','validation-help');
  const error=doc.createElement('span');
  error.id='validation-probe-error';error.hidden=true;
  error.textContent='Enter at least 3 <characters>';
  form.append(summary,input,error);doc.body.append(form);
  let completed=0;
  const api=initValidationSummary(form,summary,list,[
   {input,error,label:'Project title',valid:el=>el.value.trim().length>=3}
  ],{onValid:()=>completed++});
  form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
  const link=list.querySelector('a');
  const invalid={
   focused:doc.activeElement===summary,
   invalid:input.getAttribute('aria-invalid'),
   describedby:input.getAttribute('aria-describedby'),
   href:link?.getAttribute('href'),
   linkText:link?.textContent,
   markupSafe:link?.querySelector('characters')===null
  };
  link.click();
  const linkFocused=doc.activeElement===input;
  input.value='Studio refresh';
  input.dispatchEvent(new Event('input',{bubbles:true}));
  const recovered={
   summaryHidden:summary.hidden,
   invalid:input.getAttribute('aria-invalid'),
   describedby:input.getAttribute('aria-describedby')
  };
  const valid=api.validate();
  api.destroy();
  const retired={describedby:input.getAttribute('aria-describedby'),invalid:input.getAttribute('aria-invalid'),errorHidden:error.hidden,summaryHidden:summary.hidden};
  form.remove();
  return {invalid,linkFocused,recovered,valid,completed,retired};
 });
 expect(state).toEqual({
  invalid:{focused:true,invalid:'true',describedby:'validation-help validation-probe-error',
   href:'#validation-probe',linkText:'Project title: Enter at least 3 <characters>',markupSafe:true},
  linkFocused:true,
  recovered:{summaryHidden:true,invalid:null,describedby:'validation-help'},
  valid:true,completed:1,
  retired:{describedby:'validation-help',invalid:null,errorHidden:true,summaryHidden:true}
 });
});
