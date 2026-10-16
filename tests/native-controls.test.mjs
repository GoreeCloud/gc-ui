import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const markup=readFileSync(new URL('../lab/components.html',import.meta.url),'utf8');
const style=readFileSync(new URL('../styles/gc.v1.components.css',import.meta.url),'utf8');
const script=readFileSync(new URL('../lab/primitives.mjs',import.meta.url),'utf8');

test('native-first components retain browser roles and fieldset semantics',()=>{
  assert.match(markup,/<input\s+type="checkbox"\s+id="gc-show-tips"[^>]*>/);
  assert.match(markup,/<fieldset\s+class="gc-radio-group">[\s\S]*?<legend>Workspace visibility<\/legend>/);
  assert.match(markup,/<input\s+type="radio"\s+name="gc-visibility"/);
  assert.match(markup,/<input\s+class="gc-range"[^>]+type="range"/);
  assert.match(markup,/<progress\s+class="gc-progress"[^>]+max="100"[^>]+value="64"/);
  assert.match(markup,/<details\s+class="gc-accordion"><summary>/);
  assert.match(markup,/<output\s+id="gc-completion-value"\s+for="gc-completion">64%<\/output>/);
});
test('icon toggle has stable name with aria-pressed and local glyph',()=>{
  assert.match(markup,/<button\s+id="favorite-workspace"[^>]+aria-label="Favorite workspace"[^>]+aria-pressed="false"/);
  assert.match(markup, /gc-glyphs\.svg#gc-spark/);
  assert.match(script,/favorite\.setAttribute\('aria-pressed'/);
  assert.doesNotMatch(script,/favorite\.setAttribute\('aria-label'/);
});
test('native controls remain keyboard visible and styled with semantic roles',()=>{
  for(const cls of ['gc-checkbox','gc-radio-group','gc-range','gc-progress','gc-card','gc-badge','gc-accordion']){
    assert.ok(style.includes('.'+cls),'missing component '+cls);
  }
  for(const token of ['--gc-v1-color-primary','--gc-v1-color-on-surface','--gc-v1-color-focus-ring']){
    assert.ok(style.includes(token),'missing semantic role '+token);
  }
  assert.match(style,/\.gc-accordion>summary:focus-visible/);
  assert.match(style,/\.gc-range:focus-visible/);
  assert.match(style,/@media\(forced-colors:active\)/);
});

test('action menus ship fully styled in reusable component CSS',()=>{
 for(const selector of ['.gc-menu-anchor','.gc-menu{','.gc-menu[hidden]', '[role=menuitemcheckbox]','[role=menuitemradio]','.gc-menu-divider']){
  assert.ok(style.includes(selector),'missing reusable menu selector '+selector);
 }
 const lab=readFileSync(new URL('../lab/primitives.css',import.meta.url),'utf8');
 assert.ok(!lab.includes('.gc-menu{'),'menu implementation may not live only in lab CSS');
});
test('compact buttons meet the system touch target baseline',()=>{
 assert.match(style,/\.gc-button\[data-size=small\]\{min-block-size:44px/);
});
