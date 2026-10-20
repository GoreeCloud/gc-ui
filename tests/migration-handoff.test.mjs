import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {checkCutoverReadiness} from '../scripts/check-cutover-readiness.mjs';
import {generateMigrationHandoff,renderMigrationHandoff} from '../scripts/render-consumer-migration-handoff.mjs';

const ledger=()=>JSON.parse(readFileSync(new URL('../registry/consumer-migration-reconciliation.v1.json',import.meta.url),'utf8'));
const doc=new URL('../docs/CONSUMER_MIGRATION_HANDOFF.md',import.meta.url);
test('handoff derives exactly 18 dated consumer next actions and preserves all four cutover gates',()=>{
 const r=checkCutoverReadiness(),text=renderMigrationHandoff(r,ledger());
 assert.equal(r.summary.consumerMigrationsAccepted,0);
 assert.match(text,/Source snapshot:.*2026-10-17/);
 assert.match(text,/0 migration acceptances/);
 assert.match(text,/Not a live repo audit/);
 for(const consumer of r.consumers){
  assert.ok(text.includes('| '+consumer.product+' |'),consumer.product);
  assert.ok(text.includes(consumer.nextAction),consumer.product+' next step');
 }
 for(const gate of r.blockedBy)assert.ok(text.includes('`'+gate+'`'),gate);
 assert.ok(text.includes('| GoreeCloud Notes | Unresolved | Not verified | Unresolved |'));
 assert.match(text,/clean static scan alone is not acceptance/);
 assert.equal(text,generateMigrationHandoff());
});
test('handoff rejects alleged adoption and inconsistent readiness before rendering',()=>{
 const readiness=checkCutoverReadiness();
 const forged={...readiness,consumers:readiness.consumers.map((x,i)=>i===0?{...x,actualGcUiAcceptance:'passed'}:x)};
 assert.throws(()=>renderMigrationHandoff(forged,ledger()),/unproven consumer acceptance/);
 assert.throws(()=>renderMigrationHandoff({...readiness,cutoverComplete:true},ledger()),/unverified or inconsistent/);
 assert.throws(()=>renderMigrationHandoff({...readiness,blockedBy:[]},ledger()),/unverified or inconsistent/);
});
test('version-controlled handoff remains in sync; verification performs no writes',()=>{
 const path=fileURLToPath(doc),before=readFileSync(path,'utf8');
 const cli=fileURLToPath(new URL('../scripts/render-consumer-migration-handoff.mjs',import.meta.url));
 const result=spawnSync(process.execPath,[cli,'--check'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 assert.match(result.stdout,/18 consumers, 0 accepted/);
 assert.equal(readFileSync(path,'utf8'),before,'read-only check must not mutate the tracked handoff');
 assert.equal(before,generateMigrationHandoff());
 assert.equal(spawnSync(process.execPath,[cli,'--unsafe'],{encoding:'utf8'}).status,4);
});
