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
    removeAttribute(){},
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
    setAttribute(){},removeAttribute(){},focus(){this.focused=true},closest(){return this}
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

test('tabs controller restores borrowed aria, native tab order and panel visibility on destroy',async()=>{
 const {initTabs}=await import('../src/gc-interactions.mjs');
 const handles=new Map(),nodes=new Map();
 const make=(role,props={})=>{
  const attrs=new Map(Object.entries({role,...props}));
  return {disabled:false,hidden:false,tabIndex:Number(attrs.get('tabindex')??0),
   getAttribute:name=>attrs.get(name)??null,
   setAttribute(name,value){attrs.set(name,String(value));if(name==='tabindex')this.tabIndex=Number(value)},
   removeAttribute(name){attrs.delete(name);if(name==='tabindex')this.tabIndex=0},
   focus(){this.focused=true},
   closest(){return this}
  };
 };
 const first=make('tab',{'aria-controls':'first-panel','aria-selected':'false',tabindex:'4'});
 const second=make('tab',{'aria-controls':'second-panel','aria-selected':'true',tabindex:'2'});
 const a=make('tabpanel'),b=make('tabpanel');a.hidden=true;b.hidden=false;
 nodes.set('first-panel',a);nodes.set('second-panel',b);
 const list={ownerDocument:{getElementById:id=>nodes.get(id)},
  getAttribute:key=>key==='role'?'tablist':null,
  querySelectorAll:()=>[first,second],
  addEventListener:(name,fn)=>handles.set(name,fn),
  removeEventListener:name=>handles.delete(name)};
 const ctl=initTabs(list);
 ctl.select(first);
 assert.equal(first.getAttribute('aria-selected'),'true');
 assert.equal(a.hidden,false);
 ctl.destroy();
 assert.equal(first.getAttribute('aria-selected'),'false');
 assert.equal(second.getAttribute('aria-selected'),'true');
 assert.equal(first.getAttribute('tabindex'),'4');
 assert.equal(second.getAttribute('tabindex'),'2');
 assert.equal(first.tabIndex,4);
 assert.equal(second.tabIndex,2);
 assert.equal(a.hidden,true);
 assert.equal(b.hidden,false);
 assert.equal(handles.size,0);
 assert.throws(()=>ctl.select(first),/destroyed/);
 ctl.destroy();
});

test('tabs teardown respects new application-owned states and removes only still-owned attributes',async()=>{
 const {initTabs}=await import('../src/gc-interactions.mjs');
 const attrs=(original={})=>{
  const map=new Map(Object.entries(original));
  return {
   disabled:false,hidden:false,tabIndex:0,
   getAttribute:name=>map.get(name)??null,
   setAttribute(name,value){map.set(name,String(value));if(name==='tabindex')this.tabIndex=Number(value)},
   removeAttribute(name){map.delete(name);if(name==='tabindex')this.tabIndex=0},
   focus(){},closest(){return this}
  };
 };
 const tab1=attrs({'role':'tab','aria-controls':'p1'}),tab2=attrs({'role':'tab','aria-controls':'p2'});
 const p1=attrs({role:'tabpanel'}),p2=attrs({role:'tabpanel'});p2.hidden=true;
 const panels=new Map([['p1',p1],['p2',p2]]);
 const list={ownerDocument:{getElementById:id=>panels.get(id)},
  getAttribute:n=>n==='role'?'tablist':null,querySelectorAll:()=>[tab1,tab2],
  addEventListener(){},removeEventListener(){}};
 const ctl=initTabs(list);
 assert.equal(tab1.getAttribute('aria-selected'),'true');
 assert.equal(tab1.getAttribute('tabindex'),null);
 // The consumer changes some fields after controller activation.
 tab1.setAttribute('aria-selected','app-selected');
 tab2.tabIndex=7;tab2.setAttribute('tabindex','7');
 p2.hidden=false;
 ctl.destroy();
 assert.equal(tab1.getAttribute('aria-selected'),'app-selected');
 assert.equal(tab2.getAttribute('aria-selected'),null,'GC-owned ARIA removed');
 assert.equal(tab1.getAttribute('tabindex'),null,'GC-owned tabIndex removed');
 assert.equal(tab2.getAttribute('tabindex'),'7','newer tab order preserved');
 assert.equal(p2.hidden,false,'newer host visibility preserved');
});

test('toast region ARIA is borrowed, restored on final destroy and respects newer app ownership',async()=>{
 const {createToast}=await import('../src/gc-interactions.mjs');
 const attrs=new Map([['role','alert'],['aria-live','assertive'],['aria-atomic','false']]);
 const region={
  ownerDocument:{},
  getAttribute:name=>attrs.get(name)??null,
  setAttribute(name,value){attrs.set(name,String(value))},
  removeAttribute(name){attrs.delete(name)}
 };
 const first=createToast(region),second=createToast(region);
 assert.equal(region.getAttribute('role'),'status');
 assert.equal(region.getAttribute('aria-live'),'polite');
 first.destroy();
 assert.equal(region.getAttribute('role'),'status','an overlapping controller still uses this region');
 second.destroy();
 assert.equal(region.getAttribute('role'),'alert');
 assert.equal(region.getAttribute('aria-live'),'assertive');
 assert.equal(region.getAttribute('aria-atomic'),'false');

 const third=createToast(region);
 region.setAttribute('aria-live','off'); // consumer made a newer change
 third.destroy();
 assert.equal(region.getAttribute('aria-live'),'off');
 assert.equal(region.getAttribute('role'),'alert');
 assert.equal(region.getAttribute('aria-atomic'),'false');
});

test('async action preserves borrowed ARIA and does not overwrite newer application states',async()=>{
 const attrs=new Map([['aria-busy','false']]);
 const button={disabled:false,
  getAttribute:name=>attrs.get(name)??null,
  setAttribute(name,value){attrs.set(name,String(value))},
  removeAttribute(name){attrs.delete(name)}
 };
 assert.equal(await runAsyncAction(button,async()=> 'saved'),'saved');
 assert.equal(button.getAttribute('aria-busy'),'false','pre-existing aria-busy=false is not controller-owned');

 let resolve;
 const pending=runAsyncAction(button,()=>new Promise(done=>{resolve=done}));
 button.setAttribute('aria-busy','host-managed');
 resolve('complete');
 assert.equal(await pending,'complete');
 assert.equal(button.getAttribute('aria-busy'),'host-managed','newer host value must not be removed');
 assert.equal(button.disabled,false);
});

test('async action respects aria-disabled before launch and host disablement during request',async()=>{
 const attrs=new Map();
 const button={disabled:false,
  getAttribute:name=>attrs.get(name)??null,
  setAttribute:(name,value)=>attrs.set(name,String(value)),
  removeAttribute:name=>attrs.delete(name)
 };
 let called=0;
 button.setAttribute('aria-disabled','true');
 assert.equal(await runAsyncAction(button,()=>{called++;return 'should not execute'}),null);
 assert.equal(called,0,'an ARIA-disabled native button cannot invoke the action');
 assert.equal(button.disabled,false,'a focusable ARIA-disabled button remains focusable');
 button.setAttribute('aria-disabled','false');
 let finish;
 const pending=runAsyncAction(button,()=>new Promise(resolve=>{called++;finish=resolve}));
 assert.equal(button.disabled,true);
 button.setAttribute('aria-disabled','true'); // host marks the action unavailable while pending
 finish('saved');
 assert.equal(await pending,'saved');
 assert.equal(button.disabled,true,'host-disabled action must not become actionable after completion');
 assert.equal(button.getAttribute('aria-busy'),null,'busy belongs to the action, not the host disabled flag');
 assert.equal(called,1);
});


test('pending action remains locked when its host clears busy presentation',async()=>{
 const attrs=new Map();
 const button={disabled:false,getAttribute:key=>attrs.get(key)??null,
  setAttribute:(key,value)=>attrs.set(key,String(value)),
  removeAttribute:key=>attrs.delete(key)};
 let done,runs=0;
 const first=runAsyncAction(button,()=>{runs++;return new Promise(resolve=>done=resolve)});
 button.setAttribute('aria-busy','false');
 button.disabled=false;
 const second=await runAsyncAction(button,()=>{runs++;return 'duplicate'});
 assert.equal(second,null);
 assert.equal(runs,1);
 done('saved');
 assert.equal(await first,'saved');
 assert.equal(button.getAttribute('aria-busy'),'false');
 assert.equal(await runAsyncAction(button,()=> 'retry'),'retry');
});

test('action lock is released when host presentation setup throws',async()=>{
 const attrs=new Map();let rejectWrite=true;
 const button={disabled:false,
  getAttribute:key=>attrs.get(key)??null,
  setAttribute(key,value){
   if(rejectWrite){rejectWrite=false;throw new Error('host setter failed')}
   attrs.set(key,String(value));
  },
  removeAttribute:key=>attrs.delete(key)};
 await assert.rejects(runAsyncAction(button,()=> 'unreachable'),/host setter failed/);
 assert.equal(await runAsyncAction(button,()=> 'recovered'),'recovered');
});
