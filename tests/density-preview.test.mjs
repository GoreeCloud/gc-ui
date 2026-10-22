import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('native density switch synchronizes a constrained root design signal',()=>{
 const html=read('lab/forms.html'),js=read('lab/forms.mjs');
 assert.match(html,/<select id="demo-density"/);
 assert.match(js,/new Set\(\['compact','comfortable','spacious'\]\)/);
 assert.match(js,/root\.dataset\.gcDensity=next/);
 assert.match(js,/density\.addEventListener\('change',\(\)=>\{applyDensity\(\);stepper\.set/);
 assert.doesNotMatch(js,/localStorage|sessionStorage|fetch\(/);
});
test('compact and spacious layouts change whitespace but do not shrink native target minimums',()=>{
 const sheet=read('styles/gc.v1.components.css'),lab=read('lab/forms.css');
 assert.match(sheet,/:root\[data-gc-density=compact\] \.gc-field\{gap:4px\}/);
 assert.match(sheet,/:root\[data-gc-density=spacious\] \.gc-field\{gap:10px\}/);
 assert.match(sheet,/\.gc-stepper-button\{min-block-size:48px;min-inline-size:48px/);
 assert.match(sheet,/\.gc-search-clear\{[^\n]*inline-size:44px;block-size:44px/);
 assert.match(sheet,/\.gc-passphrase-reveal\{[^\n]*min-block-size:44px/);
 assert.match(sheet,/\.gc-button,.gc-icon-button\{[^\n]*min-block-size:44px/);
 assert.match(lab,/:root\[data-gc-density=compact\] \.gc-form-panel/);
 assert.match(lab,/:root\[data-gc-density=spacious\] \.gc-form-panel/);
});
