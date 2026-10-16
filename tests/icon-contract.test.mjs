import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const svg=readFileSync(new URL('../assets/gc-glyphs.svg',import.meta.url),'utf8');

test('GC icons have twelve uniquely named 24x24 outline symbols',()=>{
 const ids=[...svg.matchAll(/<symbol\s+id="(gc-[\w-]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,12);
 assert.equal(new Set(ids).size,ids.length);
 assert.ok(ids.includes('gc-check')&&ids.includes('gc-search')&&ids.includes('gc-warning'));
 const symbols=[...svg.matchAll(/<symbol\b[^>]*>/g)].map(x=>x[0]);
 for(const s of symbols){
  assert.match(s,/viewBox="0 0 24 24"/);
  assert.match(s,/stroke-width="1.75"/);
  assert.match(s,/stroke="currentColor"/);
 }
});
test('glyph sprite contains no scripts, fonts, linked images or inline CSS assets',()=>{
 assert.doesNotMatch(svg,/<(?:script|image|foreignObject|font)\b/i);
 assert.doesNotMatch(svg,/(?:href|xlink:href)=["'](?:https?:|data:)/i);
});
