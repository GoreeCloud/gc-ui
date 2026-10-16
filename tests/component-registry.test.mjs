import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=new URL('../',import.meta.url);
const spec=readFileSync(new URL('../docs/COMPONENT_CATALOG_V1.md',import.meta.url),'utf8');
const registry=JSON.parse(readFileSync(new URL('../registry/components.v1.json',import.meta.url),'utf8'));
const rows=spec.split('\n').filter(line=>/^\|\s*[AFCNOM]\d{2}\s*\|/.test(line))
 .map(line=>line.split('|').slice(1,-1).map(x=>x.trim()));
test('all catalog rows are uniquely mirrored in the machine-readable component registry',()=>{
 assert.equal(rows.length,63);
 assert.equal(registry.components.length,63);
 const ids=new Set();
 for(let i=0;i<63;i++){
  const component=registry.components[i],row=rows[i];
  assert.equal(component.id,row[0]);
  assert.equal(component.name,row[1]);
  assert.equal(component.anatomy,row[2]);
  assert.equal(component.behavior,row[3]);
  assert.ok(!ids.has(component.id),'duplicate '+component.id);
  ids.add(component.id);
 }
});
test('implementation claims are specific, experimental, and traceable to source files',()=>{
 const implemented=registry.components.filter(c=>c.webStatus==='experimental');
 assert.equal(implemented.length,10);
 assert.equal(registry.components.filter(c=>c.webStatus==='stable').length,0);
 for(const component of registry.components){
  assert.equal(component.nativeStatus,'specified');
  if(component.webStatus==='experimental'){
   assert.ok(component.web.classNames.length);
   assert.ok(component.web.sources.length);
   assert.ok(component.web.example.startsWith('lab/'));
   for(const path of component.web.sources)assert.ok(existsSync(new URL('../'+path,import.meta.url)),component.id+' missing '+path);
  }else{
   assert.equal(component.web,undefined);
  }
 }
});

test('every experimental component points to a real lab page and implemented CSS class',()=>{
 for(const component of registry.components.filter(c=>c.webStatus==='experimental')){
  const page=component.web.example.split('#')[0];
  assert.ok(existsSync(new URL('../'+page,import.meta.url)),component.id+' missing example '+page);
  const css=component.web.sources.filter(path=>path.endsWith('.css')).map(path=>
   readFileSync(new URL('../'+path,import.meta.url),'utf8')).join('\n');
  for(const className of component.web.classNames){
   assert.ok(css.includes('.'+className),component.id+' unimplemented class '+className);
  }
 }
});
