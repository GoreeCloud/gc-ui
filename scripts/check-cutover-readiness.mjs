#!/usr/bin/env node
/** Evidence-bounded GC UI consumer cutover planner. No remote/consumer access. */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {verifyConsumerReconciliation} from './check-consumer-reconciliation.mjs';

const ledgerPath=new URL('../registry/consumer-migration-reconciliation.v1.json',import.meta.url);
const authorityPath=new URL('../registry/design-authority.v1.json',import.meta.url);
export function deriveCutoverReadiness(ledger,authority){
 const tally=verifyConsumerReconciliation(ledger);
 if(authority?.schema!=='gc-ui-design-succession.v1'||
    authority.authority?.successorRepository!=='GoreeCloud/gc-ui')
  throw new Error('Unknown GC UI design authority contract');
 const status=authority.verified;
 if(!status||status.currentSourceMaturity!=='alpha'||
    status.foundationsStableVersion!=='1.0.1'||
    status.foundationsPublishedStable!==true)
  throw new Error('Source/release maturity must be reconciled before evaluating cutover');
 const consumers=ledger.entries.map(entry=>{
  const {current,migration}=entry;
  const next=current.identityState==='unresolved'
   ?'Identify and authorize a current owning repository'
   :current.identityState==='needs-product-confirmation'
    ?'Confirm owner product mapping and current UI source subtree'
    :current.identityState==='repository-verified'
     ?'Confirm whether runnable consumer UI exists, then identify the exact source subtree'
     :'Obtain authorized current-revision source audit and review runtime imports';
  return Object.freeze({
   product:entry.legacyProduct,
   identityState:current.identityState,
   repository:current.repository,
   sourcePath:current.sourcePath,
   pinnedRevision:current.headSha,
   staticSourceAudit:migration.staticSourceAudit,
   actualGcUiAcceptance:migration.actualGcUiAcceptance,
   migrationAccepted:false,
   nextAction:next,
   subsequentProof:[
    'Owned consumer implementation and exact source revision',
    'Installed supported GC UI scope and negative legacy dependency audit',
    'Product-level functional/accessibility/security and rollout/rollback acceptance'
   ]
  });
 });
 const blocked=[
  ...(!status.governanceDocumentsAmended?['read-only-drive-governance-not-superseded']:[]),
  ...(!status.allConsumerMigrationsVerified?['per-consumer-runtime-adoption-unverified']:[]),
  ...(!status.predecessorRepositoriesRetired?['separately-authorized-legacy-retirement-pending']:[]),
  ...(!status.exclusiveCutoverCompleted?['no-evidence-for-final-exclusive-cutover']:[])
 ];
 if(!blocked.length||consumers.some(item=>item.migrationAccepted))
  throw new Error('Cutover status unexpectedly asserted complete');
 return Object.freeze({
  schema:'gc-ui-consumer-cutover-readiness.v1',
  releaseContext:{workspace:'0.2.0-alpha.1',stableFoundations:'1.0.1',
   stableFoundationsIsNotFullUI:true},
  readOnly:true,cutoverComplete:false,releaseOrDeploymentPerformed:false,
  distribution:{npmRegistryPublished:status.foundationsNpmRegistryPublished,
   githubFoundationsTarballAvailable:true,
   npmPublicationIsNotUniversalMigrationRequirement:true},
  summary:{
   historicalConsumers:tally.entries,
   repositoriesConfirmed:tally.repositoriesConfirmed,
   currentSubtreesConfirmed:tally.sourceSubtreesConfirmed,
   mappingConfirmationOpen:tally.productIdentityOpen,
   unresolved:tally.unresolved,
   consumerMigrationsAccepted:tally.migrationsAccepted
  },
  blockedBy:blocked,consumers
 });
}
export function checkCutoverReadiness(){
 return deriveCutoverReadiness(JSON.parse(readFileSync(ledgerPath,'utf8')),
  JSON.parse(readFileSync(authorityPath,'utf8')));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.some(arg=>!['--json','--strict','--check'].includes(arg))||new Set(args).size!==args.length){
  console.error('Usage: node scripts/check-cutover-readiness.mjs [--json] [--check] [--strict]');
  process.exitCode=4;
 }else{
  try{
   const report=checkCutoverReadiness();
   if(args.includes('--json'))console.log(JSON.stringify(report,null,2));
   else console.log('GC UI cutover evidence is BLOCKED: '+report.summary.consumerMigrationsAccepted+
    '/'+report.summary.historicalConsumers+' consumers accepted; '+report.blockedBy.length+
    ' independent cutover gates pending. The read-only ledger passed integrity checks.');
   // --check validates truthful and internally consistent blocked state (CI-green);
   // --strict indicates deployment/retirement is NOT approved (nonzero).
   if(args.includes('--strict'))process.exitCode=2;
  }catch(error){console.error('Cutover readiness rejected: '+error.message);process.exitCode=3}
 }
}
