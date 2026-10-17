import test from 'node:test';
import assert from 'node:assert/strict';
import {createMotionCoordinator} from '../src/gc-transition-coordinator.mjs';

function fakeElement(){
 const animationList=[];
 const el={animate(frames,timing){
  const listeners={};let cancelled=0;
  const animation={
   frames,timing,
   addEventListener(name,fn){listeners[name]=fn},
   cancel(){cancelled++;listeners.cancel?.()},
   finish(){listeners.finish?.()},get cancelled(){return cancelled}
  };
  animationList.push(animation);
  return animation;
 }};
 return {el,animationList};
}
test('coordinator cancels interrupted animation and prevents old completion races',()=>{
 const {el,animationList}=fakeElement();
 const coordinator=createMotionCoordinator({media:()=>({matches:false}),root:{dataset:{}}});
 const a=coordinator.play(el,'reveal');
 assert.equal(coordinator.activeCount(),1);
 const b=coordinator.play(el,'settle');
 assert.notEqual(a,b);
 assert.equal(a.cancelled,1);
 assert.equal(coordinator.activeCount(),1);
 a.finish();
 assert.equal(coordinator.activeCount(),1);
 b.finish();
 assert.equal(coordinator.activeCount(),0);
 assert.equal(b.cancelled,1);
 assert.equal(animationList.length,2);
 coordinator.destroy();
 assert.throws(()=>coordinator.play(el,'reveal'),/destroyed/);
});
test('motion omitted when OS preference requests reduction and when WAAPI is absent',()=>{
 const {el,animationList}=fakeElement();
 const coordinator=createMotionCoordinator({media:q=>({matches:q.includes('reduced-motion')}),root:{dataset:{}}});
 assert.equal(coordinator.play(el,'reveal'),null);
 assert.equal(animationList.length,0);
 coordinator.destroy();
 const other=createMotionCoordinator({media:()=>({matches:false}),root:{dataset:{}}});
 assert.equal(other.play({},'reveal'),null);
 assert.throws(()=>other.play(null,'settle'),/element/);
});
test('cancelAll and cleanup ensure no stale animation stays active',()=>{
 const a=fakeElement(),b=fakeElement();
 const coordinator=createMotionCoordinator({media:()=>({matches:false}),root:{dataset:{}}});
 coordinator.play(a.el,'settle');coordinator.play(b.el,'soften');
 assert.equal(coordinator.activeCount(),2);
 coordinator.cancelAll();
 assert.equal(coordinator.activeCount(),0);
 assert.equal(a.animationList[0].cancelled,1);
 assert.equal(b.animationList[0].cancelled,1);
});
