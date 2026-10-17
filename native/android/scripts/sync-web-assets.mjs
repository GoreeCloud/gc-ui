/** Copies ONLY public GC UI lab assets to the APK; deterministic on every Gradle preBuild. */
import {cpSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const android=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const repo=resolve(android,'../..');
const output=resolve(android,'app/src/main/assets');
const allow=['lab','src','styles','assets','registry','docs'];
if(!existsSync(resolve(repo,'lab/experience-studio.html')))throw new Error('GC UI Experience Studio source missing');
rmSync(output,{recursive:true,force:true});
mkdirSync(output,{recursive:true});
for(const dir of allow){
 const source=resolve(repo,dir);
 if(!source.startsWith(repo+sep)||!existsSync(source))throw new Error('Missing GC UI source directory '+dir);
 cpSync(source,resolve(output,dir),{recursive:true,filter:path=>
  !/(^|\/)(?:node_modules|test-results|\.git)(\/|$)/.test(path)
 });
}
console.log('GC UI Android: synced public lab sources to APK assets ('+allow.join(', ')+').');
