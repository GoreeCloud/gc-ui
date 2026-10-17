/**
 * Conservative Lens contrast audit for the current static GC UI material contract.
 *
 * A translucent Lens may cover a photograph or any other backdrop. Checking
 * both black and white *under* its sRGB alpha mix bounds contrast for every
 * opaque sRGB backdrop, including arbitrary images and blurred composites.
 * This tests flat foreground roles, not glyph rasterization, focus rings,
 * filters outside the Lens, blend modes, or platform compositor fidelity.
 */
import {readFileSync} from 'node:fs';
import {generateTheme} from '../src/gc-color-engine.mjs';

const css=readFileSync(new URL('../styles/gc.v1.materials.css',import.meta.url),'utf8');
const tokens=JSON.parse(readFileSync(new URL('../tokens/gc.v1.tokens.json',import.meta.url),'utf8'));
const lensRule=css.match(/\.gc-material-surface\[data-gc-treatment=lens\]\s*\{([^}]+)\}/)?.[1];
if(!lensRule)throw new Error('Lens material CSS rule missing');
const alphaMatch=lensRule.match(/background:\s*color-mix\(in srgb,\s*var\(--gc-v1-color-surface\)\s+([\d.]+)%,\s*transparent\s*\)/);
if(!alphaMatch)throw new Error('Lens no longer uses the audited opaque surface/transparent sRGB mix');
const alpha=Number(alphaMatch[1])/100;
if(!(alpha>0&&alpha<1))throw new Error('Expected a partially transparent Lens background');
if(!/--gc-v1-color-on-surface-muted:\s*var\(--gc-v1-color-on-surface\)/.test(lensRule))
 throw new Error('Lens secondary text must use the audited strong on-surface foreground role');

const rgb=hex=>{
 if(!/^#[\da-f]{6}$/i.test(hex))throw new TypeError('Non-opaque role: '+hex);
 return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
};
const luminance=values=>values.reduce((sum,value,i)=>{
 const s=value/255,linear=s<=0.04045?s/12.92:((s+0.055)/1.055)**2.4;
 return sum+linear*[0.2126,0.7152,0.0722][i];
},0);
const ratio=(a,b)=>{
 const [x,y]=[luminance(a),luminance(b)].sort((m,n)=>m-n);
 return (y+0.05)/(x+0.05);
};
const blend=(front,back)=>front.map((v,i)=>alpha*v+(1-alpha)*back[i]);
const failures=[];
let checks=0,schemes=0,minRatio=Infinity,minimum=null;
function audit(name,roles){
 const fg=rgb(roles.onSurface),surface=rgb(roles.surface);
 // The Lens's scoped muted alias intentionally resolves to onSurface.
 // Two endpoints are sufficient: luminance is monotonic in each channel.
 for(const [backdrop,back] of [['black',[0,0,0]],['white',[255,255,255]]]){
  const bg=blend(surface,back),value=ratio(fg,bg);
  checks++;
  if(value<minRatio){minRatio=value;minimum={name,backdrop,ratio:+value.toFixed(3)}}
  if(value<4.5)failures.push({name,backdrop,ratio:+value.toFixed(3)});
 }
 schemes++;
}
const rolesFrom=values=>Object.fromEntries(Object.entries(values).map(([key,value])=>[key,value.$value]));
for(const mode of ['light','dark']){
 audit('default '+mode,rolesFrom(tokens.color[mode]));
 audit('high-contrast '+mode,rolesFrom(tokens.color.highContrast[mode]));
 for(let i=0;i<361;i++){
  const seed='#'+((i*68321)&0xffffff).toString(16).padStart(6,'0');
  audit(seed+' '+mode,generateTheme(seed,mode).roles);
 }
}
console.log(JSON.stringify({name:'GC UI translucent Lens worst-backdrop contrast',lensAlpha:alpha,schemes,backdropChecks:checks,minimum,failed:failures.length,examples:failures.slice(0,12),scope:'onSurface and Lens-scoped secondary text; arbitrary opaque sRGB backdrop endpoints, not a rendered image/accessibility certification'},null,2));
if(failures.length)process.exitCode=1;
