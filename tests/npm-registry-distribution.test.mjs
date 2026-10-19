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
const response=(status,payload)=>({status,
 arrayBuffer:async()=>{
  const bytes=Buffer.isBuffer(payload)?payload:Buffer.from(JSON.stringify(payload));
  return Uint8Array.from(bytes).buffer;
 }});
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

test('a declared oversized tarball response is rejected before materializing its bytes',async()=>{
 let n=0,readAttempted=false;
 const mock=async()=>{
  if(n++===0)return response(200,fixture());
  return {status:200,headers:{get:key=>key==='content-length'?'5000000':null},
   arrayBuffer:async()=>{readAttempted=true;throw Error('should never read oversized tarball')}};
 };
 await assert.rejects(()=>verifyPublicRegistry({fetchImpl:mock}),/exceeds .*limit/);
 assert.equal(readAttempted,false);
});
test('oversized streaming registry tarball is interrupted before full collection',async()=>{
 let n=0,cancelled=false;
 const mock=async()=>{
  if(n++===0)return response(200,fixture());
  return {status:200,body:{getReader:()=>({
   async read(){return {done:false,value:new Uint8Array(300000)}},
   async cancel(){cancelled=true},
   releaseLock(){}
  })}};
 };
 await assert.rejects(()=>verifyPublicRegistry({fetchImpl:mock}),/exceeds .*limit/);
 assert.equal(cancelled,true);
});
test('oversized metadata and invalid content-length are never mistaken for unpublished',async()=>{
 await assert.rejects(()=>verifyPublicRegistry({fetchImpl:async()=>({
  status:200,headers:{get:k=>k==='content-length'?'5000000':null},
  json:async()=>fixture()
 })}),/exceeds .*limit/);
 await assert.rejects(()=>verifyPublicRegistry({fetchImpl:async()=>({
  status:200,headers:{get:k=>k==='content-length'?'-1':null},
  json:async()=>fixture()
 })}),/content-length/);
});
test('streamed metadata and tarball chunks are bounded and concatenated exactly',async()=>{
 const {readBoundedResponse}=await import('../scripts/verify-npm-registry-distribution.mjs');
 const input=Buffer.from('test metadata packet');
 let cursor=0;
 const reader={
  async read(){if(cursor===input.length)return {done:true};const value=input.subarray(cursor,cursor+3);cursor+=value.length;return {done:false,value}},
  releaseLock(){}
 };
 const out=await readBoundedResponse({headers:{get:()=>String(input.length)},body:{getReader:()=>reader}},'sample');
 assert.deepEqual(out,input);
});
