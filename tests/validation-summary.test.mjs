import test from 'node:test';
import assert from 'node:assert/strict';
import {initValidationSummary} from '../src/index.mjs';

class Node {
 constructor(localName,id='',doc=null){
  this.localName=localName;this.id=id;this.ownerDocument=doc;this.attrs=new Map();
  this.hidden=false;this.listeners=new Map();this.children=[];this.parent=null;this.focused=0;this.textContent='';
 }
 getAttribute(name){return this.attrs.get(name)??null}
 setAttribute(name,value){this.attrs.set(name,String(value))}
 removeAttribute(name){this.attrs.delete(name)}
 addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn)}
 removeEventListener(name,fn){this.listeners.get(name)?.delete(fn)}
 fire(name,event={}){for(const fn of this.listeners.get(name)||[])fn(event)}
 append(child){this.children.push(child);child.parent=this}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this)}
 contains(node){return this===node||this.children.some(child=>child.contains(node))}
 focus(){this.focused++}
 closest(selector){return selector==='a[href^="#"]'&&this.localName==='a'?this:null}
}
function fixture(){
 const doc={createElement(name){return new Node(name,'',doc)}};
 const form=new Node('form','form',doc),summary=new Node('section','errors',doc),list=new Node('ul','items',doc);
 summary.setAttribute('role','group');summary.setAttribute('tabindex','-1');summary.hidden=true;
 const input=new Node('input','task',doc),error=new Node('span','task-error',doc);
 input.value='';input.setAttribute('aria-describedby','task-help');error.hidden=true;
 error.textContent='Please type a task <never as HTML>';
 return {form,summary,list,input,error,field:{input,error,label:'Task',valid:el=>el.value.trim().length>=3}};
}
test('validation summary links invalid native fields, preserves edits and has a success callback',()=>{
 const {form,summary,list,input,error,field}=fixture();
 let success=0;const api=initValidationSummary(form,summary,list,[field],{onValid:()=>success++});
 let prevented=0;form.fire('submit',{preventDefault(){prevented++}});
 assert.equal(prevented,1);assert.equal(summary.hidden,false);assert.equal(summary.focused,1);
 assert.equal(input.getAttribute('aria-invalid'),'true');
 assert.equal(input.getAttribute('aria-describedby'),'task-help task-error');
 assert.equal(list.children.length,1);
 const link=list.children[0].children[0];
 assert.equal(link.getAttribute('href'),'#task');
 assert.equal(link.textContent,'Task: Please type a task <never as HTML>');
 let clickPrevented=0;list.fire('click',{target:link,preventDefault(){clickPrevented++}});
 assert.equal(clickPrevented,1);assert.equal(input.focused,1);
 input.value='Complete';input.fire('input');
 assert.equal(input.getAttribute('aria-invalid'),null);
 assert.equal(input.getAttribute('aria-describedby'),'task-help');
 assert.equal(summary.hidden,true);assert.equal(list.children.length,0);
 assert.equal(api.validate(),true);assert.equal(success,1);
 api.destroy();assert.equal(form.listeners.get('submit').size,0);
 assert.throws(()=>api.validate(),/destroyed/);
});
test('teardown restores borrowed field attributes only when still owned',()=>{
 const {form,summary,list,input,error,field}=fixture();
 input.setAttribute('aria-invalid','spelling');
 const api=initValidationSummary(form,summary,list,[field]);
 api.validate({focusSummary:false});
 input.setAttribute('aria-describedby','host-updated');
 error.hidden=true; // application changed the controller-visible error
 api.destroy();
 assert.equal(input.getAttribute('aria-describedby'),'host-updated');
 assert.equal(input.getAttribute('aria-invalid'),'spelling');
 assert.equal(error.hidden,true);
 assert.equal(summary.hidden,true);
});
test('invalid contracts and throwing validators do not commit partial accessibility state',()=>{
 const x=fixture();
 assert.throws(()=>initValidationSummary(x.form,x.summary,x.list,[{...x.field,label:''}]),/descriptor/);
 assert.throws(()=>initValidationSummary(x.form,x.summary,x.list,[x.field,x.field]),/duplicate/);
 const bad={...x.field,valid:()=>{throw Error('validation unavailable')}};
 const api=initValidationSummary(x.form,x.summary,x.list,[bad]);
 assert.throws(()=>api.validate(),/validation unavailable/);
 assert.equal(x.input.getAttribute('aria-invalid'),null);
 assert.equal(x.summary.hidden,true);
 api.destroy();
});

test('asynchronous validation does not accidentally approve an invalid field',()=>{
 const x=fixture();
 const api=initValidationSummary(x.form,x.summary,x.list,[{...x.field,valid:()=>Promise.resolve(false)}]);
 assert.throws(()=>api.validate(),/synchronous boolean/);
 assert.equal(x.input.getAttribute('aria-invalid'),null);
 api.destroy();
});

test('host-added descriptions survive invalid corrections, repeat validation, and teardown',()=>{
 const x=fixture();
 const api=initValidationSummary(x.form,x.summary,x.list,[x.field]);
 assert.equal(api.validate({focusSummary:false}),false);
 x.input.setAttribute('aria-describedby','task-help live-hint task-error');
 x.input.value='New task';x.input.fire('input');
 assert.equal(x.input.getAttribute('aria-describedby'),'task-help live-hint','correcting an error must not delete newer help');
 assert.equal(api.validate({focusSummary:false}),true);
 assert.equal(x.input.getAttribute('aria-describedby'),'task-help live-hint');
 api.destroy();
 assert.equal(x.input.getAttribute('aria-describedby'),'task-help live-hint','teardown must not revive stale snapshot');
});

test('replaced host description remains linked during subsequent invalid validation',()=>{
 const x=fixture();
 const api=initValidationSummary(x.form,x.summary,x.list,[x.field]);
 assert.equal(api.validate({focusSummary:false}),false);
 x.input.setAttribute('aria-describedby','host-current');
 assert.equal(api.validate({focusSummary:false}),false);
 assert.equal(x.input.getAttribute('aria-describedby'),'host-current task-error');
 api.destroy();
 assert.equal(x.input.getAttribute('aria-describedby'),'host-current');
});

test('host description replacements before first validation are retained on teardown',()=>{
 const x=fixture();
 const api=initValidationSummary(x.form,x.summary,x.list,[x.field]);
 x.input.setAttribute('aria-describedby','host-after-mount-before-submit');
 assert.equal(api.validate({focusSummary:false}),false);
 assert.equal(x.input.getAttribute('aria-describedby'),'host-after-mount-before-submit task-error');
 api.destroy();
 assert.equal(x.input.getAttribute('aria-describedby'),'host-after-mount-before-submit');
});

test('disposing validation in onInput cannot revive obsolete field or summary state',()=>{
 const x=fixture();
 // Pre-existing host errors may intentionally survive optional controller teardown.
 x.input.setAttribute('aria-invalid','true');
 let api;
 api=initValidationSummary(x.form,x.summary,x.list,[x.field],{
  onInput(){api.destroy()}
 });
 assert.equal(api.validate({focusSummary:false}),false);
 x.input.value='Completed task';
 x.input.fire('input');
 assert.equal(x.input.getAttribute('aria-invalid'),'true','original host ARIA must survive teardown');
 assert.equal(x.input.getAttribute('aria-describedby'),'task-help');
 assert.equal(x.error.hidden,true);
 assert.equal(x.summary.hidden,true);
 assert.equal(x.list.children.length,0);
 assert.equal(x.input.listeners.get('input').size,0);
});

test('a validator that unmounts its controller must not commit stale error state',()=>{
 const x=fixture();
 let api,unmount=false;
 const field={...x.field,valid:el=>{
  if(unmount)api.destroy();
  return el.value.trim().length>=3;
 }};
 api=initValidationSummary(x.form,x.summary,x.list,[field]);
 assert.equal(api.validate({focusSummary:false}),false);
 unmount=true;x.input.value='Task completed';x.input.fire('input');
 assert.equal(x.input.getAttribute('aria-invalid'),null);
 assert.equal(x.input.getAttribute('aria-describedby'),'task-help');
 assert.equal(x.error.hidden,true);
 assert.equal(x.summary.hidden,true);
 assert.equal(x.list.children.length,0);
 assert.equal(x.input.listeners.get('input').size,0);
});

test('submit validator unmount cannot reintroduce obsolete errors or focus',()=>{
 const x=fixture();
 let api;
 const destroyingField={...x.field,valid:()=>{api.destroy();return false}};
 api=initValidationSummary(x.form,x.summary,x.list,[destroyingField]);
 assert.throws(()=>api.validate(),/destroyed/);
 assert.equal(x.input.getAttribute('aria-invalid'),null);
 assert.equal(x.input.getAttribute('aria-describedby'),'task-help');
 assert.equal(x.error.hidden,true);
 assert.equal(x.summary.hidden,true);
 assert.equal(x.summary.focused,0);
 assert.equal(x.list.children.length,0);
 assert.equal(x.form.listeners.get('submit').size,0);
});
