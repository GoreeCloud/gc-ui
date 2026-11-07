import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const pinned={
 'assets/gc-mark.svg':'f931dada18f8743706981ea6eb1e61f426d96170',
 'assets/gc-symbol.svg':'a38257a5242cd9741dfd1c5c87285b56cddeb868',
 'assets/gc-logo.svg':'6522c7955a227490408e453fd23845af2bbeffc1',
 'assets/gc-logo-dark.svg':'46ce79ed0d6200dd6a49f1f2f02c2fa57c8adb89'
};
function blobId(data){
 return createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
}
test('GC UI consumer vectors exactly match canonical branding Git blob IDs',()=>{
 for(const [path,expected] of Object.entries(pinned)){
  const source=readFileSync(new URL('../'+path,import.meta.url));
  assert.equal(blobId(source),expected,path+' drifted from branding source');
  const svg=source.toString('utf8');
  assert.match(svg,/<svg\s[^>]*viewBox=/);
  assert.doesNotMatch(svg,/<script\b|<foreignObject\b|<image\b|<iframe\b|\bon[a-z]+\s*=|\bhref\s*=/i);
  if(path.endsWith('gc-mark.svg')||path.endsWith('gc-symbol.svg')){
   assert.doesNotMatch(svg,/<text\b/i,'symbol and app tile must be true vector outlines');
  } else {
   assert.match(svg,/<text\b[^>]*font-family="system-ui,-apple-system,Segoe UI,sans-serif"/,
    'source-identical approved wordmark contains first-party text with system fallback');
   assert.doesNotMatch(svg,/<style\b|@font-face|@import/i,'wordmark must not import fonts or styles');
  }
 }
});
test('official icon is used in all GC UI laboratory headers and favicons',()=>{
 const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(index,/assets\/gc-mark\.svg/);
 for(const page of ['lab/v1.html','lab/components.html','lab/catalog.html','lab/adaptive.html']){
  const html=readFileSync(new URL('../'+page,import.meta.url),'utf8');
  assert.match(html,/href="\.\.\/assets\/gc-mark\.svg"/);
  assert.match(html,/src="\.\.\/assets\/gc-mark\.svg"/);
  assert.doesNotMatch(html,/<span class="(?:logo|brandmark|gc-shell-mark)" aria-hidden="true">G<\/span>/);
 }
});
