import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,symlinkSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {isAllowedLocalResource,GC_DESKTOP_CONTENT_SECURITY_POLICY} from '../local-resource-policy.mjs';

test('desktop local file policy allows only approved GC UI document and asset files',()=>{
 const root=mkdtempSync(join(tmpdir(),'gc-local-policy-'));
 try{
  for(const dir of ['lab','assets','src','docs','.git','tests','native','styles'])mkdirSync(join(root,dir));
  const make=(path)=>{writeFileSync(join(root,path),'placeholder');return pathToFileURL(join(root,path)).href};
  const page=make('lab/studio.html'),asset=make('assets/scene.svg'),script=make('src/runtime.mjs');
  assert.equal(isAllowedLocalResource(page,root),true);
  assert.equal(isAllowedLocalResource(asset,root),true);
  assert.equal(isAllowedLocalResource(script,root),true);
  for(const path of ['.git/config','tests/security.test.mjs','native/key.json','docs/credentials.env','assets/executable.sh'])
   assert.equal(isAllowedLocalResource(make(path),root),false,path);
  assert.equal(isAllowedLocalResource('https://example.org/resource',root),false);
  assert.equal(isAllowedLocalResource('data:text/html,unsafe',root),false);
  assert.equal(isAllowedLocalResource(page+'?secret=1',root),false);
  assert.equal(isAllowedLocalResource(page.replace('studio.html','missing.html'),root),false);
  const outside=join(tmpdir(),'gc-local-outside-'+process.pid+'.svg');
  writeFileSync(outside,'outside');
  symlinkSync(outside,join(root,'assets','linked.svg'));
  assert.equal(isAllowedLocalResource(pathToFileURL(join(root,'assets/linked.svg')).href,root),false);
  rmSync(outside);
 }finally{rmSync(root,{recursive:true,force:true})}
});
test('desktop policy locks remote scripts, network and embedded frames behind a CSP',()=>{
 for(const fragment of ["default-src 'none'","script-src 'self'","connect-src 'none'",
  "object-src 'none'","frame-src 'none'","form-action 'none'"])
  assert.ok(GC_DESKTOP_CONTENT_SECURITY_POLICY.includes(fragment),fragment);
});
