import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('registry/third-party-assets.v1.json',root),'utf8'));
const read=path=>readFileSync(new URL(path,root),'utf8');
test('opt-in third-party asset registry is pinned, attributed and locally complete',()=>{
 assert.equal(manifest.providers.length,7);
 assert.equal(manifest.icons.length,21);
 assert.equal(new Set(manifest.icons.map(i=>i.id)).size,21);
 for(const p of manifest.providers){
  assert.match(p.revision,/^[a-f0-9]{40}$/,p.id);
  assert.equal(p.bundledIcons,3);
  assert.ok(existsSync(new URL(p.licenseFile,root)),p.id);
  assert.match(read(p.licenseFile),/license/i,p.id);
  const own=manifest.icons.filter(i=>i.provider===p.id);
  assert.equal(own.length,3);
  for(const icon of own){
   assert.ok(icon.source.includes('/blob/'+p.revision+'/'),icon.id);
   assert.equal(icon.viewBox.split(' ').length,4);
   const svg=read(icon.svg);
   assert.match(svg,/<svg\b/,icon.id);
   assert.doesNotMatch(svg,/<script|<foreignObject|<image\b|href="https?:|url\(https?:/i,icon.id);
  }
 }
});
test('derived icon sprite contains 21 safe namespaced symbols',()=>{
 const sprite=read('assets/third-party/gc-third-party-glyphs.svg');
 for(const icon of manifest.icons)assert.ok(sprite.includes('id="'+icon.id+'"'),icon.id);
 assert.equal((sprite.match(/<symbol\b/g)||[]).length,21);
 assert.doesNotMatch(sprite,/<script|<foreignObject|<image\b|href="https?:|url\(https?:/i);
 assert.equal(manifest.optionalEngines.length,3);
 assert.ok(manifest.optionalEngines.every(i=>i.bundled===false));
});
