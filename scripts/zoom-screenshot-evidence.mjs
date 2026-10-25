/** Bounded retry for optional native-zoom screenshot evidence.
 * Geometry, keyboard and hit-target assertions remain separate mandatory gates.
 */
export async function captureZoomScreenshot(page,options,{attempts=2,delayMs=250}={}){
 if(!Number.isSafeInteger(attempts)||attempts<1||
    !Number.isFinite(delayMs)||delayMs<0)
  throw new RangeError('Invalid screenshot retry limits');
 let lastError;
 for(let count=1;count<=attempts;count++){
  try{
   await page.screenshot(options);
   return {captured:true,attempts:count};
  }catch(error){
   lastError=error;
   if(count<attempts)await page.waitForTimeout(delayMs);
  }
 }
 return {captured:false,attempts,error:lastError};
}
