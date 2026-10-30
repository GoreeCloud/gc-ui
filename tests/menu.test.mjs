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
  removeAttribute:key=>attrs.delete(key),
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

test('menu teardown restores borrowed accessibility state, original visibility and tab stops',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'borrowed',role:'menu'});
 const first=elem('button',{role:'menuitem'}),second=elem('button',{role:'menuitem'});
 for(const item of [trigger,menu,first,second])item.ownerDocument=doc;
 trigger.setAttribute('aria-haspopup','dialog');
 trigger.setAttribute('aria-controls','old-menu');
 trigger.setAttribute('aria-expanded','true');
 menu.hidden=true;
 first.tabIndex=4;
 second.tabIndex=2;
 menu.querySelectorAll=()=>[first,second];
 menu.contains=node=>node===menu||node===first||node===second;
 const api=initMenu(trigger,menu,{document:doc});
 assert.equal(first.tabIndex,-1);
 assert.equal(api.open(),true);
 assert.equal(doc.activeElement,first);
 api.destroy();
 assert.equal(menu.hidden,true);
 assert.equal(trigger.getAttribute('aria-haspopup'),'dialog');
 assert.equal(trigger.getAttribute('aria-controls'),'old-menu');
 assert.equal(trigger.getAttribute('aria-expanded'),'true');
 assert.equal(first.tabIndex,4);
 assert.equal(second.tabIndex,2);
 assert.equal(doc.activeElement,trigger,'focus must leave a hidden menu');
 assert.equal(api.open(),false,'retired controller cannot open again');
 api.destroy();
});

test('menu teardown leaves external changes intact and removes controller-only ARIA',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'external',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const el of [trigger,menu,item])el.ownerDocument=doc;
 menu.hidden=false;
 menu.querySelectorAll=()=>[item];
 menu.contains=el=>el===menu||el===item;
 const api=initMenu(trigger,menu,{document:doc});
 assert.equal(api.open(),true);
 trigger.setAttribute('aria-haspopup','listbox');
 trigger.setAttribute('aria-expanded','external');
 menu.hidden=true;
 item.tabIndex=3;
 doc.activeElement=trigger;
 api.destroy();
 assert.equal(trigger.getAttribute('aria-haspopup'),'listbox');
 assert.equal(trigger.getAttribute('aria-expanded'),'external');
 assert.equal(trigger.getAttribute('aria-controls'),null,'controller-only attribute removed');
 assert.equal(menu.hidden,true,'newer external visibility is not overwritten');
 assert.equal(item.tabIndex,3,'newer external tab order is not overwritten');
});

test('menu teardown restores initially visible markup and removes new ARIA state',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'visible',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const el of [trigger,menu,item])el.ownerDocument=doc;
 menu.hidden=false;
 menu.querySelectorAll=()=>[item];
 menu.contains=el=>el===menu||el===item;
 const api=initMenu(trigger,menu,{document:doc});
 api.open();
 api.close({returnFocus:false});
 api.destroy();
 assert.equal(menu.hidden,false,'preexisting visibility survives disposal');
 for(const name of ['aria-haspopup','aria-controls','aria-expanded'])
  assert.equal(trigger.getAttribute(name),null);
 assert.equal(item.tabIndex,0);
});

test('host hide followed by focusout never converts external visibility into menu ownership',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'host-visibility',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const el of [trigger,menu,item])el.ownerDocument=doc;
 menu.hidden=false;
 menu.querySelectorAll=()=>[item];
 menu.contains=el=>el===menu||el===item;
 const api=initMenu(trigger,menu,{document:doc});
 api.open();
 menu.hidden=true; // application ownership transition, after controller wrote false
 menu.fire('focusout',{relatedTarget:trigger});
 api.destroy();
 assert.equal(menu.hidden,true,'host hide must survive focusout then destroy');
 assert.equal(trigger.getAttribute('aria-expanded'),null);
});

test('controller close preserves externally hidden menu ownership through teardown',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'external-close',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const el of [trigger,menu,item])el.ownerDocument=doc;
 menu.hidden=false;menu.querySelectorAll=()=>[item];
 menu.contains=node=>node===menu||node===item;
 const api=initMenu(trigger,menu,{document:doc});
 api.open();
 menu.hidden=true; // host hides an initially visible menu before closing controller
 api.close({returnFocus:false});
 api.destroy();
 assert.equal(menu.hidden,true,'teardown must not unhide a host-hidden menu');
});

test('aria-disabled menu triggers cannot open by mouse, keys or API until re-enabled',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'a11y-disabled',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const el of [trigger,menu,item])el.ownerDocument=doc;
 menu.querySelectorAll=()=>[item];menu.contains=el=>el===menu||el===item;
 trigger.setAttribute('aria-disabled','true');
 const api=initMenu(trigger,menu,{document:doc});
 assert.equal(api.open(),false);
 trigger.fire('click');
 trigger.fire('keydown',{key:'ArrowDown',preventDefault(){}});
 assert.equal(api.isOpen(),false);
 assert.equal(menu.hidden,true);
 assert.equal(trigger.getAttribute('aria-expanded'),'false');
 trigger.setAttribute('aria-disabled','false');
 assert.equal(api.open(),true,'host can re-enable a focusable menu trigger');
 assert.equal(menu.hidden,false);
 api.destroy();
});

test('a second pointer activation closes an open menu even after blur',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'pointer-menu',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const node of [trigger,menu,item])node.ownerDocument=doc;
 menu.querySelectorAll=()=>[item];menu.contains=node=>node===menu||node===item;
 const api=initMenu(trigger,menu,{document:doc});
 trigger.fire('pointerdown');trigger.fire('click');
 assert.equal(api.isOpen(),true);
 trigger.fire('pointerdown');menu.fire('focusout',{relatedTarget:trigger});trigger.fire('click');
 assert.equal(api.isOpen(),false);
 api.destroy();
});

test('canceled trigger pointer does not suppress subsequent keyboard focus dismissal',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'cancel-pointer',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const node of [trigger,menu,item])node.ownerDocument=doc;
 menu.querySelectorAll=()=>[item];menu.contains=node=>node===menu||node===item;
 const api=initMenu(trigger,menu,{document:doc});
 api.open();
 trigger.fire('pointerdown');
 trigger.fire('pointercancel');
 menu.fire('focusout',{relatedTarget:trigger});
 assert.equal(api.isOpen(),false);
 assert.equal(trigger.getAttribute('aria-expanded'),'false');
 api.destroy();
});
test('released pointer away from trigger clears deferred dismissal and listeners',()=>{
 const handlers=new Map();
 const doc={activeElement:null,addEventListener(name,fn){handlers.set(name,fn)},
  removeEventListener(name){handlers.delete(name)}};
 const trigger=elem('button'),menu=elem('div',{id:'drag-pointer',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const node of [trigger,menu,item])node.ownerDocument=doc;
 menu.querySelectorAll=()=>[item];menu.contains=node=>node===menu||node===item;
 const api=initMenu(trigger,menu,{document:doc});
 api.open();
 trigger.fire('pointerdown');
 trigger.focus(); // emulate the browser's focus transfer before focusout
 menu.fire('focusout',{relatedTarget:trigger});
 assert.equal(api.isOpen(),true,'do not close while trigger press is pending');
 handlers.get('pointerup')({target:elem('div')});
 assert.equal(api.isOpen(),false,'abandoned pointer press must not leave an orphaned menu');
 api.destroy();
 assert.equal(handlers.size,0);
});

test('canceling trigger after focus moves closes the menu safely',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'cancel-foc',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const e of [trigger,menu,item])e.ownerDocument=doc;
 menu.querySelectorAll=()=>[item];menu.contains=e=>e===menu||e===item;
 const api=initMenu(trigger,menu,{document:doc});
 api.open();trigger.fire('pointerdown');trigger.focus();
 menu.fire('focusout',{relatedTarget:trigger});
 assert.equal(api.isOpen(),true);
 trigger.fire('pointercancel');
 assert.equal(api.isOpen(),false);
 assert.equal(doc.activeElement,trigger);
 api.destroy();
});

test('nonprimary pointerdown cannot suppress focusout dismissal',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'secondary-pointer-menu',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const node of [trigger,menu,item])node.ownerDocument=doc;
 menu.querySelectorAll=()=>[item];menu.contains=node=>node===menu||node===item;
 const api=initMenu(trigger,menu,{document:doc});
 api.open();
 trigger.fire('pointerdown',{button:2,isPrimary:true,pointerType:'mouse'});
 trigger.focus();
 menu.fire('focusout',{relatedTarget:trigger});
 assert.equal(api.isOpen(),false,'right-click must not arm a pending primary click');
 assert.equal(trigger.getAttribute('aria-expanded'),'false');
 api.destroy();
});
test('external close clears a pending trigger press before a new menu open',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'externally-closed-menu',role:'menu'}),item=elem('button',{role:'menuitem'});
 for(const node of [trigger,menu,item])node.ownerDocument=doc;
 menu.querySelectorAll=()=>[item];menu.contains=node=>node===menu||node===item;
 const api=initMenu(trigger,menu,{document:doc});
 api.open();
 trigger.fire('pointerdown',{button:0,isPrimary:true,pointerType:'mouse'});
 api.close({returnFocus:false});
 assert.equal(api.open(),true);
 menu.fire('focusout',{relatedTarget:trigger});
 assert.equal(api.isOpen(),false,'external close must clear pending pointer state');
 api.destroy();
});

test('menu skips host-hidden actions and refuses a menu with no available actions',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'hidden-actions',role:'menu'});
 const first=elem('button',{role:'menuitem'}),second=elem('button',{role:'menuitem'}),third=elem('button',{role:'menuitem'});
 for(const el of [trigger,menu,first,second,third])el.ownerDocument=doc;
 first.hidden=true;
 second.setAttribute('aria-hidden','true');
 menu.querySelectorAll=()=>[first,second,third];
 menu.contains=el=>[menu,first,second,third].includes(el);
 const api=initMenu(trigger,menu,{document:doc});
 assert.equal(api.open(),true);
 assert.equal(doc.activeElement,third,'first eligible visible action receives focus');
 assert.equal(menu.hidden,false);
 third.hidden=true;
 api.close({returnFocus:false});
 assert.equal(api.open(),false,'all-hidden menu must not be exposed');
 assert.equal(menu.hidden,true);
 assert.equal(trigger.getAttribute('aria-expanded'),'false');
 third.hidden=false;
 third.inert=true;
 assert.equal(api.open(),false,'inert actions are also excluded from the focus ring');
 third.inert=false;
 assert.equal(api.open(),true);
 assert.equal(doc.activeElement,third,'host can restore an action dynamically');
 api.destroy();
});


test('nested hidden, inert and ARIA-disabled groups never expose their menu actions',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'group-actions',role:'menu'});
 const hiddenGroup=elem('div'),inertGroup=elem('div');
 const hiddenAction=elem('button',{role:'menuitem'});
 const inertAction=elem('button',{role:'menuitem'});
 const availableAction=elem('button',{role:'menuitem'});
 for(const el of [trigger,menu,hiddenGroup,inertGroup,hiddenAction,inertAction,availableAction])
  el.ownerDocument=doc;
 hiddenGroup.parentElement=menu;inertGroup.parentElement=menu;
 hiddenAction.parentElement=hiddenGroup;
 inertAction.parentElement=inertGroup;
 availableAction.parentElement=menu;
 menu.querySelectorAll=()=>[hiddenAction,inertAction,availableAction];
 menu.contains=el=>[menu,hiddenGroup,inertGroup,hiddenAction,inertAction,availableAction].includes(el);
 let selected=0;
 const api=initMenu(trigger,menu,{document:doc,onSelect:()=>selected++});
 hiddenGroup.hidden=true;
 inertGroup.inert=true;
 assert.equal(api.open(),true);
 assert.equal(doc.activeElement,availableAction,'skip descendants of unavailable groups');
 menu.fire('click',{target:hiddenAction});
 menu.fire('click',{target:inertAction});
 assert.equal(selected,0,'hidden actions cannot be selected by delegated clicks');
 menu.fire('keydown',{key:'ArrowDown',target:availableAction,preventDefault(){}});
 assert.equal(doc.activeElement,availableAction,'keyboard cannot enter unavailable groups');
 api.close();

 hiddenGroup.hidden=false;inertGroup.inert=false;
 hiddenGroup.setAttribute('aria-hidden','true');
 inertGroup.setAttribute('aria-disabled','true');
 assert.equal(api.open(),true);
 assert.equal(doc.activeElement,availableAction,'ARIA-disabled groups are also unavailable');
 api.close();

 hiddenGroup.removeAttribute('aria-hidden');inertGroup.removeAttribute('aria-disabled');
 assert.equal(api.open(),true);
 assert.equal(doc.activeElement,hiddenAction,'restored group is navigable without reinstalling');
 menu.fire('keydown',{key:'ArrowDown',target:hiddenAction,preventDefault(){}});
 assert.equal(doc.activeElement,inertAction,'keyboard follows newly available actions');
 api.close();
 availableAction.hidden=true;
 hiddenGroup.hidden=true;
 inertGroup.inert=true;
 assert.equal(api.open(),false,'all unavailable descendants keep popup collapsed');
 assert.equal(trigger.getAttribute('aria-expanded'),'false');
 assert.equal(menu.hidden,true);
 api.destroy();
});


test('menu trigger inherits unavailable host groups and recovers when re-enabled',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'grouped-trigger',role:'menu'});
 const action=elem('button',{role:'menuitem'});
 for(const node of [trigger,menu,action])node.ownerDocument=doc;
 menu.querySelectorAll=()=>[action];
 menu.contains=el=>el===menu||el===action;
 let blocked='[aria-disabled="true"]';
 trigger.parentElement={closest:selector=>blocked&&selector.includes(blocked)?{}:null};
 const api=initMenu(trigger,menu,{document:doc});
 for(const state of ['[aria-disabled="true"]','[hidden]','[inert]','[aria-hidden="true"]']){
  blocked=state;
  assert.equal(api.open(),false,'host ancestor '+state+' blocks direct open');
  trigger.fire('click');
  trigger.fire('keydown',{key:'ArrowDown',preventDefault(){}});
  assert.equal(api.isOpen(),false,'host ancestor '+state+' blocks pointer and keyboard open');
  assert.equal(menu.hidden,true);
  assert.equal(trigger.getAttribute('aria-expanded'),'false');
 }
 blocked=null;
 assert.equal(api.open(),true,'restored host enables normal menu operation');
 assert.equal(menu.hidden,false);
 assert.equal(doc.activeElement,action);
 api.close();
 blocked='[aria-disabled="true"]';
 trigger.fire('click');
 assert.equal(api.isOpen(),false,'newly disabled ancestor blocks later reopening');
 api.destroy();
});


test('unavailable trigger itself, detached popup and disabled fieldset block menu activation',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'self-availability',role:'menu'});
 const action=elem('button',{role:'menuitem'});
 for(const node of [trigger,menu,action])node.ownerDocument=doc;
 menu.querySelectorAll=()=>[action];menu.contains=node=>node===menu||node===action;
 let inheritedNativeDisabled=false;
 trigger.matches=selector=>selector===':disabled'&&inheritedNativeDisabled;
 const api=initMenu(trigger,menu,{document:doc});
 const cases=[
  ['hidden',()=>{trigger.hidden=true},()=>{trigger.hidden=false}],
  ['inert',()=>{trigger.inert=true},()=>{trigger.inert=false}],
  ['aria-hidden',()=>trigger.setAttribute('aria-hidden','true'),
    ()=>trigger.removeAttribute('aria-hidden')],
  ['detached trigger',()=>{trigger.isConnected=false},()=>{trigger.isConnected=true}],
  ['detached menu',()=>{menu.isConnected=false},()=>{menu.isConnected=true}],
  ['disabled fieldset',()=>{inheritedNativeDisabled=true},()=>{inheritedNativeDisabled=false}]
 ];
 for(const [name,disable,enable] of cases){
  disable();
  assert.equal(api.open(),false,name+' must block direct controller API');
  trigger.fire('click');
  trigger.fire('keydown',{key:'ArrowDown',preventDefault(){}});
  assert.equal(api.isOpen(),false,name+' must block click and keyboard activation');
  assert.equal(menu.hidden,true,name+' cannot expose an unavailable popup');
  assert.equal(trigger.getAttribute('aria-expanded'),'false');
  enable();
 }
 assert.equal(trigger.disabled,false,'fieldset-only disablement does not set disabled attribute');
 assert.equal(api.open(),true,'menu recovers when host restores trigger and popup');
 assert.equal(doc.activeElement,action);
 api.close();
 api.destroy();
});


test('fieldset-disabled menuitem is omitted from keyboard and action selection',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'native-item-disabled',role:'menu'});
 const blocked=elem('button',{role:'menuitem'}),available=elem('button',{role:'menuitem'});
 for(const el of [trigger,menu,blocked,available])el.ownerDocument=doc;
 let disabledByFieldset=true,selected=0;
 blocked.matches=selector=>selector===':disabled'&&disabledByFieldset;
 menu.querySelectorAll=()=>[blocked,available];
 menu.contains=el=>el===menu||el===blocked||el===available;
 const api=initMenu(trigger,menu,{document:doc,onSelect:()=>selected++});
 assert.equal(blocked.disabled,false,'disabled fieldset is not the button disabled property');
 assert.equal(api.open(),true);
 assert.equal(doc.activeElement,available,'skip inherited native-disabled item');
 menu.fire('click',{target:blocked});
 assert.equal(selected,0,'delegated events cannot select disabled fieldset item');
 menu.fire('keydown',{key:'ArrowDown',target:available,preventDefault(){}});
 assert.equal(doc.activeElement,available,'arrow navigation avoids fieldset-disabled item');
 api.close();
 available.hidden=true;
 assert.equal(api.open(),false,'no eligible menu actions remain');
 assert.equal(menu.hidden,true);
 disabledByFieldset=false;
 assert.equal(api.open(),true,'host can enable the item without remount');
 assert.equal(doc.activeElement,blocked);
 menu.fire('click',{target:blocked});
 assert.equal(selected,1);
 api.destroy();
});


test('menu never restores focus to host-disabled triggers',()=>{
 const doc={activeElement:null,addEventListener(){},removeEventListener(){}};
 const trigger=elem('button'),menu=elem('div',{id:'focus-recovery',role:'menu'});
 const item=elem('button',{role:'menuitem'});
 for(const el of [trigger,menu,item])el.ownerDocument=doc;
 menu.hidden=true;menu.querySelectorAll=()=>[item];
 menu.contains=el=>el===menu||el===item;
 let returned=0,nativeDisabled=false;
 trigger.focus=()=>{returned++;doc.activeElement=trigger};
 trigger.matches=selector=>selector===':disabled'&&nativeDisabled;
 const api=initMenu(trigger,menu,{document:doc});
 const cases=[
  [()=>{trigger.hidden=true},()=>{trigger.hidden=false}],
  [()=>{trigger.inert=true},()=>{trigger.inert=false}],
  [()=>trigger.setAttribute('aria-disabled','true'),()=>trigger.removeAttribute('aria-disabled')],
  [()=>{nativeDisabled=true},()=>{nativeDisabled=false}]
 ];
 for(const [block,restore] of cases){
  assert.equal(api.open(),true);
  block();api.close();assert.equal(returned,0);
  restore();
 }
 assert.equal(api.open(),true);api.close();assert.equal(returned,1);
 assert.equal(api.open(),true);
 trigger.hidden=true;api.destroy();
 assert.equal(returned,1,'retiring menu must not focus hidden trigger');
 assert.equal(menu.hidden,true);
});
