import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';

const authority=JSON.parse(readFileSync('registry/design-authority.v1.json','utf8'))
 .ownerDesignClarification20261106;
const pages=readdirSync('lab').filter(name=>name.endsWith('.html')).sort();

test('founder color freedom is authoritative without changing stable preset contract',()=>{
 assert.equal(authority?.colorFreedom?.mandatoryGoreeCloudPalette,false);
 assert.equal(authority?.colorFreedom?.mandatoryGoreeCloudSystemColor,false);
 assert.equal(authority?.mobileNavigation?.primaryNavigation,'floating-bottom-dock');
 assert.equal(authority?.premiumQuality?.allConsumerAcceptanceVerified,false);
 const markup=readFileSync('lab/components.html','utf8');
 assert.match(markup,/id="gc-custom-accent"[^>]+type="color"|type="color" id="gc-custom-accent"/);
 assert.match(readFileSync('lab/primitives.mjs','utf8'),/theme\.set\(\{accent:'custom',seed:/);
});

test('every existing HTML lab has a static and independently accessible primary mobile dock',()=>{
 assert.equal(pages.length,11,'coverage must expand when new labs are added');
 for(const name of pages){
  const markup=readFileSync(join('lab',name),'utf8');
  assert.match(markup,/mobile-dock\.css/,name+' missing shared dock contract');
  assert.match(markup,/<body[^>]*data-gc-mobile-dock/,name+' missing safe-area clearance');
  assert.match(markup,/<nav[^>]+gc-mobile-dock[^>]+aria-label="Primary (?:mobile navigation|navigation, mobile)"/,name+' missing mobile landmark');
  if(name!=='adaptive.html'){
   assert.equal((markup.match(/<nav class="gc-mobile-dock"/g)||[]).length,1,name+' unexpected duplicate dock');
   assert.match(markup,/class="gc-desktop-nav" aria-label=/,name+' missing segregated desktop nav');
  }
 }
});
