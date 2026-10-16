import test from 'node:test';
import assert from 'node:assert/strict';
import {nextMenuIndex,initMenu} from '../src/gc-menu.mjs';

test('menu arrow navigation cycles and Home/End jump',()=>{
 assert.equal(nextMenuIndex('ArrowDown',2,3),0);
 assert.equal(nextMenuIndex('ArrowUp',0,3),2);
 assert.equal(nextMenuIndex('Home',2,3),0);
 assert.equal(nextMenuIndex('End',0,3),2);
 assert.equal(nextMenuIndex('Escape',1,3),null);
 assert.throws(()=>nextMenuIndex('ArrowDown',0,0));
});
function elem(name,{id='',role='',disabled=false}={}){
 const attrs=new Map(role?[['role',role]]:[]),handlers=new Map();
 return {
  localName:name,id,disabled,tabIndex:0,hidden:false,isConnected:true,ownerDocument:null,
  getAttribute:key=>attrs.get(key)??null,
  setAttribute:(key,v)=>attrs.set(key,String(v)),
  addEventListener:(key,fn)=>{const list=handlers.get(key)||new Set();list.add(fn);handlers.set(key,list)},
  removeEventListener:(key,fn)=>handlers.get(key)?.delete(fn),
  fire(key,event={}){for(const fn of handlers.get(key)||[])fn(event)},
  focus(){this.ownerDocument.activeElement=this},
  contains(target){return target===this},
  closest(selector){return selector.includes('menuitem')?this:null}
 };
}
test('menu opens, skips disabled actions, and returns focus on Escape',()=>{
 const doc={activeElement:null,handlers:new Map(),addEventListener(key,fn){this.handlers.set(key,fn)},removeEventListener(key){this.handlers.delete(key)}};
 const trigger=elem('button'),menu=elem('div',{id:'file-actions',role:'menu'});
 const a=elem('button',{role:'menuitem'}),disabled=elem('button',{role:'menuitem',disabled:true}),b=elem('button',{role:'menuitem'});
 for(const x of [trigger,menu,a,b,disabled])x.ownerDocument=doc;
 menu.querySelectorAll=()=>[a,disabled,b];
 menu.contains=el=>[menu,a,disabled,b].includes(el);
 let selected=[];
 const api=initMenu(trigger,menu,{document:doc,onSelect:item=>selected.push(item)});
 assert.equal(menu.hidden,true);assert.equal(trigger.getAttribute('aria-expanded'),'false');
 trigger.fire('click');
 assert.equal(menu.hidden,false);assert.equal(doc.activeElement,a);
 let prevented=false;
 menu.fire('keydown',{key:'ArrowDown',target:a,preventDefault(){prevented=true}});
 assert.equal(doc.activeElement,b);assert.equal(prevented,true);
 menu.fire('keydown',{key:'Escape',target:b,preventDefault(){}});
 assert.equal(menu.hidden,true);assert.equal(doc.activeElement,trigger);
 trigger.fire('click');
 menu.fire('click',{target:disabled});
 assert.equal(selected.length,0);
 menu.fire('click',{target:b});
 assert.deepEqual(selected,[b]);
 assert.equal(trigger.getAttribute('aria-expanded'),'false');
 api.destroy();
 assert.equal(doc.handlers.size,0);
});
test('Tab dismissal does not pull focus back to menu trigger',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'menu',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const x of [trigger,menu,item])x.ownerDocument=doc;
 menu.querySelectorAll=()=>[item];menu.contains=x=>x===menu||x===item;
 const api=initMenu(trigger,menu,{document:doc});
 api.open();
 menu.fire('keydown',{key:'Tab',target:item,preventDefault(){throw Error('Tab should remain default')}});
 assert.equal(api.isOpen(),true,'menu stays visible while browser processes native Tab');
 menu.fire('focusout',{relatedTarget:trigger});
 assert.equal(api.isOpen(),false);
 assert.equal(doc.activeElement,item,'dismissal must not steal keyboard focus');
 api.destroy();
});

test('keyboard Enter and a following native click select an action exactly once',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'unique-actions',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const element of [trigger,menu,item])element.ownerDocument=doc;
 menu.querySelectorAll=()=>[item];
 menu.contains=element=>element===menu||element===item;
 let selected=0;
 const api=initMenu(trigger,menu,{document:doc,onSelect:()=>selected++});
 api.open();
 menu.fire('keydown',{key:'Enter',target:item,preventDefault(){}});
 menu.fire('click',{target:item}); // native button can also synthesize click
 assert.equal(selected,1);
 assert.equal(api.isOpen(),false);
 menu.fire('click',{target:item}); // stale clicks while closed are no-ops
 assert.equal(selected,1);
 api.destroy();
});

test('focus movement between menu items does not dismiss menu; reverse Tab does',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'focus-actions',role:'menu'});
 const items=[elem('button',{role:'menuitem'}),elem('button',{role:'menuitem'})];
 for(const el of [trigger,menu,...items])el.ownerDocument=doc;
 menu.querySelectorAll=()=>items;
 menu.contains=el=>el===menu||items.includes(el);
 const api=initMenu(trigger,menu,{document:doc});
 api.open();
 menu.fire('focusout',{relatedTarget:items[1]});
 assert.equal(api.isOpen(),true);
 menu.fire('keydown',{key:'Tab',shiftKey:true,target:items[1],preventDefault(){throw Error('Shift+Tab is native')}});
 menu.fire('focusout',{relatedTarget:trigger});
 assert.equal(api.isOpen(),false);
 api.destroy();
});
