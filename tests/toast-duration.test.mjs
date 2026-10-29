import test from 'node:test';
import assert from 'node:assert/strict';
import {createToast} from '../src/gc-interactions.mjs';

test('a rejected duration does not replace the existing toast',()=>{
 const nodes=[];
 const doc={activeElement:null,createElement:()=>({
  setAttribute(){},addEventListener(){},
  append(...parts){this.parts=parts},
  remove(){const i=nodes.indexOf(this);if(i>=0)nodes.splice(i,1)}
 })};
 const region={ownerDocument:doc,setAttribute(){},appendChild:x=>nodes.push(x)};
 const toast=createToast(region);
 toast.show('Original',{duration:0});
 const original=nodes[0];
 for(const value of [-1,NaN,Infinity,0.5,600001]){
  assert.throws(()=>toast.show('Invalid',{duration:value}),RangeError);
  assert.equal(nodes[0],original);
 }
 toast.destroy();
 assert.equal(nodes.length,0);
});
