/**
 * GoreeCloud UI sortable table enhancement.
 * Operates on native <table>/<thead>/<tbody>/<th>/<td>/<button> only.
 * Client-side ordering; no injected HTML, network, storage, or telemetry.
 */
const MODES = ["text", "number", "date"];
const DIRECTIONS = ["ascending", "descending"];
const isoDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year,month,day]=value.split("-").map(Number);
  // Date.UTC interprets years 0–99 as 1900–1999; preserve the ISO year.
  const date=new Date(0);
  date.setUTCFullYear(year,month-1,day);
  const timestamp=date.getTime();
  if (!Number.isFinite(timestamp)) return null;
  const reconstructed=new Date(timestamp).toISOString().slice(0,10);
  return reconstructed===value ? timestamp : null;
};
const numberValue = value => {
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) return null;
  const number=Number(value);
  return Number.isFinite(number) ? number : null;
};

/**
 * @returns {{sortBy:(index:number,direction?:string)=>void,reset:()=>void,refresh:()=>number,dispose:()=>void}}
 */
export function initSortableTable(table,{locale, onSort}={}) {
  if (!table || typeof table.querySelectorAll !== "function" ||
      typeof table.querySelector !== "function") {
    throw new TypeError("Sortable table requires a native table");
  }
  if (onSort!==undefined && typeof onSort!=="function") throw new TypeError("onSort must be a function");
  const body=table.querySelector("tbody");
  if (!body || typeof body.append !== "function") throw new Error("Sortable table needs a tbody");
  const headers=Array.from(table.querySelectorAll("thead th"));
  const columns=headers.map((header,index)=>{
    const button=header.querySelector('button[data-gc-sort]');
    if (!button) return null;
    const kind=button.getAttribute("data-gc-sort") || "text";
    if (!MODES.includes(kind)) throw new RangeError("Unknown sort mode: "+kind);
    return {header,button,index,kind};
  }).filter(Boolean);
  if (!columns.length) throw new Error("Sortable table requires a sort button in a column header");
  // The reset baseline is the insertion order known to this controller.
  // Preserve it for retained rows and append newly introduced rows in their
  // present DOM order. Removed rows must never be silently re-inserted.
  let original=Array.from(body.rows);
  let originalIndex=new Map(original.map((row,index)=>[row,index]));
  const reconcileRows=()=>{
    const current=Array.from(body.rows);
    const live=new Set(current);
    const known=new Set(original);
    original=original.filter(row=>live.has(row)).concat(current.filter(row=>!known.has(row)));
    originalIndex=new Map(original.map((row,index)=>[row,index]));
    return original.length;
  };
  const collator=new Intl.Collator(locale||table.ownerDocument?.documentElement?.lang||"en",
    {numeric:true,sensitivity:"base"});
  let selected=null, direction="none", disposed=false;
  const valueFor=(row,column)=>{
    const cell=row.cells[column.index];
    const raw=(cell?.getAttribute("data-sort-value")??cell?.textContent??"").trim();
    if (!raw) return null;
    if (column.kind==="number") return numberValue(raw);
    if (column.kind==="date") return isoDate(raw);
    return raw;
  };
  const sortBy=(index,nextDirection="ascending")=>{
    if (disposed) throw new Error("Sortable table has been disposed");
    if (!DIRECTIONS.includes(nextDirection)) throw new RangeError("Invalid sort direction");
    const column=columns.find(c=>c.index===index);
    if (!column) throw new RangeError("Column has no sortable header");
    reconcileRows(); // Prevent undefined tie indices on newly inserted DOM rows.
    const sign=nextDirection==="ascending"?1:-1;
    const sorted=Array.from(body.rows).sort((a,b)=>{
      const va=valueFor(a,column), vb=valueFor(b,column);
      // Blank or invalid sort values stay at the end in both directions.
      if (va===null&&vb!==null) return 1;
      if (vb===null&&va!==null) return -1;
      const compare=va===null&&vb===null?0:
        (column.kind==="text"?collator.compare(va,vb):Math.sign(va-vb));
      return compare===0 ? originalIndex.get(a)-originalIndex.get(b) : compare*sign;
    });
    body.append(...sorted);
    selected=index;direction=nextDirection;
    headers.forEach((header,i)=>{
      header.setAttribute("aria-sort",i===selected?direction:"none");
    });
    if (onSort) onSort({column:index,direction,rows:sorted.slice()});
  };
  const reset=()=>{
    if (disposed) throw new Error("Sortable table has been disposed");
    reconcileRows();
    body.append(...original);
    selected=null;direction="none";
    headers.forEach(header=>header.setAttribute("aria-sort","none"));
    if (onSort) onSort({column:null,direction:"none",rows:original.slice()});
  };
  const refresh=()=>{
    if (disposed) throw new Error("Sortable table has been disposed");
    const count=reconcileRows();
    // A dynamically updated table keeps its last explicit user sort.
    // No active sort means the new baseline is the only reset order.
    if (selected!==null) sortBy(selected,direction);
    else reset();
    return count;
  };
  const callbacks=columns.map(({button,index})=>{
    const handler=()=>sortBy(index,selected===index&&direction==="ascending"?"descending":"ascending");
    button.addEventListener("click",handler);
    return handler;
  });
  headers.forEach(header=>header.setAttribute("aria-sort","none"));
  return Object.freeze({
    sortBy,reset,refresh,
    dispose(){
      if (disposed) return;
      disposed=true;
      columns.forEach((column,i)=>column.button.removeEventListener("click",callbacks[i]));
    }
  });
}
