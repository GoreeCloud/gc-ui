import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const path=new URL('../assets/gc-scenes.svg',import.meta.url);
test('original contextual illustrations contain exactly three safe, accessible sourceable symbols',()=>{
 const svg=readFileSync(path,'utf8');
 for(const id of ['gc-scene-workspace','gc-scene-reading','gc-scene-analysis'])
  assert.ok(svg.includes('id="'+id+'"'),id);
 assert.equal((svg.match(/<symbol\b/g)||[]).length,3);
 assert.doesNotMatch(svg,/<script|<foreignObject|<image\b|href="https?:|url\(https?:|<!ENTITY/i);
 assert.match(svg,/currentColor/);
});
