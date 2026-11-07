import test from 'node:test';
import assert from 'node:assert/strict';
import {GC_PRODUCT_ACCENTS,getProductAccent,createProductThemeController} from '../src/gc-product-themes.mjs';
import {generateTheme,contrastRatio} from '../src/gc-color-engine.mjs';

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
test('optional historical examples never mandate a GoreeCloud color',()=>{
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
test('historical examples require explicit opt-in and remain nonpersistent',()=>{
  const f=fixture();
  const neutral=createProductThemeController({...f,media:()=>null,product:'messenger'});
  assert.equal(neutral.get().accent,'neutral','product name must not impose a hue');
  neutral.destroy();
  const controller=createProductThemeController({...f,media:()=>null,product:'messenger',useProductSuggestion:true});
  assert.equal(controller.get().accent,'ocean');
  controller.set({mode:'dark'});
  assert.equal(f.map.has('gc-ui-v1:accent'),false);
  controller.destroy();
  const different=createProductThemeController({...f,media:()=>null,product:'notify',useProductSuggestion:true});
  assert.equal(different.get().accent,'lagoon');
  different.destroy();
});
test('explicit user color persists across products and resets without enforced product color',()=>{
  const f=fixture('iris');
  const controller=createProductThemeController({...f,media:()=>null,product:'notify'});
  assert.equal(controller.get().accent,'iris');
  controller.set({accent:'ember'});
  assert.equal(f.map.get('gc-ui-v1:accent'),'ember');
  controller.destroy();
  const next=createProductThemeController({...f,media:()=>null,product:'dns'});
  assert.equal(next.get().accent,'ember');
  assert.equal(next.reset().accent,'neutral');
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

test('arbitrary individual colors are available for any product',()=>{
 const f=fixture();
 const c=createProductThemeController({
  ...f,media:()=>null,product:'wardveil',defaultAccent:'ember'
 });
 assert.equal(c.get().accent,'ember','explicit local color is allowed');
 c.set({accent:'custom',seed:'#FA2E87'});
 assert.equal(c.get().seed,'#FA2E87');
 assert.equal(f.map.get('gc-ui-v1:seed'),'#FA2E87');
 c.destroy();
 const next=createProductThemeController({...f,media:()=>null,product:'messenger'});
 assert.equal(next.get().accent,'custom','saved color survives across products');
 assert.equal(next.get().seed,'#FA2E87');
 next.reset();
 assert.equal(next.get().accent,'neutral','reset uses rendering fallback, not product hue');
 assert.equal(f.map.has('gc-ui-v1:seed'),false);
 next.destroy();
});

test('opted-in sample does not replace explicit local or individual choices',()=>{
 const f=fixture('moss');
 const c=createProductThemeController({
  ...f,media:()=>null,product:'messenger',
  useProductSuggestion:true,defaultAccent:'lagoon'
 });
 assert.equal(c.get().accent,'moss');
 c.reset();
 assert.equal(c.get().accent,'lagoon');
 c.destroy();
});

test('application may propose an arbitrary color without persisting a user choice',()=>{
 const f=fixture();
 const c=createProductThemeController({
  ...f,media:()=>null,product:'any-new-application',
  defaultAccent:'custom',defaultSeed:'#D14AC3'
 });
 assert.equal(c.get().accent,'custom');
 assert.equal(c.get().seed,'#D14AC3');
 assert.equal(f.map.size,0,'proposed color must not be stored as user selection');
 assert.ok(f.root.style.getPropertyValue('--gc-v1-color-primary'),
   'the proposed source seed generates usable semantic roles');
 c.set({seed:'#17AB92'});
 assert.equal(c.get().seed,'#17AB92');
 assert.equal(f.map.get('gc-ui-v1:seed'),'#17AB92');
 c.reset();
 assert.equal(c.get().seed,'#D14AC3');
 assert.equal(c.get().accent,'custom');
 assert.equal(f.map.size,0,'reset restores app proposal without persisting it');
 c.destroy();
});

test('malformed app-proposed custom seed falls back safely to technical rendering colors',()=>{
 const f=fixture();
 const c=createProductThemeController({
  ...f,media:()=>null,product:'messenger',
  defaultAccent:'custom',defaultSeed:'url(javascript:alert(1))'
 });
 assert.equal(c.get().accent,'neutral');
 assert.equal(c.get().seed,'#374151');
 assert.equal(f.map.size,0);
 c.destroy();
});

test('arbitrary source hues retain accessible generated on-colors in both modes',()=>{
 const seeds=[
  '#000000','#FFFFFF','#FF0000','#00FF00','#0000FF','#FFFF00',
  '#FF00FF','#00FFFF','#808080','#FA2E87','#3A7D52'
 ];
 const roles=[
  ['canvas','onCanvas'],['surface','onSurface'],['primary','onPrimary'],
  ['primaryContainer','onPrimaryContainer'],['secondary','onSecondary'],
  ['tertiary','onTertiary']
 ];
 for(const seed of seeds)for(const mode of ['light','dark']){
  const theme=generateTheme(seed,mode).roles;
  for(const [background,foreground] of roles)
   assert.ok(contrastRatio(theme[background],theme[foreground])>=4.5,
    seed+' '+mode+' '+background+' must preserve minimum text contrast');
 }
});
