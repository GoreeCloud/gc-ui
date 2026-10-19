import test from 'node:test';
import assert from 'node:assert/strict';
import {initChoiceChips,initDisclosureGroup} from '../src/gc-patterns.mjs';

function choice(name,pressed=null){
 const attributes=new Map([['data-gc-choice',name]]);
 if(pressed!==null)attributes.set('aria-pressed',pressed);
 return {
  localName:'button',type:'button',disabled:false,focused:false,
  getAttribute:k=>attributes.get(k)??null,
  setAttribute(k,v){attributes.set(k,String(v))},
  removeAttribute(k){attributes.delete(k)},
  closest(){return this},focus(){this.focused=true}
 };
}
function group(items){
 const events=new Map();
 return {
  querySelectorAll:()=>items,
  addEventListener(type,handler){events.set(type,handler)},
  removeEventListener(type,handler){if(events.get(type)===handler)events.delete(type)},
  fire(type,target){events.get(type)?.({target})},
  listenerCount:()=>events.size
 };
}
test('native choice chips select once, skip disabled buttons, and restore borrowed ARIA',()=>{
 const all=choice('all','false'),workspace=choice('workspace','true'),system=choice('system');
 const scope=group([all,workspace,system]),values=[];
 const ctl=initChoiceChips(scope,{onChange:v=>values.push(v)});
 assert.equal(ctl.get(),'workspace');
 assert.equal(ctl.select('workspace'),false);
 system.disabled=true;
 assert.equal(ctl.select('system'),false);
 system.disabled=false;
 scope.fire('click',system);
 assert.equal(ctl.get(),'system');
 assert.deepEqual(values,['system']);
 ctl.select('all',{focus:true});
 assert.equal(all.focused,true);
 assert.equal(all.getAttribute('aria-pressed'),'true');
 assert.throws(()=>ctl.select('invented'),/Unknown choice/);
 ctl.destroy();
 assert.equal(all.getAttribute('aria-pressed'),'false');
 assert.equal(workspace.getAttribute('aria-pressed'),'true');
 assert.equal(system.getAttribute('aria-pressed'),null);
 assert.equal(scope.listenerCount(),0);
 ctl.destroy();
 assert.throws(()=>ctl.select('all'),/destroyed/);
});
test('choice cleanup respects newer consumer ARIA changes',()=>{
 const one=choice('one'),two=choice('two');
 const scope=group([one,two]);
 const ctl=initChoiceChips(scope);
 one.setAttribute('aria-pressed','consumer-value');
 ctl.destroy();
 assert.equal(one.getAttribute('aria-pressed'),'consumer-value');
 assert.equal(two.getAttribute('aria-pressed'),null);
});
test('invalid choice groups fail closed before subscribing',()=>{
 const invalid=choice('duplicate'),scope=group([invalid,choice('duplicate')]);
 assert.throws(()=>initChoiceChips(scope),/uniquely named/);
 assert.equal(scope.listenerCount(),0);
 assert.throws(()=>initChoiceChips(group([choice('only')]),{onChange:null}),/function/);
 const disabled=choice('disabled');disabled.disabled=true;
 assert.throws(()=>initChoiceChips(group([disabled])),/enabled/);
});
function disclosure(open=false){
 const handlers=new Map();
 return {
  localName:'details',open,
  querySelector:k=>k==='summary'?{}:null,
  addEventListener(type,fn){handlers.set(type,fn)},
  removeEventListener(type,fn){if(handlers.get(type)===fn)handlers.delete(type)},
  fire(){handlers.get('toggle')?.()},
  count:()=>handlers.size
 };
}
test('native disclosures allow only one open and dispose without replacing user state',()=>{
 const a=disclosure(true),b=disclosure(true),c=disclosure();
 const ctl=initDisclosureGroup(group([a,b,c]));
 assert.equal(a.open,true);
 assert.equal(b.open,false);
 b.open=true;b.fire();
 assert.equal(a.open,false);
 assert.deepEqual(ctl.getOpen(),[b]);
 ctl.expand(c);
 assert.equal(b.open,false);
 assert.deepEqual(ctl.getOpen(),[c]);
 assert.throws(()=>ctl.expand(disclosure()),/Foreign disclosure/);
 ctl.destroy();
 assert.equal(c.open,true,'native state remains meaningful after unmount');
 assert.equal(a.count()+b.count()+c.count(),0);
 assert.throws(()=>ctl.expand(a),/destroyed/);
});
test('multi-open disclosures remain independent, and malformed markup is rejected',()=>{
 const a=disclosure(true),b=disclosure(true);
 const ctl=initDisclosureGroup(group([a,b]),{multiple:true});
 assert.deepEqual(ctl.getOpen(),[a,b]);
 ctl.expand(a);
 assert.equal(b.open,true);
 ctl.destroy();
 assert.throws(()=>initDisclosureGroup(group([])),/details and a summary/);
 const bad=disclosure();bad.querySelector=()=>null;
 assert.throws(()=>initDisclosureGroup(group([bad])),/details and a summary/);
});
