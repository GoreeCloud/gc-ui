import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('lab/workflow.html');
const script=read('lab/workflow.mjs');
const css=read('lab/workflow.css');
const packageJson=JSON.parse(read('package.json'));

test('workflow has four distinct steps and a functional no-JS fallback',()=>{
 assert.equal((html.match(/<section data-workflow-step /g)||[]).length,4);
 for(const label of ['Basics','Preferences','Schedule','Review'])
  assert.match(html,new RegExp('data-title="'+label+'"'));
 assert.match(html,/id="workflow-fallback"[^>]*role="status"/);
 for(const id of ['workflow-back','workflow-next','workflow-check'])
  assert.match(html,new RegExp('id="'+id+'"[^>]*disabled'));
 assert.match(html,/aria-label="Setup steps"/);
 assert.match(html,/aria-current="step"/);
});
test('native date, input hints, and linked errors avoid fixed regional formats',()=>{
 assert.match(html,/id="workspace-date" type="date" required/);
 assert.match(html,/id="workspace-date-help"/);
 assert.match(script,/Intl\.DateTimeFormat\(navigator\.language/);
 assert.match(script,/timeZone:'UTC'/);
 assert.match(script,/input\.setAttribute\('aria-describedby',id\+'-help '\+id\+'-error'\)/);
 assert.doesNotMatch(html,/MM\/DD\/YYYY|DD\/MM\/YYYY/);
});
test('no persistence or network submission code exists in the specimen',()=>{
 assert.match(script,/form\.addEventListener\('submit',event=>event\.preventDefault\(\)\)/);
 assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|innerHTML\s*=/);
 assert.doesNotMatch(html,/<(?:input|textarea|select)[^>]+\bname="/);
 assert.match(html,/Nothing was sent or saved/);
});
test('workflow styling uses semantic tokens and responsive, forced-color navigation',()=>{
 for(const token of ['--gc-v1-color-canvas','--gc-v1-color-primary','--gc-v1-color-on-surface'])
  assert.ok(css.includes(token));
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/@media\(forced-colors:active\)/);
 assert.match(css,/\.gc-workflow-steps li\[aria-current=step\]/);
});
test('both browser interaction commands cover this experimental workflow',()=>{
 for(const name of ['test:e2e:interaction','test:e2e:firefox'])
  assert.ok(packageJson.scripts[name].includes('e2e/workflow.spec.mjs'),name);
});
