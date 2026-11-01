import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('GC UI design language preserves the mandatory premium visual standard', () => {
  const guide = read('docs/DESIGN_LANGUAGE.md');
  assert.match(guide, /### Mandatory premium interface standard/);
  assert.match(guide, /MUST be beautiful, modern, polished, premium/);
  assert.match(guide, /does not accept plain, basic, boring/);
  assert.match(guide, /mandatory design and review requirement/);
  assert.match(guide, /not a claim that existing GoreeCloud applications already comply/);
});

test('developer documentation links to premium and visual acceptance rules', () => {
  const readme = read('README.md');
  assert.match(readme, /Mandatory visual-quality standard/);
  assert.match(readme, /docs\/DESIGN_LANGUAGE\.md#mandatory-premium-interface-standard/);
  assert.match(readme, /docs\/COMPONENTS\.md#mandatory-visual-acceptance-gate/);
});

test('component review requires visual, functional, and accessibility evidence', () => {
  const contract = read('docs/COMPONENTS.md');
  assert.match(contract, /## Mandatory visual acceptance gate/);
  for (const requirement of [
    'First impression and brand',
    'Composition',
    'Complete experience',
    'Responsive and theme quality',
    'Accessible function',
    'Reference fidelity and evidence',
  ]) {
    assert.ok(contract.includes(requirement), 'Missing visual gate: ' + requirement);
  }
  assert.match(contract, /Accept only when the reviewer has evidence/);
  assert.match(contract, /mockup, component demo, or unrelated screen/);
});

test('pull-request template prompts evidence rather than asserting unverified compliance', () => {
  const template = read('.github/PULL_REQUEST_TEMPLATE.md');
  assert.match(template, /Mandatory quality review/);
  assert.match(template, /premium, distinctive, and eye-catching/);
  assert.match(template, /A checked box is a contributor attestation/);
  assert.match(template, /independent proof of release readiness/);
  assert.match(template, /No UI change/);
  const checks = template.match(/^- \[ \] /gm) ?? [];
  assert.ok(checks.length >= 8, 'The template must retain the core quality-review checklist');
  assert.match(template, /Screenshots\/rendered evidence/);
  assert.match(template, /Validation commands and results/);
});
