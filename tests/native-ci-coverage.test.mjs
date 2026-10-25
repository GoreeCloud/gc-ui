import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const workflow=readFileSync(new URL('../.github/workflows/native-hosts.yml',import.meta.url),'utf8');
const androidAssets=readFileSync(new URL('../native/android/scripts/sync-web-assets.mjs',import.meta.url),'utf8');

function eventPaths(event){
 const start=workflow.indexOf(`  ${event}:\n`);
 assert.notEqual(start,-1,`Missing native CI ${event} trigger`);
 const end=event==='push'
  ? workflow.indexOf('  pull_request:',start)
  : workflow.indexOf('\npermissions:',start);
 assert.ok(end>start,`Cannot isolate native CI ${event} path filters`);
 const eventBlock=workflow.slice(start,end);
 const pathsBlock=eventBlock.slice(eventBlock.indexOf('    paths:\n')+'    paths:\n'.length);
 return new Set([...pathsBlock.matchAll(/^\s+- '([^']+)'\s*$/gm)].map(match=>match[1]));
}

test('native CI runs for every asset directory packaged into Android and used by desktop',()=>{
 const match=androidAssets.match(/const allow\s*=\s*\[([^\]]+)\]/);
 assert.ok(match,'Android asset directory allowlist must remain discoverable');
 const directories=[...match[1].matchAll(/'([^']+)'/g)].map(result=>result[1]);
 assert.ok(directories.length>0,'Android asset directory allowlist must not be empty');
 for(const event of ['push','pull_request']){
  const paths=eventPaths(event);
  for(const directory of directories){
   assert.ok(paths.has(`${directory}/**`),
    `Native ${event} CI misses Android/Electron source directory ${directory}/**`);
  }
 }
});

test('native CI keeps source, workflow, and host regression triggers',()=>{
 for(const event of ['push','pull_request']){
  const paths=eventPaths(event);
  for(const required of [
   'native/**',
   'e2e/native-host.spec.mjs',
   'tests/native-*.test.mjs',
   'playwright.config.mjs',
   'package.json',
   '.github/workflows/native-hosts.yml'
  ]){
   assert.ok(paths.has(required),`Native ${event} CI is missing ${required}`);
  }
 }
});
