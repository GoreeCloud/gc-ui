/** Pure Playwright server/evidence settings; safe to verify without Playwright installed. */
export function resolvePlaywrightIsolation(env=process.env){
 const port=Number(env.GC_PLAYWRIGHT_PORT??4173);
 if(!Number.isInteger(port)||port<1024||port>65535)
  throw new TypeError('GC_PLAYWRIGHT_PORT must be a port between 1024 and 65535');
 const runId=env.GC_PLAYWRIGHT_RUN_ID;
 if(runId!==undefined && !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(runId))
  throw new TypeError('GC_PLAYWRIGHT_RUN_ID must be a safe short directory name');
 return {
  port,
  outputDir:runId?'./test-results/isolated/'+runId:'./test-results'
 };
}
