import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTheme,resolveTheme,createThemeController,GC_THEME_DEFAULTS} from '../src/gc-theme-runtime.mjs';

test('theme settings validate values and seeds',()=>{
  assert.deepEqual(normalizeTheme(null),GC_THEME_DEFAULTS);
  assert.deepEqual(normalizeTheme({mode:'bad',accent:'custom',seed:'red',material:'glass'}),{...GC_THEME_DEFAULTS,accent:'custom'});
  assert.equal(normalizeTheme({seed:'#13aBED'}).seed,'#13ABED');
});
test('auto mode follows system but explicit mode does not',()=>{
  assert.equal(resolveTheme({mode:'auto'},{dark:true}).mode,'dark');
  assert.equal(resolveTheme({mode:'light'},{dark:true}).mode,'light');
  assert.equal(resolveTheme({mode:'dark'},{dark:false}).mode,'dark');
});
test('forced colors, reduced transparency and high contrast force solid material',()=>{
  for(const pref of [{forcedColors:true},{reducedTransparency:true},{highContrast:true}]){
    assert.equal(resolveTheme({material:'translucent'},pref).material,'solid');
  }
  assert.equal(resolveTheme({contrast:'high'},{}).material,'solid');
});
test('runtime reacts to system changes, supports custom themes, restores curated roles',()=>{
  const variables=new Map(),stored=new Map(),queryMap=new Map();
  const root={dataset:{},style:{setProperty:(k,v)=>variables.set(k,v),removeProperty:k=>variables.delete(k)},dispatchEvent(){}};
  const storage={getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v),removeItem:k=>stored.delete(k)};
  const media=query=>{
    if(!queryMap.has(query)){
      const handlers=new Set();
      queryMap.set(query,{matches:false,addEventListener:(_,f)=>handlers.add(f),removeEventListener:(_,f)=>handlers.delete(f),
        emit(value){this.matches=value;for(const f of handlers)f();},handlers});
    }
    return queryMap.get(query);
  };
  const controller=createThemeController({root,media,storage});
  assert.equal(root.dataset.gcMode,'light');
  queryMap.get('(prefers-color-scheme: dark)').emit(true);
  assert.equal(root.dataset.gcMode,'dark');
  controller.set({accent:'custom',seed:'#12A456'});
  assert.ok(variables.has('--gc-v1-color-primary'));
  for(const value of variables.values())assert.match(value,/^#[0-9a-fA-F]{6}$/);
  queryMap.get('(prefers-reduced-transparency: reduce)').emit(true);
  assert.equal(root.dataset.gcMaterial,'solid');
  controller.set({accent:'iris'});
  assert.equal(variables.size,0);
  controller.reset();
  assert.deepEqual(controller.get(),GC_THEME_DEFAULTS);
  controller.destroy();
  assert.equal(queryMap.get('(prefers-color-scheme: dark)').handlers.size,0);
  assert.throws(()=>controller.set({mode:'light'}));
});

test('high contrast and forced colors suppress custom theme inline overrides',()=>{
 const vars=new Map();
 const root={dataset:{},style:{setProperty:(key,val)=>vars.set(key,val),removeProperty:key=>vars.delete(key)},dispatchEvent(){}};
 const mql=new Map();
 const media=pattern=>{
   const handlers=new Set();
   const query={matches:false,addEventListener:(_,fn)=>handlers.add(fn),removeEventListener:(_,fn)=>handlers.delete(fn),emit(value){this.matches=value;for(const fn of handlers)fn();}};
   mql.set(pattern,query);return query;
 };
 const controller=createThemeController({root,media,storage:null});
 controller.set({accent:'custom',seed:'#CC3265'});
 assert.ok(vars.size>0);
 controller.set({contrast:'high'});
 assert.equal(vars.size,0);
 assert.equal(root.dataset.gcContrast,'high');
 controller.set({contrast:'standard'});
 assert.ok(vars.size>0);
 mql.get('(forced-colors: active)').emit(true);
 assert.equal(vars.size,0);
 assert.equal(root.dataset.gcMaterial,'solid');
 controller.destroy();
});

test('OS high-contrast remains authoritative even with saved standard preference',()=>{
 const resolved=resolveTheme({contrast:'standard',material:'translucent'},{highContrast:true});
 assert.equal(resolved.contrast,'high');
 assert.equal(resolved.material,'solid');
});
