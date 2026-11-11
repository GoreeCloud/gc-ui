import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { initNavigationRail } from "../src/navigation-rail.js";

function fixture({ tablet = false, collapsed } = {}) {
  const eventTarget = () => ({
    listeners:new Map(),
    addEventListener(name,fn){this.listeners.set(name,fn);},
    removeEventListener(name,fn){if(this.listeners.get(name)===fn)this.listeners.delete(name);},
    emit(name,event={}){const e={defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...event};this.listeners.get(name)?.(e);return e;}
  });
  const attr = (tagName) => ({
    ...eventTarget(),tagName,attrs:new Map(),title:"",hidden:false,
    getAttribute(name){return this.attrs.get(name)??null;},
    setAttribute(name,value){this.attrs.set(name,String(value));if(name==="title")this.title=String(value);},
    removeAttribute(name){this.attrs.delete(name);if(name==="title")this.title="";}
  });
  const win = eventTarget();
  win.location={origin:"https://example.test",pathname:"/lab/",search:"",hash:"#overview"};
  const media=eventTarget();media.matches=tablet;win.matchMedia=()=>media;
  const doc={defaultView:win,baseURI:"https://example.test/lab/"};
  const shell=attr("DIV"), rail=attr("ASIDE"), nav=attr("NAV"), toggle=attr("BUTTON");
  rail.ownerDocument=nav.ownerDocument=toggle.ownerDocument=doc;
  nav.id="rail-links";nav.setAttribute("aria-label","Sections");
  toggle.setAttribute("aria-controls","rail-links");
  const names=["Overview","Settings","Disabled"];
  const links=names.map((name,i)=>{
    const l=attr("A");
    l.label={textContent:name};
    l.getAttribute=(function(base){return function(key){if(key==="href")return "#"+name.toLowerCase();return base.call(this,key);};})(l.getAttribute);
    l.querySelector=()=>l.label;
    if(i===2)l.setAttribute("aria-disabled","true");
    return l;
  });
  rail.closest=selector=>selector===".gc-navigation-shell"?shell:null;
  rail.matches=()=>false;
  rail.querySelector=selector=>selector==="nav.gc-navigation-rail__links"?nav:toggle;
  nav.querySelectorAll=()=>links;
  const init=()=>initNavigationRail(rail,{collapsed});
  return {init,rail,shell,nav,toggle,links,win,doc,media};
}

test("tablet starts icon-only with readable links and descriptive expansion control",()=>{
  const f=fixture({tablet:true});const ctrl=f.init();
  assert.equal(ctrl.collapsed,true);
  assert.equal(f.rail.getAttribute("data-gc-collapsed"),"true");
  assert.equal(f.shell.getAttribute("data-gc-rail-collapsed"),"true");
  assert.equal(f.toggle.getAttribute("aria-expanded"),"false");
  assert.equal(f.toggle.getAttribute("aria-label"),"Expand navigation");
  assert.equal(f.links[0].getAttribute("title"),"Overview");
  assert.equal(f.links[0].getAttribute("aria-current"),"page");
  f.toggle.emit("click");
  assert.equal(ctrl.collapsed,false);
  assert.equal(f.toggle.getAttribute("aria-expanded"),"true");
  assert.equal(f.links[0].getAttribute("title"),null);
  f.media.matches=false;f.media.emit("change");
  assert.equal(ctrl.collapsed,false,"manual choice survives resizing");
  ctrl.dispose();assert.equal(f.rail.getAttribute("data-gc-collapsed"),null);
  assert.equal(f.toggle.getAttribute("aria-label"),null);
  assert.equal(f.win.listeners.size,0);
});

test("desktop starts expanded and navigation follows actual location",()=>{
  const f=fixture();const ctrl=f.init();
  assert.equal(ctrl.collapsed,false);
  f.win.location.hash="#settings";f.win.emit("hashchange");
  assert.equal(f.links[1].getAttribute("aria-current"),"page");
  assert.equal(f.links[0].getAttribute("aria-current"),null);
  f.win.location.hash="#disabled";f.win.emit("popstate");
  assert.equal(f.links[1].getAttribute("aria-current"),"page","disabled destination cannot become current");
  const click=f.nav.emit("click",{target:{closest:()=>f.links[2]}});
  assert.equal(click.defaultPrevented,true,"disabled route does not navigate");
  f.media.matches=true;f.media.emit("change");
  assert.equal(ctrl.collapsed,true,"untouched rail responds to tablet breakpoint");
  assert.equal(ctrl.setCollapsed(false),true);
  assert.throws(()=>ctrl.setCollapsed("false"),TypeError);
  ctrl.dispose();
});

test("preexisting destination title survives collapse and controller disposal",()=>{
  const f=fixture({collapsed:true});f.links[0].setAttribute("title","Custom heading");
  const c=f.init();assert.equal(f.links[0].getAttribute("title"),"Custom heading");
  c.setCollapsed(false);
  assert.equal(f.links[0].getAttribute("title"),"Custom heading");
  c.dispose();c.dispose();
});

test("rejects malformed or unlabeled navigation before listeners are installed",()=>{
  const f=fixture();f.nav.removeAttribute("aria-label");
  assert.throws(f.init,/accessible nav name/);
  assert.equal(f.win.listeners.size,0);
  const other=fixture({collapsed:"bad"});
  assert.throws(other.init,/boolean/);
  const empty=fixture();empty.links[0].label.textContent=" ";
  assert.throws(empty.init,/readable label/);
});

test("responsive rail CSS preserves phone bottom navigation and contrast rules",()=>{
  const css=readFileSync(new URL("../src/components.css",import.meta.url),"utf8");
  for(const key of ["gc-navigation-shell","gc-navigation-rail-size","data-gc-collapsed","prefers-reduced-motion:reduce","forced-colors:active"])assert.ok(css.includes(key),key);
  assert.match(css,/@media\(max-width:600px\)[\s\S]*?\.gc-navigation-rail \{ display:none; \}/);
  const lab=readFileSync(new URL("../lab/lab.css",import.meta.url),"utf8");
  assert.ok(lab.includes("#demo-bottom-nav { display:none; }"));
  assert.ok(lab.includes(".gc-lab-rail[data-gc-collapsed=\"true\"]"));
});
