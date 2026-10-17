import test from 'node:test';
import assert from 'node:assert/strict';
import {nextTabIndex,runAsyncAction} from '../src/gc-interactions.mjs';

test('tabs cycle, obey direction, support Home/End and reject invalid indices',()=>{
 assert.equal(nextTabIndex('ArrowRight',2,3),0);
 assert.equal(nextTabIndex('ArrowLeft',0,3),2);
 assert.equal(nextTabIndex('ArrowRight',0,3,{rtl:true}),2);
 assert.equal(nextTabIndex('ArrowLeft',0,3,{rtl:true}),1);
 assert.equal(nextTabIndex('Home',2,3),0);
 assert.equal(nextTabIndex('End',0,3),2);
 assert.equal(nextTabIndex('Escape',1,3),null);
 assert.throws(()=>nextTabIndex('Home',0,0));
});
test('async actions block duplicate activation and restore state on failure',async()=>{
 let disabled=false;const attrs={};
 const button={get disabled(){return disabled},set disabled(v){disabled=v},
  getAttribute:k=>attrs[k]||null,setAttribute:(k,v)=>{attrs[k]=v},
  removeAttribute:k=>{delete attrs[k]}};
 let complete;
 const pending=runAsyncAction(button,()=>new Promise(resolve=>complete=resolve));
 assert.equal(button.disabled,true);
 assert.equal(button.getAttribute('aria-busy'),'true');
 assert.equal(await runAsyncAction(button,()=>{throw Error('duplicate')}),null);
 complete('saved');
 assert.equal(await pending,'saved');
 assert.equal(button.disabled,false);
 await assert.rejects(runAsyncAction(button,async()=>{throw Error('failed')}),/failed/);
 assert.equal(button.disabled,false);
});

test('stale toast dismiss handles do not remove a newer message',async()=>{
 const elements=[];
 const region={
  ownerDocument:{createElement:()=>({setAttribute(){},parts:[],append(...nodes){this.parts.push(...nodes)},listeners:{},addEventListener(key,fn){this.listeners[key]=fn},remove(){const index=elements.indexOf(this);if(index!==-1)elements.splice(index,1)}})},
  setAttribute(){},
  appendChild(item){elements.push(item)}
 };
 const {createToast}=await import('../src/gc-interactions.mjs');
 const toast=createToast(region);
 const dismissOld=toast.show('first',{duration:0});
 toast.show('second',{duration:0});
 dismissOld();
 assert.equal(elements.length,1);
 assert.equal(elements[0].parts[0].textContent,'second');
 toast.dismiss();
 assert.equal(elements.length,0);
});

test('public tab selection guards against foreign tabs and supports changing enabled states',async()=>{
  const handlers=new Map(),widgets=new Map();
  const doc={getElementById:id=>widgets.get(id)};
  const panel=(id)=>({id,hidden:false,getAttribute:k=>k==='role'?'tabpanel':null});
  const panels=[panel('a-panel'),panel('b-panel'),panel('c-panel')];
  panels.forEach(x=>widgets.set(x.id,x));
  const tabs=['a','b','c'].map((name,i)=>({
    disabled:false,tabIndex:-1,focused:false,
    getAttribute:k=>k==='aria-controls'?panels[i].id:k==='aria-selected'&&i===0?'true':null,
    setAttribute(k,v){if(k==='aria-selected')this.selected=v},
    focus(){this.focused=true},
    closest(){return this}
  }));
  const group={
    ownerDocument:doc,
    getAttribute:k=>k==='role'?'tablist':null,
    querySelectorAll:()=>tabs,
    addEventListener:(event,fn)=>handlers.set(event,fn),
    removeEventListener:event=>handlers.delete(event)
  };
  const {initTabs}=await import('../src/gc-interactions.mjs');
  const control=initTabs(group);
  assert.equal(panels[0].hidden,false);
  assert.throws(()=>control.select({disabled:false}),/does not belong/);
  assert.equal(panels[0].hidden,false,'invalid call may not hide active panel');
  tabs[1].disabled=true;
  let defaultPrevented=false;
  handlers.get('keydown')({target:tabs[0],key:'ArrowRight',preventDefault(){defaultPrevented=true}});
  assert.equal(defaultPrevented,true);
  assert.equal(panels[2].hidden,false);
  control.destroy();
});
test('vertical tablists use Up/Down arrows and ignore Left/Right',async()=>{
  const panels=['one','two'].map(id=>({hidden:false,getAttribute:()=> 'tabpanel'}));
  const byId=new Map([['one',panels[0]],['two',panels[1]]]);
  const handlers=new Map();
  const tabs=panels.map((_,i)=>({
    disabled:false,tabIndex:-1,
    getAttribute:k=>k==='aria-controls'?i===0?'one':'two':k==='aria-selected'&&i===0?'true':null,
    setAttribute(){},focus(){this.focused=true},closest(){return this}
  }));
  const group={ownerDocument:{getElementById:id=>byId.get(id)},getAttribute:k=>k==='role'?'tablist':k==='aria-orientation'?'vertical':null,
    querySelectorAll:()=>tabs,addEventListener:(k,v)=>handlers.set(k,v),removeEventListener:k=>handlers.delete(k)};
  const {initTabs}=await import('../src/gc-interactions.mjs');
  const controller=initTabs(group);
  handlers.get('keydown')({target:tabs[0],key:'ArrowRight',preventDefault(){throw Error('horizontal arrow should be ignored')}});
  assert.equal(panels[1].hidden,true);
  handlers.get('keydown')({target:tabs[0],key:'ArrowDown',preventDefault(){}});
  assert.equal(panels[1].hidden,false);
  controller.destroy();
});

test('superseded toasts cannot reschedule dismissal of the current toast',async()=>{
 const children=[];
 const region={
  setAttribute(){},
  ownerDocument:{createElement:()=>({setAttribute(){},parts:[],append(...nodes){this.parts.push(...nodes)},
   listeners:{},addEventListener(type,fn){this.listeners[type]=fn},
   remove(){const at=children.indexOf(this);if(at!==-1)children.splice(at,1)}
  })},
  appendChild(node){children.push(node)}
 };
 const {createToast}=await import('../src/gc-interactions.mjs');
 const toast=createToast(region);
 toast.show('first',{duration:20});
 const old=children[0];
 toast.show('new',{duration:0});
 old.listeners.pointerleave(); // detached DOM element still holds event callbacks
 old.listeners.focusout();
 await new Promise(resolve=>setTimeout(resolve,45));
 assert.equal(children.length,1);
 assert.equal(children[0].parts[0].textContent,'new');
 toast.destroy();
});


test('toast remains until neither pointer nor focus is inside it',async()=>{
 const children=[];
 const region={
  setAttribute(){},
  ownerDocument:{createElement:()=>({setAttribute(){},parts:[],append(...nodes){this.parts.push(...nodes)},
   listeners:{},addEventListener(type,fn){this.listeners[type]=fn},
   contains(target){return target===this.child},
   remove(){const at=children.indexOf(this);if(at!==-1)children.splice(at,1)}
  })},
  appendChild(node){children.push(node)}
 };
 const {createToast}=await import('../src/gc-interactions.mjs');
 const toast=createToast(region);
 toast.show('Keep reading',{duration:25});
 const el=children[0];
 el.listeners.pointerenter();
 el.listeners.focusin();
 el.listeners.pointerleave();
 await new Promise(resolve=>setTimeout(resolve,60));
 assert.equal(children.length,1,'pointer exit must not dismiss the focused toast');
 el.listeners.focusout({relatedTarget:el.child={}});
 await new Promise(resolve=>setTimeout(resolve,40));
 assert.equal(children.length,1,'focus moving within the toast must not restart its timer');
 el.listeners.focusout({relatedTarget:null});
 await new Promise(resolve=>setTimeout(resolve,60));
 assert.equal(children.length,0,'toast can expire after both pointer and focus have left');
 toast.destroy();
});


test('toast destroy permanently retires its controller without affecting another instance',async()=>{
 const children=[];
 const region={
  setAttribute(){},
  ownerDocument:{createElement:()=>({setAttribute(){},parts:[],append(...nodes){this.parts.push(...nodes)},
   listeners:{},addEventListener(type,fn){this.listeners[type]=fn},
   remove(){const index=children.indexOf(this);if(index!==-1)children.splice(index,1)}
  })},
  appendChild(node){children.push(node)}
 };
 const {createToast}=await import('../src/gc-interactions.mjs');
 const retired=createToast(region);
 const oldDismiss=retired.show('Original',{duration:20});
 assert.equal(children.length,1);
 retired.destroy();
 assert.equal(children.length,0,'destroy removes any active notification');
 assert.throws(()=>retired.show('Unexpected',{duration:0}),/destroyed/);
 assert.equal(children.length,0,'retired controller never appends new notifications');
 const live=createToast(region);
 live.show('New controller',{duration:0});
 retired.dismiss();
 retired.destroy();
 oldDismiss();
 await new Promise(resolve=>setTimeout(resolve,40));
 assert.equal(children.length,1,'retired timers/handles cannot affect replacement controller');
 assert.equal(children[0].parts[0].textContent,'New controller');
 live.destroy();
 assert.equal(children.length,0);
});

test('toast renders a keyboard-accessible dismiss button and returns focus',async()=>{
 const children=[];
 const trigger={isConnected:true,focused:false,focus(){this.focused=true}};
 const doc={activeElement:trigger,createElement:tag=>({
  tag,listeners:{},attrs:{},parts:[],
  addEventListener(type,fn){this.listeners[type]=fn},
  setAttribute(name,value){this.attrs[name]=value},
  append(...nodes){this.parts.push(...nodes)},
  contains(node){return this.parts.includes(node)},
  remove(){const index=children.indexOf(this);if(index!==-1)children.splice(index,1)}
 })};
 const region={ownerDocument:doc,setAttribute(){},appendChild(node){children.push(node)}};
 const {createToast}=await import('../src/gc-interactions.mjs');
 const toast=createToast(region);
 toast.show('Saved locally',{duration:0});
 assert.equal(children.length,1);
 const [message,close]=children[0].parts;
 assert.equal(message.textContent,'Saved locally');
 assert.equal(close.tag,'button');
 assert.equal(close.type,'button');
 assert.equal(close.attrs['aria-label'],'Dismiss notification');
 assert.equal(close.textContent,'Dismiss');
 doc.activeElement=close;
 close.listeners.click();
 assert.equal(children.length,0);
 assert.equal(trigger.focused,true,'dismiss action must restore keyboard focus to previous control');
 toast.destroy();
});

test('external toast dismissal and teardown restore only focus held inside the toast',async()=>{
 const children=[];
 let restored=0;
 const doc={activeElement:null,createElement:tag=>({
  tag,parts:[],listeners:{},attrs:{},
  setAttribute(name,value){this.attrs[name]=value},
  append(...nodes){this.parts.push(...nodes)},
  contains(node){return this.parts.includes(node)},
  addEventListener(name,fn){this.listeners[name]=fn},
  remove(){const at=children.indexOf(this);if(at!==-1)children.splice(at,1)}
 })};
 const opener={isConnected:true,focus(){restored++;doc.activeElement=this}};
 const elsewhere={isConnected:true,focus(){doc.activeElement=this}};
 doc.activeElement=opener;
 const region={ownerDocument:doc,setAttribute(){},appendChild(node){children.push(node)}};
 const {createToast}=await import('../src/gc-interactions.mjs');
 const toast=createToast(region);
 toast.show('Dismissed from code',{duration:0});
 doc.activeElement=children[0].parts[1];
 toast.dismiss();
 assert.equal(children.length,0);
 assert.equal(doc.activeElement,opener);
 assert.equal(restored,1,'programmatic dismissal must return focus to the opener');
 toast.show('Destroyed from code',{duration:0});
 doc.activeElement=children[0].parts[1];
 toast.destroy();
 assert.equal(doc.activeElement,opener);
 assert.equal(restored,2,'teardown must not leave focus in a removed notification');
 assert.equal(children.length,0);
 const replacement=createToast(region);
 replacement.show('Not focused',{duration:0});
 doc.activeElement=elsewhere;
 replacement.dismiss();
 assert.equal(doc.activeElement,elsewhere,'dismissal must not steal focus from other controls');
 assert.equal(restored,2);
 replacement.destroy();
});
