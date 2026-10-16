import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const pinned={
 'assets/gc-mark.svg':'d3d2f4f2ae241e172691de8c8f6bef628331a350',
 'assets/gc-symbol.svg':'613dfb1747f251d86a1faa6e12c83836b2a950b7',
 'assets/gc-logo.svg':'95a7b63c6928d4e2d79f6afbd41025bc887d7c1c',
 'assets/gc-logo-dark.svg':'9c36aec87107552fa703798a2b09adb610175572'
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
  assert.doesNotMatch(svg,/<script\b|<foreignObject\b|<text\b|<image\b/i);
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
