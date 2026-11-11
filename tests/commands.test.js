import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesCommand, initCommandPalette } from "../src/commands.js";
import { readFileSync } from "node:fs";

test("command matching is Unicode-normalized plain text, not a regex", () => {
  assert.equal(matchesCommand("DARK","Switch to dark mode","night"),true);
  assert.equal(matchesCommand("night","Switch to dark mode","night"),true);
  assert.equal(matchesCommand("(","Show notification","message"),false);
  assert.equal(matchesCommand("<img src=x>","show image",""),false);
  assert.equal(matchesCommand("re\u0301sume\u0301","Résumé",""),true);
  assert.equal(matchesCommand("other","Résumé",""),false);
});
test("command controller refuses non-native or inert shells", () => {
  assert.throws(()=>initCommandPalette(null,{onSelect() {}}),TypeError);
  const fake={showModal(){},close(){},querySelector(){return null},querySelectorAll(){return []},ownerDocument:{addEventListener(){}}};
  assert.throws(()=>initCommandPalette(fake),/onSelect/);
  assert.throws(()=>initCommandPalette(fake,{onSelect(){}}),/input/);
});
test("aria-disabled commands and rows cannot be activated by pointer or keyboard", () => {
  function emitter(attrs={}) {
    const events=new Map();
    return {attrs:{...attrs},hidden:false,disabled:false,value:"",textContent:"",open:false,
      getAttribute(k){return this.attrs[k]??null},
      setAttribute(k,v){this.attrs[k]=String(v)},
      removeAttribute(k){delete this.attrs[k]},
      addEventListener(k,fn){if(!events.has(k))events.set(k,new Set());events.get(k).add(fn)},
      removeEventListener(k,fn){events.get(k)?.delete(fn)},
      emit(k,extra={}){const e={currentTarget:this,target:this,key:"",prevented:false,
        preventDefault(){this.prevented=true},...extra};
        for(const fn of events.get(k)||[])fn(e);return e},
      focus(){this.focused=true}
    };
  }
  const owner=emitter(),input=emitter(),status=emitter(),empty=emitter();
  const rows=[emitter(),emitter({"aria-disabled":"true"}),emitter()];
  const buttons=["Blocked button","Blocked row","Available"].map((label,i)=>{
    const button=emitter(i===0?{"aria-disabled":"true"}:{});
    button.textContent=label;button.closest=()=>rows[i];return button;
  });
  const dialog=emitter();dialog.ownerDocument=owner;
  dialog.querySelector=selector=>selector==='input[type="search"]'?input:
    selector==="[data-gc-command-status]"?status:
    selector==="[data-gc-command-empty]"?empty:null;
  dialog.querySelectorAll=()=>buttons;
  dialog.showModal=()=>{dialog.open=true};
  dialog.close=()=>{dialog.open=false;dialog.emit("close")};
  const actions=[];
  const api=initCommandPalette(dialog,{shortcut:false,onSelect:button=>actions.push(button)});
  api.open();
  const enter=input.emit("keydown",{key:"Enter"});
  assert.equal(enter.prevented,true);
  assert.deepEqual(actions,[buttons[2]]);
  assert.equal(status.textContent,"1 command available");
  api.open();buttons[0].emit("click");buttons[1].emit("click");
  assert.deepEqual(actions,[buttons[2]]);
  api.dispose();
});

test("command stylesheet, typings, lab and browser verification remain connected", () => {
  const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
  const pkg=JSON.parse(load("package.json"));
  assert.equal(pkg.exports["./commands"].default,"./src/commands.js");
  assert.ok(load("src/commands.d.ts").includes("initCommandPalette"));
  const lab=load("lab/index.html"),smoke=load("tests/browser-smoke.html");
  assert.ok(lab.includes('id="command-dialog"'));
  assert.ok(lab.includes('id="open-command"'));
  assert.ok(smoke.includes("command search filters safely"));
  assert.ok(load("src/components.css").includes(".gc-command__item"));
});


function asyncPaletteFixture(){
  const make=(attrs={})=>{
    const listeners=new Map();
    return {
      attrs:{...attrs},open:false,hidden:false,disabled:false,value:"",textContent:"",
      isConnected:true,
      getAttribute(k){return this.attrs[k]??null},
      setAttribute(k,v){this.attrs[k]=String(v)},
      removeAttribute(k){delete this.attrs[k]},
      addEventListener(k,cb){const list=listeners.get(k)||[];list.push(cb);listeners.set(k,list)},
      removeEventListener(k,cb){listeners.set(k,(listeners.get(k)||[]).filter(x=>x!==cb))},
      emit(k,extra={}){const e={currentTarget:this,target:this,key:"",defaultPrevented:false,
        preventDefault(){this.defaultPrevented=true},...extra};
        for(const cb of listeners.get(k)||[])cb(e);return e;
      },
      focus(){this.focused=true;this.ownerDocument.activeElement=this},
    };
  };
  const owner=make(),outside=make(),invoker=make(),input=make(),status=make(),empty=make();
  owner.body=make();owner.body.ownerDocument=owner;
  for(const n of [outside,invoker,input,status,empty])n.ownerDocument=owner;
  const button=make();
  button.ownerDocument=owner;button.textContent="Open file";
  const row=make();row.ownerDocument=owner;
  button.closest=()=>row;
  const dialog=make();dialog.ownerDocument=owner;
  dialog.querySelector=selector=>selector==='input[type="search"]'?input:
    selector==="[data-gc-command-status]"?status:
    selector==="[data-gc-command-empty]"?empty:null;
  const commands=[button];
  dialog.querySelectorAll=()=>commands.slice();
  dialog.contains=node=>[dialog,input,row,button,status,empty].includes(node);
  dialog.showModal=()=>{dialog.open=true};
  dialog.close=()=>{dialog.open=false;dialog.emit("close")};
  const activate=()=>button.emit("click");
  return {make,owner,dialog,button,input,invoker,outside,status,empty,commands,activate};
}

test("pending command success cannot close a reopened palette or steal current focus",async()=>{
  const f=asyncPaletteFixture();let settle;
  const gate=new Promise(resolve=>{settle=resolve});
  f.invoker.focus();
  const api=initCommandPalette(f.dialog,{shortcut:false,onSelect:()=>gate});
  api.open();f.activate();
  assert.equal(f.dialog.getAttribute("aria-busy"),"true");
  api.close();
  f.outside.focus();
  api.open();
  assert.equal(f.dialog.open,true);
  settle();
  for(let i=0;i<7;i++)await Promise.resolve();
  assert.equal(f.dialog.open,true,"A prior action must not close the next dialog session");
  assert.equal(f.dialog.getAttribute("aria-busy"),null);
  api.dispose();
});

test("late rejected command never announces stale status after external dismissal",async()=>{
  const f=asyncPaletteFixture();let rejectAction;
  const gate=new Promise((_resolve,reject)=>{rejectAction=reject});
  f.invoker.focus();
  const api=initCommandPalette(f.dialog,{shortcut:false,onSelect:()=>gate});
  api.open();f.activate();
  f.dialog.open=false; // Native Escape dismissal before queued close notification.
  f.outside.focus();
  f.dialog.emit("close");
  assert.equal(f.owner.activeElement,f.outside,
    "Closing after focus moved outside must not restore the prior invoker");
  const prior=f.status.textContent;
  rejectAction(Error("private upstream failure"));
  for(let i=0;i<7;i++)await Promise.resolve();
  assert.equal(f.status.textContent,prior);
  assert.equal(f.owner.activeElement,f.outside);
  assert.equal(f.dialog.getAttribute("aria-busy"),null);
  api.dispose();
});

test("ordinary dialog close restores invoker only when focus still belongs to dialog",()=>{
  const f=asyncPaletteFixture();
  f.invoker.focus();
  const api=initCommandPalette(f.dialog,{shortcut:false,onSelect:()=>{}});
  api.open();
  assert.equal(f.owner.activeElement,f.input);
  api.close();
  assert.equal(f.owner.activeElement,f.invoker);
  api.open();
  f.outside.focus();
  api.close();
  assert.equal(f.owner.activeElement,f.outside,
    "A deliberate outside focus move must not be stolen on close");
  api.dispose();
});


test("IME composition never activates commands or filters incomplete search text",async()=>{
  const f=asyncPaletteFixture();
  const actions=[];
  f.invoker.focus();
  const api=initCommandPalette(f.dialog,{shortcut:false,onSelect:button=>actions.push(button)});
  api.open();
  const initial=f.status.textContent;
  assert.equal(initial,"1 command available");
  f.input.emit("compositionstart");
  f.input.value="nonexistent";
  f.input.emit("input",{isComposing:true});
  assert.equal(f.status.textContent,initial,
    "Do not announce uncommitted IME input as a finished search");
  for(const details of [{key:"Enter",isComposing:true},{key:"Enter",keyCode:229},
      {key:"Process"},{key:"ArrowDown",isComposing:true}]) {
    const event=f.input.emit("keydown",details);
    assert.equal(event.defaultPrevented,false,"Do not capture IME keyboard keys");
  }
  assert.deepEqual(actions,[]);
  f.input.emit("compositionend");
  assert.equal(f.status.textContent,"No matching commands");
  f.input.value="open";
  f.input.emit("input");
  const event=f.input.emit("keydown",{key:"Enter"});
  assert.equal(event.defaultPrevented,true);
  await Promise.resolve();
  assert.deepEqual(actions,[f.button]);
  api.dispose();
});

test("global command shortcut ignores IME input and conflicting modified combinations",()=>{
  const f=asyncPaletteFixture();
  f.invoker.focus();
  const api=initCommandPalette(f.dialog,{shortcut:true,onSelect:()=>{}});
  for(const extra of [
    {key:"k",ctrlKey:true,isComposing:true},
    {key:"k",metaKey:true,keyCode:229},
    {key:"k",ctrlKey:true,altKey:true},
    {key:"k",ctrlKey:true,shiftKey:true},
  ]) {
    const event=f.owner.emit("keydown",extra);
    assert.equal(event.defaultPrevented,false);
    assert.equal(f.dialog.open,false);
  }
  const valid=f.owner.emit("keydown",{key:"k",ctrlKey:true});
  assert.equal(valid.defaultPrevented,true);
  assert.equal(f.dialog.open,true);
  api.close();
  api.dispose();
});

test("command refresh discovers late native buttons and detaches removed actions",async()=>{
  const f=asyncPaletteFixture(),actions=[];
  f.invoker.focus();
  const api=initCommandPalette(f.dialog,{shortcut:false,onSelect:button=>actions.push(button)});
  api.open();
  f.input.value="mesh";
  f.input.emit("input");
  assert.equal(f.status.textContent,"No matching commands");
  const row=f.make(),added=f.make();
  added.ownerDocument=f.owner;
  added.textContent="Mesh integrations";
  added.closest=()=>row;
  f.commands.push(added);
  api.refresh();
  assert.equal(f.status.textContent,"1 command available");
  assert.equal(f.empty.hidden,true);
  added.focus();
  f.commands.splice(f.commands.indexOf(added),1);
  api.refresh();
  assert.equal(f.owner.activeElement,f.input,
    "Removing a focused command should restore keyboard focus to search");
  assert.equal(f.status.textContent,"No matching commands");
  added.emit("click");
  added.emit("keydown",{key:"Enter"});
  assert.deepEqual(actions,[],"Detached native commands cannot execute");
  api.dispose();
});

test("dynamic command refresh remains idempotent, handles empty list and later recovery",async()=>{
  const f=asyncPaletteFixture(),actions=[];
  const api=initCommandPalette(f.dialog,{shortcut:false,onSelect:button=>actions.push(button)});
  api.open();
  f.commands.splice(0,1);
  api.refresh();
  assert.equal(f.status.textContent,"No matching commands");
  assert.equal(f.empty.hidden,false);
  const emptyEnter=f.input.emit("keydown",{key:"Enter"});
  assert.equal(emptyEnter.defaultPrevented,false);
  assert.deepEqual(actions,[]);
  const row=f.make(),added=f.make();
  added.ownerDocument=f.owner;
  added.textContent="Local command";
  added.closest=()=>row;
  f.commands.push(added);
  api.refresh();api.refresh();api.refresh();
  assert.equal(f.status.textContent,"1 command available");
  const selected=f.input.emit("keydown",{key:"Enter"});
  assert.equal(selected.defaultPrevented,true);
  await Promise.resolve();
  assert.deepEqual(actions,[added],"Repeated refresh cannot attach duplicate listeners");
  api.open();
  added.emit("click");
  await Promise.resolve();
  assert.deepEqual(actions,[added,added]);
  api.dispose();
  added.emit("click");
  assert.equal(actions.length,2,"Disposal must unregister dynamically registered commands");
});
