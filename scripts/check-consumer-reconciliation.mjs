#!/usr/bin/env node
/** Fail-closed validation for bounded GC UI historical consumer reconciliation. */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const PATH=fileURLToPath(new URL('../registry/consumer-migration-reconciliation.v1.json',import.meta.url));
const SHA=/^[a-f0-9]{40}$/;
const REPO=/^GoreeCloud\/[A-Za-z0-9._-]+$/;
const STATES=new Set(['repository-verified','source-path-verified','needs-product-confirmation','unresolved']);
const AUDIT_STATES=new Set(['not-run','incomplete','legacy-dependency-evidence','manual-review-required','no-legacy-evidence-detected']);
const NONNEGATIVE_SAFE_INTEGER=value=>Number.isSafeInteger(value)&&value>=0;
function verifyStaticAudit(migration,cur,name,fail){
 const status=migration.staticSourceAudit,evidence=migration.staticAuditEvidence;
 if(!AUDIT_STATES.has(status)){fail('unknown static audit status '+name);return;}
 if(status==='not-run'){
  if(evidence!=null)fail('unrun source audit must have no evidence '+name);
  return;
 }
 if(!evidence||typeof evidence!=='object'||Array.isArray(evidence)){
  fail('audited source lacks evidence '+name);return;
 }
 if(cur.identityState!=='source-path-verified')fail('audit requires verified consumer source subtree '+name);
 if(!SHA.test(evidence.auditorRevision||''))fail('audit lacks exact scanner revision '+name);
 if(evidence.consumerRevision!==cur.headSha)fail('stale or mismatched consumer audit revision '+name);
 if(evidence.sourcePath!==cur.sourcePath)fail('audit source path mismatch '+name);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(evidence.scannedAt||''))fail('audit date missing '+name);
 if(!NONNEGATIVE_SAFE_INTEGER(evidence.filesScanned)||evidence.filesScanned===0||
    !NONNEGATIVE_SAFE_INTEGER(evidence.bytesScanned))fail('audit file/byte count invalid '+name);
 const totals=evidence.totals||{};
 for(const key of ['active','review','informational','incomplete'])
  if(!NONNEGATIVE_SAFE_INTEGER(totals[key]))fail('audit count invalid '+key+' '+name);
 if(!Array.isArray(evidence.incompleteReasons)||
    evidence.incompleteReasons.length!==totals.incomplete||
    evidence.incompleteReasons.some(x=>!x||typeof x.reason!=='string'||!x.reason||
      typeof x.path!=='string'||x.path.startsWith('/')||x.path.split('/').includes('..')))
  fail('audit incomplete evidence invalid '+name);
 const derived=totals.incomplete>0?'incomplete':totals.active>0?'legacy-dependency-evidence':
   totals.review>0?'manual-review-required':'no-legacy-evidence-detected';
 if(status!==derived)fail('static audit result contradicts findings '+name);
}


export function verifyConsumerReconciliation(data){
 const errors=[];
 const fail=message=>errors.push(message);
 if(!data||typeof data!=='object')throw new TypeError('Consumer ledger must be JSON object');
 if(data.schema!=='gc-ui-consumer-reconciliation.v1')fail('unknown schema');
 if(!data.inputSources || !SHA.test(data.inputSources.legacyRegistry?.commit||''))fail('missing exact historical registry revision');
 if(data.inputSources?.liveProvider?.account!=='GoreeCloud')fail('wrong provider identity');
 for(const flag of ['drivePoliciesSuperseded','legacyConsumersMigrated','releasePromotedStable'])
  if(data.conditions?.[flag]!==false)fail('unproven ecosystem/release completion: '+flag);
 if(!Array.isArray(data.entries)||data.entries.length!==18)
  fail('expected exactly the 18 dated registry products');
 const names=new Set(),legacyKeys=new Set();
 for(const entry of Array.isArray(data.entries)?data.entries:[]){
  const name=entry.legacyProduct;
  if(typeof name!=='string'||!name.startsWith('GoreeCloud '))fail('missing product name');
  if(names.has(name))fail('duplicate product name '+name);
  names.add(name);
  const old=entry.legacy||{},cur=entry.current||{},migration=entry.migration||{};
  if(!REPO.test(old.repository||''))fail('invalid historical repository '+name);
  const legacyKey=old.repository+':'+(old.sourcePath||'.');
  if(legacyKeys.has(legacyKey))fail('duplicate old location '+legacyKey);
  legacyKeys.add(legacyKey);
  if(!['adoption-required','unverified'].includes(old.registryStatus))fail('invalid legacy status '+name);
  if(!STATES.has(cur.identityState))fail('unknown state '+name);
  if(cur.identityState==='unresolved'){
   if(cur.repository!==null||cur.headSha!==null||cur.repoId!==null||cur.sourcePath!==null)
    fail('unresolved entry pretends to have provider evidence '+name);
  }else{
   if(!REPO.test(cur.repository||''))fail('missing verified repository '+name);
   if(!SHA.test(cur.headSha||''))fail('missing exact live revision '+name);
   if(!Number.isSafeInteger(cur.repoId)||cur.repoId<1)fail('missing immutable provider repository ID '+name);
  }
  if(cur.identityState==='source-path-verified'&&
    (typeof cur.sourcePath!=='string'||cur.sourcePath==='.'||cur.sourcePath.startsWith('/')||cur.sourcePath.includes('..')))
    fail('source-path-verified must be a safe actual subdirectory '+name);
  if(typeof cur.sourceRemarks!=='string'||cur.sourceRemarks.length<15)fail('missing evidence caveat '+name);
  if(migration.actualGcUiAcceptance!=='not-evaluated'||migration.migrationComplete!==false)
   fail('unsupported adoption/acceptance claims '+name);
  verifyStaticAudit(migration,cur,name,fail);
  if(cur.repository==='GoreeCloud/android-app-defaults'&&
   ['Launcher','Keyboard','Gallery','Since'].some(label=>name.endsWith(' '+label)))
   fail('obsolete Android monorepo mapping reintroduced '+name);
 }
 if(data.entries?.filter(x=>x.legacy.registryStatus==='unverified').length!==1)
  fail('historic status not preserved');
 if(data.entries?.filter(x=>x.current.identityState==='unresolved').length!==1)
  fail('current unknown Notes mapping was silently invented');
 if(errors.length)throw new Error('Consumer migration ledger rejected:\n'+errors.join('\n'));
 return {
  entries:data.entries.length,
  repositoriesConfirmed:data.entries.filter(x=>x.current.identityState==='repository-verified'||x.current.identityState==='source-path-verified').length,
  sourceSubtreesConfirmed:data.entries.filter(x=>x.current.identityState==='source-path-verified').length,
  productIdentityOpen:data.entries.filter(x=>x.current.identityState==='needs-product-confirmation').length,
  unresolved:data.entries.filter(x=>x.current.identityState==='unresolved').length,
  sourceAuditsRecorded:data.entries.filter(x=>x.migration.staticSourceAudit!=='not-run').length,
  migrationsAccepted:0
 };
}
export function verifyLedgerFile(path=PATH){
 const parsed=JSON.parse(readFileSync(path,'utf8'));
 return verifyConsumerReconciliation(parsed);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log('Verified GC UI consumer reconciliation:',JSON.stringify(verifyLedgerFile()));}
 catch(e){console.error(e.message);process.exitCode=1;}
}
