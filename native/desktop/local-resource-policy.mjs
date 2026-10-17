/** Restricts Electron's file:// loader to GC UI's explicit public asset directories.
 * Repo metadata, dotfiles, tests, generated APKs, credentials and node_modules never load.
 */
import {realpathSync,statSync} from 'node:fs';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const DIRECTORIES=Object.freeze(['assets','lab','styles','src','registry','docs']);
const EXTENSIONS=new Set(['.html','.css','.mjs','.js','.json','.svg','.png','.jpg','.jpeg','.webp','.avif','.gif','.ico','.woff','.woff2','.ttf','.txt','.md']);
const under=(path,dir)=>path.startsWith(dir+sep);
export const GC_DESKTOP_CONTENT_SECURITY_POLICY=
 "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
export function isAllowedLocalResource(url,repositoryRoot){
 try{
  const parsed=new URL(url);
  if(parsed.protocol!=='file:'||parsed.username||parsed.password||parsed.search)return false;
  const root=realpathSync(repositoryRoot);
  const candidate=realpathSync(resolve(fileURLToPath(parsed)));
  if(!under(candidate,root)||!statSync(candidate).isFile())return false;
  const relative=candidate.slice(root.length+sep.length).split(sep);
  if(relative.length<2||!DIRECTORIES.includes(relative[0]))return false;
  if(relative.some(part=>part.startsWith('.')||part==='node_modules'||part==='dist'||part==='test-results'))return false;
  return EXTENSIONS.has(extname(candidate).toLowerCase());
 }catch{return false}
}
