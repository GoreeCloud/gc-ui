import test from 'node:test';
import assert from 'node:assert/strict';
import {initChoiceChips} from '../src/gc-patterns.mjs';

function choice(value,pressed=null){
 const attrs=new Map([['data-gc-choice',value]]);
 if(pressed!==null)attrs.set('aria-pressed',pressed);
 return {localName:'button',type:'button',disabled:false,
  getAttribute:key=>attrs.get(key)??null,
  setAttribute:(key,val)=>attrs.set(key,String(val)),
  removeAttribute:key=>attrs.delete(key),
  closest(){return this},focus(){}};
}
function group(choices){
 const handlers=new Map();
 return {querySelectorAll:()=>choices,
  addEventListener:(key,fn)=>handlers.set(key,fn),
  removeEventListener:(key,fn)=>{if(handlers.get(key)===fn)handlers.delete(key)},
  fire:(key,target)=>handlers.get(key)?.({target}),
  count:()=>handlers.size};
}
test('choice callback may unmount without leaving borrowed ARIA or live listeners',()=>{
 const first=choice('first','true'),second=choice('second');
 const host=group([first,second]);
 let controller;
 controller=initChoiceChips(host,{onChange:()=>controller.destroy()});
 assert.equal(controller.select('second'),true);
 assert.equal(first.getAttribute('aria-pressed'),'true');
 assert.equal(second.getAttribute('aria-pressed'),null);
 assert.equal(host.count(),0);
 host.fire('click',first);
 assert.equal(second.getAttribute('aria-pressed'),null);
 assert.throws(()=>controller.select('first'),/destroyed/);
 controller.destroy();
});
test('rejected host callback after unmount cannot resurrect controller ARIA writes',()=>{
 const first=choice('first','true'),second=choice('second');
 const host=group([first,second]);
 let controller;
 controller=initChoiceChips(host,{onChange:()=>{
  controller.destroy();
  throw Error('route unmounted');
 }});
 assert.throws(()=>controller.select('second'),/route unmounted/);
 assert.equal(first.getAttribute('aria-pressed'),'true');
 assert.equal(second.getAttribute('aria-pressed'),null);
 assert.equal(host.count(),0);
});
