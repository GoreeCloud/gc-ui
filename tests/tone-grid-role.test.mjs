import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('tonal surface samples are an accessible named group',()=>{
 const html=readFileSync(new URL('../lab/v1.html',import.meta.url),'utf8');
 assert.ok(html.includes('class="tone-grid" role="group" aria-label="GC UI surface material samples"'));
});
