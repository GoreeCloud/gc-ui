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

/** Capture a neutral, top-of-page baseline from the actual current browser.
 * A fixed, offscreen skip link can otherwise appear halfway down a stitched
 * full-page image after clicking a lower-page theme or profile control.
 */
export async function captureFullPageVisualEvidence(page,testInfo,name){
 await page.evaluate(()=>{
  document.activeElement?.blur?.();
  window.scrollTo({top:0,left:0,behavior:'instant'});
 });
 await page.waitForFunction(()=>window.scrollX===0&&window.scrollY===0);
 const misplaced=await page.evaluate(()=>[...document.querySelectorAll('.skip-link,.gc-skip-link')]
  .filter(el=>el.getBoundingClientRect().bottom>0)
  .map(el=>el.textContent?.trim()||'skip link'));
 if(misplaced.length)throw new Error('Focus-only skip links exposed in screenshot: '+misplaced.join(', '));
 const png=await page.screenshot({fullPage:true,animations:'disabled'});
 return retainVisualEvidence(testInfo,name,png);
}
