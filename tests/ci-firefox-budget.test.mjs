import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const workflow=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const sections=workflow.split('  browser-firefox:\n');
assert.equal(sections.length,2,'Missing or duplicated Firefox job');
const firefox=sections[1].split('\n  foundations-stable:')[0];

test('Firefox CI keeps genuine browser and accessibility work inside a realistic bounded budget',()=>{
 const timeout=firefox.match(/^    timeout-minutes:\s*(\d+)\s*$/m);
 assert.ok(timeout,'No explicit Firefox CI time budget');
 assert.equal(Number(timeout[1]),35,'Cold-mirror evidence requires a 35-minute budget');
 assert.match(firefox,/run: npx playwright install --with-deps firefox/);
 assert.match(firefox,/run: npm run test:e2e:firefox/);
 for(const cmd of [
  'qa:visual:matrix:verify','qa:visual:interactive:verify',
  'qa:visual:nontext:verify','qa:seal-evidence:verify',
  'qa:native-zoom:firefox'
 ]) assert.ok(firefox.includes(cmd),'Missing Firefox acceptance gate '+cmd);
 assert.match(firefox,/name: Upload Firefox browser QA evidence/);
});

test('Firefox native zoom does not repeat Playwright browser package-index refresh',()=>{
 const section=firefox.split('      - name: Verify genuine 200% and 400% Firefox browser zoom\n')[1]
  ?.split('\n      - name: ')[0];
 assert.ok(section,'Native browser zoom step must exist');
 assert.doesNotMatch(section,/^\s*sudo apt-get update\b/m,
  'Playwright already refreshed indexes via --with-deps');
 assert.match(section,/^\s*sudo apt-get install -y x11-utils libxtst6\s*$/m,
  'Required X11 utilities must remain installed');
 assert.match(section,/^\s*npm run qa:native-zoom:firefox\s*$/m);
});
