import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = name => readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('owner stable policy cannot inherit optional hardware or human AT blockers',()=>{
 const content=read('docs/STABLE_RELEASE_SCOPE.md');
 for(const phrase of [
  'scoped, versioned, supported distribution',
  'second physical Android device',
  'Unplugged battery-energy measurements',
  'human desktop screen-reader listening sessions',
  'not universally mandated',
  'Signed native artifacts',
  '0.2.0-alpha.1',
  '12/12 user-reported Android TalkBack'
 ])assert.ok(content.includes(phrase),'Release policy missing '+phrase);
 assert.match(content,/Actual accessibility or security defects/);
 assert.match(content,/owner approval/);
});

test('key public guidance points to the scoped release rules',()=>{
 for(const name of [
  'README.md',
  'docs/RELEASE_PLAN_V1.md',
  'docs/ACCESSIBILITY_RELEASE.md',
  'docs/ACCESSIBILITY.md',
  'docs/NATIVE_HOSTS.md',
  'docs/IMPLEMENTATION_STATUS.md',
  'docs/ANDROID_TALKBACK_ACCEPTANCE.md'
 ])assert.match(read(name),/STABLE_RELEASE_SCOPE\.md/,'Missing release policy link in '+name);
 assert.match(read('docs/RELEASE_PLAN_V1.md'),/Not required by default:/);
});

test('scope correction does not automatically make a stable package or erase TalkBack passes',()=>{
 const packageJson=JSON.parse(read('package.json'));
 assert.equal(packageJson.version,'0.2.0-alpha.1');
 assert.equal(packageJson.private,true);
 const rows=read('docs/QA_TALKBACK_USER_ACCEPTANCE_2026_10_17.md').split('\n');
 for(let i=1;i<=12;i++){
  const id='TB-'+String(i).padStart(2,'0');
  const row=rows.find(value=>value.startsWith('| '+id+' |'));
  assert.ok(row && row.includes('**PASS**'),'Missing prior accepted result for '+id);
 }
});
