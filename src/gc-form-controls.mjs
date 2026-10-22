/** Experimental, framework-neutral bindings for native form controls.
 * These helpers never persist field values or submit network requests. */

/** Maintain a stable accessible button name while exposing the pressed state. */
export function initPasswordReveal(input,button){
 if(input?.localName!=='input'||input.type!=='password')
  throw new TypeError('Expected a native password input');
 if(button?.localName!=='button')throw new TypeError('Expected a native button');
 if(button.type!=='button')throw new TypeError('Password reveal button must be type=button');
 if(!button.getAttribute('aria-label')&&!button.getAttribute('aria-labelledby'))
  throw new TypeError('Password reveal needs a stable accessible button name');
 // Host markup is not owned by the controller. A marked visible label may
 // change, but never replace a button's children (icons, badges, SVG, etc.).
 const label=button.querySelector?.('[data-gc-password-reveal-label]')??null;
 const textTarget=label||((button.childElementCount??0)===0?button:null);
 const originalText=textTarget?.textContent;
 const priorPressed=button.getAttribute('aria-pressed');
 let writtenText,writtenPressed,destroyed=false;
 const ensureActive=()=>{if(destroyed)throw new Error('Password controller was destroyed')};
 const setPressed=value=>{
  button.setAttribute('aria-pressed',value);
  writtenPressed=value;
 };
 const setVisible=visible=>{
  ensureActive();
  input.type=visible?'text':'password';
  setPressed(String(visible));
  if(textTarget){
   const text=visible?'Hide':'Show';
   textTarget.textContent=text;
   writtenText=text;
  }
  return visible;
 };
 setPressed('false');
 const toggle=()=>setVisible(input.type==='password');
 button.addEventListener('click',toggle);
 return {
  isRevealed:()=>input.type==='text',
  hide:()=>setVisible(false),
  destroy(){
   if(destroyed)return;
   destroyed=true;
   button.removeEventListener('click',toggle);
   // Password masking is a security invariant even when the view unmounts.
   input.type='password';
   if(button.getAttribute('aria-pressed')===writtenPressed){
    if(priorPressed===null)button.removeAttribute('aria-pressed');
    else button.setAttribute('aria-pressed',priorPressed);
   }
   if(textTarget&&textTarget.textContent===writtenText)
    textTarget.textContent=originalText;
  }
 };
}

/** A bounded, integer-step controller that preserves native number editing.
 * Direct typing is normalized on change, not on each keystroke.
 */
export function initNumberStepper(input,decrease,increase,{onChange=()=>{}}={}){
 if(input?.localName!=='input'||input.type!=='number')
  throw new TypeError('Expected a native number input');
 if(decrease?.localName!=='button'||increase?.localName!=='button')
  throw new TypeError('Expected native decrement and increment buttons');
 if(decrease===increase)throw new RangeError('Stepper buttons must differ');
 if(decrease.type!=='button'||increase.type!=='button')
  throw new TypeError('Stepper controls must use type=button');
 if(typeof onChange!=='function')throw new TypeError('onChange must be a function');
 const minimum=Number(input.min),maximum=Number(input.max),step=Number(input.step||1);
 if(input.min===''||input.max===''||!Number.isSafeInteger(minimum)||!Number.isSafeInteger(maximum)||
  !Number.isSafeInteger(step)||step<=0||maximum<=minimum||((maximum-minimum)%step)!==0)
  throw new RangeError('Stepper requires finite integer min, max, and positive dividing step');
 // Controller-owned button disablement must not leak across remounts.
 const priorDisabled=new Map([[decrease,decrease.disabled],[increase,increase.disabled]]);
 const writtenDisabled=new Map();
 const setDisabled=(button,value)=>{
  button.disabled=value;
  writtenDisabled.set(button,value);
 };
 let destroyed=false,updateRevision=0;
 const priorInputValue=input.value;
 let writtenInputValue,acceptedInputValue=priorInputValue;
 const ensureActive=()=>{if(destroyed)throw new Error('Number stepper was destroyed')};
 const normalize=value=>{
  const n=Number(value);
  const raw=value===''||!Number.isFinite(n)?minimum:n;
  const snapped=minimum+Math.round((raw-minimum)/step)*step;
  return Math.max(minimum,Math.min(maximum,snapped));
 };
 const update=value=>{
  ensureActive();
  const revision=++updateRevision;
  const next=normalize(String(value));
  const previousDisabled=new Map([[decrease,decrease.disabled],[increase,increase.disabled]]);
  input.value=String(next);
  writtenInputValue=input.value;
  setDisabled(decrease,next<=minimum);
  setDisabled(increase,next>=maximum);
  try{onChange(next)}
  catch(error){
   // An application callback can synchronously commit a newer nested update.
   // Never let an older rejection roll back its accepted input or boundaries.
   if(revision!==updateRevision)throw error;
   // Rejecting a later update must be as safe as rejecting initialization.
   // Native editing already changed input.value before its 'change' handler;
   // the last accepted value is therefore independent of the event snapshot.
   if(input.value===writtenInputValue){
    input.value=acceptedInputValue;
    writtenInputValue=input.value;
   }else writtenInputValue=undefined; // callback took ownership of the input
   for(const button of [decrease,increase]){
    if(button.disabled===writtenDisabled.get(button)){
     button.disabled=previousDisabled.get(button);
     writtenDisabled.set(button,button.disabled);
    }else writtenDisabled.delete(button); // host changed the button in callback
   }
   throw error;
  }
  acceptedInputValue=input.value;
  return next;
 };
 const onInputChange=()=>update(input.value);
 const decrement=()=>{
  update(normalize(input.value)-step);
  input.focus();
 };
 const increment=()=>{
  update(normalize(input.value)+step);
  input.focus();
 };
 // Initialize before subscribing: a host callback can reject the initial
 // value. Failed construction must never leave ghost click/change handlers
 // or temporarily-controller-owned changes on the original host markup.
 try{update(input.value)}
 catch(error){
  if(input.value===writtenInputValue)input.value=priorInputValue;
  for(const button of [decrease,increase])
   if(button.disabled===writtenDisabled.get(button))button.disabled=priorDisabled.get(button);
  writtenDisabled.clear();
  throw error;
 }
 decrease.addEventListener('click',decrement);
 increase.addEventListener('click',increment);
 input.addEventListener('change',onInputChange);
 return {
  get:()=>Number(input.value),
  set:update,
  destroy(){
   if(destroyed)return;
   destroyed=true;
   decrease.removeEventListener('click',decrement);
   increase.removeEventListener('click',increment);
   input.removeEventListener('change',onInputChange);
   for(const button of [decrease,increase]){
    if(button.disabled===writtenDisabled.get(button))
     button.disabled=priorDisabled.get(button);
   }
  }
 };
}

/**
 * Experimental native-first form error summary controller.
 * Field values are never persisted, transmitted, or HTML-parsed.
 * Each descriptor has {input,error,label,valid}; all validations are synchronous.
 */
export function initValidationSummary(form,summary,list,fields,{onValid=()=>{},onInput=()=>{}}={}){
 if(form?.localName!=='form'||summary?.getAttribute?.('role')!=='group'||
  summary.getAttribute('tabindex')!=='-1'||list?.localName!=='ul'||
  !list.ownerDocument?.createElement)
  throw new TypeError('Expected a native form, focusable group summary and list');
 if(!Array.isArray(fields)||!fields.length||typeof onValid!=='function'||typeof onInput!=='function')
  throw new TypeError('Expected fields and callback functions');
 const ids=new Set();
 for(const field of fields){
  if(!['input','textarea','select'].includes(field?.input?.localName)||
   !field.input.id||!field.error?.id||typeof field.label!=='string'||!field.label.trim()||
   typeof field.valid!=='function'||ids.has(field.input.id)||ids.has(field.error.id))
   throw new TypeError('Invalid or duplicate form field/error descriptor');
  ids.add(field.input.id);ids.add(field.error.id);
 }
 const original=fields.map(field=>({
  field,invalid:field.input.getAttribute('aria-invalid'),
  describedby:field.input.getAttribute('aria-describedby'),
  errorHidden:field.error.hidden
 }));
 const summaryHidden=summary.hidden;
 const ownedErrors=new Map();
 let ownedSummary,ownedNodes=[],destroyed=false;
 const ensureActive=()=>{if(destroyed)throw new Error('Validation summary controller was destroyed')};
 // Keep last controller writes separate from host-provided values.
 const written=new Map();
 function setAttr(el,name,value){
  if(value===null)el.removeAttribute(name);else el.setAttribute(name,value);
  if(!written.has(el))written.set(el,new Map());
  written.get(el).set(name,value);
 }
 function render(){
  for(const node of ownedNodes)node.remove();
  ownedNodes=[];
  const invalid=fields.filter(field=>field.input.getAttribute('aria-invalid')==='true');
  for(const field of invalid){
   const li=list.ownerDocument.createElement('li');
   const link=list.ownerDocument.createElement('a');
   link.setAttribute('href','#'+field.input.id);
   link.textContent=field.label+': '+field.error.textContent;
   li.append(link);list.append(li);ownedNodes.push(li);
  }
  summary.hidden=invalid.length===0;ownedSummary=summary.hidden;
  return invalid.length;
 }
 function validate({focusSummary=true}={}){
  ensureActive();
  // Evaluate every validator before changing any DOM. A throwing validator
  // must not commit partially updated error states.
  const decisions=fields.map(field=>{
   const result=field.valid(field.input);
   if(typeof result!=='boolean')throw new TypeError('Field validator must return a synchronous boolean');
   return result;
  });
  for(let i=0;i<fields.length;i++)checkWithDecision(fields[i],decisions[i]);
  const count=render();
  if(count&&focusSummary)summary.focus();
  if(!count)onValid();
  return count===0;
 }
 function checkWithDecision(field,valid){
  const record=original.find(entry=>entry.field===field);
  const current=field.input.getAttribute('aria-describedby');
  const owned=written.get(field.input);
  const help=(current||'').split(/\s+/).filter(Boolean).filter(id=>id!==field.error.id);
  // A host may replace or extend its help links after mount. Respect its
  // current tokens and remember them for teardown, not the stale mount value.
  if(owned?.has('aria-describedby')&&current!==owned.get('aria-describedby'))
   record.describedby=help.length?help.join(' '):null;
  if(!valid)help.push(field.error.id);
  setAttr(field.input,'aria-describedby',help.length?help.join(' '):null);
  setAttr(field.input,'aria-invalid',valid?null:'true');
  field.error.hidden=valid;ownedErrors.set(field.error,valid);
 }
 const submit=event=>{event.preventDefault();validate()};
 const click=event=>{
  const link=event.target.closest?.('a[href^="#"]');
  if(!link||!list.contains(link))return;
  const field=fields.find(item=>'#'+item.input.id===link.getAttribute('href'));
  if(field){event.preventDefault();field.input.focus()}
 };
 const listeners=fields.map(field=>{
  const input=()=>{
   onInput(field.input);
   if(field.input.getAttribute('aria-invalid')!=='true')return;
   const valid=field.valid(field.input);
   if(typeof valid!=='boolean')throw new TypeError('Field validator must return a synchronous boolean');
   checkWithDecision(field,valid);render();
  };
  field.input.addEventListener('input',input);
  return [field.input,input];
 });
 form.addEventListener('submit',submit);
 list.addEventListener('click',click);
 return {validate,destroy(){
  if(destroyed)return;
  destroyed=true;
  form.removeEventListener('submit',submit);
  list.removeEventListener('click',click);
  for(const [el,fn] of listeners)el.removeEventListener('input',fn);
  for(const node of ownedNodes)node.remove();
  for(const record of original){
   const {field}=record;
   const writtenAttrs=written.get(field.input);
   for(const [name,prior] of [['aria-invalid',record.invalid],['aria-describedby',record.describedby]]){
    const owned=writtenAttrs?.get(name);
    if(owned===undefined)continue;
    if(field.input.getAttribute(name)!==owned)continue;
    if(prior===null)field.input.removeAttribute(name);
    else field.input.setAttribute(name,prior);
   }
   if(ownedErrors.has(field.error)&&field.error.hidden===ownedErrors.get(field.error))
    field.error.hidden=record.errorHidden;
  }
  if(ownedSummary!==undefined&&summary.hidden===ownedSummary)summary.hidden=summaryHidden;
 }};
}
