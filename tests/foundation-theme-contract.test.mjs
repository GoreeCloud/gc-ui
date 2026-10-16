import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const foundation=readFileSync(new URL('../lab/v1.js',import.meta.url),'utf8');
const components=readFileSync(new URL('../lab/primitives.mjs',import.meta.url),'utf8');
const foundationMarkup=readFileSync(new URL('../lab/v1.html',import.meta.url),'utf8');
const foundationStyles=readFileSync(new URL('../lab/v1.css',import.meta.url),'utf8');

test('both laboratories consume the shared theme runtime',()=>{
 assert.match(foundation,/import\s+\{createThemeController\}\s+from\s+['"]\.\.\/src\/gc-theme-runtime\.mjs['"]/);
 assert.match(components,/import\s+\{createThemeController\}\s+from\s+['"]\.\.\/src\/gc-theme-runtime\.mjs['"]/);
 assert.match(foundation,/const theme=createThemeController\(\)/);
 assert.match(components,/const theme=createThemeController\(\)/);
});
test('foundation lab never bypasses accessibility-aware theme resolution',()=>{
 assert.doesNotMatch(foundation,/localStorage\.(?:getItem|setItem)/);
 assert.doesNotMatch(foundation,/generateTheme\(/);
 assert.doesNotMatch(foundation,/root\.style\.setProperty\(/);
 assert.match(foundation,/root\.addEventListener\('gc-theme-change',syncControls\)/);
 assert.match(foundation,/\['mode','accent','material'\]/);
 assert.match(foundation,/accent:'custom',seed:seedInput\.value/);
});
test('foundation Lens has readable effective-material feedback and accessibility fallback',()=>{
 assert.match(foundationMarkup,/id="material-effective"[^>]*role="status"/);
 assert.match(foundationStyles,/:root\[data-gc-contrast="high"\] \.lens/);
 assert.match(foundationStyles,/prefers-reduced-transparency:reduce/);
 assert.match(foundationStyles,/forced-colors:active/);
});
