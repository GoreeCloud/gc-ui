#!/usr/bin/env node
/** Cross-platform pinned Electron host prerequisites, not a signed installer. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync,lstatSync} from 'node:fs';
import {join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const desktop=join(root,'native','desktop');
const p=JSON.parse(readFileSync(join(desktop,'package.json'),'utf8'));
const lock=JSON.parse(readFileSync(join(desktop,'package-lock.json'),'utf8'));
assert.equal(p.private,true,'Preview must remain private');
assert.equal(p.devDependencies.electron,'44.9.0','Electron version drift');
assert.equal(lock.packages['node_modules/electron'].version,p.devDependencies.electron);
assert.equal(lock.packages['node_modules/playwright'].version,p.devDependencies.playwright);
const included=[
 'native/desktop/main.mjs','native/desktop/preload.cjs',
 'native/desktop/host-contract.mjs','native/desktop/local-resource-policy.mjs',
 'lab/experience-studio.html','lab/experience-studio.mjs','lab/experience-studio.css',
 'src/gc-native-host.mjs'
];
for (const name of included){
 const absolute=join(root,...name.split('/'));
 assert.ok(existsSync(absolute),'Desktop resource missing: '+name);
 assert.ok(lstatSync(absolute).isFile(),'Resource is not a regular file: '+name);
 assert.ok(resolve(absolute).startsWith(root+sep),'Resource path escapes repo');
}
const electronPackage=join(desktop,'node_modules','electron','package.json');
assert.ok(existsSync(electronPackage),'Locked Electron runtime not installed');
const actual=JSON.parse(readFileSync(electronPackage,'utf8'));
assert.equal(actual.version,p.devDependencies.electron);
console.log('DESKTOP PORTABILITY PREREQUISITES PASS',JSON.stringify({
 host:process.platform,arch:process.arch,electron:actual.version,
 resourceFiles:included.length,privatePreview:true,signedInstallerProduced:false,
 voiceOverOrNvdaTested:false
}));
