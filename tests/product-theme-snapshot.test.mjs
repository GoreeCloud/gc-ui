import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {contrastRatio} from '../src/gc-color-engine.mjs';

const tokens=JSON.parse(readFileSync(new URL('../tokens/gc.v1.tokens.json',import.meta.url),'utf8'));
const snapshot=readFileSync(new URL('../integrations/themes/gc-app-semantic.css',import.meta.url),'utf8');
const overlay=readFileSync(new URL('../styles/gc.v1.product-palettes.css',import.meta.url),'utf8');
const vars={primary:'--gc-v1-color-primary',onPrimary:'--gc-v1-color-on-primary',
 primaryContainer:'--gc-v1-color-primary-container',onPrimaryContainer:'--gc-v1-color-on-primary-container'};

function declarations(css,selector){
  const open=css.indexOf(selector+' {');
  assert.ok(open>=0,'Missing CSS selector: '+selector);
  const start=css.indexOf('{',open)+1;
  const stop=css.indexOf('}',start);
  assert.ok(stop>start,'Unclosed CSS selector: '+selector);
  const body=css.slice(start,stop);
  const found=Object.create(null);
  for(const [,key,val] of body.matchAll(/(--gc-v1-color-[a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)){
    assert.equal(Object.hasOwn(found,key),false,'Duplicate semantic role '+key+' at '+selector);
    found[key]=val.toUpperCase();
  }
  return found;
}
function compareRoles(css,selector,expected,keys){
  const found=declarations(css,selector);
  for(const name of keys)assert.equal(found[vars[name]],expected[name].$value.toUpperCase(),selector+' '+name);
}
test('offline semantic snapshot derives its core surface roles from GC UI',()=>{
  const dark=declarations(snapshot,':root');
  const light=declarations(snapshot,':root[data-theme="light"]');
  for(const [expected,actual] of [[tokens.color.dark,dark],[tokens.color.light,light]]){
    for(const name of ['canvas','surface','surfaceRaised','surfaceTonal','surfaceInset','onSurface','onSurfaceMuted','outline','divider','success','danger']){
      const cssName='--gc-v1-color-'+name.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();
      if(Object.hasOwn(actual,cssName))assert.equal(actual[cssName],expected[name].$value.toUpperCase(),name);
    }
  }
});
test('curated app snapshots use exact GC UI primary/on-primary pairings',()=>{
  for(const name of ['iris','lagoon','moss','ember']){
    compareRoles(snapshot,':root[data-gc-accent="'+name+'"]',tokens.color.accent[name].dark,Object.keys(vars));
    compareRoles(snapshot,':root[data-theme="light"][data-gc-accent="'+name+'"]',tokens.color.accent[name].light,Object.keys(vars).filter(x=>x!=='onPrimaryContainer'||name!=='unused'));
  }
});
test('neutral and blue snapshot pairings match the canonical product overlay',()=>{
  const productPairs=[
    [':root[data-gc-accent="ocean"]',':root[data-gc-mode="dark"][data-gc-accent="ocean"]:not([data-gc-contrast="high"])'],
    [':root[data-theme="light"][data-gc-accent="ocean"]',':root[data-gc-accent="ocean"]:not([data-gc-contrast="high"])']
  ];
  for(const [consumer,source] of productPairs){
    const from=declarations(snapshot,consumer),ref=declarations(overlay,source);
    for(const role of Object.values(vars))assert.equal(from[role],ref[role],consumer+' '+role);
  }
});
test('all app snapshot primary pairs remain readable in light and dark',()=>{
  for(const accent of ['ocean','lagoon','moss','iris','ember']){
    for(const prefix of [':root[data-gc-accent="',':root[data-theme="light"][data-gc-accent="']){
      const role=declarations(snapshot,prefix+accent+'"]');
      const score=contrastRatio(role[vars.primary],role[vars.onPrimary]);
      assert.ok(score>=4.5,accent+' '+prefix+' primary contrast '+score);
    }
  }
});
