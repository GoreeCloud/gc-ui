import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const cwd=fileURLToPath(new URL('../',import.meta.url));
const script="import c from './playwright.config.mjs'; console.log(JSON.stringify({outputDir:c.outputDir,baseURL:c.use.baseURL}))";
function evaluate(env){
 return spawnSync(process.execPath,['--input-type=module','-e',script],{
  cwd,encoding:'utf8',env:{...process.env,...env}
 });
}
test('concurrent run identifiers isolate their Playwright artifacts and loopback servers',()=>{
 const a=evaluate({GC_PLAYWRIGHT_PORT:'4187',GC_PLAYWRIGHT_RUN_ID:'alpha-1'});
 const b=evaluate({GC_PLAYWRIGHT_PORT:'4188',GC_PLAYWRIGHT_RUN_ID:'alpha-2'});
 assert.equal(a.status,0,a.stderr);
 assert.equal(b.status,0,b.stderr);
 const one=JSON.parse(a.stdout),two=JSON.parse(b.stdout);
 assert.equal(one.outputDir,'./test-results/isolated/alpha-1');
 assert.equal(two.outputDir,'./test-results/isolated/alpha-2');
 assert.notEqual(one.outputDir,two.outputDir);
 assert.equal(one.baseURL,'http://127.0.0.1:4187');
 assert.equal(two.baseURL,'http://127.0.0.1:4188');
});
test('unsafe artifact identifiers and invalid web ports are rejected before browser startup',()=>{
 for(const bad of ['../../traversal','', '.hidden','slash/name','x'.repeat(70)]){
  const x=evaluate({GC_PLAYWRIGHT_RUN_ID:bad});
  assert.notEqual(x.status,0,bad);
  assert.match(x.stderr,/GC_PLAYWRIGHT_RUN_ID/);
 }
 const invalid=evaluate({GC_PLAYWRIGHT_PORT:'0'});
 assert.notEqual(invalid.status,0);
 assert.match(invalid.stderr,/GC_PLAYWRIGHT_PORT/);
});
test('legacy single-suite Playwright behavior remains unchanged without opt-in run ID',()=>{
 const result=evaluate({GC_PLAYWRIGHT_PORT:'4173',GC_PLAYWRIGHT_RUN_ID:undefined});
 assert.equal(result.status,0,result.stderr);
 const conf=JSON.parse(result.stdout);
 assert.equal(conf.outputDir,'./test-results');
 assert.equal(conf.baseURL,'http://127.0.0.1:4173');
});
