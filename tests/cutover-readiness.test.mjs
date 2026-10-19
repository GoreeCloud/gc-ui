import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {checkCutoverReadiness,deriveCutoverReadiness} from '../scripts/check-cutover-readiness.mjs';

const ledger=()=>JSON.parse(readFileSync(new URL('../registry/consumer-migration-reconciliation.v1.json',import.meta.url),'utf8'));
const authority=()=>JSON.parse(readFileSync(new URL('../registry/design-authority.v1.json',import.meta.url),'utf8'));
test('readiness faithfully identifies 18 historical consumers, zero acceptance and independent blockers',()=>{
 const report=checkCutoverReadiness();
 assert.equal(report.schema,'gc-ui-consumer-cutover-readiness.v1');
 assert.equal(report.readOnly,true);
 assert.equal(report.cutoverComplete,false);
 assert.equal(report.summary.historicalConsumers,18);
 assert.equal(report.summary.consumerMigrationsAccepted,0);
 assert.equal(report.summary.repositoriesConfirmed,14);
 assert.equal(report.summary.currentSubtreesConfirmed,4);
 assert.equal(report.summary.mappingConfirmationOpen,3);
 assert.equal(report.summary.unresolved,1);
 assert.equal(report.consumers.length,18);
 assert.ok(report.consumers.every(e=>e.migrationAccepted===false));
 assert.ok(report.consumers.every(e=>e.staticSourceAudit==='not-run'&&e.actualGcUiAcceptance==='not-evaluated'));
 assert.equal(report.blockedBy.length,4);
 assert.equal(report.distribution.npmPublicationIsNotUniversalMigrationRequirement,true);
 assert.equal(report.releaseContext.stableFoundationsIsNotFullUI,true);
});
test('mapping uncertainty is preserved; no stale app or repo status is promoted',()=>{
 const r=checkCutoverReadiness(),byName=new Map(r.consumers.map(c=>[c.product,c]));
 assert.equal(byName.get('GoreeCloud Notes').repository,null);
 assert.match(byName.get('GoreeCloud Notes').nextAction,/Identify/);
 assert.match(byName.get('GoreeCloud Care').nextAction,/Confirm/);
 assert.equal(byName.get('GoreeCloud Website').sourcePath,'sites/main');
 assert.equal(byName.get('GoreeCloud Memos').sourcePath,'web');
 assert.ok(byName.get('GoreeCloud Tasks').nextAction.includes('runnable'));
});
test('tampered consumer acceptance and governance cannot silently pass',()=>{
 let l=ledger();l.entries[0].migration.migrationComplete=true;
 assert.throws(()=>deriveCutoverReadiness(l,authority()),/unsupported adoption/);
 l=ledger();l.entries[0].migration.actualGcUiAcceptance='passed';
 assert.throws(()=>deriveCutoverReadiness(l,authority()),/unsupported adoption/);
 let a=authority();a.verified.currentSourceMaturity='stable';
 assert.throws(()=>deriveCutoverReadiness(ledger(),a),/Source\/release maturity/);
 a=authority();a.authority.successorRepository='GoreeCloud/glaze';
 assert.throws(()=>deriveCutoverReadiness(ledger(),a),/Unknown GC UI/);
});
test('strict cutover readiness returns blocked exit 2; consistency check returns zero',()=>{
 const cli=fileURLToPath(new URL('../scripts/check-cutover-readiness.mjs',import.meta.url));
 const run=(...args)=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});
 const check=run('--json','--check');assert.equal(check.status,0,check.stderr);
 assert.equal(JSON.parse(check.stdout).cutoverComplete,false);
 const strict=run('--strict');assert.equal(strict.status,2);
 assert.match(strict.stdout,/BLOCKED/);
 assert.equal(run('--publish').status,4);
});
