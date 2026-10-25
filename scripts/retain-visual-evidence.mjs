/** Persist actual-build Playwright screenshot evidence outside per-test attachments.
 * A GitHub Actions artifact can read outputDir/visual-review even when the
 * Playwright reporter does not retain successful test attachment directories.
 */
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';

export async function retainVisualEvidence(testInfo,name,png){
 if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(name))
  throw new TypeError('Visual evidence name must be a safe slug');
 const root=testInfo?.project?.outputDir;
 if(typeof root!=='string'||!root||!Buffer.isBuffer(png)||png.length<8||
    png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')
  throw new TypeError('Expected testInfo.project.outputDir and PNG bytes');
 const folder=resolve(root,'visual-review');
 await mkdir(folder,{recursive:true});
 const file=join(folder,name+'.png');
 await writeFile(file,png);
 // Keep the normal Playwright report attachment while also maintaining a
 // deterministic artifact path for successful-test visual review.
 await testInfo.attach(name,{path:file,contentType:'image/png'});
 return file;
}
