#!/usr/bin/env node
/** Stage a deliberately small GC UI Foundations candidate. No publish or tag. */
import {readFileSync,writeFileSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const output=join(root,'dist','gc-ui-foundations');
const VERSION='1.0.0-rc.1';
const contract=[
 ['src/gc-color-engine.mjs','src/gc-color-engine.mjs'],
 ['src/gc-theme-runtime.mjs','src/gc-theme-runtime.mjs'],
 ['tokens/gc.v1.tokens.json','tokens/gc.v1.tokens.json'],
 ['styles/gc.v1.generated.css','styles/gc.v1.generated.css'],
 ['release/foundations/README.md','README.md']
];
const source=(name)=>readFileSync(join(root,name),'utf8');
const check=process.argv.includes('--check');
if(process.argv.some(arg=>arg.startsWith('--')&&arg!=='--check'))
 throw new TypeError('Only --check supported');
const types=source('types/index.d.ts').split('export interface GCTabController')[0]
 .replace("GC_UI_VERSION:'0.2.0-alpha.1'","GC_UI_VERSION:'"+VERSION+"'")
 .replace('GC UI experimental web API: signatures may change before stable 1.0.',
          'GC UI Foundations release candidate: deliberately narrow scope.');
if(!types.includes("GC_UI_VERSION:'"+VERSION+"'")||!types.includes('createThemeController'))
 throw new Error('Type source drift; review necessary');
const entry="/** GC UI Foundations v1 RC — deliberately restricted API. */\n"+
 "export {generateTheme,contrastRatio} from './gc-color-engine.mjs';\n"+
 "export {GC_THEME_DEFAULTS,normalizeTheme,resolveTheme,createThemeController} from './gc-theme-runtime.mjs';\n"+
 "export const GC_UI_VERSION='"+VERSION+"';\n";
const pkg={
 name:'@goreecloud/gc-ui',version:VERSION,
 description:'GC UI Foundations — original semantic tokens and accessible theme/color runtime (release candidate)',
 type:'module',private:true,license:'UNLICENSED',
 engines:{node:'>=20'},sideEffects:['./styles/*.css'],
 exports:{
  '.':{types:'./types/index.d.ts',import:'./src/index.mjs'},
  './tokens':'./tokens/gc.v1.tokens.json',
  './css/tokens':'./styles/gc.v1.generated.css'
 },
 types:'./types/index.d.ts',
 files:['src','types','tokens','styles','README.md','provenance.json']
};
const files=[
 ...contract.map(([from,to])=>[to,source(from)]),
 ['src/index.mjs',entry],
 ['types/index.d.ts',types],
 ['package.json',JSON.stringify(pkg,null,2)+'\n']
];
const digests=Object.fromEntries(files.map(([name,value])=>[
 name,createHash('sha256').update(value).digest('hex')
]));
files.push(['provenance.json',JSON.stringify({
 schema:'gc-ui-foundations-provenance.v1',releaseCandidate:VERSION,
 sourceRepository:'GoreeCloud/gc-ui',status:'candidate only; not published',
 files:digests
},null,2)+'\n']);
if(check){
 for(const [name,value] of files){
  const path=join(output,name);
  if(!existsSync(path)||readFileSync(path,'utf8')!==value)
   throw new Error('Foundations staged drift: '+name);
 }
 console.log('Foundations candidate agrees with '+files.length+' generated files.');
}else{
 rmSync(output,{recursive:true,force:true});
 for(const [name,value] of files){
  const path=join(output,name);
  mkdirSync(dirname(path),{recursive:true});
  writeFileSync(path,value);
 }
 console.log('Staged '+VERSION+' in dist/gc-ui-foundations; no publish/tag performed.');
}
