import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const guide=read('docs/UX_UI_DESIGN_PRINCIPLES.md');
const html=read('lab/forms.html');
const script=read('lab/forms.mjs');

test('all eight founder UX principles and scope boundaries are documented',()=>{
 const numbers=[...guide.matchAll(/^### ([1-8])\. /gm)].map(match=>Number(match[1]));
 assert.deepEqual(numbers,[1,2,3,4,5,6,7,8]);
 assert.match(guide,/## Reference implementation coverage \(not release certification\)/);
 assert.match(guide,/Manageable multi-step forms.*not.*demonstrated/i);
 assert.match(guide,/Actual network progress is not claimed/);
 assert.match(guide,/No data has been submitted or saved/);
});

test('validation-only action and result labels describe actual behavior',()=>{
 assert.match(html,/<h2 id="draft-title">Check a project brief<\/h2>/);
 assert.match(html,/<button id="brief-submit"[^>]*disabled>Check brief<\/button>/);
 assert.match(html,/Check brief is disabled; no project data will be sent/);
 assert.match(html,/<strong>Brief checks passed<\/strong>/);
 assert.match(html,/No data has been submitted or saved/);
 assert.doesNotMatch(html,/>Create brief<\/button>|<strong>Brief ready<\/strong>/);
 assert.match(script,/event\.preventDefault\(\)/);
 assert.match(script,/summary\.focus\(\)/);
 assert.doesNotMatch(script,/\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
});

test('form search, feedback, and input affordances retain meaningful semantics',()=>{
 for(const expression of [
  /id="project-search"[^>]*role="combobox"/,
  /id="project-suggestions"[^>]*role="listbox"/,
  /id="project-result-count"[^>]*role="status"/,
  /id="brief-errors"[^>]*tabindex="-1"/,
  /id="brief-success"[^>]*role="status"/,
  /for="brief-email"/
 ])assert.match(html,expression);
});
