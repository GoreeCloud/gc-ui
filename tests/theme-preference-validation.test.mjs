import test from 'node:test';
import assert from 'node:assert/strict';
import {createThemeController} from '../src/gc-theme-runtime.mjs';

function fixture(initial={}) {
  const data=new Map(Object.entries(initial)),styleData=new Map();
  const storage={
    getItem:key=>data.has(key)?data.get(key):null,
    setItem:(key,value)=>data.set(key,value),
    removeItem:key=>data.delete(key)
  };
  const root={dataset:{},style:{
    getPropertyValue:key=>styleData.get(key)||'',
    getPropertyPriority:()=>'',setProperty:(key,value)=>styleData.set(key,value),
    removeProperty:key=>styleData.delete(key)
  }};
  return {root,storage,data};
}
test('an invalid app accent cannot pin a suggested color as an explicit user choice',()=>{
  const f=fixture();
  const controller=createThemeController({...f,media:()=>null,defaultAccent:'ocean'});
  assert.equal(controller.get().accent,'ocean');
  assert.equal(controller.set({accent:'not-a-palette'}).accent,'ocean');
  assert.equal(f.data.has('gc-ui-v1:accent'),false);
  controller.destroy();
  const notify=createThemeController({...f,media:()=>null,defaultAccent:'lagoon'});
  assert.equal(notify.get().accent,'lagoon');
  notify.destroy();
});
test('invalid appearance, seeds, and unsupported keys do not enter storage',()=>{
  const f=fixture();
  const controller=createThemeController({...f,media:()=>null,defaultAccent:'moss'});
  const before=controller.get();
  assert.deepEqual(controller.set({mode:'invalid',seed:'red',contrast:'unknown',security:'on'}),before);
  assert.equal(f.data.size,0);
  assert.deepEqual(controller.set(null),before);
  assert.deepEqual(controller.set([]),before);
  assert.deepEqual(controller.set('bad'),before);
  assert.equal(f.data.size,0);
  controller.destroy();
});
test('mixed patches persist validated explicit fields only',()=>{
  const f=fixture(),controller=createThemeController({...f,media:()=>null,defaultAccent:'lagoon'});
  controller.set({mode:'light',accent:'invalid',material:'solid',contrast:'bad',seed:'invalid'});
  assert.deepEqual([...f.data.entries()].sort(),[
    ['gc-ui-v1:material','solid'],['gc-ui-v1:mode','light']
  ]);
  assert.equal(controller.get().accent,'lagoon');
  controller.set({accent:'iris',seed:'#123abc'});
  assert.equal(f.data.get('gc-ui-v1:accent'),'iris');
  assert.equal(f.data.get('gc-ui-v1:seed'),'#123ABC');
  controller.destroy();
});
test('inherited values cannot claim an accent and user choices survive unrelated updates',()=>{
  const f=fixture();
  const a=createThemeController({...f,media:()=>null,defaultAccent:'moss'});
  const inherited=Object.create({accent:'iris'});
  inherited.mode='dark';
  a.set(inherited);
  assert.equal(a.get().accent,'moss');
  assert.equal(f.data.has('gc-ui-v1:accent'),false);
  a.set({accent:'ember'});
  a.set({mode:'light'});
  assert.equal(f.data.get('gc-ui-v1:accent'),'ember');
  a.destroy();
  const b=createThemeController({...f,media:()=>null,defaultAccent:'ocean'});
  assert.equal(b.get().accent,'ember');
  b.destroy();
});
test('invalid updates cannot replace an existing saved explicit accent',()=>{
  const f=fixture({'gc-ui-v1:accent':'iris'});
  const controller=createThemeController({...f,media:()=>null,defaultAccent:'ocean'});
  controller.set({accent:'nonexistent'});
  assert.equal(controller.get().accent,'iris');
  assert.equal(f.data.get('gc-ui-v1:accent'),'iris');
  controller.destroy();
});
