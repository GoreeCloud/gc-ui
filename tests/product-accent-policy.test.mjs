import test from 'node:test';
import assert from 'node:assert/strict';
import {createThemeController, normalizeTheme, GC_THEME_DEFAULTS} from '../src/gc-theme-runtime.mjs';

function fixture(initial={}) {
  const data=new Map(Object.entries(initial));
  const styles=new Map();
  const root={dataset:{},style:{
    getPropertyValue:key=>styles.get(key)||'',
    getPropertyPriority:()=>'',setProperty:(key,value)=>styles.set(key,value),
    removeProperty:key=>styles.delete(key)
  }};
  const storage={
    getItem:key=>data.has(key)?data.get(key):null,
    setItem:(key,value)=>data.set(key,value),
    removeItem:key=>data.delete(key)
  };
  return {root,storage,data};
}
test('unconfigured GoreeCloud products are neutral, never purple',()=>{
  assert.equal(GC_THEME_DEFAULTS.accent,'neutral');
  assert.equal(normalizeTheme({}).accent,'neutral');
});
test('product color is suggested, not persisted as a user choice',()=>{
  const f=fixture();
  let c=createThemeController({...f,media:()=>null,defaultAccent:'ocean'});
  assert.equal(c.get().accent,'ocean');
  c.set({mode:'dark'});
  assert.equal(f.data.has('gc-ui-v1:accent'),false);
  c.destroy();
  c=createThemeController({...f,media:()=>null,defaultAccent:'lagoon'});
  assert.equal(c.get().accent,'lagoon');
  c.destroy();
});
test('explicit user accent overrides product suggestion, reset restores suggestion',()=>{
  const f=fixture({'gc-ui-v1:accent':'iris'});
  const c=createThemeController({...f,media:()=>null,defaultAccent:'ocean'});
  assert.equal(c.get().accent,'iris');
  c.set({accent:'moss'});
  assert.equal(f.data.get('gc-ui-v1:accent'),'moss');
  c.destroy();
  const next=createThemeController({...f,media:()=>null,defaultAccent:'lagoon'});
  assert.equal(next.get().accent,'moss');
  assert.equal(next.reset().accent,'lagoon');
  next.destroy();
});
test('unsupported product accents never override neutral fallback',()=>{
  const f=fixture();
  const c=createThemeController({...f,media:()=>null,defaultAccent:'untrusted'});
  assert.equal(c.get().accent,'neutral');
  c.destroy();
});
