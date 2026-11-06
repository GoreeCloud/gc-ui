import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('GC UI design language preserves the mandatory premium visual standard', () => {
  const guide = read('docs/DESIGN_LANGUAGE.md');
  assert.match(guide, /### Mandatory premium interface standard/);
  // November 5 broadens, rather than repeals, October 31 requirements.
  assert.match(guide, /October 31, 2026 premium-interface requirement/);
  assert.match(guide, /\*\*Effective:\*\* November 5, 2026/);
  assert.match(guide, /I require every GoreeCloud application to always present a polished, eye-catching, premium, modern, beautiful, and elegant user interface/);
  for (const rejected of [
    'Overcrowded, cramped, or visually overwhelming',
    'Basic, boring, plain, or generic',
    'Colorless, lifeless, or visually unappealing',
    'Misaligned, inconsistent, or poorly organized',
    'Ugly, amateurish, unfinished, or outdated'
  ]) assert.ok(guide.includes(rejected), 'Missing prohibited visual quality: ' + rejected);
  assert.match(guide, /Visual richness must never become clutter\. Elegant simplicity must never become blandness/);
  assert.match(guide, /mandatory throughout design, development, review, and visual acceptance/);
  assert.match(guide, /Withhold visual-design acceptance/);
  assert.match(guide, /not a statement that existing products are already visually accepted, deployed, or compliant/);
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

test('authority contract publishes the mandatory premium mandate without inventing adoption', () => {
  const contract = JSON.parse(read('registry/design-authority.v1.json'));
  const rule = contract.authority.premiumVisualQualityMandate;
  assert.equal(rule.effectiveDate, '2026-10-31');
  assert.equal(rule.mandatory, true);
  // Fail closed if any original or November 5 premium requirement disappears.
  assert.deepEqual(rule.requiredQualities, [
    'beautiful', 'modern', 'polished', 'premium', 'eye-catching',
    'elegant', 'well-aligned', 'uncluttered', 'cohesive-semantic-color'
  ]);
  assert.deepEqual(rule.unacceptableQualities, [
    'plain', 'basic', 'boring', 'generic', 'unfinished', 'merely-functional',
    'overcrowded', 'colorless', 'misaligned', 'ugly'
  ]);
  assert.equal(rule.founderClarificationDate, '2026-11-05');
  assert.ok(rule.scope.includes('applications'));
  assert.ok(rule.scope.includes('dashboards'));
  assert.ok(rule.scope.includes('service-interfaces'));
  assert.equal(rule.designSpecification, 'docs/DESIGN_LANGUAGE.md#mandatory-premium-interface-standard');
  assert.equal(rule.visualAcceptanceCriteria, 'docs/COMPONENTS.md#mandatory-visual-acceptance-gate');
  assert.equal(rule.pullRequestReviewTemplate, '.github/PULL_REQUEST_TEMPLATE.md');
  assert.equal(rule.allConsumerVisualAcceptanceVerified, false);
});
