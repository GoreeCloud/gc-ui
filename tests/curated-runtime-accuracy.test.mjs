import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createThemeController,getCuratedAccentRoles} from '../src/gc-theme-runtime.mjs';
import {contrastRatio,generateTheme} from '../src/gc-color-engine.mjs';

const css=readFileSync(new URL('../styles/gc.v1.product-palettes.css',import.meta.url),'utf8');
const kebab=name=>name.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();
function declarations(selector) {
  const pos=css.indexOf(selector+' {');
  assert.ok(pos>=0,'missing curated CSS selector '+selector);
  const body=css.slice(css.indexOf('{',pos)+1,css.indexOf('}',pos));
  return Object.fromEntries(
    Array.from(body.matchAll(/--gc-v1-color-([a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g),
      ([,k,v])=>[k,v.toUpperCase()])
  );
}
const selectors={
 neutral:{
   light:':root[data-gc-accent="neutral"]:not([data-gc-contrast="high"])',
   dark:':root[data-gc-mode="dark"][data-gc-accent="neutral"]:not([data-gc-contrast="high"])'
 },
 ocean:{
   light:':root[data-gc-accent="ocean"]:not([data-gc-contrast="high"])',
   dark:':root[data-gc-mode="dark"][data-gc-accent="ocean"]:not([data-gc-contrast="high"])'
 }
};
function fixture(saved={},forced=false) {
  const map=new Map(Object.entries(saved)),props=new Map(),query={matches:forced};
  const root={dataset:{},style:{
    getPropertyValue:name=>props.get(name)?.v||'',
    getPropertyPriority:name=>props.get(name)?.p||'',
    setProperty:(name,v,p='')=>props.set(name,{v,p}),
    removeProperty:name=>props.delete(name)
  }};
  const storage={
    getItem:key=>map.get(key)??null,
    setItem:(key,v)=>map.set(key,v),
    removeItem:key=>map.delete(key)
  };
  return {root,props,map,storage,media:q=>q==='(forced-colors: active)'?query:null,query};
}
test('neutral and ocean runtime roles match the alpha curated CSS exactly',()=>{
  for(const [accent,entry] of Object.entries(selectors)){
    for(const mode of ['light','dark']){
      const actual=getCuratedAccentRoles(accent,mode),expected=declarations(entry[mode]);
      assert.ok(actual);
      for(const [k,v] of Object.entries(actual)){
        assert.equal(v,expected[kebab(k)],accent+' '+mode+' '+k);
      }
      assert.deepEqual(Object.keys(actual).map(kebab).sort(),Object.keys(expected).sort());
      assert.ok(contrastRatio(actual.primary,actual.onPrimary)>=4.5);
      assert.ok(contrastRatio(actual.primaryContainer,actual.onPrimaryContainer)>=4.5);
    }
  }
});
test('neutral default writes actual slate, not OKLCH-generated blue',()=>{
  const f=fixture();
  const c=createThemeController({...f,defaultAccent:'neutral'});
  assert.equal(c.resolved().accent,'neutral');
  assert.equal(f.root.dataset.gcAccent,'neutral');
  assert.equal(f.root.style.getPropertyValue('--gc-v1-color-primary'),'#374151');
  assert.notEqual(f.root.style.getPropertyValue('--gc-v1-color-primary'),generateTheme('#374151','light').roles.primary);
  c.set({mode:'dark'});
  assert.equal(f.root.style.getPropertyValue('--gc-v1-color-primary'),'#D1D5DB');
  c.destroy();
});
test('ocean suggestion uses curated blue, user iris takes priority, reset restores ocean',()=>{
  const f=fixture();
  const c=createThemeController({...f,defaultAccent:'ocean'});
  assert.equal(f.root.style.getPropertyValue('--gc-v1-color-primary'),'#1D4ED8');
  c.set({accent:'iris'});
  assert.equal(f.map.get('gc-ui-v1:accent'),'iris');
  assert.equal(f.root.dataset.gcAccent,'iris');
  assert.equal(f.root.style.getPropertyValue('--gc-v1-color-primary'),'');
  c.reset();
  assert.equal(f.root.style.getPropertyValue('--gc-v1-color-primary'),'#1D4ED8');
  assert.equal(f.map.has('gc-ui-v1:accent'),false);
  c.destroy();
  assert.equal(f.root.style.getPropertyValue('--gc-v1-color-primary'),'');
});
test('custom seed still uses generated roles, returning to neutral restores exact slate',()=>{
  const f=fixture();
  const c=createThemeController({...f});
  c.set({accent:'custom',seed:'#FF0000'});
  assert.equal(f.root.style.getPropertyValue('--gc-v1-color-primary'),generateTheme('#FF0000','light').roles.primary);
  c.set({accent:'neutral'});
  assert.equal(f.root.style.getPropertyValue('--gc-v1-color-primary'),'#374151');
  c.destroy();
});
test('high contrast and forced colors suppress curated inline overrides',()=>{
  const f=fixture();
  const c=createThemeController({...f});
  assert.equal(f.props.has('--gc-v1-color-primary'),true);
  c.set({contrast:'high'});
  assert.equal(f.props.has('--gc-v1-color-primary'),false);
  c.set({contrast:'standard'});
  assert.equal(f.props.get('--gc-v1-color-primary')?.v,'#374151');
  f.query.matches=true;
  c.set({mode:'dark'});
  assert.equal(f.props.has('--gc-v1-color-primary'),false);
  c.destroy();
});
test('a host-owned inline role and priority survive controller mount, render and destroy',()=>{
  const f=fixture();
  f.root.style.setProperty('--gc-v1-color-primary','#123456','important');
  const c=createThemeController({...f});
  assert.equal(f.props.get('--gc-v1-color-primary')?.v,'#374151');
  c.set({mode:'dark'});
  c.destroy();
  assert.deepEqual(f.props.get('--gc-v1-color-primary'),{v:'#123456',p:'important'});
});

test('neutral secondary and tertiary containers are complete, readable and curated',()=>{
 for(const mode of ['light','dark']){
  const roles=getCuratedAccentRoles('neutral',mode);
  const expected=declarations(selectors.neutral[mode]);
  for(const prefix of ['secondary','tertiary']){
   const surface=prefix+'Container',onSurface='on'+prefix[0].toUpperCase()+prefix.slice(1)+'Container';
   assert.equal(roles[surface],expected[kebab(surface)]);
   assert.equal(roles[onSurface],expected[kebab(onSurface)]);
   assert.ok(contrastRatio(roles[surface],roles[onSurface])>=4.5,mode+' '+prefix+' text contrast');
  }
 }
});
test('neutral container roles retain host ownership and disappear in system high contrast',()=>{
 const f=fixture();
 const property='--gc-v1-color-secondary-container';
 const c=createThemeController({...f});
 assert.equal(f.root.style.getPropertyValue(property),'#E2E8F0');
 // The app may take ownership after the controller has rendered.
 f.root.style.setProperty(property,'#ABCDEF','important');
 c.set({mode:'dark'});
 assert.equal(f.root.style.getPropertyValue(property),'#ABCDEF');
 assert.equal(f.root.style.getPropertyPriority(property),'important');
 c.set({contrast:'high'});
 assert.equal(f.root.style.getPropertyValue('--gc-v1-color-tertiary-container'),'');
 c.set({contrast:'standard'});
 assert.equal(f.root.style.getPropertyValue('--gc-v1-color-tertiary-container'),'#44403C');
 c.set({accent:'iris'});
 assert.equal(f.root.style.getPropertyValue('--gc-v1-color-tertiary-container'),'');
 c.destroy();
 assert.equal(f.root.style.getPropertyValue(property),'#ABCDEF');
});
