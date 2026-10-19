#!/usr/bin/env node
/** Run a Playwright suite with its own loopback server and independent evidence directory. */
import {createServer} from 'node:net';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function freeLocalPort(){
 return new Promise((resolvePort,reject)=>{
  const server=createServer();
  server.once('error',reject);
  server.listen(0,'127.0.0.1',()=>{
   const port=server.address().port;
   server.close(error=>error?reject(error):resolvePort(port));
  });
 });
}
const port=await freeLocalPort();
const runId='run-'+randomUUID();
const env={...process.env,GC_PLAYWRIGHT_PORT:String(port),GC_PLAYWRIGHT_RUN_ID:runId};
const cli=resolve(root,'node_modules/@playwright/test/cli.js');
console.log('GC UI isolated Playwright: port='+port+' output=test-results/isolated/'+runId);
const result=spawnSync(process.execPath,[cli,'test',...process.argv.slice(2)],{
 cwd:root,env,stdio:'inherit'
});
if(result.error)throw result.error;
process.exitCode=result.status??1;
