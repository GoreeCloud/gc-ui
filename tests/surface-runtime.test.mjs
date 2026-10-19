import test from 'node:test';
import assert from 'node:assert/strict';
import {GC_SURFACE_DEFAULTS,normalizeSurfaceConfig,resolveSurfaceEnvironment,createSurfaceController} from '../src/gc-surface-runtime.mjs';

test('surface options reject unrecognized contexts and default responsibly',()=>{
 assert.deepEqual(normalizeSurfaceConfig({context:'marketing',intensity:'flashy',illumination:'strobe'}),GC_SURFACE_DEFAULTS);
 assert.equal(resolveSurfaceEnvironment({context:'reading'}).intensity,'quiet');
 assert.equal(resolveSurfaceEnvironment({context:'workspace'}).intensity,'balanced');
 assert.equal(resolveSurfaceEnvironment({context:'media',intensity:'expressive'}).intensity,'expressive');
 assert.equal(resolveSurfaceEnvironment({illumination:'off'}).illumination,'off');
});
test('system needs take precedence over lighting, Lens and motion',()=>{
 const state={context:'media',intensity:'expressive',illumination:'soft'};
 const high=resolveSurfaceEnvironment(state,{highContrast:true});
 assert.deepEqual([high.intensity,high.illumination,high.solidLens,high.motionAllowed],['quiet','off',true,false]);
 const forced=resolveSurfaceEnvironment(state,{forcedColors:true});
 assert.equal(forced.illumination,'off');
 assert.equal(forced.solidLens,true);
 const reduced=resolveSurfaceEnvironment(state,{reducedTransparency:true,reducedMotion:true});
 assert.equal(reduced.solidLens,true);
 assert.equal(reduced.motionAllowed,false);
});
test('controller changes effective attributes, persists, responds to media and stops observing after destroy',()=>{
 const root={dataset:{},dispatchEvent(){}};
 const cache=new Map();
 const storage={getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v),removeItem:k=>cache.delete(k)};
 const items={};
 const media=query=>{
  const obj={matches:false,listeners:new Set(),addEventListener(_type,fn){this.listeners.add(fn)},removeEventListener(_type,fn){this.listeners.delete(fn)}};
  items[query]=obj;return obj;
 };
 const ctl=createSurfaceController({root,storage,media});
 assert.equal(root.dataset.gcSurfaceIntensity,'balanced');
 ctl.set({context:'analysis',intensity:'expressive'});
 assert.equal(ctl.get().context,'analysis');
 assert.equal(root.dataset.gcSurfaceIntensity,'expressive');
 assert.equal(cache.get('gc-ui-surface:context'),'analysis');
 items['(forced-colors: active)'].matches=true;
 for(const fn of items['(forced-colors: active)'].listeners)fn();
 assert.equal(root.dataset.gcIllumination,'off');
 assert.equal(root.dataset.gcSurfaceLens,'solid');
 ctl.reset();
 assert.equal(cache.has('gc-ui-surface:context'),false);
 ctl.destroy();
 for(const item of Object.values(items))assert.equal(item.listeners.size,0);
 assert.throws(()=>ctl.set({context:'media'}));
});

test('lighting direction is validated and reflected into the environment',()=>{
 assert.equal(normalizeSurfaceConfig({lightDirection:'below'}).lightDirection,'overhead');
 assert.equal(resolveSurfaceEnvironment({lightDirection:'leading'}).lightDirection,'leading');
 const root={dataset:{}};
 const controller=createSurfaceController({root,media:()=>null,storage:null});
 controller.set({lightDirection:'trailing'});
 assert.equal(root.dataset.gcLightDirection,'trailing');
 controller.destroy();
});

test('surface teardown restores existing app attributes and clears only controller-added state',()=>{
 const original={gcSurfaceContext:'consumer-context',gcSurfaceLens:'consumer-lens',unrelated:'preserve'};
 const root={dataset:{...original}};
 const controller=createSurfaceController({root,media:()=>null,storage:null});
 assert.equal(root.dataset.gcSurfaceContext,'workspace');
 assert.equal(root.dataset.gcSurfaceLens,'auto');
 controller.set({context:'reading',lightDirection:'trailing'});
 controller.destroy();
 assert.deepEqual(root.dataset,original);
 controller.destroy();
 assert.deepEqual(root.dataset,original,'teardown remains idempotent');
});

test('surface teardown preserves newer consumer writes rather than resurrecting stale state',()=>{
 const root={dataset:{gcSurfaceContext:'original'}};
 const controller=createSurfaceController({root,media:()=>null,storage:null});
 controller.set({context:'media',intensity:'expressive'});
 root.dataset.gcSurfaceContext='external-context';
 root.dataset.gcSurfaceIntensity='external-intensity';
 controller.destroy();
 assert.deepEqual(root.dataset,{
  gcSurfaceContext:'external-context',
  gcSurfaceIntensity:'external-intensity'
 });
});
