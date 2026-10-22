import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {checkCutoverReadiness} from '../scripts/check-cutover-readiness.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('implementation roadmap distinguishes experimental workspace from scoped stable Foundations',()=>{
 const roadmap=read('docs/ROADMAP.md');
 const pkg=JSON.parse(read('package.json'));
 const authority=JSON.parse(read('registry/design-authority.v1.json'));
 assert.equal(pkg.private,true);
 assert.equal(authority.verified.currentSourceMaturity,'alpha');
 assert.equal(authority.verified.foundationsNpmRegistryPublished,false);
 assert.ok(roadmap.includes(pkg.version),'roadmap should disclose the current experimental workspace version');
 assert.ok(roadmap.includes(authority.verified.foundationsStableVersion));
 assert.match(roadmap,/Foundations subset only/);
 assert.match(roadmap,/no npm registry publication/i);
 assert.match(roadmap,/not.*universal WCAG certification/i);
});

test('roadmap browser automation claim is grounded in CI and does not invent consumer acceptance',()=>{
 const roadmap=read('docs/ROADMAP.md');
 const ci=read('.github/workflows/ci.yml');
 const scripts=JSON.parse(read('package.json')).scripts;
 const cutover=checkCutoverReadiness();
 assert.match(ci,/Browser interaction smoke tests \(Chromium\)/);
 assert.match(ci,/Firefox interaction smoke tests/);
 assert.match(ci,/Upload visual captures and failure traces/);
 assert.match(scripts['test:e2e'],/test:e2e:visual/);
 assert.match(scripts['test:e2e:visual'],/visual-capture\.spec\.mjs/);
 assert.match(roadmap,/\[x\] Add automated browser interaction and screenshot capture to CI/);
 assert.equal(cutover.summary.consumerMigrationsAccepted,0);
 assert.equal(cutover.blockedBy.length,4);
 assert.match(roadmap,/0\/18 migrations accepted/);
 assert.match(roadmap,/four independent blocked gates/);
});
