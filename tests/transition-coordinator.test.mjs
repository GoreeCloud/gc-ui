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
test('active motion is cancelled immediately when accessibility preferences change',()=>{
 const {el,animationList}=fakeElement();
 const queries=new Map();
 const media=query=>{
  if(!queries.has(query))queries.set(query,{matches:false,handlers:new Set(),
   addEventListener(event,fn){if(event==='change')this.handlers.add(fn)},
   removeEventListener(event,fn){if(event==='change')this.handlers.delete(fn)},
   fire(){for(const fn of this.handlers)fn()}
  });
  return queries.get(query);
 };
 const root={dataset:{},handlers:new Map(),
  addEventListener(name,fn){this.handlers.set(name,fn)},
  removeEventListener(name,fn){if(this.handlers.get(name)===fn)this.handlers.delete(name)},
  fire(name){this.handlers.get(name)?.()}
 };
 const ctl=createMotionCoordinator({media,root});
 const start=()=>{const animation=ctl.play(el,'reveal');assert.ok(animation);return animation};
 const first=start();
 queries.get('(prefers-reduced-motion: reduce)').matches=true;
 queries.get('(prefers-reduced-motion: reduce)').fire();
 assert.equal(ctl.activeCount(),0);
 assert.equal(first.cancelled,1);
 assert.equal(ctl.play(el,'reveal'),null);
 queries.get('(prefers-reduced-motion: reduce)').matches=false;
 const second=start();
 queries.get('(forced-colors: active)').matches=true;
 queries.get('(forced-colors: active)').fire();
 assert.equal(ctl.activeCount(),0);
 assert.equal(second.cancelled,1);
 queries.get('(forced-colors: active)').matches=false;
 const third=start();
 queries.get('(prefers-contrast: more)').matches=true;
 queries.get('(prefers-contrast: more)').fire();
 assert.equal(ctl.activeCount(),0);
 assert.equal(third.cancelled,1);
 queries.get('(prefers-contrast: more)').matches=false;
 const fourth=start();
 root.dataset.gcContrast='high';
 root.fire('gc-theme-change');
 assert.equal(ctl.activeCount(),0);
 assert.equal(fourth.cancelled,1);
 ctl.destroy();
 for(const value of queries.values())assert.equal(value.handlers.size,0);
 assert.equal(root.handlers.size,0);
 assert.equal(animationList.length,4);
});
test('coordinator tolerates unavailable preference event APIs and retires active animations',()=>{
 const {el,animationList}=fakeElement();
 const ctl=createMotionCoordinator({media:()=>({matches:false}),root:{dataset:{}}});
 ctl.play(el,'reveal');
 ctl.destroy();ctl.destroy();
 assert.equal(animationList[0].cancelled,1);
 assert.equal(ctl.activeCount(),0);
});

test('a failing optional Web Animations implementation falls back without throwing',()=>{
 const ctl=createMotionCoordinator({media:()=>({matches:false}),root:{dataset:{}}});
 const broken={animate(){throw new Error('Animation unavailable')}};
 assert.equal(ctl.play(broken,'reveal'),null);
 assert.equal(ctl.activeCount(),0);
 const {el,animationList}=fakeElement();
 assert.ok(ctl.play(el,'reveal'));
 assert.equal(ctl.activeCount(),1);
 ctl.destroy();
 assert.equal(animationList[0].cancelled,1);
});
