/** Optional GC UI pattern controllers: enhance native HTML, never replace it. */

/** Single-select filter chips built from ordinary native type=button controls. */
export function initChoiceChips(group,{onChange=()=>{}}={}){
 if(!group?.querySelectorAll||!group?.addEventListener)
  throw new TypeError('Choice group element required');
 if(typeof onChange!=='function')throw new TypeError('onChange must be a function');
 const buttons=Array.from(group.querySelectorAll('[data-gc-choice]'));
 const values=buttons.map(button=>button.getAttribute('data-gc-choice'));
 if(!buttons.length||buttons.some(button=>button.localName!=='button'||button.type!=='button')||
    values.some(value=>!value)||new Set(values).size!==values.length)
  throw new TypeError('Choices must be uniquely named native type=button controls');
 const enabled=button=>!button.disabled&&!button.hidden&&!button.inert&&button.isConnected!==false&&button.getAttribute('aria-disabled')!=='true'&&button.getAttribute('aria-hidden')!=='true'&&(typeof group.contains!=='function'||group.contains(button))&&!button.parentElement?.closest?.('[hidden], [inert], [aria-hidden="true"]');
 if(!buttons.some(enabled))throw new Error('At least one enabled choice required');
 const original=new Map(buttons.map(button=>[button,button.getAttribute('aria-pressed')]));
 const written=new Map();
 let current=buttons.find(button=>enabled(button)&&button.getAttribute('aria-pressed')==='true')||buttons.find(enabled);
 let destroyed=false;
 function render(){
  for(const button of buttons){
   const value=button===current?'true':'false';
   button.setAttribute('aria-pressed',value);
   written.set(button,value);
  }
 }
 render();
 function select(value,{focus=false}={}){
  if(destroyed)throw new Error('Choice controller was destroyed');
  const index=values.indexOf(value);
  if(index<0)throw new RangeError('Unknown choice');
  const button=buttons[index];
  if(!enabled(button))return false;
  const changed=current!==button;
  const previous=current;
  const before=new Map(buttons.map(item=>[item,{
   attribute:item.getAttribute('aria-pressed'),written:written.get(item)
  }]));
  current=button;
  render();
  if(focus)button.focus();
  if(changed)try{onChange(value)}
  catch(error){
   // A rejected application selection must not become the committed choice.
   // Restore only controller-written ARIA; callback-owned changes win.
   // A nested host selection may have committed a newer choice while this
   // callback was running. Never roll that newer transaction back.
   if(current!==button)throw error;
   current=previous;
   for(const item of buttons){
    if(item.getAttribute('aria-pressed')!==written.get(item)){
     written.delete(item);
     continue;
    }
    const prior=before.get(item);
    if(prior.attribute===null)item.removeAttribute('aria-pressed');
    else item.setAttribute('aria-pressed',prior.attribute);
    if(prior.attribute===prior.written)written.set(item,prior.written);
    else written.delete(item);
   }
   throw error;
  }
  return changed;
 }
 const click=event=>{
  const button=event.target.closest?.('[data-gc-choice]');
  const index=buttons.indexOf(button);
  if(index>=0)select(values[index]);
 };
 group.addEventListener('click',click);
 return Object.freeze({
  get:()=>values[buttons.indexOf(current)],
  select,
  destroy(){
   if(destroyed)return;
   destroyed=true;
   group.removeEventListener('click',click);
   for(const button of buttons){
    if(button.getAttribute('aria-pressed')!==written.get(button))continue;
    const prior=original.get(button);
    if(prior===null)button.removeAttribute('aria-pressed');
    else button.setAttribute('aria-pressed',prior);
   }
   written.clear();
  }
 });
}

/** Native details/summary group: optionally keep a single disclosure expanded.
 * Current native open/closed states intentionally persist after disposal.
 */
export function initDisclosureGroup(group,{multiple=false}={}){
 if(!group?.querySelectorAll)throw new TypeError('Disclosure group element required');
 const disclosures=Array.from(group.querySelectorAll('details'));
 if(!disclosures.length||disclosures.some(detail=>detail.localName!=='details'||
     !detail.querySelector('summary')))
  throw new TypeError('Each disclosure needs native details and a summary');
 let destroyed=false;
 function expand(target){
  if(destroyed)throw new Error('Disclosure controller was destroyed');
  if(!disclosures.includes(target))throw new RangeError('Foreign disclosure');
  if(!multiple)for(const detail of disclosures)if(detail!==target)detail.open=false;
  target.open=true;
  return target;
 }
 if(!multiple){
  let first=null;
  for(const detail of disclosures){
   if(detail.open){if(first)detail.open=false;else first=detail}
  }
 }
 const listeners=disclosures.map(detail=>{
  const onToggle=()=>{if(!destroyed&&detail.open&&!multiple)expand(detail)};
  detail.addEventListener('toggle',onToggle);
  return [detail,onToggle];
 });
 return Object.freeze({
  expand,
  getOpen:()=>disclosures.filter(detail=>detail.open),
  destroy(){
   if(destroyed)return;
   destroyed=true;
   for(const [detail,listener] of listeners)detail.removeEventListener('toggle',listener);
  }
 });
}
