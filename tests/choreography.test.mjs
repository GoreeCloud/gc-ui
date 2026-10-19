import test from 'node:test';
import assert from 'node:assert/strict';
import {createChoreography} from '../src/gc-choreography.mjs';
function fixture(){
 const calls=[];
 const elements=Array.from({length:5},()=>({
  animate(frames,timing){
   let cancelled=0;
   const handlers={};
   const animation={frames,timing,addEventListener(name,fn){handlers[name]=fn},
    cancel(){cancelled++;handlers.cancel?.()},
    finish(){handlers.finish?.()},get cancelled(){return cancelled}};
   calls.push(animation);return animation;
  }
 }));
 return {elements,calls};
}
test('choreography bounds animation to three visible groups and <=45ms staggers',()=>{
 const {elements,calls}=fixture();
 const ctl=createChoreography({media:()=>({matches:false}),root:{dataset:{}}});
 const result=ctl.play(elements,{stagger:100});
 assert.deepEqual(result,{animated:3,skipped:2});
 assert.deepEqual(calls.map(x=>x.timing.delay),[0,45,90]);
 assert.ok(calls.every(x=>x.timing.duration<=440));
 assert.equal(ctl.activeCount(),3);
 calls[1].finish();
 assert.equal(ctl.activeCount(),2);
 assert.equal(calls[1].cancelled,1);
 ctl.destroy();
 assert.equal(ctl.activeCount(),0);
 assert.throws(()=>ctl.play(elements),/destroyed/);
});
test('new scene transition cancels old animations and reduced motion preserves final DOM',()=>{
 const {elements,calls}=fixture();
 const ctl=createChoreography({media:()=>({matches:false}),root:{dataset:{}}});
 ctl.play(elements.slice(0,2));
 const stale=calls[0];
 ctl.play(elements.slice(0,1),{preset:'slideInline',direction:'rtl'});
 assert.equal(stale.cancelled,1);
 assert.equal(calls[2].frames[0].transform,'translateX(-8px)');
 stale.finish();
 assert.equal(ctl.activeCount(),1);
 assert.deepEqual(ctl.play(elements,{reducedMotion:true}),{animated:0,skipped:5});
 assert.equal(ctl.activeCount(),0);
 assert.equal(ctl.play(elements,{stagger:NaN}).animated,3);
 ctl.cancel();
 assert.equal(ctl.activeCount(),0);
});
test('forced colors and native WAAPI absence skip playback safely',()=>{
 const ctl=createChoreography({media:q=>({matches:q.includes('forced-colors')}),root:{dataset:{}}});
 assert.deepEqual(ctl.play([{}]),{animated:0,skipped:1});
 ctl.destroy();
 const another=createChoreography({media:()=>({matches:false}),root:{dataset:{}}});
 assert.deepEqual(another.play([{}]),{animated:0,skipped:1});
 assert.throws(()=>another.play('not-an-array'),/array/);
});


test('active sequence cancels immediately when reduced-motion activates at runtime',()=>{
 const {elements,calls}=fixture(),queries=new Map();
 const media=query=>{
  if(!queries.has(query))queries.set(query,{matches:false,events:new Set(),
   addEventListener(_event,fn){this.events.add(fn)},
   removeEventListener(_event,fn){this.events.delete(fn)}});
  return queries.get(query);
 };
 const ctl=createChoreography({media,root:{dataset:{}}});
 ctl.play(elements.slice(0,2));
 assert.equal(ctl.activeCount(),2);
 const reduce=queries.get('(prefers-reduced-motion: reduce)');
 reduce.matches=true;
 for(const fn of reduce.events)fn();
 assert.equal(ctl.activeCount(),0);
 assert.equal(calls[0].cancelled,1);
 assert.equal(calls[1].cancelled,1);
 ctl.destroy();
 for(const value of queries.values())assert.equal(value.events.size,0);
});

test('repeated group elements never create orphaned animations',()=>{
 const {elements,calls}=fixture();
 const ctl=createChoreography({media:()=>({matches:false}),root:{dataset:{}}});
 assert.deepEqual(ctl.play([elements[0],elements[0],elements[1]]),{animated:2,skipped:1});
 assert.equal(calls.length,2);
 ctl.destroy();
 assert.equal(calls[0].cancelled,1);
 assert.equal(calls[1].cancelled,1);
});

test('an unavailable animation implementation does not break the remaining group',()=>{
 const {elements,calls}=fixture();
 const unsupported={animate(){throw new Error('Animation unavailable')}};
 const ctl=createChoreography({media:()=>({matches:false}),root:{dataset:{}}});
 assert.deepEqual(ctl.play([unsupported,elements[0],elements[1]]),{animated:2,skipped:1});
 assert.equal(ctl.activeCount(),2);
 ctl.destroy();
 assert.ok(calls.every(animation=>animation.cancelled===1));
});
