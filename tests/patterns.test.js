import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { initAccordion, initToggleGroup, bindRangeOutput, initDrawer, createThemeController } from "../src/index.js";

function node(attributes={}) {
  const callbacks=new Map();
  return {
    attributes:{...attributes}, disabled:false, open:false, tabIndex:0,
    addEventListener(name,fn){if(!callbacks.has(name))callbacks.set(name,new Set());callbacks.get(name).add(fn)},
    removeEventListener(name,fn){callbacks.get(name)?.delete(fn)},
    getAttribute(k){return this.attributes[k]??null},setAttribute(k,v){this.attributes[k]=String(v)},
    focus(){this.focused=true},
    emit(name,extra={}) {const e={currentTarget:this,key:"",prevented:false,preventDefault(){this.prevented=true},...extra};
      for(const fn of callbacks.get(name)||[])fn(e);return e}
  };
}
test("native accordion single-open coordination and teardown",()=>{
  const [a,b,c]=[node(),node(),node()];a.open=true;b.open=true;
  const group={querySelectorAll:()=>[a,b,c]};const dispose=initAccordion(group);
  assert.equal(a.open,true);assert.equal(b.open,false);
  c.open=true;c.emit("toggle");assert.equal(a.open,false);
  dispose();a.open=true;a.emit("toggle");assert.equal(c.open,true);
  assert.throws(()=>initAccordion({querySelectorAll:()=>[]}),/at least one/);
});
test("toggle toolbar supports arrow navigation, disabled skip, RTL and detach",()=>{
  const [a,b,c]=[node({"aria-pressed":"true"}),node({"aria-pressed":"false"}),node({"aria-pressed":"false"})];
  b.disabled=true;
  const group=node({"aria-orientation":"horizontal"});group.querySelectorAll=()=>[a,b,c];
  const document={documentElement:{dir:"ltr"}};group.ownerDocument=document;
  let changeCount=0;
  const dispose=initToggleGroup(group,{onChange:()=>changeCount++});
  assert.equal(a.tabIndex,0);
  const event=a.emit("keydown",{key:"ArrowRight"});
  assert.equal(event.prevented,true);assert.equal(c.attributes["aria-pressed"],"true");assert.equal(c.focused,true);
  c.emit("keydown",{key:"Home"});assert.equal(a.attributes["aria-pressed"],"true");
  document.documentElement.dir="rtl";a.emit("keydown",{key:"ArrowRight"});
  assert.equal(c.attributes["aria-pressed"],"true");
  b.emit("click");assert.equal(c.attributes["aria-pressed"],"true");
  assert.equal(changeCount,3);
  dispose();a.emit("click");assert.equal(c.attributes["aria-pressed"],"true");
  assert.throws(()=>initToggleGroup(group,{onChange:"invalid"}),TypeError);
});
test("aria-disabled toggle options cannot become active or receive roving focus",()=>{
  const [a,b,c]=[node({"aria-pressed":"false"}),
    node({"aria-pressed":"true","aria-disabled":"true"}),node({"aria-pressed":"false"})];
  const group=node();group.querySelectorAll=()=>[a,b,c];
  group.ownerDocument={documentElement:{dir:"ltr"}};
  const changes=[];const dispose=initToggleGroup(group,{onChange:button=>changes.push(button)});
  assert.equal(a.getAttribute("aria-pressed"),"true");
  assert.equal(b.getAttribute("aria-pressed"),"false");
  assert.equal(b.tabIndex,-1);
  a.emit("keydown",{key:"ArrowRight"});
  assert.equal(c.getAttribute("aria-pressed"),"true");
  assert.equal(c.focused,true);
  b.emit("click");
  assert.equal(c.getAttribute("aria-pressed"),"true");
  const ignored=b.emit("keydown",{key:"ArrowRight"});
  assert.equal(ignored.prevented,false);
  assert.deepEqual(changes,[c]);
  dispose();
});

test("range output uses textContent and detaches",()=>{
  const input=node();input.type="range";input.value="12";const output={textContent:"",value:""};
  const dispose=bindRangeOutput(input,output,{format:v=>"<"+v+">"});
  assert.equal(output.textContent,"<12>");
  input.value="36";input.emit("input");assert.equal(output.value,"<36>");
  dispose();input.value="18";input.emit("input");assert.equal(output.textContent,"<36>");
  assert.throws(()=>bindRangeOutput({type:"text"},output),TypeError);
});
test("native side drawer closes, returns focus and unregisters",()=>{
  const modal=node();modal.showModal=function(){this.open=true};
  modal.close=function(){this.open=false;this.emit("close")};
  const open=node(),close=node();const dispose=initDrawer(modal,open,close);
  open.emit("click");assert.equal(modal.open,true);
  close.emit("click");assert.equal(modal.open,false);assert.equal(open.focused,true);
  dispose();open.emit("click");assert.equal(modal.open,false);
  assert.throws(()=>initDrawer({},open,close),TypeError);
});
test("custom accents update in auto mode on OS appearance change",()=>{
  const prior=globalThis.matchMedia;const listeners=new Set();let dark=false;
  globalThis.matchMedia=()=>({get matches(){return dark},
    addEventListener(_,fn){listeners.add(fn)},removeEventListener(_,fn){listeners.delete(fn)}});
  try{
    const attrs=new Map(),props=new Map();
    const root={setAttribute(k,v){attrs.set(k,v)},
      style:{setProperty(k,v){props.set(k,v)},removeProperty(k){props.delete(k)}}};
    const controller=createThemeController(root,{mode:"auto",accent:"iris",customAccent:"#EDEDED"});
    const old=props.get("--gc-brand");dark=true;for(const fn of listeners)fn();
    assert.notEqual(old,props.get("--gc-brand"));
    controller.update({mode:"light"});const fixed=props.get("--gc-brand");
    for(const fn of listeners)fn();assert.equal(props.get("--gc-brand"),fixed);
    assert.throws(()=>controller.update({accent:"bad"}),RangeError);
    assert.equal(attrs.get("data-gc-accent"),"iris");
    controller.dispose();controller.dispose();assert.equal(listeners.size,0);
    assert.throws(()=>controller.update(),/disposed/);
  }finally{if(prior===undefined)delete globalThis.matchMedia;else globalThis.matchMedia=prior}
});
test("interaction styles, native semantics and lab examples stay in sync",()=>{
  const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
  const css=load("src/components.css"),lab=load("lab/index.html"),js=load("lab/app.js");
  for(const klass of [".gc-accordion",".gc-drawer",".gc-range",".gc-breadcrumbs",".gc-details-list",".gc-steps",".gc-toolbar"])assert.ok(css.includes(klass));
  for(const id of ["demo-accordion","demo-drawer","demo-radius","demo-toggle-group","demo-custom-accent"])assert.ok(lab.includes('id="'+id+'"'),id);
  for(const fn of ["initAccordion(","initDrawer(","bindRangeOutput(","initToggleGroup(","createThemeController("])assert.ok(js.includes(fn),fn);
  assert.doesNotMatch(lab,/\bonclick\s*=/i);
});

test("failed initial range formatter does not retain event listeners or mutate output", () => {
  let additions = 0;
  const callbacks = new Set();
  const input = {
    type: "range", value: "17",
    addEventListener(_event, callback) { additions++; callbacks.add(callback); },
    removeEventListener(_event, callback) { callbacks.delete(callback); },
  };
  const output = { textContent: "original", value: "original" };
  assert.throws(() => bindRangeOutput(input, output, {
    format() { throw new Error("formatter failed"); },
  }), /formatter failed/);
  assert.equal(additions, 0, "initial render failure must not install a handler");
  assert.equal(callbacks.size, 0);
  assert.equal(output.textContent, "original");
  assert.equal(output.value, "original");
  const dispose = bindRangeOutput(input, output, { format: value => "value:" + value });
  assert.equal(output.textContent, "value:17");
  assert.equal(callbacks.size, 1);
  dispose();
  assert.equal(callbacks.size, 0);
});

test("drawer does not steal focus when an externally managed dialog closes", () => {
  const dialog = node(), open = node(), close = node();
  dialog.showModal = function () { this.open = true; };
  dialog.close = function () { this.open = false; this.emit("close"); };
  const dispose = initDrawer(dialog, open, close);
  dialog.open = true; // another owner opened the dialog
  dialog.close();
  assert.notEqual(open.focused, true, "external close must not redirect focus");
  open.emit("click");
  assert.equal(dialog.open, true);
  close.emit("click");
  assert.equal(open.focused, true, "controller-owned close restores focus");
  dispose();
});

test("accordion initialization unregisters partially installed listeners on failure", () => {
  const first = node(), second = node();
  first.open = true;
  const add = second.addEventListener.bind(second);
  second.addEventListener = (...args) => {
    add(...args);
    throw new Error("injected registration failure");
  };
  assert.throws(() => initAccordion({querySelectorAll: () => [first, second]}), /registration failure/);
  second.open = true;
  first.emit("toggle");
  assert.equal(second.open, true, "the first listener was rolled back");
});

test("toggle-group initialization rolls back click when keydown attachment fails", () => {
  const a = node({"aria-pressed": "true"}), b = node({"aria-pressed": "false"});
  const add = a.addEventListener.bind(a);
  a.addEventListener = (name, fn) => {
    add(name, fn);
    if (name === "keydown") throw new Error("injected key listener failure");
  };
  const toolbar = node();
  toolbar.querySelectorAll = () => [a, b];
  assert.throws(() => initToggleGroup(toolbar), /key listener failure/);
  b.emit("click");
  assert.equal(a.getAttribute("aria-pressed"), "true");
  a.emit("keydown", {key: "ArrowRight"});
  assert.equal(b.getAttribute("aria-pressed"), "false");
});

test("drawer initialization rolls back opener and closer listeners on failure", () => {
  const dialog = node(), open = node(), close = node();
  dialog.showModal = function () { this.open = true; };
  dialog.close = function () { this.open = false; this.emit("close"); };
  const add = dialog.addEventListener.bind(dialog);
  dialog.addEventListener = (...args) => {
    add(...args);
    throw new Error("dialog listener failure");
  };
  assert.throws(() => initDrawer(dialog, open, close), /dialog listener failure/);
  open.emit("click");
  assert.equal(dialog.open, false, "failed controller must not open dialog");
  dialog.open = true;
  close.emit("click");
  assert.equal(dialog.open, true, "failed controller must not close dialog");
});
