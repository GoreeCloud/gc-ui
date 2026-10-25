import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../e2e/accessibility.spec.mjs',import.meta.url),'utf8');
const guide=readFileSync(new URL('../docs/TESTING.md',import.meta.url),'utf8');

test('documented accessibility screening count matches executable matrix',()=>{
 const pages=source.split('for(const name of [')[1].split('])')[0];
 const baseline=pages.split("'").length/2-0.5;
 const states=source.split('const states=[')[1].split('];\nfor(const state')[0];
 const interactive=states.split("{name:'").length-1;
 assert.equal(baseline,10);
 assert.equal(interactive,16);
 assert.equal(baseline+interactive,26);
 assert.ok(guide.includes('26 axe-core accessibility screens'));
 assert.ok(guide.includes('10 GC UI baseline labs and 16 additional'));
});
