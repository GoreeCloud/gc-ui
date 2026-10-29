import test from 'node:test';
import assert from 'node:assert/strict';
import {initMenu} from '../src/gc-menu.mjs';

function element(name,{id='',role=''}={}){
 const values=new Map(role?[['role',role]]:[]);
 const listeners=new Map();
 return {localName:name,id,hidden:false,disabled:false,inert:false,isConnected:true,tabIndex:0,
  getAttribute:key=>values.get(key)??null,
  setAttribute:(key,value)=>values.set(key,String(value)),
  removeAttribute:key=>values.delete(key),
  addEventListener:(key,fn)=>listeners.set(key,fn),
  removeEventListener:key=>listeners.delete(key),
  contains(node){return node===this},
  focus(){this.ownerDocument.activeElement=this}
 };
}

test('menu ignores actions detached after controller initialization',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=element('button'),menu=element('div',{id:'dynamic-menu',role:'menu'});
 const first=element('button',{role:'menuitem'}),second=element('button',{role:'menuitem'});
 for(const item of [trigger,menu,first,second])item.ownerDocument=doc;
 const present=new Set([first,second]);
 menu.querySelectorAll=()=>[first,second];
 menu.contains=item=>item===menu||present.has(item);
 const controller=initMenu(trigger,menu,{document:doc});
 present.delete(first);
 assert.equal(controller.open(),true);
 assert.equal(doc.activeElement,second);
 controller.close();
 present.delete(second);
 assert.equal(controller.open(),false);
 assert.equal(menu.hidden,true);
 assert.equal(trigger.getAttribute('aria-expanded'),'false');
 present.add(second);
 assert.equal(controller.open(),true);
 assert.equal(doc.activeElement,second);
 controller.destroy();
});
