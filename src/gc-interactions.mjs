/** GC UI v1 progressive enhancement bindings for native semantic controls. */
export function nextTabIndex(key,current,length,{rtl=false}={}){
 if(!Number.isInteger(length)||length<1)throw new RangeError('At least one tab required');
 if(!Number.isInteger(current)||current<0||current>=length)throw new RangeError('Tab index out of range');
 if(key==='Home')return 0;
 if(key==='End')return length-1;
 if(key==='ArrowRight')return(current+(rtl?-1:1)+length)%length;
 if(key==='ArrowLeft')return(current+(rtl?1:-1)+length)%length;
 return null;
}
export function initTabs(tablist,{rtl=false}={}){
 if(tablist.getAttribute('role')!=='tablist')throw new TypeError('Expected role=tablist');
 const tabs=Array.from(tablist.querySelectorAll('[role=tab]'));
 if(!tabs.length)throw new TypeError('No tabs found');
 const panels=tabs.map(tab=>{
  const id=tab.getAttribute('aria-controls');
  const p=tablist.ownerDocument.getElementById(id);
  if(!id||!p||p.getAttribute('role')!=='tabpanel')throw new Error('Each tab needs a matching tabpanel');
  return p;
 });
 if(new Set(panels).size!==panels.length)throw new Error('Each tab requires a unique tabpanel');
 const enabled=()=>tabs.filter(tab=>!tab.disabled&&tab.matches?.(':disabled')!==true&&!tab.hidden&&!tab.inert&&tab.getAttribute('aria-disabled')!=='true'&&tab.getAttribute('aria-hidden')!=='true'&&tab.isConnected!==false&&(typeof tablist.contains!=='function'||tablist.contains(tab))&&!tab.parentElement?.closest?.('[hidden], [inert], [aria-hidden="true"], [aria-disabled="true"]'));
 if(!enabled().length)throw new Error('No enabled tab');
 // A tablist borrows attributes and panel visibility from its host app.
 // Restore only values that are still the controller's last writes.
 const priorTabs=new Map(tabs.map(tab=>[tab,{
  selected:tab.getAttribute('aria-selected'),
  tabIndexAttr:tab.getAttribute('tabindex'),tabIndex:tab.tabIndex
 }]));
 const priorPanels=new Map(panels.map(panel=>[panel,panel.hidden]));
 const writtenTabs=new Map(),writtenPanels=new Map();
 let destroyed=false;
 function activate(tab,{focus=false}={}){
  if(destroyed)throw new Error('Tab controller was destroyed');
  if(!tabs.includes(tab))throw new RangeError('Tab does not belong to the tablist');
  if(!enabled().includes(tab))return;
  tabs.forEach((item,index)=>{
   const selected=item===tab,aria=String(selected),indexValue=selected?0:-1,hidden=!selected;
   item.setAttribute('aria-selected',aria);
   item.tabIndex=indexValue;
   panels[index].hidden=hidden;
   writtenTabs.set(item,{selected:aria,tabIndex:indexValue});
   writtenPanels.set(panels[index],hidden);
  });
  if(focus)tab.focus();
 }
 activate(tabs.find(tab=>tab.getAttribute('aria-selected')==='true'&&enabled().includes(tab))||enabled()[0]);
 const click=e=>{const tab=e.target.closest?.('[role=tab]');if(tabs.includes(tab))activate(tab)};
 const keydown=e=>{
  const tab=e.target.closest?.('[role=tab]'),candidates=enabled(),current=candidates.indexOf(tab);
  if(current===-1)return;
  const vertical=tablist.getAttribute('aria-orientation')==='vertical';
  let direction=e.key;
  if(vertical){
    if(e.key==='ArrowDown')direction='ArrowRight';
    else if(e.key==='ArrowUp')direction='ArrowLeft';
    else if(e.key==='ArrowRight'||e.key==='ArrowLeft')return;
  }else if(e.key==='ArrowUp'||e.key==='ArrowDown')return;
  const next=nextTabIndex(direction,current,candidates.length,{rtl:vertical?false:rtl});
  if(next===null)return;
  e.preventDefault();activate(candidates[next],{focus:true});
 };
 tablist.addEventListener('click',click);tablist.addEventListener('keydown',keydown);
 return {select:activate,destroy(){
  if(destroyed)return;
  destroyed=true;
  tablist.removeEventListener('click',click);
  tablist.removeEventListener('keydown',keydown);
  for(const tab of tabs){
   const prior=priorTabs.get(tab),written=writtenTabs.get(tab);
   if(tab.getAttribute('aria-selected')===written?.selected){
    if(prior.selected===null)tab.removeAttribute('aria-selected');
    else tab.setAttribute('aria-selected',prior.selected);
   }
   if(tab.tabIndex===written?.tabIndex){
    if(prior.tabIndexAttr===null){
     tab.removeAttribute('tabindex');
    }else tab.setAttribute('tabindex',prior.tabIndexAttr);
   }
  }
  for(const panel of panels)
   if(panel.hidden===writtenPanels.get(panel))panel.hidden=priorPanels.get(panel);
  writtenTabs.clear();
  writtenPanels.clear();
 }};
}
export function initDialog(dialog,{document=dialog?.ownerDocument}={}){
 if(dialog?.localName!=='dialog')throw new TypeError('Expected native dialog');
 if(!document?.addEventListener)throw new TypeError('A document is required');
 let trigger=null,destroyed=false,ownsOpen=false;
 const ensureActive=()=>{if(destroyed)throw new Error('Dialog controller was destroyed')};
 // Delegated events can be synthetic; native and inherited host availability
 // must be checked independently of the explicit programmatic controller API.
 const unavailable=el=>el.disabled===true||el.isConnected===false||
  el.matches?.(':disabled')===true||
  !!el.closest?.('[hidden], [inert], [aria-hidden="true"], [aria-disabled="true"]');
 const click=e=>{
  if(destroyed)return;
  const opener=e.target.closest?.('[data-gc-dialog-open]');
  if(opener?.dataset.gcDialogOpen===dialog.id){
   if(!dialog.open&&opener.matches?.(':disabled')!==true&&
      !opener.hidden&&!opener.inert&&opener.isConnected!==false&&
      opener.getAttribute?.('aria-disabled')!=='true'&&
      opener.getAttribute?.('aria-hidden')!=='true'){
    dialog.showModal();trigger=opener;ownsOpen=true
   }
   return;
  }
  const close=e.target.closest?.('[data-gc-dialog-close]');
  if(close&&dialog.contains(close)&&dialog.open&&
     close.matches?.(':disabled')!==true&&!close.hidden&&!close.inert&&
     close.getAttribute?.('aria-disabled')!=='true'&&
     close.getAttribute?.('aria-hidden')!=='true')dialog.close();
 };
 const closed=()=>{ownsOpen=false;if(trigger?.isConnected)trigger.focus();trigger=null};
 document.addEventListener('click',click);dialog.addEventListener('close',closed);
 return {
  open(){ensureActive();if(!dialog.open){dialog.showModal();ownsOpen=true}},
  close(){ensureActive();if(dialog.open)dialog.close()},
  destroy(){
   if(destroyed)return;
   destroyed=true;
   document.removeEventListener('click',click);
   dialog.removeEventListener('close',closed);
   // A host-opened modal must survive disposal of this optional controller.
   if(ownsOpen&&dialog.open)dialog.close();
   if(trigger?.isConnected)trigger.focus();
   trigger=null;ownsOpen=false;
  }
 };
}
// Multiple controllers may temporarily share the same host-owned live region.
// Restore its prior semantics only after the last controller has detached.
const toastRegionOwners=new WeakMap();
export function createToast(region){
 if(!region?.setAttribute)throw new TypeError('Toast region required');
 let ownership=toastRegionOwners.get(region);
 if(!ownership){
  const semantics={'role':'status','aria-live':'polite','aria-atomic':'true'};
  const prior=new Map(Object.keys(semantics).map(name=>[name,region.getAttribute?.(name)??null]));
  ownership={users:0,prior,semantics};
  for(const [name,value] of Object.entries(semantics))region.setAttribute(name,value);
  toastRegionOwners.set(region,ownership);
 }
 ownership.users++;
 let timer=null,active=null,destroyed=false,returnFocus=null;
 const dismiss=()=>{
  if(timer!==null)clearTimeout(timer);
  timer=null;
  const retiring=active,target=returnFocus;
  active=null;returnFocus=null;
  if(!retiring)return;
  // Retire a focused notification without leaving focus on a detached button;
  // if focus already moved elsewhere, leave it untouched.
  const hadFocus=retiring.contains?.(region.ownerDocument.activeElement)===true;
  retiring.remove();
  if(hadFocus&&target?.isConnected&&typeof target.focus==='function')target.focus();
 };
 function show(message,{duration=6000}={}){
  if(destroyed)throw new Error('Toast controller was destroyed');
  if(!Number.isSafeInteger(duration)||duration<0||duration>600000)
   throw new RangeError('Toast duration must be an integer between 0 and 600000 milliseconds');
  dismiss();
  const doc=region.ownerDocument;
  returnFocus=doc.activeElement;
  const el=doc.createElement('div');
  el.className='gc-toast';
  const text=doc.createElement('span');
  text.className='gc-toast-message';
  text.textContent=String(message);
  const close=doc.createElement('button');
  close.type='button';
  close.className='gc-toast-dismiss';
  close.setAttribute('aria-label','Dismiss notification');
  close.textContent='Dismiss';
  el.append(text,close);region.appendChild(el);active=el;
  if(duration>0)timer=setTimeout(dismiss,duration);
  // A real, keyboard-focusable dismissal control makes focus-based
  // timer suspension reachable without scripting a tabindex onto the toast.
  let hovered=false,focused=false;
  const pause=()=>{if(active===el&&timer!==null){clearTimeout(timer);timer=null}};
  const resume=()=>{
   if(active===el&&!hovered&&!focused&&timer===null&&duration>0)
    timer=setTimeout(dismiss,duration);
  };
  el.addEventListener('pointerenter',()=>{hovered=true;pause()});
  el.addEventListener('pointerleave',()=>{hovered=false;resume()});
  el.addEventListener('focusin',()=>{focused=true;pause()});
  el.addEventListener('focusout',event=>{
   if(event?.relatedTarget&&el.contains?.(event.relatedTarget))return;
   focused=false;resume();
  });
  close.addEventListener('click',()=>{if(active===el)dismiss()});
  return ()=>{if(active===el)dismiss()};
 }
 return {show,dismiss,destroy(){
  if(destroyed)return;
  destroyed=true;
  dismiss();
  if(--ownership.users===0){
   toastRegionOwners.delete(region);
   for(const [name,value] of Object.entries(ownership.semantics)){
    // A host change after mount is not ours to undo.
    if(region.getAttribute?.(name)!==value)continue;
    const previous=ownership.prior.get(name);
    if(previous===null)region.removeAttribute?.(name);
    else region.setAttribute(name,previous);
   }
  }
 }};
}
// Attribute state is host-owned presentation, not a reliable request lock: a
// consumer can change aria-busy or disabled before the first promise settles.
const pendingAsyncActions=new WeakSet();
export async function runAsyncAction(button,operation){
 if(pendingAsyncActions.has(button)||button.getAttribute('aria-busy')==='true'||
    button.disabled||button.matches?.(':disabled')===true||
    button.getAttribute('aria-disabled')==='true')return null;
 const previousBusy=button.getAttribute('aria-busy');
 pendingAsyncActions.add(button);
 try{
  button.setAttribute('aria-busy','true');button.disabled=true;
  return await operation();
 }
 finally{
  try{
   // The host may disable the action while pending. Keep an explicit
   // aria-disabled host override, and preserve independently changed ARIA.
   if(button.getAttribute('aria-disabled')!=='true')button.disabled=false;
   if(button.getAttribute('aria-busy')==='true'){
    if(previousBusy===null)button.removeAttribute('aria-busy');
    else button.setAttribute('aria-busy',previousBusy);
   }
  }finally{
   // Keep the lock until the last cleanup write has finished, even if a host
   // setter throws during teardown.
   pendingAsyncActions.delete(button);
  }
 }
}
