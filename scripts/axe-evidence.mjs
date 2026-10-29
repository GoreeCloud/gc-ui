/** Persist complete, source-derived accessibility evidence from passing runs.
 * Automated axe A/AA results are a review input, not WCAG certification.
 */
import {mkdir,readdir,readFile,writeFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolvePlaywrightIsolation} from './playwright-isolation-config.mjs';

const safeName=/^[a-z0-9][a-z0-9-]{0,79}$/;
export function expectedAxeScenarios(source){
 const baseline=source.match(/for\(const name of \[([^\]]+)\]\)/)?.[1];
 const interactive=source.split('const states=[')[1]?.split('];\nfor(const state')[0];
 if(!baseline||!interactive)throw new Error('Cannot locate executable axe scenarios');
 const names=[...(baseline.matchAll(/'([^']+)'/g))].map(x=>x[1])
  .concat([...interactive.matchAll(/^\s*\{name:'([^']+)'/gm)].map(x=>x[1]));
 if(names.some(x=>!safeName.test(x))||new Set(names).size!==names.length)
  throw new Error('Duplicate or invalid accessibility scenario labels');
 return names;
}

export function normalizeIncompleteReason(summary){
 const text=typeof summary==='string'?summary.trim():'';
 return text.replace(/^Fix (?:any|all) of the following:\s*/i,'')
  .replace(/\s+/g,' ').trim()||'No failure summary supplied by axe';
}

export async function retainAxeEvidence(testInfo,report){
 const {scenario,violations,incomplete,rulesPassed}=report??{};
 const root=testInfo?.project?.outputDir;
 if(typeof root!=='string'||!root||!safeName.test(scenario??'')||
    !Array.isArray(violations)||!Array.isArray(incomplete)||
    !Number.isSafeInteger(rulesPassed)||rulesPassed<0)
  throw new TypeError('Invalid Playwright accessibility evidence');
 const folder=resolve(root,'accessibility-review');
 const file=join(folder,scenario+'.json');
 await mkdir(folder,{recursive:true});
 await writeFile(file,JSON.stringify(report,null,2)+'\n');
 await testInfo.attach('axe-'+scenario+'-review.json',{path:file,contentType:'application/json'});
 return file;
}

export async function verifyAxeEvidence(folder,names,{revision=null}={}){
 if(!Array.isArray(names)||!names.length||names.some(x=>!safeName.test(x))||
    new Set(names).size!==names.length)throw new TypeError('Invalid expected accessibility inventory');
 const found=await readdir(folder);
 const expected=names.map(x=>x+'.json');
 const missing=expected.filter(x=>!found.includes(x));
 const extra=found.filter(x=>x.endsWith('.json')&&x!=='manifest.json'&&!expected.includes(x));
 if(missing.length||extra.length)
  throw new Error('Accessibility evidence mismatch: missing='+missing.join(',')+' unexpected='+extra.join(','));
 const reports=[],incompleteByRule=new Map(),incompleteByReason=new Map();
 for(const scenario of names){
  const bytes=await readFile(join(folder,scenario+'.json'));
  let data;
  try{data=JSON.parse(bytes.toString('utf8'))}catch{throw new Error('Invalid accessibility report JSON: '+scenario)}
  if(data.scenario!==scenario||!Array.isArray(data.violations)||
     !Array.isArray(data.incomplete)||!Number.isSafeInteger(data.rulesPassed)||
     data.rulesPassed<0)throw new Error('Malformed accessibility report: '+scenario);
  if(data.violations.length)throw new Error('Unresolved axe violations: '+scenario);
  const needsMenuTree=scenario==='components-menu-open'||
    scenario==='components-menu-open-forced-colors';
  if(needsMenuTree){
   const evidence=data.semanticEvidence;
   if(!evidence||typeof evidence.engine!=='string'||
      typeof evidence.triggerTree!=='string'||!evidence.triggerTree.includes('Workspace actions')||
      typeof evidence.menuTree!=='string'||!evidence.menuTree.includes('Duplicate workspace')||
      !evidence.menuTree.includes('Archive (unavailable)')||
      evidence.expanded!==true||evidence.focusedItem!=='Duplicate workspace')
    throw new Error('Missing or invalid browser ARIA tree evidence: '+scenario);
  }
  let incompleteNodes=0;
  for(const rule of data.incomplete){
   if(!rule||typeof rule.id!=='string'||!rule.id||!Array.isArray(rule.nodes))
    throw new Error('Malformed incomplete axe rule in '+scenario);
   const count=rule.nodes.length;
   incompleteNodes+=count;
   for(const node of rule.nodes){
    const reason=normalizeIncompleteReason(node?.summary);
    const key=JSON.stringify([rule.id,reason]);
    const entry=incompleteByReason.get(key)??{rule:rule.id,reason,nodes:0,scenarios:[]};
    entry.nodes++;
    if(!entry.scenarios.includes(scenario))entry.scenarios.push(scenario);
    incompleteByReason.set(key,entry);
   }
   const total=incompleteByRule.get(rule.id)??{id:rule.id,checks:0,nodes:0,scenarios:[]};
   total.checks++;
   total.nodes+=count;
   if(!total.scenarios.includes(scenario))total.scenarios.push(scenario);
   incompleteByRule.set(rule.id,total);
  }
  reports.push({scenario,rulesPassed:data.rulesPassed,incompleteChecks:data.incomplete.length,
   incompleteNodes,semanticTreeCaptured:needsMenuTree,
   bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 }
 const manifest={revision,expected:names.length,captured:reports.length,
  incompleteChecks:reports.reduce((total,x)=>total+x.incompleteChecks,0),
  incompleteNodes:reports.reduce((total,x)=>total+x.incompleteNodes,0),
  menuSemanticTrees:reports.filter(x=>x.semanticTreeCaptured).map(x=>x.scenario),
  incompleteByRule:[...incompleteByRule.values()].sort((a,b)=>b.nodes-a.nodes||a.id.localeCompare(b.id)),
  incompleteByReason:[...incompleteByReason.values()].sort((a,b)=>b.nodes-a.nodes||
   a.rule.localeCompare(b.rule)||a.reason.localeCompare(b.reason)),
  limitations:'Automated axe WCAG A/AA screen; inconclusive checks require manual review. Not certification.',
  reports};
 await writeFile(join(folder,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const source=readFileSync(new URL('../e2e/accessibility.spec.mjs',import.meta.url),'utf8');
 const names=expectedAxeScenarios(source);
 const folder=resolve(resolvePlaywrightIsolation(process.env).outputDir,'accessibility-review');
 const manifest=await verifyAxeEvidence(folder,names,{revision:process.env.GITHUB_SHA??null});
 console.log('PASS retained axe evidence '+manifest.captured+'/'+manifest.expected+
  '; inconclusive checks needing review: '+manifest.incompleteChecks);
}
