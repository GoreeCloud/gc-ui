import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

test('canonical Flutter palettes are reproducible for all accents and appearances', () => {
  assert.doesNotThrow(() => execFileSync(process.execPath,
    ['scripts/generate-flutter-tokens.mjs', '--check'],
    {cwd: new URL('../', import.meta.url), stdio: 'pipe'}));
  const source = readFileSync(new URL('../flutter/gc_ui_expressive/lib/src/generated/gc_ui_palettes.g.dart', import.meta.url), 'utf8');
  for (const accent of ['iris', 'lagoon', 'ember', 'moss'])
    for (const mode of ['light', 'dark']) assert.ok(source.includes("'" + accent + "/" + mode + "'"));
});
