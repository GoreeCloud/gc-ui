#!/usr/bin/env node
/** Public, unauthenticated, read-only exact npm distribution readback. No publish. */
import {createHash,timingSafeEqual} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertArchiveDigest} from './verify-foundations-handoff.mjs';

const authority=JSON.parse(readFileSync(new URL('../registry/design-authority.v1.json',import.meta.url),'utf8'));
const PACKAGE='@goreecloud/gc-ui',VERSION='1.0.1';
const META='https://registry.npmjs.org/%40goreecloud%2Fgc-ui/1.0.1';
const TARBALL='https://registry.npmjs.org/@goreecloud/gc-ui/-/gc-ui-1.0.1.tgz';
const sha512=bytes=>createHash('sha512').update(bytes).digest('base64');
const sha1=bytes=>createHash('sha1').update(bytes).digest('hex');
// The immutable GitHub artifact is 16,043 bytes. A 128-KiB cap gives
// ordinary registry responses room without accepting unbounded downloads.
export const MAX_REGISTRY_RESPONSE_BYTES=128*1024;
export async function readBoundedResponse(response,label,{limit=MAX_REGISTRY_RESPONSE_BYTES}={}){
 const declared=response.headers?.get?.('content-length');
 if(declared!==null&&declared!==undefined){
  if(!/^(0|[1-9][0-9]*)$/.test(declared))throw new Error('Invalid '+label+' content-length');
  if(Number(declared)>limit)throw new Error(label+' exceeds '+limit+'-byte limit');
 }
 if(response.body?.getReader){
  const reader=response.body.getReader();
  const chunks=[];
  let total=0;
  try{
   while(true){
    const {done,value}=await reader.read();
    if(done)break;
    if(!(value instanceof Uint8Array))throw new TypeError(label+' returned a non-byte chunk');
    total+=value.byteLength;
    if(total>limit)throw new Error(label+' exceeds '+limit+'-byte limit');
    chunks.push(value);
   }
   return Buffer.concat(chunks,total);
  }catch(error){
   await reader.cancel?.().catch(()=>{});
   throw error;
  }finally{reader.releaseLock?.()}
 }
 // Only non-streaming test/injected clients use the fallback; Node's actual
 // fetch has a streaming body, so the real network path never uses it.
 if(!response.arrayBuffer)throw new Error(label+' has no readable response body');
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length>limit)throw new Error(label+' exceeds '+limit+'-byte limit');
 return bytes;
}


export function validateRegistryVersion(metadata){
 if(!metadata||typeof metadata!=='object'||Array.isArray(metadata))
  throw new TypeError('Invalid public npm registry metadata');
 if(metadata.name!==PACKAGE||metadata.version!==VERSION)
  throw new Error('Registry package/version identity mismatch');
 if(metadata.private===true)throw new Error('Private package metadata is not a public distribution proof');
 if(metadata.license!=='Apache-2.0')throw new Error('Registry license mismatch');
 if(!metadata.dist||metadata.dist.tarball!==TARBALL)
  throw new Error('Registry tarball origin/path is not the exact pinned package');
 const integrity=metadata.dist.integrity;
 if(typeof integrity!=='string'||!/^sha512-[A-Za-z0-9+/]{86}==$/.test(integrity))
  throw new Error('Missing or malformed sha512 integrity');
 return integrity.slice('sha512-'.length);
}
export function verifyRegistryIntegrity(bytes,metadata){
 const expected=validateRegistryVersion(metadata);
 const actual=sha512(bytes);
 const x=Buffer.from(expected,'base64'),y=Buffer.from(actual,'base64');
 if(x.length!==64||y.length!==64||!timingSafeEqual(x,y))
  throw new Error('Registry dist.integrity sha512 mismatch');
 if(metadata.dist.shasum!==undefined&&metadata.dist.shasum!==sha1(bytes))
  throw new Error('Registry dist.shasum sha1 mismatch');
 return true;
}
async function get(fetchImpl,url){
 const response=await fetchImpl(url,{
  headers:{accept:'application/json','cache-control':'no-cache'},
  redirect:'error',credentials:'omit',signal:AbortSignal.timeout(20000)
 });
 if(!response||typeof response.status!=='number')throw new Error('Invalid registry HTTP response');
 return response;
}
export async function verifyPublicRegistry({fetchImpl=globalThis.fetch}={}){
 if(typeof fetchImpl!=='function')throw new TypeError('HTTP fetch provider required');
 if(authority.verified.foundationsStableVersion!==VERSION||
  authority.verified.foundationsStableArchiveSha256.length!==64)
  throw new Error('Pinned release authority version/hash missing');
 const response=await get(fetchImpl,META);
 if(response.status===404||response.status===403)return Object.freeze({
  schema:'gc-ui-npm-distribution-readback.v1',version:VERSION,
  status:'public-registry-metadata-unavailable',
  httpStatus:response.status,verified:false,published:false,
  scopeOwnershipVerified:false,npmPublishingIdentityVerified:false
 });
 if(response.status!==200)throw new Error('Unexpected registry HTTP status '+response.status);
 const metadata=JSON.parse((await readBoundedResponse(response,'npm metadata')).toString('utf8'));
 validateRegistryVersion(metadata); // validates origin before download
 const archiveResponse=await get(fetchImpl,TARBALL);
 if(archiveResponse.status!==200)throw new Error('Registry tarball HTTP status '+archiveResponse.status);
 const bytes=await readBoundedResponse(archiveResponse,'npm tarball');
 verifyRegistryIntegrity(bytes,metadata);
 const sha256=assertArchiveDigest(bytes); // exact, release-authority-pinned bytes, not just npm metadata
 return Object.freeze({
  schema:'gc-ui-npm-distribution-readback.v1',version:VERSION,
  status:'exact-public-distribution-verified',httpStatus:200,
  archiveSha256:sha256,bytes:bytes.length,verified:true,published:true,
  scopeOwnershipVerified:false,npmPublishingIdentityVerified:false
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.some(x=>!['--json','--check','--strict'].includes(x))||new Set(args).size!==args.length){
  console.error('Usage: node scripts/verify-npm-registry-distribution.mjs [--json] [--check] [--strict]');
  process.exitCode=4;
 }else{
  try{
   const result=await verifyPublicRegistry();
   if(args.includes('--json'))console.log(JSON.stringify(result,null,2));
   else console.log(result.verified?
    'Public npm distribution verified against exact GitHub Foundations 1.0.1 digest '+result.archiveSha256:
    'BLOCKED: no publicly accessible metadata for @goreecloud/gc-ui@1.0.1 (HTTP '+result.httpStatus+'). This does not establish package or scope ownership.');
   if(args.includes('--strict')&&!result.verified)process.exitCode=2;
  }catch(error){
   console.error('Public npm registry verification failed closed: '+error.message);
   process.exitCode=3;
  }
 }
}
