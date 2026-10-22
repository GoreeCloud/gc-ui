import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('lab/forms.html'),script=read('lab/forms.mjs'),css=read('styles/gc.v1.components.css'),formApi=read('src/gc-form-controls.mjs');

test('textarea and form fields retain native labels, help and constraints',()=>{
 for(const id of ['brief-name','brief-email','brief-notes']){
  assert.match(html,new RegExp('for="'+id+'"'));
  assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,new RegExp('id="'+id+'-error"'));
 }
 assert.match(html,/<textarea[^>]+id="brief-notes"[^>]+required[^>]+minlength="10"[^>]+maxlength="280"/);
 assert.match(html,/id="brief-errors"[^>]+role="group"[^>]+tabindex="-1"/);
 assert.match(script,/summary\.focus\(\)/);
 assert.match(script,/aria-invalid/);
 assert.match(script,/summaryList\.addEventListener\('click'/);
});
test('search is a named combobox with deterministic keyboard suggestion behavior',()=>{
 assert.match(html,/id="project-search"[^>]+role="combobox"/);
 assert.match(html,/aria-expanded="false" aria-autocomplete="list" aria-controls="project-suggestions"/);
 assert.match(html,/id="project-suggestions"[^>]+role="listbox"/);
 assert.match(html,/id="project-result-count"[^>]+role="status" aria-live="polite"/);
 assert.match(script,/aria-activedescendant/);
 assert.match(script,/event\.key==='Escape'/);
 assert.match(script,/event\.key==='ArrowDown'/);
 assert.match(script,/textContent=choice\.name/);
 assert.doesNotMatch(script,/innerHTML\s*=/);
});
test('empty state contains an explanation and reset action',()=>{
 assert.match(html,/id="project-empty"[^>]+aria-labelledby="empty-title"[^>]+hidden/);
 assert.match(html,/id="empty-reset"/);
 assert.match(css,/\.gc-empty-state\[hidden\]/);
 assert.match(css,/\.gc-validation-summary\[hidden\]/);
});

test('shared form styles hide skip links until keyboard focus and avoid duplicate search clear glyphs',()=>{
 assert.match(css,/\.gc-skip-link\{position:absolute/);
 assert.match(css,/\.gc-skip-link:focus\{position:fixed;inset-block-start:12px/);
 assert.match(css,/\.gc-search-input::-webkit-search-cancel-button/);
});

test('native passphrase, select and bounded number field carry explicit semantics',()=>{
 assert.match(html,/id="demo-passphrase"[^>]+type="password"[^>]+autocomplete="new-password"/);
 assert.match(html,/id="passphrase-reveal"[^>]+aria-label="Reveal sample passphrase" aria-pressed="false"/);
 assert.match(html,/<select id="demo-density"/);
 assert.match(html,/id="demo-collaborators"[^>]+type="number" min="1" max="12" step="1"/);
 assert.match(formApi,/button\.setAttribute\('aria-pressed'/);
 assert.match(formApi,/input\.focus\(\)/);
 assert.match(css,/\.gc-passphrase-wrap/);
 assert.match(css,/\.gc-stepper-button:focus-visible/);
});
test('retry has an alert and focus recovery, and simulated failure does not send data',()=>{
 assert.match(html,/id="recovery-error"[^>]+role="alert"/);
 assert.match(html,/id="recovery-retry"/);
 assert.match(html,/id="recovery-success"[^>]+role="status"/);
 assert.match(script,/simulate\.focus\(\)/);
 assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
});
test('composition input does not trigger keyboard suggestion selection prematurely',()=>{
 assert.match(script,/compositionstart/);
 assert.match(script,/compositionend/);
 assert.match(script,/if\(composing\|\|event\.isComposing\|\|event\.keyCode===229\)return/);
});

test('form specimens use exported experimental native controllers',()=>{
 assert.match(script,/initPasswordReveal\(/);
 assert.match(script,/initNumberStepper\(/);
 assert.match(read('src/index.mjs'),/initPasswordReveal,initNumberStepper/);
 assert.match(read('types/index.d.ts'),/GCNumberStepperController/);
});

test('no-JavaScript markup is safe and includes all six real example projects',()=>{
 const form=html.match(/<form id="brief-form"[\s\S]*?<\/form>/)?.[0];
 assert.ok(form,'brief form exists');
 assert.match(form,/<button id="brief-submit"[^>]+disabled>/);
 for(const fieldId of ['brief-name','brief-email','brief-notes']){
  const tag=form.match(new RegExp('<(?:input|textarea)[^>]+id="'+fieldId+'"[^>]*>'))?.[0];
  assert.ok(tag,fieldId+' is part of the form');
  assert.doesNotMatch(tag,/\sname=/);
 }
 const list=html.match(/<ul id="project-results"[\s\S]*?<\/ul>/)?.[0];
 assert.ok(list,'static project list is available without scripts');
 const fallback=[...list.matchAll(/<li><strong>([^<]+)<\/strong><span>([^<]+)<\/span><\/li>/g)]
  .map(([,name,type])=>({name,type}));
 const dynamic=[...script.matchAll(/\{name:'([^']+)',type:'([^']+)'\}/g)]
  .map(([,name,type])=>({name,type}));
 assert.equal(fallback.length,6);
 assert.deepEqual(fallback,dynamic,'the static list and interactive search fixtures stay in sync');
 for(const id of ['project-search','demo-passphrase','passphrase-reveal',
  'demo-density','demo-collaborators','demo-decrease','demo-increase','simulate-failure']){
  const control=html.match(new RegExp('<(?:input|select|button)[^>]+id="'+id+'"[^>]*>'))?.[0];
  assert.ok(control,id+' is available as a native control');
  assert.match(control,/\sdisabled[\s>]/,id+' must start disabled');
 }
 for(const id of ['search-js-required','preferences-js-required','recovery-js-required'])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(script,/search\.disabled=false/);
 assert.match(script,/simulate\.disabled=false/);
});


test('validation and density browser regressions are part of hosted Chromium and Firefox interaction commands',()=>{
 const pkg=JSON.parse(read('package.json'));
 for(const command of ['test:e2e:interaction','test:e2e:firefox']){
  for(const file of ['e2e/validation-summary.spec.mjs','e2e/density-preview.spec.mjs']){
   assert.ok(pkg.scripts[command].includes(file),command+' must run '+file);
   assert.ok(read(file).includes('test('),file+' defines a browser regression');
  }
 }
});
