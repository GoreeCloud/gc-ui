/**
 * GC UI reproducible contrast audit.
 * Opaque semantic pairs only. This is not a composite Lens or screen-reader audit.
 */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {generateTheme,contrastRatio} from '../src/gc-color-engine.mjs';

const tokens=JSON.parse(readFileSync(new URL('../tokens/gc.v1.tokens.json',import.meta.url),'utf8'));
const assertColor=(color,label)=>{
 if(typeof color!=='string'||!/^#[\da-fA-F]{6}$/.test(color))throw new Error(label+' is not an opaque hex color');
};
const textPairs=[
 ['primary','onPrimary'],['primaryContainer','onPrimaryContainer'],
 ['secondary','onSecondary'],['secondaryContainer','onSecondaryContainer'],
 ['tertiary','onTertiary'],['tertiaryContainer','onTertiaryContainer'],
 ['canvas','onCanvas'],['surface','onSurface'],['surface','onSurfaceMuted'],
 ['selection','onSelection'],['inverseSurface','inverseOnSurface']
];
const highBoundaryPairs=['outline','outlineStrong','divider','focusRing'];
let checks=0,schemes=0;
const failures=[];
function check(bg,fg,label,min=4.5){
 assertColor(bg,label+' background');assertColor(fg,label+' foreground');
 const ratio=contrastRatio(bg,fg);
 checks++;
 if(ratio<min)failures.push({label,ratio:+ratio.toFixed(2),required:min});
}
for(let i=0;i<361;i++){
 const seed='#'+((i*68321)&0xffffff).toString(16).padStart(6,'0');
 for(const mode of ['light','dark']){
  const {roles}=generateTheme(seed,mode);
  for(const [name,value] of Object.entries(roles))assertColor(value,seed+' '+mode+' '+name);
  for(const [bg,fg] of textPairs)check(roles[bg],roles[fg],seed+' '+mode+' '+fg+' on '+bg);
  schemes++;
 }
}
for(const mode of ['light','dark']){
 const high=tokens.color.highContrast[mode];
 const scheme=Object.fromEntries(Object.entries(high).map(([name,v])=>[name,v.$value]));
 for(const [bg,fg] of textPairs)check(scheme[bg],scheme[fg],'high-contrast '+mode+' '+fg+' on '+bg);
 for(const role of highBoundaryPairs)check(scheme.surface,scheme[role],'high-contrast '+mode+' '+role,3);
}
for(const [name,accent] of Object.entries(tokens.color.accent)){
 for(const mode of ['light','dark']){
  const scheme=accent[mode];
  for(const [bg,fg] of [['primary','onPrimary'],['primaryContainer','onPrimaryContainer']])
   check(scheme[bg].$value,scheme[fg].$value,'curated '+name+' '+mode+' '+fg+' on '+bg);
 }
}
console.log(JSON.stringify({name:'GC UI opaque semantic color audit',generatedSchemes:schemes,pairsChecked:checks,failed:failures.length,examples:failures.slice(0,20)},null,2));
if(failures.length)process.exitCode=1;
