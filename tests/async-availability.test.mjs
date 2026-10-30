import test from 'node:test';
import assert from 'node:assert/strict';
import {runAsyncAction} from '../src/gc-interactions.mjs';
test('blocked hidden async operation',async()=>{
 const attrs=new Map();let calls=0;
 const button={disabled:false,hidden:true,getAttribute:k=>attrs.get(k)??null,setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k)};
 assert.equal(await runAsyncAction(button,()=>{calls++;return 1}),null);
 assert.equal(calls,0);
});
