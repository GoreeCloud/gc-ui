/** GC UI accessible action menu. A command menu is not a form select or site navigation. */
const ITEM='[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';

export function nextMenuIndex(key,current,length){
  if(!Number.isInteger(length)||length<1)throw new RangeError('Menu requires enabled items');
  if(!Number.isInteger(current)||current<0||current>=length)throw new RangeError('Current menu item is invalid');
  if(key==='ArrowDown')return(current+1)%length;
  if(key==='ArrowUp')return(current-1+length)%length;
  if(key==='Home')return 0;
  if(key==='End')return length-1;
  return null;
}

/**
 * trigger: <button>; menu: id'd element role="menu" containing role=menuitem buttons.
 * Use onSelect for app actions. Never infer an action from innerHTML.
 */
export function initMenu(trigger,menu,{onSelect=()=>{},document=trigger?.ownerDocument}={}){
  if(trigger?.localName!=='button'||menu?.getAttribute('role')!=='menu'||!menu.id)
    throw new TypeError('Expected a button trigger and an id’d role=menu container');
  if(typeof onSelect!=='function')throw new TypeError('onSelect must be a function');
  if(!document?.addEventListener)throw new TypeError('Document required');
  const items=Array.from(menu.querySelectorAll(ITEM));
  if(!items.length)throw new Error('Menu must contain at least one menu item');
  let open=false,destroyed=false;
  // Controller state is borrowed from the host application, not owned forever.
  const attrs=['aria-haspopup','aria-controls','aria-expanded'];
  const priorAttrs=new Map(attrs.map(name=>[name,trigger.getAttribute(name)]));
  const writtenAttrs=new Map();
  const setTriggerAttr=(name,value)=>{
    trigger.setAttribute(name,value);
    writtenAttrs.set(name,value);
  };
  const priorHidden=menu.hidden;
  let writtenHidden;
  const setHidden=value=>{menu.hidden=value;writtenHidden=value};
  const priorItems=items.map(item=>({
    item,tabIndex:item.tabIndex,attribute:item.getAttribute('tabindex')
  }));
  function restore(){
    for(const name of attrs){
      if(trigger.getAttribute(name)!==writtenAttrs.get(name))continue;
      const prior=priorAttrs.get(name);
      if(prior===null)trigger.removeAttribute(name);
      else trigger.setAttribute(name,prior);
    }
    if(menu.hidden===writtenHidden)menu.hidden=priorHidden;
    for(const {item,tabIndex,attribute} of priorItems){
      if(item.tabIndex!==-1)continue;
      item.tabIndex=tabIndex;
      if(attribute===null)item.removeAttribute('tabindex');
      else item.setAttribute('tabindex',attribute);
    }
  }
  setTriggerAttr('aria-haspopup','menu');
  setTriggerAttr('aria-controls',menu.id);
  setTriggerAttr('aria-expanded','false');
  setHidden(true);
  items.forEach(item=>{item.tabIndex=-1});
  const enabled=()=>items.filter(item=>!item.disabled&&item.getAttribute('aria-disabled')!=='true');
  function focusItem(index){
    const candidates=enabled();
    if(candidates.length)candidates[((index%candidates.length)+candidates.length)%candidates.length].focus();
  }
  function show(position='first'){
    if(destroyed||trigger.disabled)return false;
    if(!enabled().length)return false;
    open=true;
    setHidden(false);
    setTriggerAttr('aria-expanded','true');
    focusItem(position==='last'?enabled().length-1:0);
    return true;
  }
  function hide({returnFocus=true}={}){
    if(!open)return;
    open=false;
    // The host may already have hidden this menu. Do not take ownership of
    // that newer visibility state merely because the controller is closing.
    if(!menu.hidden)setHidden(true);
    setTriggerAttr('aria-expanded','false');
    if(returnFocus&&trigger.isConnected)trigger.focus();
  }
  const triggerClick=()=>{open?hide():show()};
  const triggerKeys=event=>{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();
      if(!open)show(event.key==='ArrowUp'?'last':'first');
      else focusItem(event.key==='ArrowUp'?enabled().length-1:0);
    }else if(event.key==='Escape'&&open){event.preventDefault();hide()}
  };
  const menuKeys=event=>{
    if(event.key==='Escape'){event.preventDefault();hide();return}
    if(event.key==='Tab')return; // Let native Tab focus navigation complete; focusout dismisses the menu.
    const candidates=enabled(),current=candidates.indexOf(document.activeElement);
    if(!candidates.length)return;
    const next=nextMenuIndex(event.key,current===-1?0:current,candidates.length);
    if(next!==null){event.preventDefault();focusItem(next);return}
    if(event.key==='Enter'||event.key===' '){
      const item=event.target.closest?.(ITEM);
      if(item&&candidates.includes(item)){event.preventDefault();select(item,event)}
    }
  };
  function select(item,event){
    if(!open||!enabled().includes(item))return;
    hide();
    onSelect(item,event);
  }
  const menuClick=event=>{
    const item=event.target.closest?.(ITEM);
    if(item&&menu.contains(item))select(item,event);
  };
  function dismissOnFocusLeaving(){
    if(!open)return;
    // A host can hide its own menu before the browser dispatches focusout.
    // Do not claim that external hidden=true as a controller write.
    if(menu.hidden){
      open=false;
      if(trigger.getAttribute('aria-expanded')===writtenAttrs.get('aria-expanded'))
       setTriggerAttr('aria-expanded','false');
    }else hide({returnFocus:false});
  }
  const outside=event=>{
    if(open&&!menu.contains(event.target)&&!trigger.contains(event.target))
      dismissOnFocusLeaving();
  };
  const focusout=event=>{
    if(open&&!menu.contains(event.relatedTarget))dismissOnFocusLeaving();
  };
  trigger.addEventListener('click',triggerClick);
  trigger.addEventListener('keydown',triggerKeys);
  menu.addEventListener('keydown',menuKeys);
  menu.addEventListener('click',menuClick);
  menu.addEventListener('focusout',focusout);
  document.addEventListener('pointerdown',outside);
  return {
    open:show,close:hide,isOpen:()=>open,
    destroy(){
      if(destroyed)return;
      // Remove callbacks before moving focus; a teardown focusout must not rewrite DOM.
      destroyed=true;
      open=false;
      trigger.removeEventListener('click',triggerClick);
      trigger.removeEventListener('keydown',triggerKeys);
      menu.removeEventListener('keydown',menuKeys);
      menu.removeEventListener('click',menuClick);
      menu.removeEventListener('focusout',focusout);
      document.removeEventListener('pointerdown',outside);
      // Hiding the menu can synchronously move focus to the body in real browsers.
      // Capture focus ownership before restore() changes its visibility.
      const heldMenuFocus=menu.contains(document.activeElement);
      restore();
      if(heldMenuFocus&&menu.hidden&&trigger.isConnected)trigger.focus();
    }
  };
}
