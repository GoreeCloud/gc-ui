#!/usr/bin/env node
/**
 * Read-only legacy design consumer auditor.
 *
 * Explicit --root required. No repository mutations, no network, no
 * executable evaluation, no source text excerpts, no automatic rewriting.
 * Negative results mean "no detected evidence in scanned text", never proof
 * of a migrated or GC UI-conformant application.
 */
import {lstatSync,readdirSync,readFileSync,realpathSync} from 'node:fs';
import {resolve,relative,join,extname} from 'node:path';
import {pathToFileURL} from 'node:url';

const TEXT_EXTENSIONS=new Set([
 '.css','.scss','.sass','.less','.js','.jsx','.mjs','.cjs','.ts','.tsx',
 '.vue','.svelte','.html','.htm','.json','.jsonc','.yaml','.yml','.toml',
 '.gradle','.kt','.kts','.java','.swift','.xml','.plist','.properties',
 '.dart','.py','.rs','.go','.sh','.md','.mdx','.txt'
]);
const TEXT_BASENAMES=new Set(['Dockerfile','Podfile','Gemfile','Makefile','gradle.properties']);
const IGNORED_DIRS=new Set([
 '.git','.svn','.hg','node_modules','.next','.nuxt','dist','build','out',
 'coverage','test-results','playwright-report','.gradle','.idea','.venv',
 'venv','vendor','target','__pycache__','.cache'
]);
const MAX_FILES=10000, MAX_SIZE=1024*1024, MAX_BYTES=24*1024*1024, MAX_DEPTH=24;
const PREDECESSOR=/\bglaze(?:[\s_-]*ui)?\b|\bglz[A-Z][A-Za-z0-9]*\b|--(?:glz|glaze)[-\w]*\b/i;
const DEPENDENCY=/(?:^|[^\w])@goreecloud\/glaze(?:-ui)?\b|\b(?:com\.)?goreecloud\.glaze\b|\bglaze-ui\b/i;
const IMPORT=/(?:\b(?:import|export|from|require|load|include)\b|@import\b|@use\b).{0,220}\bglaze\b/i;
const TOKEN=/--(?:glaze|glz)[-\w]+\b|\$glaze[-_\w]+|\bGlz[A-Z]\w*(?:Color|Token|Theme)?\b/i;
const COMPONENT=/<\/?(?:glaze[-:]|glz[A-Z])|(?:^|[\s"'./])(?:glaze|glz)-(?:button|field|card|dialog|component|surface|lens|badge|icon|nav|menu)[-\w]*/i;
const ASSET=/(?:url\s*\(|\b(?:src|href|assets?|icons?|stylesheet|styles?)\s*[:=(])[^;\n]{0,200}\bglaze\b/i;
const DOCUMENTATION=/\.(?:md|mdx|txt)$/i;
// Dated acceptance/evidence records preserve provenance. Only non-executable
// document formats in these top-level directories are historical; executable
// scripts/source under the same directory still require normal scrutiny.
const HISTORICAL_RECORD=/^(?:acceptance|evidence)\/.*\.(?:json|ya?ml|md|mdx|txt)$/i;

function isText(filename){
 return TEXT_EXTENSIONS.has(extname(filename).toLowerCase())||
  TEXT_BASENAMES.has(filename)||/^(?:\.?env\.example|\.gitignore)$/.test(filename);
}
function semanticType(path,line){
 if(HISTORICAL_RECORD.test(path))return 'historical-acceptance-or-evidence';
 if(DOCUMENTATION.test(path)){
  return DEPENDENCY.test(line) || IMPORT.test(line) || TOKEN.test(line)?
   'documentation-migration-reference':'historical-or-documentation-mention';
 }
 if(DEPENDENCY.test(line))return 'legacy-package-or-namespace';
 if(IMPORT.test(line))return 'legacy-import-or-reexport';
 if(TOKEN.test(line))return 'legacy-token-or-identifier';
 if(COMPONENT.test(line))return 'legacy-component';
 if(ASSET.test(line))return 'legacy-asset';
 return 'unclassified-source-reference';
}
function resultStatus(issues,incomplete,filesScanned){
 if(incomplete.length || filesScanned===0)return 'incomplete';
 if(issues.some(x=>x.severity==='active'))return 'legacy-dependency-evidence';
 if(issues.some(x=>x.severity==='review'))return 'manual-review-required';
 return 'no-legacy-evidence-detected';
}
/**
 * Explicit bounded single-repository audit. Does NOT traverse symlinks.
 * Returned paths are relative; no source content or full absolute paths.
 */
export function auditConsumer(root,{maxFiles=MAX_FILES,maxSize=MAX_SIZE,maxBytes=MAX_BYTES}={}){
 if(typeof root!=='string'||!root.trim())throw new TypeError('Explicit --root is required');
 const requested=resolve(root);
 if(!lstatSync(requested).isDirectory())throw new TypeError('Root must be an actual directory, not a symlink');
 const canonical=realpathSync(requested);
 if(canonical!==requested)throw new TypeError('Root resolves through a symlink; use its canonical path');
 const stack=[{dir:canonical,depth:0}];
 const issues=[],incomplete=[],counts={files:0,bytes:0,skippedDirectories:0,skippedSymlinks:0};
 let stop=false;
 while(stack.length && !stop){
  const {dir,depth}=stack.pop();
  if(depth>MAX_DEPTH){incomplete.push({reason:'max-depth',path:relative(canonical,dir)||'.'});continue;}
  const entries=readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name));
  for(const entry of entries){
   const file=join(dir,entry.name),path=relative(canonical,file).split('\\').join('/');
   if(entry.isSymbolicLink()){
    counts.skippedSymlinks++;incomplete.push({reason:'symlink-skipped',path});continue;
   }
   if(entry.isDirectory()){
    if(IGNORED_DIRS.has(entry.name)){counts.skippedDirectories++;continue;}
    if(PREDECESSOR.test(entry.name))issues.push({path,line:0,type:'legacy-directory',severity:path.startsWith('docs/')?'informational':'active'});
    stack.push({dir:file,depth:depth+1});continue;
   }
   if(!entry.isFile())continue;
   if(PREDECESSOR.test(entry.name))issues.push({path,line:0,type:'legacy-filename',severity:DOCUMENTATION.test(path)||HISTORICAL_RECORD.test(path)?'informational':'active'});
   if(!isText(entry.name))continue;
   if(counts.files>=maxFiles){incomplete.push({reason:'max-files',path});stop=true;break;}
   const size=lstatSync(file).size;
   if(size>maxSize){incomplete.push({reason:'oversized-text-file',path});continue;}
   if(counts.bytes+size>maxBytes){incomplete.push({reason:'max-total-bytes',path});stop=true;break;}
   counts.files++;counts.bytes+=size;
   const text=readFileSync(file,'utf8');
   // Treat embedded binary/NUL as unknown rather than claiming it was cleared.
   if(text.includes('\0')){incomplete.push({reason:'binary-content-in-text-file',path});continue;}
   const lines=text.split(/\r?\n/);
   for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(!PREDECESSOR.test(line))continue;
    const type=semanticType(path,line);
    const severity=['historical-or-documentation-mention','historical-acceptance-or-evidence'].includes(type)?'informational':
      type==='documentation-migration-reference'||type==='unclassified-source-reference'?'review':'active';
    issues.push({path,line:i+1,type,severity});
   }
  }
 }
 issues.sort((a,b)=>a.path.localeCompare(b.path)||a.line-b.line||a.type.localeCompare(b.type));
 incomplete.sort((a,b)=>a.path.localeCompare(b.path));
 return {
  schema:'gc-ui-consumer-audit.v1',
  reportType:'read-only-static-evidence',
  status:resultStatus(issues,incomplete,counts.files),
  // A true cutover needs rendered, behavioral, a11y and release verification as well.
  consumerConformant:false,
  migrationComplete:false,
  sourceChanged:false,
  scan:{filesScanned:counts.files,bytesScanned:counts.bytes,
   skippedIgnoredDirectories:counts.skippedDirectories,skippedSymlinks:counts.skippedSymlinks,
   limits:{maxFiles,maxSize,maxBytes,maxDepth:MAX_DEPTH}},
  totals:{
   active:issues.filter(x=>x.severity==='active').length,
   review:issues.filter(x=>x.severity==='review').length,
   informational:issues.filter(x=>x.severity==='informational').length,
   incomplete:incomplete.length
  },
  findings:issues,incomplete
 };
}
function usage(){
 return 'Usage: node scripts/audit-legacy-consumer.mjs --root /canonical/authorized/repository [--json] [--strict]\n'+
  'Read-only. Strict exits 2 for active/review references, 3 for incomplete scans, 0 for no detected dependencies.\n';
}
export function parseArguments(argv){
 const result={json:false,strict:false,root:null};
 for(let i=0;i<argv.length;i++){
  const arg=argv[i];
  if(arg==='--root'){if(result.root||!argv[i+1])throw new TypeError('A single --root path is required');result.root=argv[++i];}
  else if(arg==='--json')result.json=true;
  else if(arg==='--strict')result.strict=true;
  else if(arg==='--help')result.help=true;
  else throw new TypeError('Unrecognized option: '+arg);
 }
 if(!result.help&&!result.root)throw new TypeError('Missing explicit --root path');
 return result;
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 try{
  const args=parseArguments(process.argv.slice(2));
  if(args.help){process.stdout.write(usage());process.exit(0);}
  const report=auditConsumer(args.root);
  if(args.json)process.stdout.write(JSON.stringify(report,null,2)+'\n');
  else process.stdout.write(
   'GC UI legacy consumer audit: '+report.status+'; '+report.scan.filesScanned+' files; '+
   report.totals.active+' active, '+report.totals.review+' review, '+
   report.totals.informational+' historical, '+report.totals.incomplete+' uninspected.\n'+
   report.findings.map(x=>x.severity+' '+x.path+':'+x.line+' ('+x.type+')').join('\n')+'\n');
  if(args.strict)process.exitCode=report.status==='incomplete'?3:
    report.status==='no-legacy-evidence-detected'?0:2;
 }catch(err){process.stderr.write('Audit refused: '+err.message+'\n'+usage());process.exitCode=4;}
}
