#!/usr/bin/env node
/** End-to-end package verification: stage, npm pack, offline install, import. */
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const destination=join(root,'dist','foundations-verify');
const staging=join(root,'dist','gc-ui-foundations');
const npm=process.platform==='win32'?'npm.cmd':'npm';
const stable=process.argv.includes('--stable');
const releaseVersion=stable?'1.0.0':'1.0.0-rc.1';
function run(bin,args,opts={}){
 const proc=spawnSync(bin,args,{
  cwd:opts.cwd||root,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024,
  ...opts
 });
 if(proc.error||proc.status!==0)
  throw new Error('Candidate verification command failed: '+bin+' '+args.join(' ')+
    '\n'+String(proc.error||proc.stderr||proc.stdout).slice(-1100));
 return proc.stdout;
}
run(process.execPath,['scripts/build-foundations-candidate.mjs',...(stable?['--stable']:[])]);
run(process.execPath,['scripts/build-foundations-candidate.mjs','--check',...(stable?['--stable']:[])]);
rmSync(destination,{recursive:true,force:true});
mkdirSync(destination,{recursive:true});
const pack=JSON.parse(run(npm,['pack','--json','--ignore-scripts','--pack-destination',destination],{cwd:staging}));
assert.equal(pack.length,1);
const tarball=join(destination,pack[0].filename);
assert.ok(existsSync(tarball),'Actual npm tarball was not produced');
const archiveSha256=createHash('sha256').update(readFileSync(tarball)).digest('hex');
writeFileSync(join(destination,'SHA256SUMS'),archiveSha256+'  '+pack[0].filename+'\n');
const expected=[
 'README.md','package.json','provenance.json',
 'src/gc-color-engine.mjs','src/gc-theme-runtime.mjs','src/index.mjs',
 'styles/gc.v1.generated.css','tokens/gc.v1.tokens.json','types/index.d.ts'
];
if(stable)expected.push('LICENSE');
const packed=pack[0].files.map(file=>file.path).sort();
assert.deepEqual(packed,expected.slice().sort(),'Candidate includes extraneous/missing files');
const metadata=JSON.parse(readFileSync(join(staging,'package.json'),'utf8'));
assert.equal(metadata.version,releaseVersion);
assert.equal(metadata.private,!stable,'Invalid release privacy for the selected mode');
assert.equal(metadata.license,stable?'Apache-2.0':'UNLICENSED','Wrong release license');
assert.equal(Object.keys(metadata.exports).length,3,'Unsupported entrypoint exposed');
const provenance=JSON.parse(readFileSync(join(staging,'provenance.json'),'utf8'));
assert.equal(stable?provenance.releaseVersion:provenance.releaseCandidate,metadata.version);
assert.deepEqual(Object.keys(provenance.files).sort(),expected.filter(file=>file!=='provenance.json').sort());
for(const [name,hash] of Object.entries(provenance.files)){
 const content=readFileSync(join(staging,name));
 assert.equal(createHash('sha256').update(content).digest('hex'),hash,
  'Staged source digest mismatch: '+name);
}
const consumer=join(destination,'consumer');
mkdirSync(consumer,{recursive:true});
writeFileSync(join(consumer,'package.json'),JSON.stringify({type:'module',private:true},null,2)+'\n');
run(npm,['install',tarball,'--offline','--no-save','--ignore-scripts','--no-audit','--no-fund'],{cwd:consumer});
const installed=join(consumer,'node_modules','@goreecloud','gc-ui');
for(const [name,hash] of Object.entries(provenance.files)){
 const bytes=readFileSync(join(installed,name));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),hash,
  'Installed Foundations file failed provenance verification: '+name);
}
const script=join(consumer,'test-consumer.mjs');
writeFileSync(script,[
 "import assert from 'node:assert/strict';",
 "import {readFileSync} from 'node:fs';",
 "import * as gc from '@goreecloud/gc-ui';",
 "import tokens from '@goreecloud/gc-ui/tokens' with {type:'json'};",
 "const want=['GC_THEME_DEFAULTS','GC_UI_VERSION','contrastRatio','createThemeController','generateTheme','normalizeTheme','resolveTheme'];",
 "assert.deepEqual(Object.keys(gc).sort(),want.sort());",
 "assert.equal(gc.GC_UI_VERSION,'"+releaseVersion+"');",
 "assert.equal(typeof tokens.color.light.canvas.$value,'string');",
 "const scheme=gc.generateTheme('#3978D3','light');",
 "assert.equal(scheme.algorithm,'gc-oklch-1');",
 "assert.ok(gc.contrastRatio(scheme.roles.primary,scheme.roles.onPrimary)>=4.5);",
 "assert.throws(()=>gc.generateTheme('not-a-seed'));",
 "assert.equal(gc.resolveTheme({material:'translucent'},{forcedColors:true}).material,'solid');",
 "const variables=new Map();",
 "const root={dataset:{},style:{setProperty:(key,value)=>variables.set(key,value),removeProperty:key=>variables.delete(key)},dispatchEvent(){}};",
 "const controller=gc.createThemeController({root,storage:null,media:()=>null});",
 "controller.set({accent:'custom',seed:'#3978D3'});",
 "assert.ok(variables.has('--gc-v1-color-primary'));",
 "controller.destroy();",
 "assert.equal(variables.size,0);",
 "const css=new URL('./node_modules/@goreecloud/gc-ui/styles/gc.v1.generated.css',import.meta.url);",
 "assert.ok(readFileSync(css,'utf8').includes('forced-colors: active'));",
 "console.log('CONSUMER INSTALL PASS: exports, JSON, CSS, color contrast, privacy-safe theme controller');"
].join('\n')+'\n');
const contractSource=readFileSync(join(root,'release','foundations','consumer-contract.ts'),'utf8');
writeFileSync(join(consumer,'typecheck.ts'),stable?contractSource.replace('1.0.0-rc.1','1.0.0'):contractSource);
writeFileSync(join(consumer,'tsconfig.json'),JSON.stringify({
 compilerOptions:{module:'NodeNext',moduleResolution:'NodeNext',target:'ES2022',
  lib:['ES2022','DOM'],strict:true,noEmit:true,skipLibCheck:false},
 files:['typecheck.ts']
},null,2)+'\n');
const result=run(process.execPath,[script],{cwd:consumer});
assert.match(result,/CONSUMER INSTALL PASS/);
const forbidden=spawnSync(process.execPath,['--input-type=module','--eval',
 "import('@goreecloud/gc-ui/native/host-client')"],{cwd:consumer,encoding:'utf8',timeout:5000});
assert.notEqual(forbidden.status,0,'Experimental native subpath must not be importable');
assert.match(forbidden.stderr,/ERR_PACKAGE_PATH_NOT_EXPORTED/);
assert.equal(createHash('sha256').update(readFileSync(tarball)).digest('hex'),archiveSha256,
 'Release artifact changed during verification');
console.log('Foundations archive SHA-256: '+archiveSha256);
console.log(result.trim());
console.log('Foundations '+(stable?'stable':'RC')+' verified: offline tarball installation, '+packed.length+
 ' allowlisted files, restricted imports, SHA-256 provenance; '+pack[0].filename);
