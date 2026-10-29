import test from 'node:test';
import assert from 'node:assert/strict';
import {GC_PRODUCT_ACCENTS,getProductAccent,createProductThemeController} from '../src/gc-product-themes.mjs';

function fixture(accent=null){
  const map=new Map(accent?[['gc-ui-v1:accent',accent]]:[]);
  const styles=new Map();
  const root={dataset:{},style:{
    getPropertyValue:k=>styles.get(k)||'',
    getPropertyPriority:()=>'',setProperty:(k,v)=>styles.set(k,v),
    removeProperty:k=>styles.delete(k)
  }};
  const storage={
    getItem:k=>map.has(k)?map.get(k):null,
    setItem:(k,v)=>map.set(k,v),
    removeItem:k=>map.delete(k)
  };
  return {map,root,storage};
}
test('product themes are neutral by default but may suggest distinct personalities',()=>{
  assert.equal(getProductAccent('gc-ui'),'neutral');
  assert.equal(getProductAccent('messenger'),'ocean');
  assert.equal(getProductAccent('notify'),'lagoon');
  assert.equal(getProductAccent('dns'),'moss');
  assert.equal(getProductAccent('wardveil'),'neutral');
  assert.equal(getProductAccent('goreeshield'),'neutral');
  assert.equal(getProductAccent('unexpected-product'),'neutral');
  assert.equal(getProductAccent(undefined),'neutral');
  assert.equal(getProductAccent('__proto__'),'neutral');
  assert.equal(getProductAccent('constructor'),'neutral');
  assert.ok(Object.isFrozen(GC_PRODUCT_ACCENTS));
});
test('app suggestions are not persisted and appearance changes do not freeze them',()=>{
  const f=fixture();
  const controller=createProductThemeController({...f,media:()=>null,product:'messenger'});
  assert.equal(controller.get().accent,'ocean');
  controller.set({mode:'dark'});
  assert.equal(f.map.has('gc-ui-v1:accent'),false);
  controller.destroy();
  const different=createProductThemeController({...f,media:()=>null,product:'notify'});
  assert.equal(different.get().accent,'lagoon');
  different.destroy();
});
test('explicit user color persists across products and resets to product suggestion',()=>{
  const f=fixture('iris');
  const controller=createProductThemeController({...f,media:()=>null,product:'notify'});
  assert.equal(controller.get().accent,'iris');
  controller.set({accent:'ember'});
  assert.equal(f.map.get('gc-ui-v1:accent'),'ember');
  controller.destroy();
  const next=createProductThemeController({...f,media:()=>null,product:'dns'});
  assert.equal(next.get().accent,'ember');
  assert.equal(next.reset().accent,'moss');
  assert.equal(f.map.has('gc-ui-v1:accent'),false);
  next.destroy();
});
test('app names cannot alter user storage keys or force custom seed',()=>{
  const f=fixture();
  const c=createProductThemeController({...f,media:()=>null,product:'../../messenger'});
  assert.equal(c.get().accent,'neutral');
  assert.deepEqual([...f.map.keys()],[]);
  c.destroy();
});
