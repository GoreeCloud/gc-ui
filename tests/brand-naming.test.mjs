import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

function read(path){
 return readFileSync(new URL('../'+path,import.meta.url),'utf8');
}
test('full public product name is defined alongside its GC UI short form',()=>{
 const guide=read('docs/BRAND_NAMING.md');
 const readme=read('README.md');
 assert.match(guide,/\*\*Full public name:\*\* GoreeCloud UI/);
 assert.match(guide,/\*\*Short name:\*\* GC UI/);
 assert.match(guide,/GoreeCloud User Interface/); // permitted as acronym explanation, not the canonical title
 assert.match(readme,/^# GoreeCloud UI \(GC UI\)/);
});
test('metadata and public documentation use GoreeCloud UI when naming in full',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.match(pkg.description,/^GoreeCloud UI \(GC UI\)/);
 for(const path of ['docs/DESIGN_LANGUAGE.md','docs/GC_UI_1_0_SPECIFICATION.md']){
  assert.match(read(path).split('\n')[0],/^# GoreeCloud UI \(GC UI\)/,path);
 }
});
test('labs retain compact GC UI branding while using the full name in document titles',()=>{
 for(const path of ['lab/adaptive.html','lab/components.html','lab/v1.html','lab/catalog.html']){
  const markup=read(path);
  assert.match(markup,/<title>GoreeCloud UI/,path);
  assert.match(markup,/<strong>GC UI<\/strong>/,path);
 }
});

test('adaptive client-side route titles preserve the full product name',()=>{
 const script=read('lab/adaptive.mjs');
 assert.match(script,/document\.title='GoreeCloud UI · '/);
 assert.doesNotMatch(script,/document\.title='GC UI · '/);
});
