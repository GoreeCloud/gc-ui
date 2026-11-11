import { test } from "node:test";
import assert from "node:assert/strict";
import { initActionMenu } from "../src/menu.js";

function node(attrs={}) {
  const listeners=new Map();
  return {
    attrs:{...attrs},disabled:false,hidden:false,style:{},offsetWidth:220,offsetHeight:140,focused:false,
    getAttribute(name){return this.attrs[name]??null},
    setAttribute(name,value){this.attrs[name]=String(value)},
    removeAttribute(name){delete this.attrs[name]},
    addEventListener(name,fn){const set=listeners.get(name)||new Set();set.add(fn);listeners.set(name,set)},
    removeEventListener(name,fn){listeners.get(name)?.delete(fn)},
    focus(){this.focused=true; if(this.ownerDocument)this.ownerDocument.activeElement=this},
    emit(type,params={}){const e={currentTarget:this,target:this,key:"",defaultPrevented:false,
      preventDefault(){this.defaultPrevented=true},...params};
      for(const fn of listeners.get(type)||[])fn(e);
      return e},
    closest(selector){return selector==='button[role="menuitem"]'?this:null}
  };
}
function fixture() {
  const view=node();view.innerWidth=390;view.innerHeight=760;
  const doc=node();doc.defaultView=view;doc.documentElement={clientWidth:390};doc.activeElement=null;
  const trigger=node();trigger.ownerDocument=doc;
  trigger.getBoundingClientRect=()=>({left:330,right:380,top:30,bottom:72});
  const menu=node({role:"menu",popover:"auto"});menu.ownerDocument=doc;menu.id="action-menu";
  const items=[node({role:"menuitem"}),node({role:"menuitem"}),node({role:"menuitem","aria-disabled":"true"})];
  for(const item of items)item.ownerDocument=doc;
  menu.querySelectorAll=()=>items;menu.querySelector=()=>null;
  let visible=false;
  menu.matches=selector=>selector===":popover-open"&&visible;
  menu.showPopover=()=>{visible=true;menu.emit("toggle")};
  menu.hidePopover=()=>{visible=false;menu.emit("toggle")};
  menu.contains=el=>items.includes(el)||el===menu;
  return {view,doc,trigger,menu,items,isOpen:()=>visible};
}
test("native menu opens, positions on screen and skips aria-disabled options",()=>{
  const f=fixture();let chosen="";
  const api=initActionMenu(f.trigger,f.menu,{onSelect:item=>{chosen=f.items.indexOf(item).toString()}});
  assert.equal(f.trigger.attrs["aria-haspopup"],"menu");
  assert.equal(f.trigger.attrs["aria-controls"],"action-menu");
  f.trigger.emit("keydown",{key:"ArrowUp"});
  assert.equal(f.isOpen(),true);
  assert.equal(f.items[1].focused,true);
  assert.equal(f.trigger.attrs["aria-expanded"],"true");
  assert.ok(parseFloat(f.menu.style.left)>=0);
  assert.ok(parseFloat(f.menu.style.left)+f.menu.offsetWidth<=390);
  const e=f.menu.emit("keydown",{target:f.items[1],key:"ArrowDown"});
  assert.equal(e.defaultPrevented,true);
  assert.equal(f.items[0].focused,true);
  f.menu.emit("click",{target:f.items[2]});
  assert.equal(chosen,"");
  f.menu.emit("click",{target:f.items[0]});
  assert.equal(chosen,"0");
  assert.equal(f.isOpen(),false);
  api.dispose();
  f.trigger.emit("click");
  assert.equal(f.isOpen(),false);
});
test("menu Home/End, Escape, outside close and explicit teardown",()=>{
  const f=fixture();
  const api=initActionMenu(f.trigger,f.menu,{onSelect(){}});
  f.trigger.emit("click");assert.equal(f.isOpen(),true);
  f.menu.emit("keydown",{target:f.items[0],key:"End"});
  assert.equal(f.items[1].focused,true);
  f.menu.emit("keydown",{target:f.items[1],key:"Home"});
  assert.equal(f.items[0].focused,true);
  f.menu.emit("keydown",{target:f.items[0],key:"Escape"});
  assert.equal(f.isOpen(),false);
  assert.equal(f.trigger.focused,true);
  f.trigger.emit("click");
  f.doc.emit("scroll");
  assert.equal(f.isOpen(),false);
  api.open();
  assert.equal(f.isOpen(),true);
  api.dispose();
  assert.equal(f.isOpen(),false);
  assert.throws(()=>api.open(),/disposed/);
});
test("invalid popover, missing action and no options fail safely",()=>{
  const f=fixture();
  assert.throws(()=>initActionMenu(null,f.menu,{onSelect(){}}),TypeError);
  assert.throws(()=>initActionMenu(f.trigger,f.menu),/onSelect/);
  f.menu.attrs.popover="manual";
  assert.throws(()=>initActionMenu(f.trigger,f.menu,{onSelect(){}}),/popover/);
  f.menu.attrs.popover="auto";
  f.menu.querySelectorAll=()=>[];
  assert.throws(()=>initActionMenu(f.trigger,f.menu,{onSelect(){}}),/menuitem/);
});
test("async failure keeps action menu open with neutral feedback",async()=>{
  const f=fixture();
  const status={textContent:""};
  f.menu.querySelector=()=>status;
  const api=initActionMenu(f.trigger,f.menu,{onSelect:async()=>{throw Error("sensitive detail")}});
  api.open();
  f.menu.emit("click",{target:f.items[0]});
  for(let i=0;i<3;i++)await Promise.resolve();
  assert.equal(f.isOpen(),true);
  assert.match(status.textContent,/could not be completed/);
  assert.doesNotMatch(status.textContent,/sensitive/);
  api.dispose();
});


test("menu typeahead finds enabled choices and ignores modifier shortcuts",()=>{
  const f=fixture();
  f.items[0].textContent="Open";
  f.items[1].textContent="Save";
  f.items[2].textContent="Search";
  const api=initActionMenu(f.trigger,f.menu,{onSelect(){}});
  api.open();
  const event=f.menu.emit("keydown",{target:f.items[0],key:"s"});
  assert.equal(event.defaultPrevented,true);
  assert.equal(f.doc.activeElement,f.items[1]);
  const modified=f.menu.emit("keydown",{target:f.items[1],key:"o",ctrlKey:true});
  assert.equal(modified.defaultPrevented,false);
  assert.equal(f.doc.activeElement,f.items[1]);
  api.dispose();
});
