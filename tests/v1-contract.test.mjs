import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildStyles} from '../scripts/build-v1-tokens.mjs';

const registry=JSON.parse(readFileSync(new URL('../tokens/gc.v1.tokens.json',import.meta.url),'utf8'));
const generated=readFileSync(new URL('../styles/gc.v1.generated.css',import.meta.url),'utf8');
const palettes=registry.color.accent;
const color=(t)=>t.$value;
const lum=(hex)=>{
  const n=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return .2126*n[0]+.7152*n[1]+.0722*n[2];
};
const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);

test('machine-readable tokens conform to DTCG token leaf structure',()=>{
  let count=0;
  function walk(node,path=[]){
    for(const [key,value] of Object.entries(node)){
      if(key.startsWith('$'))continue;
      if('$value' in value){
        count++;
        assert.ok(value.$type, path.concat(key).join('.'));
        if(value.$type==='color')assert.match(value.$value,/^#[0-9a-fA-F]{6}$/);
        if(value.$type==='dimension')assert.match(value.$value,/^-?\d+(?:\.\d+)?px$/);
      }else walk(value,path.concat(key));
    }
  }
  walk(registry);
  assert.ok(count>=140,'expected comprehensive token registry');
});
test('CSS output reproducibly matches the registry',()=>{
  assert.equal(buildStyles(registry),generated);
});
const bodyPairs=[
 ['canvas','onCanvas'],['surface','onSurface'],['surface','onSurfaceMuted'],
 ['inverseSurface','inverseOnSurface'],['selection','onSelection'],
 ['secondary','onSecondary'],['secondaryContainer','onSecondaryContainer'],
 ['tertiary','onTertiary'],['tertiaryContainer','onTertiaryContainer'],
 ...['success','warning','danger','info'].flatMap(s=>{
   const cap=s[0].toUpperCase()+s.slice(1);
   return [[s,'on'+cap],[s+'Container','on'+cap+'Container']];
 })
];
for(const mode of ['light','dark']){
 test(mode+' default role contrast >= 4.5:1 for enumerated body pairs',()=>{
   const roles=registry.color[mode];
   for(const [bg,fg] of bodyPairs){
     const r=contrast(color(roles[bg]),color(roles[fg]));
     assert.ok(r>=4.5,mode+' '+fg+' on '+bg+': '+r.toFixed(2));
   }
 });
 test(mode+' four palettes primary contrast >= 4.5:1',()=>{
   for(const [name,entry] of Object.entries(palettes)){
     const roles=entry[mode];
     for(const [bg,fg] of [['primary','onPrimary'],['primaryContainer','onPrimaryContainer']]){
       const r=contrast(color(roles[bg]),color(roles[fg]));
       assert.ok(r>=4.5,mode+' '+name+' '+fg+' on '+bg+': '+r.toFixed(2));
     }
   }
 });
}
test('every palette has both modes, seed and paired color roles',()=>{
  assert.deepEqual(Object.keys(palettes).sort(),['ember','iris','lagoon','moss']);
  for(const palette of Object.values(palettes)){
    assert.ok(palette.seed.$value);
    for(const mode of ['light','dark']){
      for(const role of ['primary','onPrimary','primaryContainer','onPrimaryContainer'])
        assert.ok(palette[mode][role].$value);
    }
  }
});
test('accessibility fallback and reference lab exist',()=>{
  assert.match(generated,/forced-colors: active/);
  assert.match(generated,/prefers-reduced-motion: reduce/);
  const demo=readFileSync(new URL('../lab/v1.html',import.meta.url),'utf8');
  assert.match(demo,/gc\.v1\.generated\.css/);
  assert.match(demo,/aria-live="polite"/);
  assert.match(demo,/data-gc-accent/);
});
