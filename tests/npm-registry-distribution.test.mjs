import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateRegistryVersion,verifyRegistryIntegrity,verifyPublicRegistry} from '../scripts/verify-npm-registry-distribution.mjs';

const tarball='https://registry.npmjs.org/@goreecloud/gc-ui/-/gc-ui-1.0.1.tgz';
const bytes=Buffer.from('synthetic test bytes that must not pass the public-release hash');
const fixture=()=>({name:'@goreecloud/gc-ui',version:'1.0.1',license:'Apache-2.0',
 dist:{tarball,integrity:'sha512-'+createHash('sha512').update(bytes).digest('base64'),
  shasum:createHash('sha1').update(bytes).digest('hex')}});
const response=(status,payload)=>({status,json:async()=>payload,
 arrayBuffer:async()=>Uint8Array.from(payload).buffer});
test('rejects registry identity, outbound URL and unverified dist integrity',()=>{
 assert.equal(validateRegistryVersion(fixture()).length,88);
 for(const change of [
  x=>x.name='@elsewhere/gc-ui',x=>x.version='1.0.0',
  x=>x.license='UNLICENSED',x=>x.private=true,
  x=>x.dist.tarball='https://evil.example/asset.tgz',
  x=>x.dist.tarball='http://registry.npmjs.org/@goreecloud/gc-ui/-/gc-ui-1.0.1.tgz',
  x=>x.dist.integrity='sha256-abc'
 ]){
  const m=fixture();change(m);assert.throws(()=>validateRegistryVersion(m));
 }
 const m=fixture();assert.equal(verifyRegistryIntegrity(bytes,m),true);
 assert.throws(()=>verifyRegistryIntegrity(Buffer.from('altered'),m),/sha512 mismatch/);
 m.dist.shasum='0'.repeat(40);assert.throws(()=>verifyRegistryIntegrity(bytes,m),/shasum/);
});
test('404 or 403 is a blocked public-metadata state, never scope ownership proof',async()=>{
 for(const status of [403,404]){
  const result=await verifyPublicRegistry({fetchImpl:async(url,opts)=>{
   assert.equal(url,'https://registry.npmjs.org/%40goreecloud%2Fgc-ui/1.0.1');
   assert.equal(opts.credentials,'omit');assert.equal(opts.redirect,'error');
   return response(status,null);
  }});
  assert.equal(result.verified,false);
  assert.equal(result.status,'public-registry-metadata-unavailable');
  assert.equal(result.scopeOwnershipVerified,false);
  assert.equal(result.httpStatus,status);
 }
});
test('metadata 200 cannot prove publication if tarball differs from immutable GitHub release',async()=>{
 let n=0;
 const mocked=async(url,opts)=>{
  assert.equal(opts.credentials,'omit');
  if(n++===0){assert.ok(url.includes('1.0.1'));return response(200,fixture())}
  assert.equal(url,tarball);return response(200,bytes);
 };
 await assert.rejects(()=>verifyPublicRegistry({fetchImpl:mocked}),/SHA-256 mismatch/);
 assert.equal(n,2);
});
test('network errors, unexpected statuses and bad metadata fail closed',async()=>{
 await assert.rejects(()=>verifyPublicRegistry({fetchImpl:()=>Promise.reject(new Error('network down'))}),/network down/);
 await assert.rejects(()=>verifyPublicRegistry({fetchImpl:async()=>response(500,null)}),/Unexpected registry/);
 await assert.rejects(()=>verifyPublicRegistry({fetchImpl:async()=>response(200,{})}),/identity mismatch/);
});
test('invalid command-line flags fail before connecting to npm',()=>{
 const cli=fileURLToPath(new URL('../scripts/verify-npm-registry-distribution.mjs',import.meta.url));
 const out=spawnSync(process.execPath,[cli,'--publish'],{encoding:'utf8'});
 assert.equal(out.status,4);assert.match(out.stderr,/Usage:/);
});
