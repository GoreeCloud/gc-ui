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
