import { test } from "node:test";
import assert from "node:assert/strict";
import { initCombobox } from "../src/combobox.js";
import { readFileSync } from "node:fs";

function node(attrs={}) {
  const listeners=new Map();
  return {
    attrs:{...attrs},id:attrs.id||"",children:[],parentElement:null,
    value:"",hidden:false,textContent:"",disabled:false,labels:[],
    getAttribute(k){return this.attrs[k]??null},setAttribute(k,v){this.attrs[k]=String(v)},
    removeAttribute(k){delete this.attrs[k]},
    addEventListener(k,f){const s=listeners.get(k)||new Set();s.add(f);listeners.set(k,s)},
    removeEventListener(k,f){listeners.get(k)?.delete(f)},
    append(...xs){for(const x of xs){x.parentElement=this;this.children.push(x)}},
    contains(o){for(let p=o;p;p=p.parentElement)if(p===this)return true;return false},
    closest(selector){if(selector!=='[role="option"]')return null;
      for(let p=this;p;p=p.parentElement)if(p.getAttribute("role")==="option")return p;
      return null},
    emit(k,params={}){const event={target:this,key:"",defaultPrevented:false,
      preventDefault(){this.defaultPrevented=true},...params};
      for(const fn of listeners.get(k)||[])fn(event);return event}
  };
}
function fixture() {
  const doc=node();const status=node();doc.getElementById=id=>id==="status"?status:null;
  const input=node({role:"combobox","aria-controls":"options","aria-describedby":"status"});
  input.labels=[{}];input.ownerDocument=doc;
  const list=node({role:"listbox",id:"options"});list.ownerDocument=doc;
  const choices=["Iris","Lagoon","Moss"].map((label,i)=>{
    const option=node({role:"option",id:"option-"+i,"data-gc-value":label.toLowerCase()});
    option.textContent=label;return option;
  });
  choices[1].setAttribute("aria-disabled","true");
  list.append(...choices);
  list.querySelectorAll=()=>choices;list.querySelector=()=>null;
  return {doc,input,list,choices,status};
}
test("input filters safe text and arrow keys skip disabled options",()=>{
  const f=fixture(),api=initCombobox(f.input,f.list);
  assert.equal(f.list.hidden,true);
  assert.equal(f.input.getAttribute("aria-expanded"),"false");
  f.input.emit("focus");assert.equal(f.list.hidden,false);
  f.input.emit("keydown",{key:"ArrowDown"});
  assert.equal(f.input.getAttribute("aria-activedescendant"),"option-0");
  f.input.emit("keydown",{key:"ArrowDown"});
  assert.equal(f.input.getAttribute("aria-activedescendant"),"option-2");
  f.input.value="moss";f.input.emit("input");
  assert.equal(f.choices[0].hidden,true);
  assert.equal(f.choices[2].hidden,false);
  assert.equal(f.status.textContent,"1 option available");
  f.input.emit("keydown",{key:"Escape"});
  assert.equal(f.list.hidden,true);
  assert.equal(f.input.getAttribute("aria-activedescendant"),null);
  api.dispose();
});
test("selection updates only real input value and aria-selected",async()=>{
  const f=fixture(),results=[];
  const api=initCombobox(f.input,f.list,{onSelect:(opt,value)=>results.push(value)});
  api.open();f.input.emit("keydown",{key:"ArrowDown"});
  f.input.emit("keydown",{key:"Enter"});
  await Promise.resolve();
  assert.deepEqual(results,["iris"]);
  assert.equal(f.input.value,"Iris");
  assert.equal(f.choices[0].getAttribute("aria-selected"),"true");
  assert.equal(f.list.hidden,true);
  f.input.value="Mo";f.input.emit("input");
  assert.equal(f.choices[0].getAttribute("aria-selected"),"false");
  api.dispose();
});
test("outside pointer closes without stealing focus, while option pointer preserves it",()=>{
  const f=fixture(),api=initCombobox(f.input,f.list);
  api.open();
  const down=f.list.emit("pointerdown",{target:f.choices[0]});
  assert.equal(down.defaultPrevented,true);
  f.doc.emit("pointerdown",{target:node()});
  assert.equal(f.list.hidden,true);
  api.dispose();assert.throws(()=>api.open(),/disposed/);
});
test("async failure stays open with generic status and no leaked error detail",async()=>{
  const f=fixture();
  const api=initCombobox(f.input,f.list,{
    onSelect:async()=>{throw new Error("secret token must never display");}
  });
  api.open();f.input.emit("keydown",{key:"ArrowDown"});
  f.input.emit("keydown",{key:"Enter"});
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.equal(f.list.hidden,false);
  assert.equal(f.input.value,"");
  assert.match(f.status.textContent,/could not be completed/);
  assert.doesNotMatch(f.status.textContent,/secret/);
  api.dispose();
});
test("malformed markup, duplicate IDs and missing labels fail closed",()=>{
  const f=fixture();
  assert.throws(()=>initCombobox(null,f.list),TypeError);
  const bad=fixture();bad.input.labels=[];
  assert.throws(()=>initCombobox(bad.input,bad.list),/label/);
  const duplicate=fixture();duplicate.choices[1].id="option-0";
  assert.throws(()=>initCombobox(duplicate.input,duplicate.list),/unique IDs/);
  const ctrl=fixture();ctrl.input.setAttribute("aria-controls","other");
  assert.throws(()=>initCombobox(ctrl.input,ctrl.list),/matching/);
});
test("public exports, CSS and checked-in docs remain consistent",()=>{
  const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
  const pkg=JSON.parse(read("package.json"));
  assert.equal(pkg.exports["./combobox"].default,"./src/combobox.js");
  assert.ok(read("src/combobox.d.ts").includes("initCombobox"));
  assert.ok(read("src/components.css").includes(".gc-combobox__option"));
});

test("initialization opens an input that was focused before mounting",()=>{
  const f=fixture();
  f.doc.activeElement=f.input;
  const api=initCombobox(f.input,f.list);
  assert.equal(f.list.hidden,false);
  assert.equal(f.input.getAttribute("aria-expanded"),"true");
  api.dispose();
});

test("pending async selection ignores competing keyboard, input and outside clicks",async()=>{
  const f=fixture();let resolveSelection;const calls=[];
  const pendingSelection=new Promise(resolve=>{resolveSelection=resolve;});
  const api=initCombobox(f.input,f.list,{onSelect:(_option,value)=>{
    calls.push(value);return pendingSelection;
  }});
  api.open();
  f.input.emit("keydown",{key:"ArrowDown"});
  f.input.emit("keydown",{key:"Enter"});
  assert.equal(f.input.getAttribute("aria-busy"),"true");
  f.input.value="Moss";
  f.input.emit("input");
  f.input.emit("keydown",{key:"ArrowDown"});
  f.input.emit("keydown",{key:"Enter"});
  f.doc.emit("pointerdown",{target:node()});
  f.list.emit("click",{target:f.choices[2]});
  assert.deepEqual(calls,["iris"]);
  assert.equal(f.list.hidden,false);
  assert.equal(f.choices[0].hidden,false);
  resolveSelection();
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.equal(f.input.value,"Iris");
  assert.equal(f.choices[0].getAttribute("aria-selected"),"true");
  assert.equal(f.input.getAttribute("aria-busy"),null);
  assert.equal(f.list.hidden,true);
  api.dispose();
});
test("dispose during unresolved selection never commits stale value",async()=>{
  const f=fixture();let resolveSelection;
  const gate=new Promise(resolve=>{resolveSelection=resolve;});
  const api=initCombobox(f.input,f.list,{onSelect:()=>gate});
  api.open();f.input.emit("keydown",{key:"ArrowDown"});
  f.input.emit("keydown",{key:"Enter"});
  api.dispose();
  resolveSelection();
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.equal(f.input.value,"");
  assert.equal(f.choices[0].getAttribute("aria-selected"),"false");
  assert.equal(f.input.getAttribute("aria-busy"),null);
});

test("rejected selection after disposal does not announce a stale error",async()=>{
  const f=fixture();let rejectSelection;
  const gate=new Promise((_resolve,reject)=>{rejectSelection=reject;});
  const api=initCombobox(f.input,f.list,{onSelect:()=>gate});
  api.open();f.input.emit("keydown",{key:"ArrowDown"});
  f.input.emit("keydown",{key:"Enter"});
  const previousStatus=f.status.textContent;
  api.dispose();
  rejectSelection(new Error("private error details"));
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.equal(f.status.textContent,previousStatus);
  assert.equal(f.input.getAttribute("aria-busy"),null);
});


test("Home/End move across visible enabled choices only while combobox is open",()=>{
  const f=fixture(),api=initCombobox(f.input,f.list);
  const closed=f.input.emit("keydown",{key:"End"});
  assert.equal(closed.defaultPrevented,false,"Closed input retains normal text editing");
  api.open();
  let e=f.input.emit("keydown",{key:"End"});
  assert.equal(e.defaultPrevented,true);
  assert.equal(f.input.getAttribute("aria-activedescendant"),"option-2");
  e=f.input.emit("keydown",{key:"Home"});
  assert.equal(e.defaultPrevented,true);
  assert.equal(f.input.getAttribute("aria-activedescendant"),"option-0");
  api.close();
  assert.equal(f.input.emit("keydown",{key:"Home"}).defaultPrevented,false);
  api.dispose();
});

test("refresh removes stale ARIA active descendant after dynamic option disabling",()=>{
  const f=fixture(),api=initCombobox(f.input,f.list);
  api.open();f.input.emit("keydown",{key:"ArrowDown"});
  assert.equal(f.input.getAttribute("aria-activedescendant"),"option-0");
  f.choices[0].setAttribute("aria-disabled","true");
  api.refresh();
  assert.equal(f.input.getAttribute("aria-activedescendant"),null);
  assert.equal(f.choices[0].getAttribute("data-gc-active"),null);
  f.input.emit("keydown",{key:"ArrowDown"});
  assert.equal(f.input.getAttribute("aria-activedescendant"),"option-2");
  f.choices[2].disabled=true;
  api.refresh();
  const noChoices=f.input.emit("keydown",{key:"Home"});
  assert.equal(noChoices.defaultPrevented,false);
  assert.equal(f.input.getAttribute("aria-activedescendant"),null);
  api.dispose();
});

test("Home and End are ignored during asynchronous selection without mutating pending input",async()=>{
  const f=fixture();let settle;
  const gate=new Promise(resolve=>{settle=resolve});
  const api=initCombobox(f.input,f.list,{onSelect:()=>gate});
  api.open();
  f.input.emit("keydown",{key:"ArrowDown"});
  f.input.emit("keydown",{key:"Enter"});
  assert.equal(f.input.getAttribute("aria-busy"),"true");
  assert.equal(f.input.emit("keydown",{key:"End"}).defaultPrevented,false);
  assert.equal(f.input.getAttribute("aria-activedescendant"),"option-0");
  settle();
  for(let i=0;i<5;i++)await Promise.resolve();
  assert.equal(f.input.value,"Iris");
  assert.equal(f.list.hidden,true);
  api.dispose();
});

test("composition defers native IME text without prematurely selecting an option",async()=>{
  const f=fixture(),selected=[];
  const api=initCombobox(f.input,f.list,{onSelect:(_option,value)=>selected.push(value)});
  api.open();
  f.input.emit("keydown",{key:"ArrowDown"});
  assert.equal(f.input.getAttribute("aria-activedescendant"),"option-0");
  f.input.emit("compositionstart");
  assert.equal(f.input.getAttribute("aria-activedescendant"),null);
  f.input.value="Mos";
  f.input.emit("input",{isComposing:true});
  assert.equal(f.choices[0].hidden,false,"Preedit input must not filter visible choices");
  for(const key of ["Enter","ArrowDown","Home","Escape"]) {
    const event=f.input.emit("keydown",{key,isComposing:true});
    assert.equal(event.defaultPrevented,false,"IME must own "+key);
  }
  assert.deepEqual(selected,[]);
  f.input.emit("compositionend");
  assert.equal(f.choices[0].hidden,true);
  assert.equal(f.choices[2].hidden,false);
  assert.equal(f.status.textContent,"1 option available");
  f.input.emit("keydown",{key:"ArrowDown"});
  assert.equal(f.input.getAttribute("aria-activedescendant"),"option-2");
  assert.equal(f.input.emit("keydown",{key:"Enter",keyCode:229}).defaultPrevented,false);
  assert.deepEqual(selected,[],"Legacy IME keyCode 229 cannot commit an option");
  f.input.emit("keydown",{key:"Enter"});
  await Promise.resolve();
  assert.deepEqual(selected,["moss"]);
  assert.equal(f.input.value,"Moss");
  api.dispose();
});

test("disposing a composing combobox removes IME listeners without a late selection",()=>{
  const f=fixture(),selected=[];
  const api=initCombobox(f.input,f.list,{onSelect:(_option,value)=>selected.push(value)});
  api.open();
  f.input.emit("compositionstart");
  f.input.value="M";
  api.dispose();
  f.input.emit("compositionend");
  f.input.emit("input");
  f.input.emit("keydown",{key:"Enter",isComposing:true});
  assert.deepEqual(selected,[]);
  assert.equal(f.list.hidden,true);
  assert.equal(f.input.getAttribute("aria-expanded"),"false");
});

test("preedit pointer gesture cannot select even when composition ends before click",async()=>{
  const f=fixture(),selected=[];
  const api=initCombobox(f.input,f.list,{onSelect:(_option,value)=>selected.push(value)});
  api.open();
  f.input.emit("compositionstart");
  const down=f.list.emit("pointerdown",{target:f.choices[0]});
  assert.equal(down.defaultPrevented,false,"IME retains native focus/commit handling");
  f.input.emit("compositionend");
  f.list.emit("click",{target:f.choices[0]});
  await Promise.resolve();
  assert.deepEqual(selected,[],"Late click from the composing pointer gesture must not select");
  assert.equal(f.input.value,"");
  // A new deliberate pointer gesture is allowed.
  const next=f.list.emit("pointerdown",{target:f.choices[0]});
  assert.equal(next.defaultPrevented,true);
  f.list.emit("click",{target:f.choices[0]});
  await Promise.resolve();
  assert.deepEqual(selected,["iris"]);
  api.dispose();
});

test("pointercancel clears deferred IME click guard, and direct composing clicks are denied",async()=>{
  const f=fixture(),selected=[];
  const api=initCombobox(f.input,f.list,{onSelect:(_option,value)=>selected.push(value)});
  api.open();
  f.input.emit("compositionstart");
  f.list.emit("click",{target:f.choices[0]});
  f.list.emit("pointerdown",{target:f.choices[0]});
  f.list.emit("pointercancel");
  f.input.emit("compositionend");
  assert.deepEqual(selected,[]);
  f.list.emit("click",{target:f.choices[0]});
  await Promise.resolve();
  assert.deepEqual(selected,["iris"],"Cancelled gesture cannot suppress later deliberate activation");
  api.dispose();
});
