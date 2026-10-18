import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyConsumerReconciliation,verifyLedgerFile} from '../scripts/check-consumer-reconciliation.mjs';
const read=()=>JSON.parse(readFileSync(new URL('../registry/consumer-migration-reconciliation.v1.json',import.meta.url),'utf8'));
const cloned=()=>structuredClone(read());
test('exact-head provider reconciliation is internally consistent and no adoption is invented',()=>{
 const count=verifyLedgerFile();
 assert.deepEqual(count,{entries:18,repositoriesConfirmed:14,sourceSubtreesConfirmed:4,productIdentityOpen:3,unresolved:1,sourceAuditsRecorded:4,migrationsAccepted:0});
});
test('different old and new canonical Android locations preserve history',()=>{
 const x=read().entries;
 for(const name of ['Launcher','Keyboard','Gallery','Since']){
  const p=x.find(v=>v.legacyProduct==='GoreeCloud '+name);
  assert.equal(p.legacy.repository,'GoreeCloud/android-app-defaults');
  assert.equal(p.current.repository,'GoreeCloud/'+name.toLowerCase());
  assert.match(p.current.headSha,/^[a-f\d]{40}$/);
 }
 assert.ok(x.some(e=>e.legacyProduct==='GoreeCloud Memos'&&e.current.sourcePath==='web'));
});
test('unresolved Notes remains unknown instead of picking arbitrary repo',()=>{
 const x=read().entries.find(e=>e.legacyProduct==='GoreeCloud Notes');
 assert.equal(x.current.identityState,'unresolved');
 assert.equal(x.current.repository,null);
});
test('rejects invented cutover, stable release, and target consumer acceptance',()=>{
 let x=cloned();x.conditions.legacyConsumersMigrated=true;
 assert.throws(()=>verifyConsumerReconciliation(x),/unproven/);
 x=cloned();x.entries[0].migration.actualGcUiAcceptance='accepted-v1';
 assert.throws(()=>verifyConsumerReconciliation(x),/unsupported adoption/);
 x=cloned();x.entries[0].migration.migrationComplete=true;
 assert.throws(()=>verifyConsumerReconciliation(x),/unsupported adoption/);
});
test('rejects missing source evidence and obsolete monorepo reinstatement',()=>{
 let x=cloned();x.entries[0].current.headSha=null;
 assert.throws(()=>verifyConsumerReconciliation(x),/exact live revision/);
 x=cloned();x.entries[4].current.repository='GoreeCloud/android-app-defaults';
 assert.throws(()=>verifyConsumerReconciliation(x),/obsolete Android monorepo/);
});
test('rejects traversal and fabricated verification for unresolved entries',()=>{
 let x=cloned();x.entries[2].current.sourcePath='../secret';
 assert.throws(()=>verifyConsumerReconciliation(x),/safe actual subdirectory/);
 x=cloned();x.entries.find(e=>e.legacyProduct==='GoreeCloud Notes').current.headSha='0'.repeat(40);
 assert.throws(()=>verifyConsumerReconciliation(x),/unresolved entry pretends/);
});

test('preserves bounded exact-revision source audit evidence without claiming migration',()=>{
 const entries=read().entries;
 const memos=entries.find(x=>x.legacyProduct==='GoreeCloud Memos');
 const website=entries.find(x=>x.legacyProduct==='GoreeCloud Website');
 assert.equal(memos.migration.staticSourceAudit,'incomplete');
 assert.deepEqual(memos.migration.staticAuditEvidence.incompleteReasons,[
  {reason:'binary-content-in-text-file',path:'src/components/MemoContent/useSearchMatchHighlight.ts'}
 ]);
 assert.equal(website.migration.staticSourceAudit,'legacy-dependency-evidence');
 assert.equal(website.migration.staticAuditEvidence.totals.active,356);
 assert.equal(website.migration.staticAuditEvidence.totals.incomplete,0);
 assert.equal(memos.migration.migrationComplete,false);
 assert.equal(website.migration.actualGcUiAcceptance,'not-evaluated');
});
test('rejects invented, unproven or mismatched source audit evidence',()=>{
 const mutate=fn=>{const x=cloned();const e=x.entries.find(v=>v.legacyProduct==='GoreeCloud Website');fn(e);return x;};
 assert.throws(()=>verifyConsumerReconciliation(mutate(e=>{e.migration.staticAuditEvidence=undefined;})),/lacks evidence/);
 assert.throws(()=>verifyConsumerReconciliation(mutate(e=>{e.migration.staticAuditEvidence.consumerRevision='0'.repeat(40);})),/mismatched consumer audit revision/);
 assert.throws(()=>verifyConsumerReconciliation(mutate(e=>{e.migration.staticAuditEvidence.sourcePath='../private';})),/audit source path mismatch/);
 assert.throws(()=>verifyConsumerReconciliation(mutate(e=>{e.migration.staticSourceAudit='no-legacy-evidence-detected';})),/contradicts findings/);
 assert.throws(()=>verifyConsumerReconciliation(mutate(e=>{e.migration.staticAuditEvidence.totals.active=-1;})),/audit count invalid/);
 assert.throws(()=>verifyConsumerReconciliation(mutate(e=>{e.migration.staticSourceAudit='not-run';})),/unrun source audit/);
 assert.throws(()=>verifyConsumerReconciliation(mutate(e=>{e.migration.migrationComplete=true;})),/unsupported adoption/);
});

test('reader and since audits are bounded to actual exact-head application source',()=>{
 const reader=read().entries.find(x=>x.legacyProduct==='GoreeCloud Reader');
 const since=read().entries.find(x=>x.legacyProduct==='GoreeCloud Since');
 assert.equal(reader.migration.staticSourceAudit,'legacy-dependency-evidence');
 assert.equal(reader.migration.staticAuditEvidence.totals.active,35);
 assert.equal(reader.migration.staticAuditEvidence.sourcePath,'apps');
 assert.equal(since.migration.staticSourceAudit,'manual-review-required');
 assert.deepEqual(since.migration.staticAuditEvidence.totals,
  {active:0,review:4,informational:0,incomplete:0});
 assert.equal(since.migration.migrationComplete,false);
 assert.equal(since.migration.actualGcUiAcceptance,'not-evaluated');
});
test('prevents unsupported clean label for a review-only source audit',()=>{
 const x=cloned();
 const entry=x.entries.find(e=>e.legacyProduct==='GoreeCloud Since');
 entry.migration.staticSourceAudit='no-legacy-evidence-detected';
 assert.throws(()=>verifyConsumerReconciliation(x),/contradicts findings/);
});
