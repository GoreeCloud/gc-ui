import { test } from "node:test";
import assert from "node:assert/strict";
import { initTreeView } from "../src/tree.js";
import { readFileSync } from "node:fs";

function node(role,attrs={}) {
  const handlers=new Map();
  return {
    attrs:{role,...attrs},children:[],parentElement:null,hidden:false,disabled:false,tabIndex:-1,focused:false,
    getAttribute(k){return this.attrs[k]??null},setAttribute(k,v){this.attrs[k]=String(v)},
    addEventListener(k,cb){const s=handlers.get(k)||new Set();s.add(cb);handlers.set(k,s)},
    removeEventListener(k,cb){handlers.get(k)?.delete(cb)},
    append(...xs){for(const x of xs){x.parentElement=this;this.children.push(x)}},
    contains(o){for(let p=o;p;p=p.parentElement)if(p===this)return true;return false},
    closest(s){const m=s.match(/^\[role="([^"]+)"\]$/);if(!m)return null;
      for(let p=this;p;p=p.parentElement)if(p.getAttribute("role")===m[1])return p;return null},
    focus(){this.focused=true;this.ownerDocument.activeElement=this},
    emit(k,target=this,params={}){const e={target,key:"",altKey:false,ctrlKey:false,metaKey:false,
      defaultPrevented:false,preventDefault(){this.defaultPrevented=true},...params};
      for(const cb of handlers.get(k)||[])cb(e);return e}
  };
}
function fixture(){
  const tree=node("tree");tree.ownerDocument={documentElement:{dir:"ltr"},activeElement:null};
  const projects=node("treeitem",{"data-gc-tree-label":"Projects","aria-expanded":"true","aria-selected":"true"});
  const pg=node("group"),docs=node("treeitem",{"data-gc-tree-label":"Documents"});
  const restricted=node("treeitem",{"data-gc-tree-label":"Restricted","aria-disabled":"true"});
  pg.append(docs,restricted);projects.append(pg);
  const services=node("treeitem",{"data-gc-tree-label":"Services","aria-expanded":"false"});
  const sg=node("group"),mesh=node("treeitem",{"data-gc-tree-label":"Mesh"});
  sg.append(mesh);services.append(sg);tree.append(projects,services);
  const items=[projects,docs,restricted,services,mesh];
  function assign(x){x.ownerDocument=tree.ownerDocument;for(const c of x.children)assign(c)}assign(tree);
  tree.querySelectorAll=()=>items;
  return {tree,projects,pg,docs,restricted,services,sg,mesh};
}
test("initial selection and collapsed groups maintain roving focus",()=>{
  const f=fixture(),api=initTreeView(f.tree);
  assert.equal(f.pg.hidden,false);assert.equal(f.sg.hidden,true);
  assert.equal(f.projects.tabIndex,0);assert.equal(f.docs.tabIndex,-1);
  assert.equal(f.projects.getAttribute("aria-selected"),"true");
  api.dispose();
});
test("LTR navigation skips disabled items, expands and descends",()=>{
  const f=fixture(),chosen=[];const api=initTreeView(f.tree,{onSelect:i=>chosen.push(i)});
  assert.equal(f.tree.emit("keydown",f.projects,{key:"ArrowRight"}).defaultPrevented,true);
  assert.equal(f.docs.focused,true);
  f.tree.emit("keydown",f.docs,{key:"ArrowDown"});
  assert.equal(f.services.getAttribute("aria-selected"),"true");
  assert.equal(f.restricted.getAttribute("aria-selected"),"false");
  f.tree.emit("keydown",f.services,{key:"ArrowRight"});
  assert.equal(f.sg.hidden,false);
  f.tree.emit("keydown",f.services,{key:"ArrowRight"});
  assert.equal(f.mesh.getAttribute("aria-selected"),"true");
  assert.ok(chosen.includes(f.mesh));api.dispose();
});
test("collapse restores focus, skips invisible descendants and supports selection API",()=>{
  const f=fixture(),api=initTreeView(f.tree);
  assert.equal(api.expand(f.services),true);
  assert.equal(api.select(f.mesh),true);
  assert.equal(api.collapse(f.services),true);
  assert.equal(f.services.focused,true);
  assert.equal(f.services.getAttribute("aria-selected"),"true");
  assert.equal(api.select(f.mesh),false);api.dispose();
});
test("RTL mapping, Home End, typeahead and leaf activation",()=>{
  const f=fixture(),activated=[];f.tree.ownerDocument.documentElement.dir="rtl";
  const api=initTreeView(f.tree,{onActivate:i=>activated.push(i),locale:"en"});
  f.tree.emit("keydown",f.projects,{key:"End"});
  assert.equal(f.services.getAttribute("aria-selected"),"true");
  f.tree.emit("keydown",f.services,{key:"ArrowLeft"});
  assert.equal(f.sg.hidden,false);
  f.tree.emit("keydown",f.services,{key:"ArrowLeft"});
  assert.equal(f.mesh.getAttribute("aria-selected"),"true");
  f.tree.emit("keydown",f.mesh,{key:"ArrowRight"});
  assert.equal(f.services.getAttribute("aria-selected"),"true");
  f.tree.emit("keydown",f.services,{key:"Home"});
  f.tree.emit("keydown",f.projects,{key:"d"});
  assert.equal(f.docs.getAttribute("aria-selected"),"true");
  f.tree.emit("keydown",f.docs,{key:"Enter"});
  assert.deepEqual(activated,[f.docs]);api.dispose();
});
test("invalid markup and disposed controllers fail closed",()=>{
  assert.throws(()=>initTreeView(null),TypeError);
  const f=fixture();assert.throws(()=>initTreeView(f.tree,{onSelect:3}),TypeError);
  const api=initTreeView(f.tree);api.dispose();api.dispose();
  assert.throws(()=>api.expand(f.projects),/disposed/);
  f.tree.emit("keydown",f.projects,{key:"ArrowDown"});
  assert.equal(f.projects.getAttribute("aria-selected"),"true");
  const invalid=fixture();invalid.docs.setAttribute("aria-expanded","true");
  assert.throws(()=>initTreeView(invalid.tree),/Leaf/);
});
test("tree source styling and typed package exports exist",()=>{
  const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
  const pkg=JSON.parse(read("package.json"));
  assert.ok(read("src/components.css").includes(".gc-tree"));
  assert.ok(pkg.exports["./tree"].types);
  assert.ok(read("src/tree.d.ts").includes("initTreeView"));
});
