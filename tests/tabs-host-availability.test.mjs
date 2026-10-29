import test from 'node:test';
import assert from 'node:assert/strict';
import {initTabs} from '../src/gc-interactions.mjs';

test('tablist filters hidden, inert, inaccessible and detached items',()=>{
 const events=new Map(),byId=new Map(),tabs=[],attached=new Set();
 for(let i=0;i<3;i++){
  const attrs=new Map([['aria-controls','p'+i]]);
  byId.set('p'+i,{hidden:false,getAttribute:()=> 'tabpanel'});
  const tab={hidden:false,inert:false,disabled:false,isConnected:true,tabIndex:-1,
   getAttribute:key=>attrs.get(key)??null,
   setAttribute:(key,value)=>attrs.set(key,String(value)),
   removeAttribute:key=>attrs.delete(key),closest(){return this},focus(){}};
  tabs.push(tab);attached.add(tab);
 }
 const list={ownerDocument:{getElementById:id=>byId.get(id)},contains:tab=>attached.has(tab),
  getAttribute:()=> 'tablist',querySelectorAll:()=>tabs,
  addEventListener:(key,fn)=>events.set(key,fn),removeEventListener:key=>events.delete(key)};
 const api=initTabs(list),[a,b,c]=tabs;
 const cases=[
  [()=>b.hidden=true,()=>b.hidden=false],
  [()=>b.inert=true,()=>b.inert=false],
  [()=>b.setAttribute('aria-hidden','true'),()=>b.removeAttribute('aria-hidden')],
  [()=>b.isConnected=false,()=>b.isConnected=true],
  [()=>attached.delete(b),()=>attached.add(b)],
  [()=>b.parentElement={closest:()=>({})},()=>b.parentElement=null]
 ];
 for(const [disable,enable] of cases){
  api.select(a);
  disable();
  api.select(b);
  assert.equal(a.getAttribute('aria-selected'),'true','unavailable tab stays inactive');
  let prevented=false;
  events.get('keydown')({target:a,key:'ArrowRight',preventDefault(){prevented=true}});
  assert.equal(prevented,true);
  assert.equal(c.getAttribute('aria-selected'),'true','next available tab is activated');
  enable();
  api.select(b);
  assert.equal(b.getAttribute('aria-selected'),'true','restored tab can be selected');
 }
 api.destroy();
});
