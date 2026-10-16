import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import * as gc from '@goreecloud/gc-ui';

const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
test('experimental public exports are resolvable without framework dependencies',()=>{
 for(const name of ['createThemeController','normalizeTheme','generateTheme','contrastRatio','initTabs','initDialog','initMenu','createToast','runAsyncAction']){
  assert.equal(typeof gc[name],'function',name);
 }
 assert.equal(gc.GC_UI_VERSION,pkg.version);
 assert.equal(pkg.private,true,'must remain unpublished until release gates are met');
});
test('all advertised exports resolve to committed files',()=>{
 for(const definition of Object.values(pkg.exports)){
  const targets=typeof definition==='string'?[definition]:Object.values(definition);
  for(const target of targets){
   assert.ok(target.startsWith('./'),'relative export expected');
   const full=resolve(process.cwd(),target);
   assert.ok(existsSync(full),'missing export '+target);
  }
 }
});
test('type declarations document every public function',()=>{
 const types=readFileSync(new URL('../types/index.d.ts',import.meta.url),'utf8');
 for(const [name,value] of Object.entries(gc)){
  if(typeof value==='function')assert.match(types,new RegExp('function '+name+'(?:<[^>]*>)?\\('),'missing type for '+name);
 }
});
