import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {captureZoomScreenshot,inspectScreenshotPixels} from '../scripts/zoom-screenshot-evidence.mjs';

function fixture(failures){
 const calls=[],waits=[];
 const page={
  async screenshot(options){
   calls.push(options);
   if(calls.length<=failures)throw new Error('Transient capture failure');
  },
  async waitForTimeout(ms){waits.push(ms)}
 };
 return {page,calls,waits};
}

test('successful first capture records a single attempt without delay',async()=>{
 const f=fixture(0),options={path:'/tmp/success.png'};
 assert.deepEqual(await captureZoomScreenshot(f.page,options),{captured:true,attempts:1});
 assert.deepEqual(f.calls,[options]);assert.deepEqual(f.waits,[]);
});

test('transient screenshot failure is retried once without losing evidence',async()=>{
 const f=fixture(1),options={path:'/tmp/retry.png',animations:'disabled'};
 assert.deepEqual(await captureZoomScreenshot(f.page,options),{captured:true,attempts:2});
 assert.deepEqual(f.calls,[options,options]);assert.deepEqual(f.waits,[250]);
});

test('repeated failures remain explicitly reported, never silently counted as captured',async()=>{
 const f=fixture(2),result=await captureZoomScreenshot(f.page,{path:'/tmp/fail.png'});
 assert.equal(result.captured,false);assert.equal(result.attempts,2);
 assert.match(result.error.message,/Transient capture failure/);
 assert.equal(f.calls.length,2);assert.deepEqual(f.waits,[250]);
});

test('retry limits reject malformed or unbounded invocation parameters',async()=>{
 const f=fixture(0);
 for(const options of [{attempts:0},{attempts:1.2},{delayMs:-1},{delayMs:Infinity}]){
  await assert.rejects(captureZoomScreenshot(f.page,{path:'/tmp/bad.png'},options),RangeError);
 }
 assert.equal(f.calls.length,0);
});

test('native zoom metrics declare expected count alongside actual captures and failures',()=>{
 const script=readFileSync(new URL('../scripts/qa-real-browser-zoom.mjs',import.meta.url),'utf8');
 assert.match(script,/screenshotCount,screenshotExpected:13,screenshotFailures/);
 assert.match(script,/\['v1','components','catalog','adaptive','forms','workflow'\]/);
});

// Small 2×2 8-bit RGBA fixture images: flat, nonuniform, and subtle variation.
const blank=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFUlEQVR4nGP88On7fwYGBgYmBigAADuxA9y5d8r7AAAAAElFTkSuQmCC','base64');
const content=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGklEQVR4nGP88On7fwYGBgYmUWkLBgYGBgYAPmYERN4sXvoAAAAASUVORK5CYII=','base64');
const subtle=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAG0lEQVR4nGP88On7/7///zEw/WZgYGBmZGIAAGdTB9ccBfLdAAAAAElFTkSuQmCC','base64');
function pngFixture(screenshots){
 const calls=[],waits=[];
 const page={
  async screenshot(options){
   calls.push(options);
   const next=screenshots[calls.length-1]??screenshots.at(-1);
   if(next instanceof Error)throw next;
   return next;
  },
  async waitForTimeout(ms){waits.push(ms)}
 };
 return {page,calls,waits};
}

test('PNG inspector detects varied vs uniform and subtle pixels',()=>{
 assert.equal(inspectScreenshotPixels(blank).hasVisibleContent,false);
 assert.equal(inspectScreenshotPixels(subtle).hasVisibleContent,false);
 assert.equal(inspectScreenshotPixels(content).hasVisibleContent,true);
 assert.deepEqual([inspectScreenshotPixels(content).width,inspectScreenshotPixels(content).height],[2,2]);
});
test('invalid or truncated screenshot data is rejected',()=>{
 assert.throws(()=>inspectScreenshotPixels(Buffer.from('not PNG')),/not a PNG/);
 assert.throws(()=>inspectScreenshotPixels(blank.subarray(0,30)),/Truncated|Incomplete/);
 assert.throws(()=>inspectScreenshotPixels(content,{minChannelDelta:0}),RangeError);
});
test('content validation accepts a nonuniform capture',async()=>{
 const f=pngFixture([content]),options={path:'/tmp/valid.png'};
 assert.deepEqual(await captureZoomScreenshot(f.page,options,{validateContent:true}),{captured:true,attempts:1});
 assert.deepEqual(f.calls,[options]);assert.deepEqual(f.waits,[]);
});

test('uniform capture is retried until a nonuniform frame exists',async()=>{
 const f=pngFixture([blank,content]),options={path:'/tmp/retry.png'};
 assert.deepEqual(await captureZoomScreenshot(f.page,options,{validateContent:true}),{captured:true,attempts:2});
 assert.deepEqual(f.calls,[options,options]);assert.deepEqual(f.waits,[250]);
});
test('repeated uniform captures remain explicitly failed evidence',async()=>{
 const f=pngFixture([blank,blank]),result=await captureZoomScreenshot(f.page,{path:'/tmp/blank.png'},{validateContent:true});
 assert.equal(result.captured,false);assert.equal(result.attempts,2);
 assert.match(result.error.message,/visually uniform/);assert.equal(f.calls.length,2);
});

test('400%-zoom Workflow evidence is focused and Chromium uses viewport readback',()=>{
 const script=readFileSync(new URL('../scripts/qa-real-browser-zoom.mjs',import.meta.url),'utf8');
 assert.match(script,/lab==='workflow'&&scale===4/);
 assert.match(script,/\.gc-workflow-steps \[aria-current=step\]/);
 assert.match(script,/Page\.captureScreenshot/);
 assert.match(script,/fromSurface:false,captureBeyondViewport:false/);
 assert.match(script,/await captureZoomScreenshot\(screenshotPage,options,\{validateContent:true\}\)/);
});
