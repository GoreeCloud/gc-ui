#!/usr/bin/env node
/** Reproducible, read-only, no-network handoff from validated GC UI cutover evidence. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkCutoverReadiness} from './check-cutover-readiness.mjs';

const OUTPUT=new URL('../docs/CONSUMER_MIGRATION_HANDOFF.md',import.meta.url);
const LEDGER=new URL('../registry/consumer-migration-reconciliation.v1.json',import.meta.url);
const groupNames={
 'source-path-verified':'1. Source subtree identified — request authorized source inspection',
 'repository-verified':'2. Repository verified — establish whether a runnable UI exists',
 'needs-product-confirmation':'3. Product mapping needs owner confirmation',
 'unresolved':'4. Product identity unresolved'
};
const evidenceSteps=[
 'Authorize access to the exact current owning repository and revision; confirm the runnable UI scope.',
 'Audit legacy assets/imports and verify an installed supported GC UI scope, never just a string rename.',
 'Record functional, keyboard/accessibility, security, supported-platform, rollout and rollback results with owner acceptance.'
];
const escapeCell=value=>String(value).replaceAll('|','\\|').replaceAll('\n',' ').replaceAll('\r',' ');
export function renderMigrationHandoff(readiness,ledger){
 if(readiness?.schema!=='gc-ui-consumer-cutover-readiness.v1'||readiness.readOnly!==true||
  readiness.cutoverComplete!==false||readiness.summary?.consumerMigrationsAccepted!==0||
  readiness.consumers?.length!==18||readiness.blockedBy?.length!==4||
  ledger?.schema!=='gc-ui-consumer-reconciliation.v1'||!/^\d{4}-\d{2}-\d{2}$/.test(ledger.auditDate))
  throw new Error('Refusing to render a handoff from unverified or inconsistent cutover evidence');
 if(readiness.consumers.some(c=>c.migrationAccepted!==false||
   c.actualGcUiAcceptance!=='not-evaluated'||c.staticSourceAudit!=='not-run'))
  throw new Error('Refusing to present unproven consumer acceptance as a handoff');
 const lines=[
  '# GC UI — consumer migration evidence handoff',
  '',
  '**Source snapshot:** '+ledger.auditDate+' provider/ledger reconciliation. **Generated from:** `npm run migration:cutover:readiness -- --json`. **Not a live repo audit.**',
  '',
  '**Current scope:** '+readiness.summary.historicalConsumers+' historical products; '+readiness.summary.repositoriesConfirmed+' repository identities confirmed, '+readiness.summary.currentSubtreesConfirmed+' UI source subtrees verified, '+readiness.summary.mappingConfirmationOpen+' mappings awaiting confirmation, '+readiness.summary.unresolved+' unresolved, **'+readiness.summary.consumerMigrationsAccepted+' migration acceptances**.',
  '',
  'Historical pinned revisions below are **evidence timestamps**, not claims that current `main` still matches. Only `GoreeCloud/gc-ui` is writable in this project. No downstream repository inspection, modification, publication or acceptance is authorized by this document.',
  '',
  '## Blocking gates',
  ''
 ];
 for(const blocker of readiness.blockedBy)lines.push('- `'+blocker+'`');
 lines.push('','## Next verification actions (ordered by readiness)','');
 for(const [state,heading] of Object.entries(groupNames)){
  const rows=readiness.consumers.filter(c=>c.identityState===state);
  lines.push('### '+heading,'','| Historical product | Dated repository evidence | Dated source path | Pinned revision | Next authorization/evidence action |','|---|---|---|---|---|');
  for(const c of rows)lines.push('| '+escapeCell(c.product)+' | '+escapeCell(c.repository??'Unresolved')+
   ' | '+escapeCell(c.sourcePath??'Not verified')+' | '+(c.pinnedRevision?'`'+c.pinnedRevision+'`':'Unresolved')+
   ' | '+escapeCell(c.nextAction)+' |');
  lines.push('');
 }
 lines.push('## Acceptance packet required for every product','');
 for(let i=0;i<evidenceSteps.length;i++)lines.push((i+1)+'. '+evidenceSteps[i]);
 lines.push('','**Current ledger fact:** Every consumer is `staticSourceAudit: not-run`, `actualGcUiAcceptance: not-evaluated`, and `migrationComplete: false`. A clean static scan alone is not acceptance. Do not alter reconciliation flags until the actual independently authorized product release and verification evidence is available.',
  '','**Not automatically cleared by npm publication:** the stable Foundations subset is not the full GC UI, and package availability does not prove app migration. Governance supersession, individually verified consumer runtime migration, legacy retirement and exclusive cutover remain separate gates.','');
 return lines.join('\n');
}
export function generateMigrationHandoff(){
 return renderMigrationHandoff(checkCutoverReadiness(),JSON.parse(readFileSync(LEDGER,'utf8')));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length>1||args.some(a=>!['--check','--stdout'].includes(a))){
  console.error('Usage: node scripts/render-consumer-migration-handoff.mjs [--check | --stdout]');
  process.exitCode=4;
 }else try{
  const expected=generateMigrationHandoff();
  if(args.includes('--check')){
   if(readFileSync(OUTPUT,'utf8')!==expected)throw new Error('Committed migration handoff is stale; regenerate from the verified ledger');
   console.log('GC UI read-only migration handoff matches the verified ledger: 18 consumers, 0 accepted.');
  }else process.stdout.write(expected);
 }catch(err){console.error('Migration handoff rejected: '+err.message);process.exitCode=3}
}
