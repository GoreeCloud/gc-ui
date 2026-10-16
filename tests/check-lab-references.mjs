import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
for(const page of ['lab/v1.html','lab/components.html','lab/catalog.html']){
 const html=readFileSync(resolve(root,page),'utf8');
 const refs=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match=>match[1]);
 for(const ref of refs){
  if(ref.startsWith('#')||/^(?:https?:|data:|mailto:)/.test(ref))continue;
  const path=resolve(dirname(resolve(root,page)),ref.split(/[?#]/)[0]);
  if(!path.startsWith(root+'/')||!existsSync(path))throw new Error(page+': unresolved or unsafe '+ref);
 }
 for(const match of html.matchAll(/<use\\b[^>]*\\bhref="([^"]+)"/g)){
  const reference=match[1];
  const index=reference.indexOf('#');
  if(index<0)throw new Error(page+': SVG use has no symbol '+reference);
  const target=reference.slice(0,index),symbol=reference.slice(index+1);
  const svg=target?resolve(dirname(resolve(root,page)),target):resolve(root,page);
  if(!existsSync(svg))throw new Error(page+': missing SVG sprite '+target);
  if(!new RegExp('\\\\bid="'+symbol.replace(/[.*+?^$()|[\\]{}]/g,'\\\\ console.log(page+': local assets resolved');')+'"').test(readFileSync(svg,'utf8')))
   throw new Error(page+': missing SVG symbol #'+symbol);
 }
 console.log(page+': local assets resolved');
}
