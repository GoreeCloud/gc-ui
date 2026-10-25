import test from 'node:test';
import assert from 'node:assert/strict';
import {captureZoomScreenshot} from '../scripts/zoom-screenshot-evidence.mjs';

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
