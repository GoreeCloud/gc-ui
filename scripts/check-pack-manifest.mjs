/** Verify the distributable payload without creating or publishing a tarball. */
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const pkg=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'));
const npm=process.platform==='win32'?'npm.cmd':'npm';
const run=spawnSync(npm,['pack','--dry-run','--json','--ignore-scripts'],{
 cwd:root,encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024
});
if(run.error||run.status!==0)throw new Error('npm pack dry-run failed: '+(run.error||run.stderr));
const pack=JSON.parse(run.stdout);
if(pack.length!==1||!Array.isArray(pack[0].files))throw new Error('Unexpected npm pack response');
const shipped=new Set(pack[0].files.map(file=>file.path));
const pathOf=value=>String(value).replace(/^\.\//,'');
const required=new Set([pathOf(pkg.types),'package.json','README.md']);
for(const exportValue of Object.values(pkg.exports)){
 const paths=typeof exportValue==='string'?[exportValue]:Object.values(exportValue);
 for(const p of paths)required.add(pathOf(p));
}
for(const name of required){
 if(!shipped.has(name))throw new Error('Export is missing from npm package: '+name);
}
for(const name of shipped){
 if(/^(lab\/|e2e\/|tests\/|test-results\/|playwright-report\/|\.github\/)/.test(name))
  throw new Error('Development-only asset unexpectedly packed: '+name);
}
if(!pkg.private)throw new Error('Alpha library must remain private until release approval');
console.log('GC UI npm dry-run: '+shipped.size+' files, all '+required.size+' required exports included; no test/lab output.');
