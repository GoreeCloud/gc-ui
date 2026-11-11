import { test } from "node:test";
import assert from "node:assert/strict";
import { initSortableTable } from "../src/table.js";

function el(attrs={}) {
  const handlers=new Map();
  return {attrs:{...attrs},textContent:"",
    getAttribute(k){return this.attrs[k]??null},
    setAttribute(k,v){this.attrs[k]=String(v)},
    addEventListener(k,f){const s=handlers.get(k)||new Set();s.add(f);handlers.set(k,s)},
    removeEventListener(k,f){handlers.get(k)?.delete(f)},
    emit(k){for(const cb of handlers.get(k)||[])cb()},
    querySelector(){return this.button||null}};
}
function fixture(data) {
  const types=["text","number","date"];
  const headers=types.map(type=>{const h=el();h.button=el({"data-gc-sort":type});return h});
  const rows=data.map(values=>({cells:values.map(value=>{const c=el();c.textContent=value;return c})}));
  const body={rows:rows.slice(),append(...items){this.rows=[...items]}};
  const table={ownerDocument:{documentElement:{lang:"en"}},
    querySelectorAll:()=>headers,querySelector:k=>k==="tbody"?body:null};
  return {table,headers,rows,body};
}
test("text labels sort numerically and ties keep insertion order",()=>{
  const f=fixture([["Item 10","2","2026-01-01"],["Item 2","2","2026-01-02"],["Item 2","3","2026-01-03"]]);
  const change=[];
  const api=initSortableTable(f.table,{onSort:s=>change.push(s)});
  f.headers[0].button.emit("click");
  assert.deepEqual(f.body.rows,[f.rows[1],f.rows[2],f.rows[0]]);
  assert.equal(f.headers[0].attrs["aria-sort"],"ascending");
  f.headers[0].button.emit("click");
  assert.deepEqual(f.body.rows,[f.rows[0],f.rows[1],f.rows[2]]);
  assert.equal(f.headers[0].attrs["aria-sort"],"descending");
  api.reset();
  assert.deepEqual(f.body.rows,f.rows);
  assert.equal(f.headers[0].attrs["aria-sort"],"none");
  assert.equal(change.length,3);
  api.dispose();
  f.headers[0].button.emit("click");
  assert.deepEqual(f.body.rows,f.rows);
  assert.throws(()=>api.sortBy(0),/disposed/);
});
test("numeric and strict ISO dates keep missing or malformed cells last",()=>{
  const f=fixture([["B","10","2026-01-03"],["A","-2","2026-01-01"],["C","","bad"],["D","4","2026-02-30"]]);
  const api=initSortableTable(f.table);
  api.sortBy(1);
  assert.deepEqual(f.body.rows,[f.rows[1],f.rows[3],f.rows[0],f.rows[2]]);
  api.sortBy(1,"descending");
  assert.deepEqual(f.body.rows,[f.rows[0],f.rows[3],f.rows[1],f.rows[2]]);
  api.sortBy(2);
  assert.deepEqual(f.body.rows,[f.rows[1],f.rows[0],f.rows[2],f.rows[3]]);
  api.dispose();
});
test("data-sort-value overrides formatted cell text",()=>{
  const f=fixture([["A","$5","2026-01-01"],["B","$20","2026-01-02"]]);
  f.rows[0].cells[1].setAttribute("data-sort-value","5");
  f.rows[1].cells[1].setAttribute("data-sort-value","20");
  const api=initSortableTable(f.table);api.sortBy(1,"descending");
  assert.deepEqual(f.body.rows,[f.rows[1],f.rows[0]]);
  api.dispose();
});
test("malformed markup and unsupported sort requests fail closed",()=>{
  assert.throws(()=>initSortableTable(null),TypeError);
  const f=fixture([["A","1","2026-01-01"]]);
  assert.throws(()=>initSortableTable(f.table,{onSort:3}),TypeError);
  f.headers[0].button.setAttribute("data-gc-sort","unsupported");
  assert.throws(()=>initSortableTable(f.table),RangeError);
  f.headers[0].button.setAttribute("data-gc-sort","text");
  const api=initSortableTable(f.table);
  assert.throws(()=>api.sortBy(99),RangeError);
  assert.throws(()=>api.sortBy(0,"neither"),RangeError);
  api.dispose();
});
