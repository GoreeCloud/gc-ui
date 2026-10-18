import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('release candidate is independently staged and cannot be published accidentally',()=>{
 const builder=read('scripts/build-foundations-candidate.mjs');
 assert.match(builder,/private:!stable/);
 assert.match(builder,/UNLICENSED/);
 assert.match(builder,/1\.0\.0-rc\.1/);
 assert.match(builder,/gc-ui-foundations/);
 assert.doesNotMatch(builder,/npm publish|git tag|gh release/);
});
test('candidate exports limited foundations, not experimental components/native hosts',()=>{
 const builder=read('scripts/build-foundations-candidate.mjs');
 for(const exported of ['generateTheme','contrastRatio','createThemeController','normalizeTheme','resolveTheme'])
  assert.ok(builder.includes(exported),exported);
 for(const unsupported of ['gc-form-controls','gc-native-host','gc-choreography','gc-motion-presets'])
  assert.ok(!builder.includes("'./"+unsupported),"Unexpected experimental source");
 assert.match(read('release/foundations/README.md'),/Not included/);
 assert.match(read('release/foundations/README.md'),/github\.com\/GoreeCloud\/gc-ui\/blob\/main\/docs\/STABLE_RELEASE_SCOPE\.md/);
});
test('release verification installs real tarball and protects provenance',()=>{
 const verify=read('scripts/verify-foundations-candidate.mjs');
 for(const evidence of ['--offline','--ignore-scripts','sha256','SHA256SUMS','ERR_PACKAGE_PATH_NOT_EXPORTED','test-consumer.mjs'])
  assert.ok(verify.includes(evidence),'Missing packaging proof '+evidence);
});
