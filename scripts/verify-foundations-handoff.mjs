#!/usr/bin/env node
/** Read-only verification of the exact released Foundations archive. Never publishes. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const authority=JSON.parse(readFileSync(new URL('../registry/design-authority.v1.json',import.meta.url),'utf8'));
const expected=Object.freeze([
 'LICENSE','README.md','package.json','provenance.json',
 'src/gc-color-engine.mjs','src/gc-theme-runtime.mjs','src/index.mjs',
 'styles/gc.v1.generated.css','tokens/gc.v1.tokens.json','types/index.d.ts'
]);
const api=Object.freeze(['GC_THEME_DEFAULTS','GC_UI_VERSION','contrastRatio','createThemeController','generateTheme','normalizeTheme','resolveTheme']);
const digest=value=>createHash('sha256').update(value).digest('hex');
const checksum=authority.verified.foundationsStableArchiveSha256;
const releaseVersion=authority.verified.foundationsStableVersion;
export function assertArchiveDigest(bytes,expectedSha=checksum){
 if(!/^[a-f0-9]{64}$/.test(expectedSha))throw new TypeError('Invalid pinned digest');
 const actual=digest(bytes);
 if(actual!==expectedSha)throw new Error('Release artifact SHA-256 mismatch: expected '+expectedSha+'; actual '+actual);
 return actual;
}
export function assertReleaseManifest(pkg){
 assert.equal(pkg.name,'@goreecloud/gc-ui');
 assert.equal(pkg.version,'1.0.1');
 assert.equal(pkg.private,false);
 assert.equal(pkg.license,'Apache-2.0');
 assert.equal(pkg.type,'module');
 assert.deepEqual(pkg.exports,{
  '.':{types:'./types/index.d.ts',import:'./src/index.mjs'},
  './tokens':'./tokens/gc.v1.tokens.json',
  './css/tokens':'./styles/gc.v1.generated.css'
 });
 assert.ok(!Object.keys(pkg).some(k=>['scripts','dependencies','devDependencies','peerDependencies','optionalDependencies','bundledDependencies','bundleDependencies'].includes(k)),
  'Unexpected install script or dependency');
 return true;
}
function tar(args){
 const result=spawnSync('tar',args,{encoding:null,maxBuffer:8*1024*1024,timeout:30000});
 if(result.error||result.status!==0)throw new Error('Release tar verification failed');
 return result.stdout;
}
export function verifyReleaseArchive(file){
 if(typeof file!=='string'||!file)throw new TypeError('Explicit release archive path is required');
 if(!authority.verified.foundationsPublishedStable||authority.verified.foundationsStableVersion!=='1.0.1')
  throw new Error('Release authority state does not match pinned public release');
 const archive=resolve(file);
 if(!statSync(archive).isFile())throw new TypeError('Release archive must be a regular file');
 const bytes=readFileSync(archive);
 const sha256=assertArchiveDigest(bytes);
 const list=tar(['-tzf',archive]).toString('utf8').trim().split('\n');
 assert.deepEqual(list.map(name=>name.startsWith('package/')?name.slice(8):name).sort(),[...expected].sort(),
  'Release package file allowlist mismatch');
 const listing=tar(['-tvzf',archive]).toString('utf8').trim().split('\n');
 assert.equal(listing.length,expected.length,'Unexpected archive entry count');
 assert.ok(listing.every(row=>row[0]==='-'),'Symlink/directory/hardlink forbidden');
 const read=name=>tar(['-xOzf',archive,'package/'+name]);
 const manifest=JSON.parse(read('package.json').toString('utf8'));
 assertReleaseManifest(manifest);
 const provenance=JSON.parse(read('provenance.json').toString('utf8'));
 assert.equal(provenance.schema,'gc-ui-foundations-provenance.v1');
 assert.equal(provenance.releaseVersion,releaseVersion);
 assert.equal(provenance.sourceRepository,'GoreeCloud/gc-ui');
 assert.deepEqual(Object.keys(provenance.files).sort(),expected.filter(name=>name!=='provenance.json').sort());
 for(const [name,sha] of Object.entries(provenance.files))
  assert.equal(digest(read(name)),sha,'Installed/source provenance mismatch: '+name);
 const index=read('src/index.mjs').toString('utf8');
 assert.ok(index.includes("GC_UI_VERSION='1.0.1'"));
 assert.ok(read('LICENSE').toString('utf8').includes('Apache License'));
 const result={release:'foundations-v1.0.1',version:manifest.version,
  archiveSha256:sha256,bytes:bytes.length,files:list.length,
  publicExports:api,archiveVerified:true,npmPublished:false,
  sourceRepository:'GoreeCloud/gc-ui'};
 return Object.freeze(result);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const argv=process.argv.slice(2);
  if(argv.length<2||argv[0]!=='--artifact'||argv.some(a=>a.startsWith('--')&&a!=='--artifact'&&a!=='--json')||argv.length>3)
   throw new TypeError('Usage: node scripts/verify-foundations-handoff.mjs --artifact /path/to/goreecloud-gc-ui-1.0.1.tgz [--json]');
  const result=verifyReleaseArchive(argv[1]);
  if(argv[2]&&argv[2]!=='--json')throw new TypeError('Unknown argument');
  console.log(argv[2]==='--json'?JSON.stringify(result,null,2):
   'Foundations release archive verified: '+result.version+', '+result.files+' pinned files, SHA-256 '+result.archiveSha256+'. No publication performed.');
 }catch(error){console.error('Foundations handoff rejected: '+error.message);process.exitCode=1;}
}
