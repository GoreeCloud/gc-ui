import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('lab/forms.html'),script=read('lab/forms.mjs'),css=read('styles/gc.v1.components.css');

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
 assert.match(css,/\.gc-skip-link\{position:fixed/);
 assert.match(css,/\.gc-skip-link:focus\{inset-block-start:12px/);
 assert.match(css,/\.gc-search-input::-webkit-search-cancel-button/);
});
