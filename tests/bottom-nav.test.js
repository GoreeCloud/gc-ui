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
 const f=fixture(),calls=[];const ctrl=initBottomNavigation(f.nav,{onNavigate:link=>calls.push(link)});
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
