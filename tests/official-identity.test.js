import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const ROOT=new URL('../',import.meta.url);
const pins={
 'app-icon.svg':'a1bf6370761f247a56666c0d61ba615dce3e5789c6e7845c630caecf6d9de418',
 'symbol.svg':'78794bc48907ddd822b42d96cd0be0061bd1b1b4fe168384e5a3818afef50078',
 'logo-light.svg':'4e40c93337c84de16560b26d701a3334d3b448bc7e04a2efe189944eac680682',
 'logo-dark.svg':'dcdd57b18d94673973f1771f91752ece56d93737679b56bed4b8339719d1eb66',
 'favicon.ico':'874fe939d8ce7a3958d11b7d1655daa22389beeb6a903c87eb17590e57a94313',
 'interface-constellation.svg':'50661cf8d84818240ac7ac5e273123e041f9471ef4aa953d2be05019e4aef6aa'
};
const read=(name)=>readFileSync(new URL(name,ROOT));
test('all six GC UI identity copies exactly match approved central SHA-256 pins',()=>{
 for(const [file,expected] of Object.entries(pins)){
  const got=createHash('sha256').update(read('assets/identity/'+file)).digest('hex');
  assert.equal(got,expected,file);
 }
});
test('official vectors are self-contained, without external SVG scripts, images or foreignObject',()=>{
 for(const file of Object.keys(pins).filter(x=>x.endsWith('.svg'))){
  const svg=read('assets/identity/'+file).toString('utf8');
  assert.match(svg,/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg,/<title/);
  assert.doesNotMatch(svg,/<script|<foreignObject|<image|xlink:href|(?:href|src)\s*=\s*[\"']https?:|url\(\s*https?:/i);
 }
});
test('lab references product-specific SVG favicon and ICO, not framework defaults',()=>{
 const html=read('lab/index.html').toString('utf8');
 assert.match(html,/rel="icon" type="image\/svg\+xml" href="\.\.\/assets\/identity\/app-icon\.svg"/);
 assert.match(html,/rel="icon" type="image\/x-icon" href="\.\.\/assets\/identity\/favicon\.ico"/);
 assert.doesNotMatch(html,/gc-lab-mark[^>]*>✦/);
});
test('lab has official identity wordmarks, artwork and accessible section',()=>{
 const html=read('lab/index.html').toString('utf8');
 for(const file of ['app-icon.svg','logo-light.svg','logo-dark.svg','interface-constellation.svg']){
  assert.ok(html.includes('../assets/identity/'+file),file);
 }
 assert.match(html,/<section id="identity" class="gc-lab-section gc-ui-identity-section" aria-labelledby="identity-heading"/);
 assert.match(html,/<h2[^>]*id="identity-heading"/);
 assert.match(html,/<figure class="gc-ui-identity-artwork">/);
});
