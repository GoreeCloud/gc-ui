#!/usr/bin/env node
/** Prevent old design-authority source and assets from entering GC UI. */
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,join,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {pathToFileURL} from 'node:url';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const sourceDirectories=[
 'src','styles','tokens','assets','lab','native','integrations','registry','release','types'
];
const sourceFiles=['index.html','package.json'];
const textExtensions=new Set(['.js','.mjs','.cjs','.ts','.css','.html','.svg','.json','.md','.kt','.xml','.gradle','.txt','.yml','.yaml']);
const ignoredDirectories=new Set(['node_modules','.git','dist','build','.gradle','.idea','.venv','out','test-results']);

// Deliberately restrict this check to source/runtime/package surfaces. Archived
// governance references, historical changelogs, and migration documentation may
// name the predecessor accurately. Do not erase origin or licensing evidence.
export function findPredecessorReference(value){
 return /(?:\bglaze(?:[\s_-]+ui)?\b|\bglz[A-Z][a-zA-Z]*\b|--glz[-\w]*\b)/i.test(value);
}
function collect(folder){
 const entries=readdirSync(folder,{withFileTypes:true});
 const result=[];
 for(const entry of entries){
  const file=join(folder,entry.name);
  if(entry.isDirectory()){
   if(!ignoredDirectories.has(entry.name))result.push(...collect(file));
  }else if(entry.isFile() && textExtensions.has(extname(entry.name).toLowerCase())){
   result.push(file);
  }
 }
 return result;
}
export function checkDesignAuthority(){
 const manifest=JSON.parse(readFileSync(join(root,'registry/design-authority.v1.json'),'utf8'));
 const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
 if(manifest.schema!=='gc-ui-design-succession.v1'||
    manifest.authority.successor!=='GoreeCloud UI'||
    manifest.authority.successorRepository!=='GoreeCloud/gc-ui'||
    manifest.authority.successorPackage!==pkg.name||
    manifest.verified.currentSourceVersion!==pkg.version||
    manifest.authority.outcome!=='exclusive-permanent-replacement'||
    manifest.authority.newPredecessorDependenciesAllowed!==false||
    manifest.authority.legacyNameAsNewBrandAllowed!==false){
  throw new Error('GC UI authority registry is inconsistent with owner decision or package');
 }
 if(manifest.verified.exclusiveCutoverCompleted &&
    (!manifest.verified.governanceDocumentsAmended||
     !manifest.verified.allConsumerMigrationsVerified||
     !manifest.verified.predecessorRepositoriesRetired)){
  throw new Error('Cannot claim full design-system cutover without verified migration gates');
 }
 const paths=[
  ...sourceDirectories.flatMap(dir=>collect(join(root,dir))),
  ...sourceFiles.map(file=>join(root,file))
 ];
 const violations=[];
 for(const file of paths){
  if(relative(root,file)==='registry/design-authority.v1.json')continue;
  const value=readFileSync(file,'utf8');
  if(findPredecessorReference(value))violations.push(relative(root,file));
 }
 if(violations.length)
  throw new Error('Legacy design authority content is forbidden in active GC UI source: '+violations.join(', '));
 return paths.length;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const count=checkDesignAuthority();
 console.log('GC UI exclusive-succession guard passed: '+count+' implementation, asset and package files checked; no predecessor imports or branded runtime surfaces.');
}
