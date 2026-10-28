/** Verify and inventory retained full-page GC UI screenshots after the visual suite.
 * This is evidence completeness, not design/visual acceptance or WCAG approval.
 */
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolvePlaywrightIsolation} from './playwright-isolation-config.mjs';

export const visualEvidenceScenarios=Object.freeze([
 ['components-desktop-light',1440,900],
 ['components-desktop-dark',1440,900],
 ['components-desktop-high-contrast',1440,900],
 ['components-mobile-light',375,812],
 ['components-menu-open',375,812],
 ['catalog-desktop',1440,900],
 ['adaptive-compact',375,812],
 ['adaptive-compact-320',320,740],
 ['adaptive-compact-dark',375,812],
 ['adaptive-medium',840,900],
 ['adaptive-expanded',1440,900],
 ['forms-desktop',1440,900],
 ['forms-compact-dark',375,812],
 ['forms-recovery-compact',375,812],
 ['environment-workspace-light',1440,900],
 ['environment-reading-dark',1440,900],
 ['environment-compact',375,812],
 ['environment-compact-320',320,740],
 ['experience-workspace-light',1440,900],
 ['experience-reading-dark',1440,900],
 ['experience-mobile-320',320,720],
 ['experience-tv-profile',1280,800]
]);

export async function verifyVisualEvidence(folder,{revision=null}={}){
 const actual=await readdir(folder);
 const expected=visualEvidenceScenarios.map(([name])=>name+'.png');
 const missing=expected.filter(name=>!actual.includes(name));
 const unexpected=actual.filter(name=>name.endsWith('.png')&&!expected.includes(name));
 if(missing.length||unexpected.length)
  throw new Error('Visual evidence inventory mismatch: missing='+missing.join(',')+' unexpected='+unexpected.join(','));
 const images=[];
 for(const [name,minWidth,minHeight] of visualEvidenceScenarios){
  const bytes=await readFile(resolve(folder,name+'.png'));
  if(bytes.length<24||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||
     bytes.subarray(12,16).toString('ascii')!=='IHDR')
   throw new Error('Not a PNG screenshot: '+name);
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  if(width!==minWidth||height<minHeight)
   throw new Error('Unexpected viewport/full-page PNG dimensions for '+name+': '+width+'x'+height+' expected width '+minWidth+', height >= '+minHeight);
  images.push({name,file:name+'.png',width,height,bytes:bytes.length,
   sha256:createHash('sha256').update(bytes).digest('hex')});
 }
 const manifest={revision,expected:visualEvidenceScenarios.length,captured:images.length,
  checks:'PNG signature, IHDR dimensions, fixture inventory and SHA-256; NOT visual approval',
  images};
 await writeFile(resolve(folder,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const folder=resolve(resolvePlaywrightIsolation(process.env).outputDir,'visual-review');
 const manifest=await verifyVisualEvidence(folder,{revision:process.env.GITHUB_SHA??null});
 console.log('PASS retained full-page UI screenshot evidence '+manifest.captured+'/'+manifest.expected+
  ' ('+folder+')');
}
