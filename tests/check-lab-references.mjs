import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
for(const page of ['lab/v1.html','lab/components.html']){
 const html=readFileSync(resolve(root,page),'utf8');
 const refs=[...html.matchAll(/(?:href|src)="([^"#]+)"/g)].map(match=>match[1]);
 for(const ref of refs){
  if(/^(?:https?:|data:|mailto:)/.test(ref))continue;
  const path=resolve(dirname(resolve(root,page)),ref.split('?')[0]);
  if(!path.startsWith(root+'/')||!existsSync(path))throw new Error(page+': unresolved or unsafe '+ref);
 }
 console.log(page+': local assets resolved');
}
