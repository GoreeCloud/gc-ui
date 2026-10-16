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
  ownerDocument:{createElement:()=>({listeners:{},addEventListener(key,fn){this.listeners[key]=fn},remove(){const index=elements.indexOf(this);if(index!==-1)elements.splice(index,1)}})},
  setAttribute(){},
  appendChild(item){elements.push(item)}
 };
 const {createToast}=await import('../src/gc-interactions.mjs');
 const toast=createToast(region);
 const dismissOld=toast.show('first',{duration:0});
 toast.show('second',{duration:0});
 dismissOld();
 assert.equal(elements.length,1);
 assert.equal(elements[0].textContent,'second');
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
