import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {initBottomNavigation} from "../src/bottom-nav.js";
function element(attrs={}) {
 const listeners=new Map();
 return {attrs:{...attrs},hidden:false,focused:false,
  getAttribute(k){return this.attrs[k]??null},setAttribute(k,v){this.attrs[k]=String(v)},
  removeAttribute(k){delete this.attrs[k]},
  addEventListener(k,fn){const s=listeners.get(k)||new Set();s.add(fn);listeners.set(k,s)},
  removeEventListener(k,fn){listeners.get(k)?.delete(fn)},
  emit(k,opts={}){const e={target:this,key:"",altKey:false,ctrlKey:false,metaKey:false,
   defaultPrevented:false,preventDefault(){this.defaultPrevented=true},...opts};
   for(const fn of listeners.get(k)||[])fn(e);return e},
  closest(s){return s==="a[href]"?this:null},
  focus(){this.focused=true;this.ownerDocument.activeElement=this}
 };
}
function fixture(){
 const win=element();win.location={pathname:"/app/",search:"",hash:"#home"};
 const doc={baseURI:"https://goreecloud.example/app/#home",defaultView:win,documentElement:{dir:"ltr"},activeElement:null};
 const links=["home","files","settings","account"].map(id=>{const x=element({href:"#"+id});x.ownerDocument=doc;return x});
 const nav=element({"aria-label":"Primary destinations"});nav.tagName="NAV";nav.ownerDocument=doc;nav.querySelectorAll=()=>links;
 return {nav,links,doc,win};
}
test("real links maintain aria-current and sync to browser history",()=>{
 const f=fixture(),calls=[];const ctrl=initBottomNavigation(f.nav,{onNavigate:link=>{calls.push(link);}});
 assert.equal(f.links[0].getAttribute("aria-current"),"page");
 const e=f.nav.emit("click",{target:f.links[1]});
 assert.equal(e.defaultPrevented,false);
 assert.deepEqual(calls,[f.links[1]]);
 assert.equal(f.links[1].getAttribute("aria-current"),"page");
 f.win.location.hash="#settings";f.win.emit("hashchange");
 assert.equal(f.links[2].getAttribute("aria-current"),"page");
 ctrl.dispose();f.win.location.hash="#account";f.win.emit("hashchange");
 assert.equal(f.links[2].getAttribute("aria-current"),"page");
});
test("RTL arrow keys and Home/End focus without navigating or selecting",()=>{
 const f=fixture();f.doc.documentElement.dir="rtl";
 f.links[1].setAttribute("aria-disabled","true");
 const ctrl=initBottomNavigation(f.nav);
 const e=f.nav.emit("keydown",{target:f.links[0],key:"ArrowLeft"});
 assert.equal(e.defaultPrevented,true);
 assert.equal(f.links[2].focused,true);
 assert.equal(f.links[0].getAttribute("aria-current"),"page");
 f.nav.emit("keydown",{target:f.links[2],key:"End"});
 assert.equal(f.links[3].focused,true);
 f.nav.emit("keydown",{target:f.links[3],key:"ArrowRight"});
 assert.equal(f.links[2].focused,true);
 ctrl.dispose();
 assert.equal(f.nav.emit("keydown",{target:f.links[0],key:"Home"}).defaultPrevented,false);
});
test("disabled links and consumer callback veto block navigation",()=>{
 const f=fixture();f.links[1].setAttribute("aria-disabled","true");
 const ctrl=initBottomNavigation(f.nav,{onNavigate:()=>false});
 assert.equal(f.nav.emit("click",{target:f.links[1]}).defaultPrevented,true);
 assert.equal(f.nav.emit("click",{target:f.links[2]}).defaultPrevented,true);
 assert.equal(f.links[0].getAttribute("aria-current"),"page");
 assert.equal(ctrl.select(f.links[1]),false);
 ctrl.dispose();
});
test("URL boundaries, duplicate routes, invalid nav or callbacks fail closed",()=>{
 assert.throws(()=>initBottomNavigation(null),TypeError);
 let f=fixture();f.nav.attrs["aria-label"]=null;assert.throws(()=>initBottomNavigation(f.nav),/accessible name/);
 f=fixture();f.links[1].attrs.href="javascript:alert(1)";assert.throws(()=>initBottomNavigation(f.nav),/same-origin/);
 f=fixture();f.links[1].attrs.href="https://outside.example";assert.throws(()=>initBottomNavigation(f.nav),/same-origin/);
 f=fixture();f.links[1].attrs.href="#home";assert.throws(()=>initBottomNavigation(f.nav),/unique/);
 f=fixture();f.links[1].attrs.href="#";assert.throws(()=>initBottomNavigation(f.nav),/real link/);
 f=fixture();f.nav.querySelectorAll=()=>f.links.slice(0,1);assert.throws(()=>initBottomNavigation(f.nav),/two to six/);
 f=fixture();assert.throws(()=>initBottomNavigation(f.nav,{onNavigate:3}),TypeError);
});
test("canonical styling, package exports and non-native status documented",()=>{
 const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
 const css=read("src/components.css"),pkg=JSON.parse(read("package.json"));
 const reg=JSON.parse(read("registry/design-authority.v1.json"));
 for(const x of [".gc-bottom-nav {",".gc-bottom-nav-content","env(safe-area-inset-bottom,0px)",
  "prefers-reduced-transparency:reduce","forced-colors:active",
  ".gc-app a.gc-bottom-nav__link[aria-current"])assert.ok(css.includes(x),x);
 assert.equal(pkg.exports["./bottom-nav"].default,"./src/bottom-nav.js");
 assert.equal(reg.bottomNavigation.requirement,"floating-at-application-bottom");
 assert.equal(reg.nativeSdkStatus,"not-implemented");
 assert.equal(reg.consumerMigrationStatus,"not-audited");
});

test("dock content clearance overrides consumer shorthand padding rules",()=>{
  const css=readFileSync(new URL("../src/components.css",import.meta.url),"utf8");
  assert.equal(css.split(".gc-app .gc-bottom-nav-content {").length-1,2);
});

test("mobile dock labels truncate on one line rather than breaking words",()=>{
  const css=readFileSync(new URL("../src/components.css",import.meta.url),"utf8");
  assert.ok(css.includes(".gc-bottom-nav__link > span {"));
  assert.ok(css.includes("white-space:nowrap; text-overflow:ellipsis"));
  const lab=readFileSync(new URL("../lab/index.html",import.meta.url),"utf8");
  assert.ok(lab.includes('<span>Library</span></a>'));
});

test("thrown authorization callback fails closed and keeps the previous destination",()=>{
 const f=fixture();
 const ctrl=initBottomNavigation(f.nav,{onNavigate(){throw new Error("internal account failure")}});
 const event=f.nav.emit("click",{target:f.links[2]});
 assert.equal(event.defaultPrevented,true);
 assert.equal(f.links[0].getAttribute("aria-current"),"page");
 assert.equal(f.links[2].getAttribute("aria-current"),null);
 ctrl.dispose();
});
test("async and malformed decisions never authorize native route changes",async()=>{
 const f=fixture();let calls=0;
 const ctrl=initBottomNavigation(f.nav,{onNavigate(){
   calls++;return calls===1?Promise.reject(new Error("secret")):42;
 }});
 const first=f.nav.emit("click",{target:f.links[1]});
 assert.equal(first.defaultPrevented,true);
 const second=f.nav.emit("click",{target:f.links[2]});
 assert.equal(second.defaultPrevented,true);
 await Promise.resolve();await Promise.resolve();
 assert.equal(f.links[0].getAttribute("aria-current"),"page");
 ctrl.dispose();
});

test("adaptive content clearance follows actual dock height and restores prior setting",()=>{
 const f=fixture();
 const styleMap=new Map([["--gc-bottom-nav-clearance","64px"]]);
 const content={ownerDocument:f.doc,style:{
   setProperty:(k,v)=>styleMap.set(k,v),
   getPropertyValue:k=>styleMap.get(k)||"",
   removeProperty:k=>styleMap.delete(k)
 }};
 let height=120;f.nav.getBoundingClientRect=()=>({height});
 f.win.getComputedStyle=()=>({bottom:"24px"});
 let observer=null;
 f.win.ResizeObserver=class {
   constructor(callback){this.callback=callback;observer=this}
   observe(el){assert.equal(el,f.nav)}
   disconnect(){this.stopped=true}
 };
 const ctrl=initBottomNavigation(f.nav,{content});
 assert.equal(styleMap.get("--gc-bottom-nav-clearance"),"160px");
 height=220;observer.callback();
 assert.equal(styleMap.get("--gc-bottom-nav-clearance"),"260px");
 ctrl.dispose();
 assert.equal(styleMap.get("--gc-bottom-nav-clearance"),"64px");
 assert.equal(observer.stopped,true);
});
test("invalid clearance target is rejected before listeners are attached",()=>{
 const f=fixture();
 assert.throws(()=>initBottomNavigation(f.nav,{content:{style:{setProperty(){}}}}),TypeError);
});


test("modified, already-canceled, external browsing-context and download clicks never change current destination",()=>{
  const f=fixture();
  let calls=0;
  const ctl=initBottomNavigation(f.nav,{onNavigate:()=>{calls++;return true;}});
  const modes=[
    {ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},
    {button:1},{button:2},{defaultPrevented:true}
  ];
  for(const options of modes) {
    const event=f.nav.emit("click",{target:f.links[1],...options});
    assert.equal(f.links[0].getAttribute("aria-current"),"page",JSON.stringify(options));
    assert.equal(f.links[1].getAttribute("aria-current"),null);
    assert.equal(calls,0,"New-context or canceled event must not run route callback");
    if(!options.defaultPrevented)assert.equal(event.defaultPrevented,false);
  }
  f.links[2].setAttribute("target","_blank");
  f.nav.emit("click",{target:f.links[2]});
  assert.equal(f.links[0].getAttribute("aria-current"),"page");
  f.links[2].removeAttribute("target");
  f.links[2].setAttribute("download","workspace.json");
  f.nav.emit("click",{target:f.links[2]});
  assert.equal(f.links[0].getAttribute("aria-current"),"page");
  assert.equal(calls,0);
  f.links[2].removeAttribute("download");
  f.nav.emit("click",{target:f.links[2]});
  assert.equal(f.links[2].getAttribute("aria-current"),"page");
  assert.equal(calls,1);
  ctl.dispose();
});

test("disabled navigation remains blocked even with modifier keys",()=>{
  const f=fixture();f.links[2].setAttribute("aria-disabled","true");
  const ctl=initBottomNavigation(f.nav);
  for(const options of [{ctrlKey:true},{metaKey:true},{shiftKey:true}]) {
    const event=f.nav.emit("click",{target:f.links[2],...options});
    assert.equal(event.defaultPrevented,true);
    assert.equal(f.links[0].getAttribute("aria-current"),"page");
  }
  ctl.dispose();
});

test("invalid dock measurements never overwrite a previously valid clearance",()=>{
 const f=fixture();
 const values=new Map();
 const content={ownerDocument:f.doc,style:{
   setProperty:(k,v)=>values.set(k,v),
   getPropertyValue:k=>values.get(k)||"",
   removeProperty:k=>values.delete(k)
 }};
 let height=100, observer;
 f.nav.getBoundingClientRect=()=>({height});
 f.win.getComputedStyle=()=>({bottom:"12px"});
 f.win.ResizeObserver=class {
   constructor(callback){this.callback=callback;observer=this}
   observe(){}
   disconnect(){}
 };
 const ctl=initBottomNavigation(f.nav,{content});
 assert.equal(values.get("--gc-bottom-nav-clearance"),"128px");
 for(const invalid of [Number.NaN,Infinity,-Infinity,-1]) {
   height=invalid;observer.callback();
   assert.equal(values.get("--gc-bottom-nav-clearance"),"128px");
 }
 height=150;observer.callback();
 assert.equal(values.get("--gc-bottom-nav-clearance"),"178px");
 ctl.dispose();
 assert.equal(values.has("--gc-bottom-nav-clearance"),false);
});


test("unmatched history routes clear stale current destination and recover when matched",()=>{
 const f=fixture(),ctrl=initBottomNavigation(f.nav);
 assert.equal(f.links[0].getAttribute("aria-current"),"page");
 f.win.location.hash="#unrecognized";
 f.win.emit("hashchange");
 for(const link of f.links){
   assert.equal(link.getAttribute("aria-current"),null);
   assert.equal(link.getAttribute("data-gc-active"),null);
 }
 f.win.location.hash="#files";
 f.win.emit("popstate");
 assert.equal(f.links[1].getAttribute("aria-current"),"page");
 for(const link of [f.links[0],f.links[2],f.links[3]]){
   assert.equal(link.getAttribute("aria-current"),null);
 }
 ctrl.dispose();
});

test("explicit route synchronization never revives stale selection after disposal",()=>{
 const f=fixture(),ctrl=initBottomNavigation(f.nav);
 f.win.location.hash="#missing";
 ctrl.sync();
 assert.equal(f.links.some(link=>link.getAttribute("aria-current")==="page"),false);
 ctrl.dispose();
 f.win.location.hash="#home";
 ctrl.sync();
 assert.equal(f.links.some(link=>link.getAttribute("aria-current")==="page"),false);
});


test("initially unknown fragment must not inherit stale server-rendered aria-current",()=>{
 const f=fixture();
 f.win.location.hash="#not-in-dock";
 f.links[2].setAttribute("aria-current","page");
 f.links[3].setAttribute("data-gc-active","");
 const ctl=initBottomNavigation(f.nav);
 assert.ok(f.links.every(link=>link.getAttribute("aria-current")===null));
 assert.ok(f.links.every(link=>link.getAttribute("data-gc-active")===null));
 f.win.location.hash="#settings";
 f.win.emit("hashchange");
 assert.equal(f.links[2].getAttribute("aria-current"),"page");
 ctl.dispose();
});

test("initial exact route overrides a stale markup hint; unrelated paths remain unselected",()=>{
 const f=fixture();
 f.links[1].setAttribute("aria-current","page");
 let ctl=initBottomNavigation(f.nav);
 assert.equal(f.links[0].getAttribute("aria-current"),"page");
 assert.equal(f.links[1].getAttribute("aria-current"),null);
 ctl.dispose();

 const other=fixture();
 other.win.location.pathname="/another/";
 other.win.location.hash="#home";
 other.links[0].setAttribute("aria-current","page");
 ctl=initBottomNavigation(other.nav);
 assert.ok(other.links.every(link=>link.getAttribute("aria-current")===null));
 ctl.dispose();
});

test("empty hash respects an explicit same-document initial destination only",()=>{
 let f=fixture();
 f.win.location.hash="";
 f.links[2].setAttribute("aria-current","page");
 let ctl=initBottomNavigation(f.nav);
 assert.equal(f.links[2].getAttribute("aria-current"),"page");
 assert.equal(f.links[0].getAttribute("aria-current"),null);
 ctl.dispose();

 f=fixture();
 f.win.location.hash="";
 // No markup hint: never invent a current destination on an ambiguous route.
 ctl=initBottomNavigation(f.nav);
 assert.ok(f.links.every(link=>link.getAttribute("aria-current")===null));
 ctl.dispose();
});
