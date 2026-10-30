import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const insideRoot=path=>path.startsWith(root+sep);
for(const page of ['lab/v1.html','lab/components.html','lab/catalog.html','lab/adaptive.html','lab/forms.html','lab/workflow.html','lab/environment.html','lab/icon-atlas.html','lab/pattern-workbench.html','lab/motion-gallery.html','lab/experience-studio.html']){
 const documentPath=resolve(root,page);
 const html=readFileSync(documentPath,'utf8');
 const refs=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match=>match[1]);
 for(const ref of refs){
  if(ref.startsWith('#')||/^(?:https?:|data:|mailto:)/.test(ref))continue;
  const target=resolve(dirname(documentPath),ref.split(/[?#]/)[0]);
  if(!insideRoot(target)||!existsSync(target))throw new Error(page+': unresolved or unsafe '+ref);
 }
 for(const match of html.matchAll(/<use\b[^>]*\bhref="([^"]+)"/g)){
  const reference=match[1];
  const index=reference.indexOf('#');
  if(index<0)throw new Error(page+': SVG use is missing a symbol fragment '+reference);
  const target=reference.slice(0,index),symbol=reference.slice(index+1);
  if(!/^[A-Za-z_][\w.-]*$/.test(symbol))throw new Error(page+': unsafe SVG symbol identifier '+symbol);
  const svg=target?resolve(dirname(documentPath),target):documentPath;
  if(!insideRoot(svg)||!existsSync(svg))throw new Error(page+': missing SVG sprite '+target);
  if(!readFileSync(svg,'utf8').includes('id="'+symbol+'"'))
   throw new Error(page+': missing SVG symbol #'+symbol);
 }
 console.log(page+': local assets and SVG symbols resolved');
}
