import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const tokens = JSON.parse(readFileSync(new URL('../tokens/gc.tokens.json', import.meta.url), 'utf8'));
const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8') + readFileSync(new URL('../styles/components.css', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

test('all declared spatial and radius tokens are implemented in CSS', () => {
  for (const type of ['space','radius']) {
    for (const [key, token] of Object.entries(tokens[type])) {
      assert.match(css, new RegExp(`--gc-${type}-${key}:\\s*${token.$value.replace('.', '\\.')}`));
    }
  }
});
test('all palette roles and modes exist', () => {
  assert.equal(Object.keys(tokens.color.palettes).length,4);
  for (const [name, palette] of Object.entries(tokens.color.palettes)) {
    assert.match(css, new RegExp(`data-accent="${name}"`));
    for (const key of ['brand','onBrand','container','onContainer']) assert.match(palette[key].$value,/^#[0-9a-f]{6}$/i);
  }
  for (const mode of tokens.modes) assert.ok(css.includes(`data-mode="${mode}"`));
  for (const role of tokens.color.semanticRoles) assert.ok(css.includes(`--gc-${role}`), `Missing --gc-${role}`);
});
test('navigation maps to a real labeled view', () => {
  for (const name of ['overview','components','foundations','guidelines']) {
    assert.ok(index.includes(`id="${name}"`));
    assert.ok(index.includes(`data-route="${name}"`));
    assert.ok(script.includes(`'${name}'`));
  }
});
test('interaction feedback and accessible fallbacks exist', () => {
  assert.ok(index.includes('aria-live="polite"'));
  assert.ok(index.includes('aria-valuenow="2"'));
  assert.ok(index.includes('<dialog'));
  assert.ok(css.includes('prefers-reduced-motion'));
  assert.ok(css.includes('prefers-reduced-transparency'));
  assert.ok(css.includes(':focus-visible'));
});
