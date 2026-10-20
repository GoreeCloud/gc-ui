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
 let destroyed=false;
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
  const next=normalize(String(value));
  const previousDisabled=new Map([[decrease,decrease.disabled],[increase,increase.disabled]]);
  input.value=String(next);
  writtenInputValue=input.value;
  setDisabled(decrease,next<=minimum);
  setDisabled(increase,next>=maximum);
  try{onChange(next)}
  catch(error){
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
