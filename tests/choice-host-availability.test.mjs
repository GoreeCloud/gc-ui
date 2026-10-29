import test from 'node:test';
import assert from 'node:assert/strict';
import {initChoiceChips} from '../src/gc-patterns.mjs';

test('choice chips exclude unavailable host actions and allow restored choices',()=>{
 const handlers=new Map(),members=new Set();
 const item=name=>{
  const attrs=new Map([['data-gc-choice',name]]);
  const button={localName:'button',type:'button',disabled:false,hidden:false,inert:false,isConnected:true,
   getAttribute:key=>attrs.get(key)??null,
   setAttribute:(key,value)=>attrs.set(key,String(value)),
   removeAttribute:key=>attrs.delete(key),closest(){return this},focus(){}};
  members.add(button);return button;
 };
 const a=item('a'),b=item('b'),seen=[];
 const group={querySelectorAll:()=>[a,b],contains:node=>members.has(node),
  addEventListener:(key,fn)=>handlers.set(key,fn),
  removeEventListener:key=>handlers.delete(key)};
 const ctl=initChoiceChips(group,{onChange:value=>seen.push(value)});
 const scenarios=[
  [()=>b.hidden=true,()=>b.hidden=false],
  [()=>b.inert=true,()=>b.inert=false],
  [()=>b.setAttribute('aria-hidden','true'),()=>b.removeAttribute('aria-hidden')],
  [()=>b.isConnected=false,()=>b.isConnected=true],
  [()=>members.delete(b),()=>members.add(b)],
  [()=>b.parentElement={closest:()=>({})},()=>b.parentElement=null]
 ];
 for(const [disable,enable] of scenarios){
  disable();
  assert.equal(ctl.select('b'),false);
  handlers.get('click')({target:b});
  assert.equal(ctl.get(),'a');
  enable();
  assert.equal(ctl.select('b'),true);
  assert.equal(ctl.select('a'),true);
 }
 assert.equal(seen.length,12);
 ctl.destroy();
 assert.equal(handlers.size,0);
});
