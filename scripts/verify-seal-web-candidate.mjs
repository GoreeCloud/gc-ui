#!/usr/bin/env node
/** Stage, archive, checksum and offline-install Seal web candidate. Never publish. */
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const stage=join(root,'dist','gc-ui-seal-web');
const dest=join(root,'dist','seal-web-verify');
const npm=process.platform==='win32'?'npm.cmd':'npm';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function run(exe,args,cwd=root){
 const p=spawnSync(exe,args,{cwd,encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
 if(p.error||p.status!==0)
  throw Error('Seal candidate command failed: '+exe+' '+args.join(' ')+'\n'+String(p.error||p.stderr||p.stdout).slice(-1500));
 return p.stdout;
}
run(process.execPath,['scripts/build-seal-web-candidate.mjs']);
rmSync(dest,{recursive:true,force:true});mkdirSync(dest,{recursive:true});
const packed=JSON.parse(run(npm,['pack','--json','--ignore-scripts','--pack-destination',dest],stage));
assert.equal(packed.length,1);
const expected=[
 'LICENSE','README.md','package.json','provenance.json',
 'src/index.mjs','src/gc-color-engine.mjs','src/gc-theme-runtime.mjs',
 'src/gc-interactions.mjs','src/gc-menu.mjs','src/gc-patterns.mjs',
 'types/index.d.ts','tokens/gc.v1.tokens.json',
 'styles/gc.v1.generated.css','styles/gc.v1.components.css',
 'styles/gc.v1.product-palettes.css'
];
const contents=packed[0].files.map(x=>x.path).sort();
assert.deepEqual(contents,expected.slice().sort(),'Candidate archive scope drift');
const metadata=JSON.parse(readFileSync(join(stage,'package.json'),'utf8'));
assert.equal(metadata.version,'0.2.0-seal.0');
assert.equal(metadata.name,'@goreecloud/gc-ui');
assert.equal(metadata.private,true);
assert.equal(metadata.license,'Apache-2.0');
assert.deepEqual(Object.keys(metadata.exports).sort(),
 ['./css/components','./css/palettes','./css/tokens','./tokens','.'].sort());
const provenance=JSON.parse(readFileSync(join(stage,'provenance.json'),'utf8'));
assert.equal(provenance.status,'unpublished, unapproved, experimental');
assert.equal(provenance.candidateVersion,metadata.version);
assert.deepEqual(Object.keys(provenance.files).sort(),expected.filter(x=>x!=='provenance.json').sort());
for(const [file,digest] of Object.entries(provenance.files))
 assert.equal(sha(readFileSync(join(stage,file))),digest,'Staged digest drift '+file);
const archive=join(dest,packed[0].filename);
assert.ok(existsSync(archive));
const archiveHash=sha(readFileSync(archive));
writeFileSync(join(dest,'SHA256SUMS'),archiveHash+'  '+packed[0].filename+'\n');
const consumer=join(dest,'consumer');
mkdirSync(consumer,{recursive:true});
writeFileSync(join(consumer,'package.json'),'{"private":true,"type":"module"}\n');
run(npm,['install',archive,'--offline','--no-save','--ignore-scripts','--no-audit','--no-fund'],consumer);
const installed=join(consumer,'node_modules','@goreecloud','gc-ui');
for(const [file,digest] of Object.entries(provenance.files))
 assert.equal(sha(readFileSync(join(installed,file))),digest,'Installed digest drift '+file);
const smoke=[
 "import assert from 'node:assert/strict';",
 "import {readFileSync} from 'node:fs';",
 "import * as gc from '@goreecloud/gc-ui';",
 "import tokens from '@goreecloud/gc-ui/tokens' with {type:'json'};",
 "const wanted=['GC_UI_VERSION','GC_THEME_DEFAULTS','generateTheme','contrastRatio','normalizeTheme','resolveTheme','createThemeController','nextTabIndex','initTabs','initDialog','createToast','runAsyncAction','nextMenuIndex','initMenu','initChoiceChips','initDisclosureGroup'];",
 "assert.deepEqual(Object.keys(gc).sort(),wanted.sort());",
 "assert.equal(gc.GC_UI_VERSION,'0.2.0-seal.0');",
 "assert.equal(gc.nextTabIndex('ArrowRight',0,3),1);",
 "assert.equal(gc.nextMenuIndex('ArrowDown',0,3),1);",
 "assert.equal(tokens.color.light.canvas.$value.startsWith('#'),true);",
 "assert.ok(gc.contrastRatio('#111827','#F9FAFB')>=4.5);",
 "assert.equal(gc.resolveTheme({contrast:'high'},{forcedColors:true}).material,'solid');",
 "const props=new Map();",
 "const root={dataset:{},style:{getPropertyValue:k=>props.get(k)||'',getPropertyPriority:()=>'',setProperty:(k,v)=>props.set(k,v),removeProperty:k=>props.delete(k)}};",
 "const ctl=gc.createThemeController({root,storage:null,media:()=>null});",
 "assert.equal(props.get('--gc-v1-color-primary'),'#374151');",
 "ctl.destroy();assert.equal(props.size,0);",
 "for(const name of ['gc.v1.generated.css','gc.v1.components.css','gc.v1.product-palettes.css']){",
 " const css=readFileSync(new URL('./node_modules/@goreecloud/gc-ui/styles/'+name,import.meta.url),'utf8');",
 " assert.ok(css.includes('gc-v1-color'),'missing tokens '+name);",
 "}",
 "console.log('Installed Seal web candidate smoke PASS');"
].join('\n')+'\n';
const script=join(consumer,'smoke.mjs');writeFileSync(script,smoke);
assert.match(run(process.execPath,[script],consumer),/smoke PASS/);
const blocked=spawnSync(process.execPath,['--input-type=module','--eval',
 "import('@goreecloud/gc-ui/native/host-client')"],{cwd:consumer,encoding:'utf8',timeout:5000});
assert.notEqual(blocked.status,0,'Unshipped native host unexpectedly public');
assert.match(blocked.stderr,/ERR_PACKAGE_PATH_NOT_EXPORTED/);
writeFileSync(join(consumer,'typecheck.ts'),[
 "import {GC_UI_VERSION,generateTheme,initTabs,initMenu,createToast,initChoiceChips,initDisclosureGroup,type GCToastController,type GCChoiceChipsController} from '@goreecloud/gc-ui';",
 "const version:'0.2.0-seal.0'=GC_UI_VERSION;",
 "const scheme=generateTheme('#3978D3','light');",
 "let toast:GCToastController=createToast(document.createElement('div'));",
 "toast.show('message',{duration:0});toast.destroy();",
 "const chips:GCChoiceChipsController=initChoiceChips(document.createElement('div'));",
 "chips.select('example',{focus:false});chips.destroy();",
 "void [version,scheme,initTabs,initMenu,initDisclosureGroup];",
 "// @ts-expect-error explicitly unshipped native host API",
 "import {createNativeHostClient} from '@goreecloud/gc-ui';"
].join('\n')+'\n');
writeFileSync(join(consumer,'tsconfig.json'),JSON.stringify({compilerOptions:{
 module:'NodeNext',moduleResolution:'NodeNext',target:'ES2022',lib:['ES2022','DOM'],strict:true,noEmit:true,skipLibCheck:false
},files:['typecheck.ts']},null,2)+'\n');
assert.equal(sha(readFileSync(archive)),archiveHash,'Tarball changed after verification');
console.log('Seal web candidate artifact: '+packed[0].filename);
console.log('Archive SHA-256: '+archiveHash);
console.log('PASS: '+expected.length+' exact files, SHA-256 provenance, offline installed imports, CSS, restricted native API.');
console.log('NOT a Seal lifecycle approval, stable release, npm publication or native package.');
