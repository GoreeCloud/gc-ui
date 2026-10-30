import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {contrastRatio} from '../src/gc-color-engine.mjs';

const overlay=readFileSync(new URL('../styles/gc.v1.product-palettes.css',import.meta.url),'utf8');
const snapshot=readFileSync(new URL('../integrations/themes/gc-app-semantic.css',import.meta.url),'utf8');

function declarations(css,selector){
 const start=css.indexOf(selector+' {');
 assert.ok(start>=0,'missing selector '+selector);
 const open=css.indexOf('{',start),end=css.indexOf('}',open);
 const body=css.slice(open+1,end),roles=new Map();
 for(const [,key,value] of body.matchAll(/(--gc-v1-color-[a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g))
  roles.set(key,value.toUpperCase());
 return roles;
}
test('offline neutral containers match curated palette and meet 4.5:1',()=>{
 for(const [app,source] of [
  [':root',':root[data-gc-mode="dark"][data-gc-accent="neutral"]:not([data-gc-contrast="high"])'],
  [':root[data-theme="light"]',':root[data-gc-accent="neutral"]:not([data-gc-contrast="high"])']
 ]){
  const actual=declarations(snapshot,app),expected=declarations(overlay,source);
  for(const name of ['secondary','tertiary']){
   const fg='--gc-v1-color-on-'+name+'-container';
   const bg='--gc-v1-color-'+name+'-container';
   assert.equal(actual.get(bg),expected.get(bg),app+' '+bg);
   assert.equal(actual.get(fg),expected.get(fg),app+' '+fg);
   assert.ok(contrastRatio(actual.get(bg),actual.get(fg))>=4.5,app+' '+name);
  }
 }
});
