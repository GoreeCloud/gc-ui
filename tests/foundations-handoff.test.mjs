import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {assertArchiveDigest,assertReleaseManifest,verifyReleaseArchive} from '../scripts/verify-foundations-handoff.mjs';

const manifest=()=>({
 name:'@goreecloud/gc-ui',version:'1.0.1',private:false,license:'Apache-2.0',
 type:'module',
 exports:{
  '.':{types:'./types/index.d.ts',import:'./src/index.mjs'},
  './tokens':'./tokens/gc.v1.tokens.json',
  './css/tokens':'./styles/gc.v1.generated.css'
 }
});
test('exact Foundations manifest is scoped and dependency/script-free',()=>{
 assert.equal(assertReleaseManifest(manifest()),true);
 for(const [field,value] of [['private',true],['version','0.2.0-alpha.1'],['license','UNLICENSED'],['scripts',{postinstall:'echo forbidden'}],['dependencies',{leftpad:'*'}]]){
  const bad=manifest();bad[field]=value;
  assert.throws(()=>assertReleaseManifest(bad),field);
 }
 const root=manifest();root.exports['./experimental']='./src/gc-menu.mjs';
 assert.throws(()=>assertReleaseManifest(root),/Expected values|deep-equal/);
});
test('pinned SHA-256 disallows substituted or repacked archive bytes',()=>{
 assert.throws(()=>assertArchiveDigest(Buffer.from('not-the-release')),/SHA-256 mismatch/);
 assert.throws(()=>assertArchiveDigest(Buffer.alloc(0),'bad'),/Invalid pinned/);
});
test('explicit release artifact is required and missing paths fail closed',()=>{
 assert.throws(()=>verifyReleaseArchive(''),/Explicit/);
 assert.throws(()=>verifyReleaseArchive('/unlikely/missing-foundations-archive.tgz'));
});
test('handoff verifier carries an immutable, non-publishing authority digest',()=>{
 const text=readFileSync(new URL('../scripts/verify-foundations-handoff.mjs',import.meta.url),'utf8');
 assert.match(text,/foundationsStableArchiveSha256/);
 assert.match(text,/npmPublished:false/);
 assert.doesNotMatch(text,/['"]publish['"]|exec\(.*publish/);
});
