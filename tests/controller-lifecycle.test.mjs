import test from 'node:test';
import assert from 'node:assert/strict';
import {initDialog,initTabs} from '../src/gc-interactions.mjs';

function emitter(props={}){
 const handlers=new Map();
 return {
  ...props,
  addEventListener(name,fn){const events=handlers.get(name)||new Set();events.add(fn);handlers.set(name,events)},
  removeEventListener(name,fn){handlers.get(name)?.delete(fn)},
  fire(name,event={}){for(const fn of [...(handlers.get(name)||[])])fn(event)},
  count(name){return handlers.get(name)?.size||0}
 };
}
function tabsFixture({duplicate=false}={}){
 const panels=['one','two'].map(id=>({id,hidden:false,getAttribute:k=>k==='role'?'tabpanel':null}));
 const widgets=new Map(panels.map(p=>[p.id,p]));
 const tabs=[0,1].map((i)=>({
  disabled:false,tabIndex:-1,selected:'false',ariaDisabled:false,
  getAttribute(k){if(k==='aria-controls')return duplicate?'one':panels[i].id;
   if(k==='aria-selected')return i===0?'true':'false';
   if(k==='aria-disabled')return this.ariaDisabled?'true':null;
   return null},
  setAttribute(k,v){if(k==='aria-selected')this.selected=String(v)},
  focus(){this.focused=true},
  closest(){return this}
 }));
 const group=emitter({
  ownerDocument:{getElementById:id=>widgets.get(id)},
  getAttribute:k=>k==='role'?'tablist':null,
  querySelectorAll:()=>tabs
 });
 return {tabs,panels,group};
}
test('initTabs rejects two tab buttons controlling the same panel',()=>{
 const {group}=tabsFixture({duplicate:true});
 assert.throws(()=>initTabs(group),/unique tabpanel/);
});
test('runtime aria-disabled tabs are skipped and cannot be activated directly',()=>{
 const {tabs,panels,group}=tabsFixture();
 const controller=initTabs(group);
 tabs[1].ariaDisabled=true;
 group.fire('keydown',{key:'ArrowRight',target:tabs[0],preventDefault(){}});
 assert.equal(tabs[0].selected,'true');
 assert.equal(panels[0].hidden,false);
 controller.select(tabs[1]);
 assert.equal(panels[1].hidden,true);
 tabs[1].ariaDisabled=false;
 group.fire('keydown',{key:'ArrowRight',target:tabs[0],preventDefault(){}});
 assert.equal(tabs[1].selected,'true');
 assert.equal(panels[1].hidden,false);
 controller.destroy();
});
function dialogFixture(){
 const doc=emitter();
 const opener={
  dataset:{gcDialogOpen:'sample-dialog'},isConnected:true,focused:0,
  focus(){this.focused++},closest(sel){return sel==='[data-gc-dialog-open]'?this:null}
 };
 const closer={closest(sel){return sel==='[data-gc-dialog-close]'?this:null}};
 const dialog=emitter({
  localName:'dialog',id:'sample-dialog',ownerDocument:doc,open:false,
  contains(target){return target===closer},
  showModal(){this.open=true},
  close(){if(!this.open)return;this.open=false;this.fire('close')}
 });
 return {dialog,doc,opener,closer};
}
test('native dialog controller closes an open modal and returns trigger focus on destroy',()=>{
 const {dialog,doc,opener}=dialogFixture();
 const controller=initDialog(dialog);
 doc.fire('click',{target:opener});
 assert.equal(dialog.open,true);
 assert.equal(doc.count('click'),1);
 assert.equal(dialog.count('close'),1);
 controller.destroy();
 assert.equal(dialog.open,false,'a destroyed controller must not strand a modal focus trap');
 assert.equal(opener.focused,1);
 assert.equal(doc.count('click'),0);
 assert.equal(dialog.count('close'),0);
 controller.destroy();
 assert.throws(()=>controller.open(),/destroyed/);
 assert.throws(()=>controller.close(),/destroyed/);
 doc.fire('click',{target:opener});
 assert.equal(dialog.open,false,'removed click listeners must not reopen a modal');
});
test('native dialog ignores a second opener when already open and lets close restore original focus',()=>{
 const {dialog,doc,opener,closer}=dialogFixture();
 const other={...opener,focused:0,focus(){this.focused++}};
 const controller=initDialog(dialog);
 doc.fire('click',{target:opener});
 doc.fire('click',{target:other});
 doc.fire('click',{target:closer});
 assert.equal(dialog.open,false);
 assert.equal(opener.focused,1);
 assert.equal(other.focused,0);
 controller.destroy();
});
