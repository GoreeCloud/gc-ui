import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {checkDesignAuthority,findPredecessorReference} from '../scripts/check-design-authority.mjs';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('single-design-authority owner decision is machine readable and release claims remain truthful',()=>{
 const contract=JSON.parse(read('registry/design-authority.v1.json'));
 const pkg=JSON.parse(read('package.json'));
 assert.equal(contract.authority.successor,'GoreeCloud UI');
 assert.equal(contract.authority.successorRepository,'GoreeCloud/gc-ui');
 assert.equal(contract.authority.outcome,'exclusive-permanent-replacement');
 assert.equal(contract.ownerMandateEffectiveDate,'2026-10-19');
 assert.equal(contract.authority.designMandateEffectiveImmediately,true);
 assert.equal(contract.authority.glazeAndGlazeUIBanned,true);
 assert.deepEqual(contract.authority.requiredDesignSurfaces,[
  'applications','websites','icons','operating-systems','all-other-goreecloud-controlled-designed-surfaces'
 ]);
 assert.equal(contract.authority.newPredecessorDependenciesAllowed,false);
 assert.equal(contract.verified.currentSourceVersion,pkg.version);
 for(const gate of ['governanceDocumentsAmended','allConsumerMigrationsVerified','predecessorRepositoriesRetired','exclusiveCutoverCompleted']){
  assert.equal(contract.verified[gate],false,'Do not invent completion: '+gate);
 }
 assert.equal(pkg.private,true);
 assert.equal(pkg.license,'Apache-2.0');
 assert.equal(contract.verified.foundationsPublishedStable,true);
 assert.equal(contract.verified.foundationsStableVersion,'1.0.1');
 assert.equal(contract.verified.foundationsStableReleaseTag,'foundations-v1.0.1');
 assert.equal(contract.verified.foundationsNpmRegistryPublished,false);
 assert.match(contract.verified.foundationsStableSourceCommit,/^[a-f0-9]{40}$/);
 assert.match(contract.verified.foundationsStableArchiveSha256,/^[a-f0-9]{64}$/);
});
test('active implementation rejects predecessor namespaced assets, imports and design tokens',()=>{
 for(const malicious of [
  "import '../legacy/Glaze UI/tokens.css'",
  'button { color: var(--glz-primary); }',
  '<glzBadge></glzBadge>',
  'export const material = "Glaze";'
 ])assert.equal(findPredecessorReference(malicious),true,malicious);
 for(const safe of ['const brand="GoreeCloud UI";','--gc-v1-color-primary','#gc-mock-app'])
  assert.equal(findPredecessorReference(safe),false,safe);
 assert.ok(checkDesignAuthority()>40);
});
test('Android build output cannot make source-only authority checks depend on build history',()=>{
 // Gradle copies historical documentation into an ignored APK asset directory.
 // Even when the copy contains old design-system terminology, the real source
 // scan must continue to check first-party implementation files instead.
 const folder=new URL('../native/android/app/src/main/assets/',import.meta.url);
 const artifact=new URL('__gc_authority_build_fixture_'+process.pid+'.txt',folder);
 mkdirSync(fileURLToPath(folder),{recursive:true});
 try{
  writeFileSync(artifact,'Historical Glaze release notes copied into build output.','utf8');
  assert.ok(checkDesignAuthority()>40);
 }finally{
  rmSync(fileURLToPath(artifact),{force:true});
 }
});
test('current GC UI guidance names exclusive successor and discloses governance gap',()=>{
 const doc=read('docs/DESIGN_SYSTEM_SUCCESSION.md');
 assert.match(doc,/permanent replacement of Glaze/);
 assert.match(doc,/Mandatory GoreeCloud-wide design mandate/);
 assert.match(doc,/2026-10-19/);
 assert.match(doc,/Glaze and Glaze UI are permanently removed/);
 assert.match(doc,/ecosystem cutover \*\*not yet complete\*\*/);
 assert.match(doc,/read-only/);
 assert.match(doc,/AGPL-3\.0-or-later/);
 for(const guide of [
  'README.md','docs/DESIGN_LANGUAGE.md','docs/ROADMAP.md',
  'docs/RELEASE_PLAN_V1.md','docs/STABLE_RELEASE_SCOPE.md',
  'docs/IMPLEMENTATION_STATUS.md'
 ])assert.match(read(guide),/DESIGN_SYSTEM_SUCCESSION\.md/,'Missing direction in '+guide);
});

test('source authority scan rejects predecessor design imports in TypeScript module variants',()=>{
 for(const extension of ['.mts','.cts']){
  const fixture=new URL('../src/__gc_authority_ts_probe_'+process.pid+extension,import.meta.url);
  try{
   writeFileSync(fixture,"import '../legacy/Glaze UI/components'","utf8");
   assert.throws(()=>checkDesignAuthority(),/Legacy design authority.*__gc_authority_ts_probe/);
  }finally{
   rmSync(fileURLToPath(fixture),{force:true});
  }
 }
 assert.ok(checkDesignAuthority()>40);
});
