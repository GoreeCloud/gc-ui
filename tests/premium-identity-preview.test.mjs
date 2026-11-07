import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

const assets=new URL('../assets/candidates/',import.meta.url);
const root=new URL('../lab/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',assets),'utf8'));

test('identity preview sources are pinned, distinct, and self-contained',()=>{
 assert.equal(manifest.status,'founder-approved-source');
 const files=Object.keys(manifest.assets).sort();
 assert.equal(files.length,5);
 assert.deepEqual(readdirSync(assets).filter(x=>x.endsWith('.svg')).sort(),files);
 for(const f of files){
  const bytes=readFileSync(new URL(f,assets));
  const svg=bytes.toString('utf8');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.assets[f].sha256,f+' integrity');
  assert.equal(bytes.length,manifest.assets[f].size,f+' byte length');
  assert.match(svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*viewBox=/);
  assert.doesNotMatch(svg,/<script\b|<foreignObject\b|<image\b|<iframe\b|\bon[a-z]+\s*=|\bhref\s*=/i);
 }
});

test('founder-approved Aperture Weave uses canonical nav branding and original artwork',()=>{
 const components=readFileSync(new URL('components.html',root),'utf8');
 const experience=readFileSync(new URL('experience-studio.html',root),'utf8');
 for(const html of [components,experience]){
  assert.match(html,/href="\.\.\/assets\/gc-mark\.svg"/,'official favicon stays pinned');
  assert.match(html,/src="\.\.\/assets\/gc-mark\.svg"/,'official header mark stays in place');
  assert.match(html,/href="\.\/premium-direction\.css"/);
  assert.match(html,/aperture-interface-artwork\.svg/,'new original artwork is present');
  assert.match(html,/gc-premium-visual/);
 }
 assert.match(components,/FOUNDER-APPROVED IDENTITY/);
 assert.match(components,/aperture-logo\.svg/);
 assert.match(components,/aperture-logo-dark\.svg/);
 assert.match(components,/App distribution requires platform validation/);
 assert.match(components,/Official GC UI identity/);
 assert.match(experience,/Founder-approved/);
});
