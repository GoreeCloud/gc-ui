import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {visualAcceptancePages,visualAcceptanceVariants} from '../scripts/visual-acceptance-scenarios.mjs';

test('all existing HTML labs have unique named matrix scenarios',()=>{
 const documented=visualAcceptancePages.map(page=>page.path.slice('/lab/'.length)).sort();
 const actual=readdirSync('lab').filter(name=>name.endsWith('.html')).sort();
 assert.deepEqual(documented,actual,'new labs must receive screenshot and geometry coverage');
 assert.equal(new Set(visualAcceptancePages.map(page=>page.id)).size,visualAcceptancePages.length);
 assert.equal(visualAcceptancePages.length,11);
});

test('four independent viewport and modality cases are retained',()=>{
 assert.deepEqual(visualAcceptanceVariants.map(v=>v.id),['320-light','375-dark','768-rtl','1440-forced']);
 assert.equal(visualAcceptancePages.length*visualAcceptanceVariants.length,44);
 assert.equal(new Set(visualAcceptanceVariants.map(v=>v.id)).size,visualAcceptanceVariants.length);
 for(const variant of visualAcceptanceVariants){
  assert.ok(variant.width>=320&&variant.height>=760);
 }
 assert.equal(visualAcceptanceVariants.find(v=>v.id==='375-dark').reduced,true);
 assert.equal(visualAcceptanceVariants.find(v=>v.id==='768-rtl').rtl,true);
 assert.equal(visualAcceptanceVariants.find(v=>v.id==='1440-forced').forced,true);
});
