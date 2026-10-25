/** Keep audited accessibility JSON across separate Playwright invocations.
 * Playwright clears its output directory when a later visual suite starts.
 */
import {cp,stat,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolvePlaywrightIsolation} from './playwright-isolation-config.mjs';

export async function transferAccessibilityReports(source,destination){
 if(typeof source!=='string'||!source||typeof destination!=='string'||!destination)
  throw new TypeError('Expected evidence source and destination directories');
 if(resolve(source)===resolve(destination))throw new TypeError('Cannot overwrite evidence with itself');
 const manifest=resolve(source,'manifest.json');
 if(!(await stat(manifest)).isFile())throw new Error('Accessibility manifest is missing: '+manifest);
 await mkdir(resolve(destination,'..'),{recursive:true});
 await cp(source,destination,{recursive:true,force:true});
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const stage=process.argv[2];
 const output=resolve(resolvePlaywrightIsolation(process.env).outputDir,'accessibility-review');
 const archive=resolve('dist','qa','accessibility-review');
 if(stage==='stash')await transferAccessibilityReports(output,archive);
 else if(stage==='restore')await transferAccessibilityReports(archive,output);
 else throw new Error('Expected stash or restore');
 console.log('PASS accessibility report '+stage);
}
