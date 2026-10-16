import test from 'node:test';
import assert from 'node:assert/strict';
import {generateTheme,contrastRatio} from '../src/gc-color-engine.mjs';

test('rejects malformed seeds and invalid modes',()=>{
  for(const bad of ['red','#fff','#12345678','xyz',null])assert.throws(()=>generateTheme(bad));
  assert.throws(()=>generateTheme('#5145D9','auto'));
});
test('custom seed generates reproducible role and tonal families',()=>{
  const a=generateTheme('#5145d9','light'),b=generateTheme('#5145D9','light');
  assert.deepEqual(a,b);
  assert.equal(Object.keys(a.palettes).length,5);
  for(const family of Object.values(a.palettes))assert.equal(Object.keys(family).length,14);
  assert.match(a.roles.primary,/^#[0-9A-F]{6}$/);
});
test('generated semantic foregrounds pass WCAG normal-text contrast for diverse seeds',()=>{
  for(const seed of ['#000000','#FFFFFF','#5145D9','#087C8D','#AE4D3F','#3F744B','#FF0000','#00FF00','#0000FF','#DEBFAA','#FFFF00']){
    for(const mode of ['light','dark']){
      const {roles}=generateTheme(seed,mode);
      for(const role of ['primary','primaryContainer','secondary','secondaryContainer','tertiary','tertiaryContainer','canvas','surface','selection','inverseSurface']){
        const on=role==='canvas'?'onCanvas':role==='surface'?'onSurface':role==='selection'?'onSelection':role==='inverseSurface'?'inverseOnSurface':'on'+role[0].toUpperCase()+role.slice(1);
        const ratio=contrastRatio(roles[role],roles[on]);
        assert.ok(ratio>=4.5,seed+' '+mode+' '+role+' '+ratio);
      }
      assert.ok(contrastRatio(roles.surface,roles.onSurfaceMuted)>=4.5);
    }
  }
});

test('every generated semantic role is an opaque sRGB color',()=>{
  for(const seed of ['#000000','#FFFFFF','#5145D9','#087C8D','#AE4D3F','#3F744B','#FF0000','#00FF00','#0000FF','#DEBFAA','#FFFF00']){
    for(const mode of ['light','dark']){
      const scheme=generateTheme(seed,mode);
      for(const [role,value] of Object.entries(scheme.roles)){
        assert.match(value,/^#[0-9A-F]{6}$/,seed+' '+mode+' '+role);
      }
    }
  }
});
