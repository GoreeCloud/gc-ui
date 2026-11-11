import { test } from "node:test";
import assert from "node:assert/strict";
import { initTabs } from "../src/elements.js";

function node(attrs={}) {
  const listeners=new Map();
  return {
    attrs:{...attrs},tabIndex:0,disabled:false,hidden:false,focused:false,
    getAttribute(name){return this.attrs[name]??null},
    setAttribute(name,value){this.attrs[name]=String(value)},
    addEventListener(type,fn){const set=listeners.get(type)||new Set();set.add(fn);listeners.set(type,set)},
    removeEventListener(type,fn){listeners.get(type)?.delete(fn)},
    focus(){this.focused=true},
    emit(type,params={}) {
      const event={currentTarget:this,key:"",defaultPrevented:false,
        preventDefault(){this.defaultPrevented=true},...params};
      for(const fn of listeners.get(type)||[])fn(event);
      return event;
    }
  };
}
function group(vertical=false) {
  const tabs=[node({role:"tab","aria-controls":"pane0","aria-selected":"true"}),
    node({role:"tab","aria-controls":"pane1","aria-selected":"false"}),
    node({role:"tab","aria-controls":"pane2","aria-selected":"false"})];
  const panes=tabs.map((_,i)=>node({role:"tabpanel",id:"pane"+i}));
  const doc={documentElement:{dir:"ltr"},getElementById:id=>panes.find(x=>x.getAttribute("id")===id)};
  const list=node({role:"tablist","aria-orientation":vertical?"vertical":"horizontal"});
  list.querySelectorAll=()=>tabs;
  list.ownerDocument=doc;
  return {list,tabs,panes,doc};
}

test("horizontal tabs skip disabled choices, wrap and restore correct panels",()=>{
  const {list,tabs,panes,doc}=group();
  tabs[1].disabled=true;
  const dispose=initTabs(list);
  assert.equal(tabs[0].tabIndex,0);
  const e=tabs[0].emit("keydown",{key:"ArrowRight"});
  assert.equal(e.defaultPrevented,true);
  assert.equal(tabs[2].attrs["aria-selected"],"true");
  assert.equal(panes[2].hidden,false);
  assert.equal(panes[0].hidden,true);
  tabs[1].emit("click");
  assert.equal(tabs[2].attrs["aria-selected"],"true");
  const back=tabs[2].emit("keydown",{key:"Home"});
  assert.equal(back.defaultPrevented,true);
  assert.equal(tabs[0].attrs["aria-selected"],"true");
  doc.documentElement.dir="rtl";
  tabs[0].emit("keydown",{key:"ArrowRight"});
  assert.equal(tabs[2].attrs["aria-selected"],"true");
  dispose();
  tabs[0].emit("click");
  assert.equal(tabs[2].attrs["aria-selected"],"true");
});
test("aria-disabled and hidden tabs are not keyboard destinations",()=>{
  const {list,tabs}=group();
  tabs[1].setAttribute("aria-disabled","true");
  tabs[2].hidden=true;
  const dispose=initTabs(list);
  tabs[0].emit("keydown",{key:"End"});
  assert.equal(tabs[0].attrs["aria-selected"],"true");
  tabs[2].emit("click");
  assert.equal(tabs[0].attrs["aria-selected"],"true");
  dispose();
});
test("vertical tabs only respond to vertical arrows and Home/End",()=>{
  const {list,tabs}=group(true);
  const dispose=initTabs(list);
  const e=tabs[0].emit("keydown",{key:"ArrowRight"});
  assert.equal(e.defaultPrevented,false);
  tabs[0].emit("keydown",{key:"ArrowDown"});
  assert.equal(tabs[1].attrs["aria-selected"],"true");
  tabs[1].emit("keydown",{key:"End"});
  assert.equal(tabs[2].attrs["aria-selected"],"true");
  tabs[2].emit("keydown",{key:"ArrowDown"});
  assert.equal(tabs[0].attrs["aria-selected"],"true");
  dispose();
});
test("reject unbound tabs and missing panels, including all disabled",()=>{
  const {list,tabs}=group();
  tabs.forEach(x=>x.disabled=true);
  assert.throws(()=>initTabs(list),/at least one enabled tab/);
  tabs[0].disabled=false;
  tabs[0].setAttribute("aria-controls","missing");
  assert.throws(()=>initTabs(list),/missing an associated tabpanel/);
  assert.throws(()=>initTabs(null),TypeError);
});
