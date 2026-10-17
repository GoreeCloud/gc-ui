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
