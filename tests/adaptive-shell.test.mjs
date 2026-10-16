import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const markup=readFileSync(new URL('../lab/adaptive.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles/gc.v1.navigation.css',import.meta.url),'utf8');
const script=readFileSync(new URL('../lab/adaptive.mjs',import.meta.url),'utf8');

test('adaptive shell has one content landmark and an accessible skip target',()=>{
  assert.match(markup,/<main id="main-content" tabindex="-1"/);
  assert.match(markup,/<a href="#main-content" class="gc-skip-link">Skip to main content<\/a>/);
  assert.equal((markup.match(/<main\b/g)||[]).length,1);
  for(const size of ['sidebar','rail','bottom']){
    assert.match(markup,new RegExp('<nav class="gc-navigation gc-nav-'+size+'" aria-label="Primary navigation,'));
    assert.match(css,new RegExp('\\.gc-nav-'+size+'\\b'));
  }
});
test('every navigation viewport offers all three routes, with current location semantics',()=>{
 for(const size of ['sidebar','rail','bottom']){
   const match=markup.match(new RegExp('<nav class="gc-navigation gc-nav-'+size+'"[^>]*>([\\s\\S]*?)<\\/nav>'));
   assert.ok(match,size+' landmark missing');
   for(const route of ['overview','activity','library']){
    assert.match(match[1],new RegExp('data-gc-route="'+route+'"'),size+' missing '+route);
   }
   assert.match(match[1],/data-gc-route="overview" aria-current="page"/);
 }
 assert.match(script,/removeAttribute\('aria-current'\)/);
 assert.match(script,/setAttribute\('aria-current','page'\)/);
});
test('navigation changes layout at compact and medium breakpoints',()=>{
 assert.match(css,/@media\(min-width:600px\) and \(max-width:1199px\)/);
 assert.match(css,/@media\(max-width:599px\)/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/@media\(forced-colors:active\)/);
});
test('native modal sheet has label, description and close control',()=>{
 assert.match(markup,/<dialog id="details-sheet" class="gc-side-sheet" aria-labelledby="sheet-title" aria-describedby="sheet-description">/);
 assert.match(markup,/<h2 id="sheet-title">/);
 assert.match(markup,/id="sheet-description"/);
 assert.match(markup,/data-gc-dialog-close aria-label="Close details"/);
 assert.match(script,/initDialog\(document.getElementById\('details-sheet'\)\)/);
 assert.match(css,/\.gc-side-sheet::backdrop/);
});
