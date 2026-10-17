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
 const enabled=()=>tabs.filter(tab=>!tab.disabled&&tab.getAttribute('aria-disabled')!=='true');
 if(!enabled().length)throw new Error('No enabled tab');
 function activate(tab,{focus=false}={}){
  if(!tabs.includes(tab))throw new RangeError('Tab does not belong to the tablist');
  if(!enabled().includes(tab))return;
  tabs.forEach((item,index)=>{
   const selected=item===tab;
   item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;panels[index].hidden=!selected;
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
 return {select:activate,destroy(){tablist.removeEventListener('click',click);tablist.removeEventListener('keydown',keydown)}};
}
export function initDialog(dialog,{document=dialog?.ownerDocument}={}){
 if(dialog?.localName!=='dialog')throw new TypeError('Expected native dialog');
 if(!document?.addEventListener)throw new TypeError('A document is required');
 let trigger=null,destroyed=false;
 const ensureActive=()=>{if(destroyed)throw new Error('Dialog controller was destroyed')};
 const click=e=>{
  if(destroyed)return;
  const opener=e.target.closest?.('[data-gc-dialog-open]');
  if(opener?.dataset.gcDialogOpen===dialog.id){
   if(!dialog.open){trigger=opener;dialog.showModal()}
   return;
  }
  const close=e.target.closest?.('[data-gc-dialog-close]');
  if(close&&dialog.contains(close)&&dialog.open)dialog.close();
 };
 const closed=()=>{if(trigger?.isConnected)trigger.focus();trigger=null};
 document.addEventListener('click',click);dialog.addEventListener('close',closed);
 return {
  open(){ensureActive();if(!dialog.open)dialog.showModal()},
  close(){ensureActive();if(dialog.open)dialog.close()},
  destroy(){
   if(destroyed)return;
   destroyed=true;
   document.removeEventListener('click',click);
   dialog.removeEventListener('close',closed);
   if(dialog.open)dialog.close();
   if(trigger?.isConnected)trigger.focus();
   trigger=null;
  }
 };
}
export function createToast(region){
 if(!region)throw new TypeError('Toast region required');
 region.setAttribute('role','status');region.setAttribute('aria-live','polite');region.setAttribute('aria-atomic','true');
 let timer=null,active=null,destroyed=false;
 const dismiss=()=>{if(timer!==null)clearTimeout(timer);timer=null;active?.remove();active=null};
 function show(message,{duration=6000}={}){
  if(destroyed)throw new Error('Toast controller was destroyed');
  dismiss();
  const el=region.ownerDocument.createElement('div');
  el.className='gc-toast';el.textContent=String(message);region.appendChild(el);active=el;
  if(duration>0)timer=setTimeout(dismiss,duration);
  // Pointer hover and keyboard focus can overlap: leaving either must not
  // dismiss a toast while the other interaction still needs to read it.
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
  return ()=>{if(active===el)dismiss()};
 }
 return {show,dismiss,destroy(){
  if(destroyed)return;
  destroyed=true;
  dismiss();
 }};
}
export async function runAsyncAction(button,operation){
 if(button.getAttribute('aria-busy')==='true'||button.disabled)return null;
 button.setAttribute('aria-busy','true');button.disabled=true;
 try{return await operation()}
 finally{button.disabled=false;button.removeAttribute('aria-busy')}
}
