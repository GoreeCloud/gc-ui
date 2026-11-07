import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';

// Full action ref SHAs were verified from the official actions/* release tags
// and commit-signature fields on November 6, 2026. Review upstream code and
// update both this allowlist and the inline human-readable release annotation
// when deliberately upgrading. Nothing is fetched or executed by this test.
const approved=new Map([
 ['actions/checkout',{sha:'11d5960a326750d5838078e36cf38b85af677262',release:'v4.4.0'}],
 ['actions/setup-node',{sha:'49933ea5288caeca8642d1e84afbd3f7d6820020',release:'v4.4.0'}],
 ['actions/upload-artifact',{sha:'ea165f8d65b6e75b540449e92b4886f43607fa02',release:'v4.6.2'}],
 ['actions/setup-java',{sha:'cf277c60eb25467037889841efdb72551f06f6c3',release:'v4.9.1'}]
]);
const directory=new URL('../.github/workflows/',import.meta.url);
const uses=[];
for(const name of readdirSync(directory).filter(n=>/\.ya?ml$/.test(n))){
 const source=readFileSync(new URL(name,directory),'utf8');
 source.split('\n').forEach((line,index)=>{
  const entry=line.match(/^\s*(?:-\s*)?uses:\s*([^\s#]+)/);
  if(entry)uses.push({name,line:index+1,reference:entry[1],source:line});
 });
}

test('every remote GitHub Actions dependency uses an immutable 40-character commit SHA',()=>{
 assert.ok(uses.length>=20,'Expected all existing jobs and reusable workflow dependencies');
 for(const item of uses){
  if(item.reference.startsWith('./'))continue;
  assert.match(item.reference,/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\/[^@\s]+)?@[a-f0-9]{40}$/,
   `Mutable or invalid action ref: ${item.name}:${item.line} ${item.reference}`);
 }
});

test('official action pins correspond to reviewed upstream signed release commits',()=>{
 const used=new Set();
 for(const item of uses){
  const at=item.reference.lastIndexOf('@');
  const id=item.reference.slice(0,at),sha=item.reference.slice(at+1);
  if(!id.startsWith('actions/'))continue;
  const pinned=approved.get(id);
  assert.ok(pinned,`Review and explicitly register newly added official action: ${id}`);
  assert.equal(sha,pinned.sha,`${item.name}:${item.line} has an unexpected ${id} SHA`);
  assert.match(item.source,new RegExp(`#\\s*${pinned.release.replaceAll('.','\\.')}(?:\\s|$)`),
   `${item.name}:${item.line} must retain its audited release annotation`);
  used.add(id);
 }
 assert.deepEqual([...used].sort(),[...approved.keys()].sort(),
  'Do not leave stale or unused approved action pins');
});
