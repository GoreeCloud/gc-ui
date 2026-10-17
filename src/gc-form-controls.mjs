/** Experimental, framework-neutral bindings for native form controls.
 * These helpers never persist field values or submit network requests. */

/** Maintain a stable accessible button name while exposing the pressed state. */
export function initPasswordReveal(input,button){
 if(input?.localName!=='input'||input.type!=='password')
  throw new TypeError('Expected a native password input');
 if(button?.localName!=='button')throw new TypeError('Expected a native button');
 if(button.type!=='button')throw new TypeError('Password reveal button must be type=button');
 let destroyed=false;
 const ensureActive=()=>{if(destroyed)throw new Error('Password controller was destroyed')};
 const setVisible=visible=>{
  ensureActive();
  input.type=visible?'text':'password';
  button.setAttribute('aria-pressed',String(visible));
  button.textContent=visible?'Hide':'Show';
  return visible;
 };
 button.setAttribute('aria-pressed','false');
 const toggle=()=>setVisible(input.type==='password');
 button.addEventListener('click',toggle);
 return {
  isRevealed:()=>input.type==='text',
  hide:()=>setVisible(false),
  destroy(){
   if(destroyed)return;
   // A retired controller must never leave a password exposed.
   setVisible(false);
   destroyed=true;
   button.removeEventListener('click',toggle);
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
 let destroyed=false;
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
  input.value=String(next);
  decrease.disabled=next<=minimum;
  increase.disabled=next>=maximum;
  onChange(next);
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
 decrease.addEventListener('click',decrement);
 increase.addEventListener('click',increment);
 input.addEventListener('change',onInputChange);
 update(input.value);
 return {
  get:()=>Number(input.value),
  set:update,
  destroy(){
   if(destroyed)return;
   destroyed=true;
   decrease.removeEventListener('click',decrement);
   increase.removeEventListener('click',increment);
   input.removeEventListener('change',onInputChange);
  }
 };
}
