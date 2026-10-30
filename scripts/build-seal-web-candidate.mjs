#!/usr/bin/env node
/** Deterministic, unpublished GC UI web-control Seal qualification artifact.
 * This is NOT the stable Foundations package or a lifecycle approval. */
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const out=join(root,'dist','gc-ui-seal-web');
const version='0.2.0-seal.0';
const source=name=>readFileSync(join(root,name),'utf8');
const rootPkg=JSON.parse(source('package.json'));
if(rootPkg.version!=='0.2.0-alpha.1'||rootPkg.private!==true)
 throw Error('Source version/private state changed; review Seal scope before staging');
if(rootPkg.license!=='Apache-2.0')throw Error('License changed; review before staging');
const baseTypes=source('types/index.d.ts');
const section=(start,end)=>{
 const from=baseTypes.indexOf(start);
 const until=baseTypes.indexOf(end,from);
 if(from<0||until<0||until<=from)throw Error('Type contract changed: '+start);
 return baseTypes.slice(from,until);
};
const types=[
 '/** Unpublished GC UI browser controls Seal qualification candidate; not a stable API. */',
 section('export type GCAppearance','/** GC UI experimental product suggestions'),
 section('export declare function generateTheme','export interface GCTabController'),
 section('export interface GCTabController','/** Experimental native form controllers'),
 baseTypes.slice(baseTypes.indexOf('/** Experimental opt-in native HTML pattern controllers. */'))
].join('\n').replace("GC_UI_VERSION:'0.2.0-alpha.1'","GC_UI_VERSION:'"+version+"'");
if(!types.includes("GC_UI_VERSION:'"+version+"'")||
   !types.includes('initChoiceChips')||!types.includes('createToast'))
 throw Error('Missing candidate public type contract');
const entry=[
 '/** Deliberately bounded, experimental browser-only qualification entrypoint. */',
 "export {generateTheme,contrastRatio} from './gc-color-engine.mjs';",
 "export {GC_THEME_DEFAULTS,normalizeTheme,resolveTheme,createThemeController} from './gc-theme-runtime.mjs';",
 "export {nextTabIndex,initTabs,initDialog,createToast,runAsyncAction} from './gc-interactions.mjs';",
 "export {nextMenuIndex,initMenu} from './gc-menu.mjs';",
 "export {initChoiceChips,initDisclosureGroup} from './gc-patterns.mjs';",
 "export const GC_UI_VERSION='"+version+"';",
 ''
].join('\n');
const pkg={
 name:'@goreecloud/gc-ui',version,private:true,
 description:'GC UI experimental web controls — unpublished Seal qualification candidate',
 license:'Apache-2.0',type:'module',engines:{node:'>=20'},
 sideEffects:['./styles/*.css'],
 exports:{
  '.':{types:'./types/index.d.ts',import:'./src/index.mjs'},
  './tokens':'./tokens/gc.v1.tokens.json',
  './css/tokens':'./styles/gc.v1.generated.css',
  './css/components':'./styles/gc.v1.components.css',
  './css/palettes':'./styles/gc.v1.product-palettes.css'
 },
 types:'./types/index.d.ts',
 files:['src','styles','tokens','types','README.md','LICENSE','provenance.json']
};
const files=[
 ...[
  'src/gc-color-engine.mjs','src/gc-theme-runtime.mjs',
  'src/gc-interactions.mjs','src/gc-menu.mjs','src/gc-patterns.mjs',
  'styles/gc.v1.generated.css','styles/gc.v1.components.css',
  'styles/gc.v1.product-palettes.css','tokens/gc.v1.tokens.json',
  'LICENSE'
 ].map(path=>[path,source(path)]),
 ['src/index.mjs',entry],
 ['types/index.d.ts',types],
 ['README.md',source('release/seal/README.md')],
 ['package.json',JSON.stringify(pkg,null,2)+'\n']
];
const sha=content=>createHash('sha256').update(content).digest('hex');
const digests=Object.fromEntries(files.map(([name,value])=>[name,sha(value)]));
files.push(['provenance.json',JSON.stringify({
 schema:'gc-ui-seal-web-provenance.v1',
 candidateVersion:version,sourceRepository:'GoreeCloud/gc-ui',
 intendedStage:'Seal qualification only',
 status:'unpublished, unapproved, experimental',
 supportedRuntime:'browser DOM; Chromium/Firefox automated reference suite',
 exclusions:['native application distribution','consumer migration','stable API or WCAG certification'],
 files:digests
},null,2)+'\n']);
rmSync(out,{recursive:true,force:true});
for(const [name,content] of files){
 const target=join(out,name);
 mkdirSync(dirname(target),{recursive:true});
 writeFileSync(target,content);
}
console.log('Staged '+files.length+' allowlisted Seal web candidate files (no publish, no tag).');
