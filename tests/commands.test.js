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
